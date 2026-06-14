/**
 * JSON Diff Compare Engine
 * Client-side sandbox friendly, zero dependencies.
 */

import { escapeHtml } from './TreeViewer.js';

/**
 * Clean clone and filter out specified ignore keys recursively
 */
export function cloneAndFilter(val, ignoreKeys = []) {
  if (val === null || typeof val !== 'object') {
    return val;
  }
  if (Array.isArray(val)) {
    return val.map(item => cloneAndFilter(item, ignoreKeys));
  }
  const result = {};
  for (const k of Object.keys(val)) {
    if (ignoreKeys.includes(k)) {
      continue;
    }
    result[k] = cloneAndFilter(val[k], ignoreKeys);
  }
  return result;
}

/**
 * Line-by-Line LCS Diff Algorithm
 * Returns an array of lines annotated as added, removed, or normal.
 */
export function calculateLcsDiff(text1, text2) {
  const a = text1.split(/\r?\n/);
  const b = text2.split(/\r?\n/);
  const n = a.length;
  const m = b.length;

  // DP table
  const dp = Array(n + 1).fill(0).map(() => Array(m + 1).fill(0));

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  let i = n, j = m;
  const diff = [];

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && a[i - 1] === b[j - 1]) {
      diff.push({ type: 'normal', val: a[i - 1], lineA: i, lineB: j });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      diff.push({ type: 'added', val: b[j - 1], lineA: null, lineB: j });
      j--;
    } else if (i > 0 && (j === 0 || dp[i][j - 1] < dp[i - 1][j])) {
      diff.push({ type: 'removed', val: a[i - 1], lineA: i, lineB: null });
      i--;
    }
  }

  return diff.reverse();
}

/**
 * Word-level/Character-level LCS diff within a single line
 * Useful to highlight small changes inside adjacent removed/added pairs.
 */
