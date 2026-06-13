/**
 * HTML escaper helper to prevent XSS
 */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Highlights matches of the search term
 */
function highlightText(text, search) {
  const safeText = escapeHtml(text);
  if (!search) return safeText;
  
  try {
    const escapedSearch = search.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`(${escapedSearch})`, 'gi');
    return safeText.replace(regex, '<mark class="bg-amber-200 dark:bg-amber-900/60 rounded px-0.5 text-black dark:text-white">$1</mark>');
  } catch (e) {
    return safeText;
  }
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
 * Renders a value recursively into an interactive HTML string
 */
export function renderJsonTree(val, search = '', path = '') {
  const searchTerm = search.trim();
  
  if (val === null) {
    return `<span class="tree-node-null font-mono text-mute select-all">null</span>`;
  }
  
  const type = typeof val;
  
  if (type === 'string') {
    return `<span class="tree-node-string font-mono text-success break-all select-all">"${highlightText(val, searchTerm)}"</span>`;
  }
  
  if (type === 'number') {
    return `<span class="tree-node-number font-mono text-warning-deep select-all">${highlightText(val.toString(), searchTerm)}</span>`;
  }
  
  if (type === 'boolean') {
    return `<span class="tree-node-boolean font-mono text-violet-deep dark:text-violet-soft font-medium select-all">${val ? 'true' : 'false'}</span>`;
  }
  
  // Handling arrays
  if (Array.isArray(val)) {
    if (val.length === 0) {
      return `<span class="font-mono text-mute">[ ]</span>`;
    }
    
    let html = `<div class="tree-group relative font-mono" data-path="${escapeHtml(path)}">`;
    // Toggle trigger + opening brackets
    html += `
      <div class="tree-header flex items-center gap-1.5 py-0.5 cursor-pointer select-none group/hdr">
        <span class="tree-caret text-[9px] text-mute group-hover/hdr:text-body transition-transform duration-150 transform rotate-90">▶</span>
        <span class="text-ink">[</span>
        <span class="text-caption-mono text-mute italic text-[11px] font-normal">// ${val.length} item${val.length > 1 ? 's' : ''}</span>
        <!-- Copy path helper button -->
        ${path ? `
        <button class="copy-path-btn opacity-0 group-hover/hdr:opacity-100 px-1 py-0.5 rounded text-[10px] bg-canvas-soft-2 hover:bg-canvas border border-hairline font-sans text-body select-none transition-all cursor-pointer ml-2" data-path="${escapeHtml(path)}" title="Copy selector path">
          Copy Path
        </button>
        ` : ''}
      </div>
    `;
    
    // Body children wrapper
    html += `<div class="tree-children pl-6 border-l border-hairline my-0.5 flex flex-col gap-0.5">`;
    for (let i = 0; i < val.length; i++) {
      const childPath = buildPath(path, i);
      html += `
        <div class="tree-row flex items-start gap-1">
          <span class="text-mute select-none">${i}:</span>
          ${renderJsonTree(val[i], searchTerm, childPath)}
        </div>
      `;
    }
    html += `</div>`; // Close children
    
    // Closing brackets
    html += `<div class="tree-footer text-ink pl-3 py-0.5">]</div>`;
    html += `</div>`; // Close group
    return html;
  }
  
  // Handling objects
  if (type === 'object') {
    const keys = Object.keys(val);
    if (keys.length === 0) {
      return `<span class="font-mono text-mute">{ }</span>`;
    }
    
    let html = `<div class="tree-group relative font-mono" data-path="${escapeHtml(path)}">`;
    // Toggle trigger + opening brackets
    html += `
      <div class="tree-header flex items-center gap-1.5 py-0.5 cursor-pointer select-none group/hdr">
        <span class="tree-caret text-[9px] text-mute group-hover/hdr:text-body transition-transform duration-150 transform rotate-90">▶</span>
        <span class="text-ink">{</span>
        <span class="text-caption-mono text-mute italic text-[11px] font-normal">// ${keys.length} key${keys.length > 1 ? 's' : ''}</span>
        <!-- Copy path helper button -->
        ${path ? `
        <button class="copy-path-btn opacity-0 group-hover/hdr:opacity-100 px-1 py-0.5 rounded text-[10px] bg-canvas-soft-2 hover:bg-canvas border border-hairline font-sans text-body select-none transition-all cursor-pointer ml-2" data-path="${escapeHtml(path)}" title="Copy selector path">
          Copy Path
        </button>
        ` : ''}
      </div>
    `;
    
    // Body children wrapper
    html += `<div class="tree-children pl-6 border-l border-hairline my-0.5 flex flex-col gap-0.5">`;
    for (const key of keys) {
      const childPath = buildPath(path, key);
      const highlightedKey = highlightText(key, searchTerm);
      html += `
        <div class="tree-row flex items-start gap-1.5 group/row">
          <span class="tree-node-key font-semibold text-link break-all select-all">"${highlightedKey}"</span>
          <span class="text-mute select-none">:</span>
          <div class="flex-1 min-w-0">
            ${renderJsonTree(val[key], searchTerm, childPath)}
          </div>
        </div>
      `;
    }
    html += `</div>`; // Close children
    
    // Closing brackets
    html += `<div class="tree-footer text-ink pl-3 py-0.5">}</div>`;
    html += `</div>`; // Close group
    return html;
  }
  
  return `<span class="font-mono text-mute select-all">${escapeHtml(String(val))}</span>`;
}