export function diffWords(lineA, lineB) {
  // Split strings into words, spaces, and punctuation tokens
  const tokenRegex = /(\s+|[{}[\],.:"'\-+*\/%&|^=<>!~?;()])/;
  const wordsA = lineA.split(tokenRegex).filter(Boolean);
  const wordsB = lineB.split(tokenRegex).filter(Boolean);

  const n = wordsA.length;
  const m = wordsB.length;
  const dp = Array(n + 1).fill(0).map(() => Array(m + 1).fill(0));

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      if (wordsA[i - 1] === wordsB[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  let i = n, j = m;
  const resultA = [];
  const resultB = [];

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && wordsA[i - 1] === wordsB[j - 1]) {
      resultA.push({ type: 'normal', val: wordsA[i - 1] });
      resultB.push({ type: 'normal', val: wordsB[j - 1] });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      resultB.push({ type: 'added', val: wordsB[j - 1] });
      j--;
    } else {
      resultA.push({ type: 'removed', val: wordsA[i - 1] });
      i--;
    }
  }

  return {
    a: resultA.reverse(),
    b: resultB.reverse()
  };
}

/**
 * Recursively diff two structural values (objects, arrays, or primitives)
 */
export function diffStructures(valA, valB) {
  if (valA === valB) {
    return { type: 'unchanged', val: valA };
  }

  if (valA === undefined) {
    return { type: 'added', val: valB };
  }
  if (valB === undefined) {
    return { type: 'removed', val: valA };
  }

  // Check type mismatch
  if (
    typeof valA !== typeof valB ||
    valA === null ||
    valB === null ||
    Array.isArray(valA) !== Array.isArray(valB)
  ) {
    return { type: 'modified', valA, valB };
  }

  // Array comparison
  if (Array.isArray(valA)) {
    const n = valA.length;
    const m = valB.length;
    
    // Heuristic matcher for array elements
    const isMatch = (itemA, itemB) => {
      if (typeof itemA !== 'object' || itemA === null || typeof itemB !== 'object' || itemB === null) {
        return itemA === itemB;
      }
      if (itemA.id !== undefined && itemB.id !== undefined) return itemA.id === itemB.id;
      if (itemA.name !== undefined && itemB.name !== undefined) return itemA.name === itemB.name;
      
      const keysA = Object.keys(itemA);
      const keysB = Object.keys(itemB);
      const common = keysA.filter(k => keysB.includes(k));
      if (keysA.length === 0 && keysB.length === 0) return true;
      return (common.length / Math.max(keysA.length, keysB.length)) > 0.5;
    };

    const dp = Array(n + 1).fill(0).map(() => Array(m + 1).fill(0));
    for (let i = 1; i <= n; i++) {
      for (let j = 1; j <= m; j++) {
        if (isMatch(valA[i - 1], valB[j - 1])) {
          dp[i][j] = dp[i - 1][j - 1] + 1;
        } else {
          dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
        }
      }
    }

    let i = n, j = m;
    const children = [];
    while (i > 0 || j > 0) {
      if (i > 0 && j > 0 && isMatch(valA[i - 1], valB[j - 1])) {
        const itemDiff = diffStructures(valA[i - 1], valB[j - 1]);
        children.push({ type: 'item', diff: itemDiff, indexA: i - 1, indexB: j - 1 });
        i--;
        j--;
      } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
        children.push({ type: 'item', diff: { type: 'added', val: valB[j - 1] }, indexA: null, indexB: j - 1 });
        j--;
      } else {
        children.push({ type: 'item', diff: { type: 'removed', val: valA[i - 1] }, indexA: i - 1, indexB: null });
        i--;
      }
    }
    children.reverse();

    const hasChanges = children.some(c => c.diff.type !== 'unchanged');
    if (!hasChanges) {
      return { type: 'unchanged', val: valA };
    }

    return { type: 'array', children, valA, valB };
  }

  // Object comparison
  const keysA = Object.keys(valA);
  const keysB = Object.keys(valB);
  const allKeys = Array.from(new Set([...keysA, ...keysB])).sort();

  const children = {};
  let hasChanges = false;

  for (const key of allKeys) {
    if (!keysA.includes(key)) {
      children[key] = { type: 'added', val: valB[key] };
      hasChanges = true;
    } else if (!keysB.includes(key)) {
      children[key] = { type: 'removed', val: valA[key] };
      hasChanges = true;
    } else {
      const childDiff = diffStructures(valA[key], valB[key]);
      children[key] = childDiff;
      if (childDiff.type !== 'unchanged') {
        hasChanges = true;
      }
    }
  }

  if (!hasChanges) {
    return { type: 'unchanged', val: valA };
  }

  return { type: 'object', children, valA, valB };
}

/**
 * Builds standard JavaScript selector paths for nested properties
 */
function buildPath(parentPath, key) {
  if (!parentPath) {
    if (typeof key === 'number') return `[${key}]`;
    if (/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key)) return key;
    return `["${key.replace(/"/g, '\\"')}"]`;
  }
  if (typeof key === 'number') {
    return `${parentPath}[${key}]`;
  }
  if (/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key)) {
    return `${parentPath}.${key}`;
  }
  return `${parentPath}["${key.replace(/"/g, '\\"')}"]`;
}

/**
 * Renders a value node diff recursively into interactive HTML strings
 * @param {Object} diffNode - Diff node calculated by diffStructures()
 * @param {boolean} showOnlyChanges - If true, unchanged nodes are collapsed/hidden
 * @param {string} path - Selector path string
 */
export function renderTreeDiff(diffNode, showOnlyChanges = false, path = '') {
  const type = diffNode.type;

  // 1. Primitive Added
  if (type === 'added') {
    return renderValueHighlight(diffNode.val, 'added', path);
  }

  // 2. Primitive Removed
  if (type === 'removed') {
    return renderValueHighlight(diffNode.val, 'removed', path);
  }

  // 3. Primitive Modified (Type changed or primitive value changed)
  if (type === 'modified') {
    return `
      <span class="inline-flex flex-wrap items-center gap-1 font-mono text-[13px] diff-nav-target">
        <span class="line-through text-red-500 bg-red-500/10 dark:bg-red-500/20 px-1 rounded select-all">${renderRawValue(diffNode.valA)}</span>
        <span class="text-mute select-none font-bold">➔</span>
        <span class="text-green-500 bg-green-500/10 dark:bg-green-500/20 px-1 rounded font-semibold select-all">${renderRawValue(diffNode.valB)}</span>
      </span>
    `;
  }

  // 4. Unchanged Node
  if (type === 'unchanged') {
    if (showOnlyChanges) {
      return ''; // Will be filtered out at render level
    }
    return renderValueHighlight(diffNode.val, 'unchanged', path);
  }

  // 5. Structure: Array Diff
  if (type === 'array') {
    const totalItems = diffNode.children.length;
    let html = `<div class="tree-group relative font-mono text-[13px]" data-path="${escapeHtml(path)}">`;
    html += `
      <div class="tree-header flex items-center gap-1.5 py-0.5 cursor-pointer select-none group/hdr">
        <span class="tree-caret text-[9px] text-mute group-hover/hdr:text-body transition-transform duration-150 transform rotate-90">▶</span>
        <span class="text-ink">[</span>
        <span class="text-caption-mono text-mute italic text-[11px] font-normal">// Array Diff (${totalItems} item${totalItems > 1 ? 's' : ''})</span>
        <span class="text-xs bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 px-1.5 py-0.5 rounded font-sans font-medium select-none ml-1 scale-90">Modified</span>
        ${path ? `
        <button class="copy-path-btn opacity-0 group-hover/hdr:opacity-100 px-1.5 py-0.5 rounded text-[10px] bg-canvas-soft-2 hover:bg-canvas border border-hairline font-sans text-body select-none transition-all cursor-pointer ml-2" data-path="${escapeHtml(path)}" title="Copy selector path">
          Copy Path
        </button>
        ` : ''}
      </div>
    `;

    html += `<div class="tree-children pl-6 border-l border-hairline my-0.5 flex flex-col gap-0.5">`;

    diffNode.children.forEach(child => {
      const idxA = child.indexA;
      const idxB = child.indexB;
      const cDiff = child.diff;

      if (showOnlyChanges && cDiff.type === 'unchanged') {
        return; // Ignore unchanged array items
      }

      let rowClass = '';
      let marker = '';
      let indexLabel = '';

      if (cDiff.type === 'added') {
        rowClass = 'bg-green-500/5 text-green-700 dark:text-green-400 rounded px-1.5 py-0.5 diff-nav-target';
        marker = '<span class="text-green-500 font-bold select-none mr-1">+</span>';
        indexLabel = `<span class="text-mute select-none">${idxB}:</span>`;
      } else if (cDiff.type === 'removed') {
        rowClass = 'bg-red-500/5 text-red-500 dark:text-red-400 line-through rounded px-1.5 py-0.5 diff-nav-target';
        marker = '<span class="text-red-500 font-bold select-none mr-1">-</span>';
        indexLabel = `<span class="text-mute select-none">${idxA}:</span>`;
      } else if (cDiff.type === 'modified') {
        rowClass = 'bg-yellow-500/5 rounded px-1.5 py-0.5 diff-nav-target';
        marker = '<span class="text-yellow-500 font-bold select-none mr-1">~</span>';
        indexLabel = `<span class="text-mute select-none">${idxA}➔${idxB}:</span>`;
      } else {
        // unchanged item
        indexLabel = `<span class="text-mute select-none">${idxB}:</span>`;
      }

      const childPath = buildPath(path, idxB !== null ? idxB : idxA);
      const childRender = renderTreeDiff(cDiff, showOnlyChanges, childPath);
      
      if (childRender) {
        html += `
          <div class="tree-row flex items-start gap-1 ${rowClass}">
            ${marker}
            ${indexLabel}
            <div class="flex-1 min-w-0">${childRender}</div>
          </div>
        `;
      }
    });

    html += `</div>`;
    html += `<div class="tree-footer text-ink pl-3 py-0.5">]</div>`;
    html += `</div>`;
    return html;
  }

  // 6. Structure: Object Diff
  if (type === 'object') {
    const keys = Object.keys(diffNode.children);
    let html = `<div class="tree-group relative font-mono text-[13px]" data-path="${escapeHtml(path)}">`;
    html += `
      <div class="tree-header flex items-center gap-1.5 py-0.5 cursor-pointer select-none group/hdr">
        <span class="tree-caret text-[9px] text-mute group-hover/hdr:text-body transition-transform duration-150 transform rotate-90">▶</span>
        <span class="text-ink">{</span>
        <span class="text-caption-mono text-mute italic text-[11px] font-normal">// Object Diff (${keys.length} key${keys.length > 1 ? 's' : ''})</span>
        <span class="text-xs bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 px-1.5 py-0.5 rounded font-sans font-medium select-none ml-1 scale-90">Modified</span>
        ${path ? `
        <button class="copy-path-btn opacity-0 group-hover/hdr:opacity-100 px-1.5 py-0.5 rounded text-[10px] bg-canvas-soft-2 hover:bg-canvas border border-hairline font-sans text-body select-none transition-all cursor-pointer ml-2" data-path="${escapeHtml(path)}" title="Copy selector path">
          Copy Path
        </button>
        ` : ''}
      </div>
    `;

    html += `<div class="tree-children pl-6 border-l border-hairline my-0.5 flex flex-col gap-0.5">`;

    keys.forEach(key => {
      const cDiff = diffNode.children[key];

      if (showOnlyChanges && cDiff.type === 'unchanged') {
        return; // Ignore unchanged object keys
      }

      let rowClass = '';
      let marker = '';
      let keyClass = 'text-link dark:text-blue-400';

      if (cDiff.type === 'added') {
        rowClass = 'bg-green-500/5 text-green-700 dark:text-green-400 rounded px-1.5 py-0.5 diff-nav-target';
        marker = '<span class="text-green-500 font-bold select-none mr-1">+</span>';
        keyClass = 'text-green-600 dark:text-green-400 font-semibold';
      } else if (cDiff.type === 'removed') {
        rowClass = 'bg-red-500/5 text-red-500 dark:text-red-400 line-through rounded px-1.5 py-0.5 diff-nav-target';
        marker = '<span class="text-red-500 font-bold select-none mr-1">-</span>';
        keyClass = 'text-red-500 dark:text-red-400 font-normal';
      } else if (cDiff.type === 'modified') {
        rowClass = 'bg-yellow-500/5 rounded px-1.5 py-0.5 diff-nav-target';
        marker = '<span class="text-yellow-500 font-bold select-none mr-1">~</span>';
        keyClass = 'text-yellow-600 dark:text-yellow-400 font-semibold';
      }

      const childPath = buildPath(path, key);
      const childRender = renderTreeDiff(cDiff, showOnlyChanges, childPath);

      if (childRender) {
        html += `
          <div class="tree-row flex items-start gap-1.5 group/row ${rowClass}">
            ${marker}
            <span class="tree-node-key break-all select-all ${keyClass}">"${escapeHtml(key)}"</span>
            <span class="text-mute select-none">:</span>
            <div class="flex-1 min-w-0">
              ${childRender}
            </div>
          </div>
        `;
      }
    });

    html += `</div>`;
    html += `<div class="tree-footer text-ink pl-3 py-0.5">}</div>`;
    html += `</div>`;
    return html;
  }

  return `<span class="text-mute font-mono">${escapeHtml(String(diffNode))}</span>`;
}

/**
 * Render raw value properly based on javascript type
 */
function renderRawValue(val) {
  if (val === null) return 'null';
  if (typeof val === 'string') return `"${escapeHtml(val)}"`;
  if (typeof val === 'object') {
    if (Array.isArray(val)) return `[Array(${val.length})]`;
    return `{Object(${Object.keys(val).length})}`;
  }
  return escapeHtml(String(val));
}

/**
 * Highlighting format helper for primitive values
 */
function renderValueHighlight(val, status, path) {
  const rVal = renderRawValue(val);
  let colorClass = 'text-mute';

  if (val === null) {
    colorClass = 'tree-node-null text-mute';
  } else if (typeof val === 'string') {
    colorClass = 'tree-node-string text-success';
  } else if (typeof val === 'number') {
    colorClass = 'tree-node-number text-warning-deep';
  } else if (typeof val === 'boolean') {
    colorClass = 'tree-node-boolean text-violet-deep dark:text-violet-soft font-medium';
  }

  let textDecoration = '';
  if (status === 'added') {
    colorClass = 'text-green-600 dark:text-green-400 font-semibold';
  } else if (status === 'removed') {
    colorClass = 'text-red-500 dark:text-red-400';
    textDecoration = 'line-through';
  }

  return `<span class="${colorClass} ${textDecoration} select-all break-all">${rVal}</span>`;
}
