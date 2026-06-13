/**
 * Coerces XML string values to primitive JS types if applicable
 */
function parsePrimitive(str) {
  if (str === '') return '';
  if (str.toLowerCase() === 'true') return true;
  if (str.toLowerCase() === 'false') return false;
  if (str.toLowerCase() === 'null') return null;
  
  const num = Number(str);
  if (!isNaN(num) && str.trim() !== '') return num;
  return str;
}

/**
 * Recursively converts a DOM Node into a JS Object
 */
function parseDomNode(node) {
  // If text node
  if (node.nodeType === 3) {
    return node.nodeValue.trim();
  }
  
  // Only process element nodes
  if (node.nodeType !== 1) {
    return null;
  }
  
  const obj = {};
  let hasAttributes = false;
  
  // Extract XML attributes as @attrName
  if (node.attributes && node.attributes.length > 0) {
    hasAttributes = true;
    for (let i = 0; i < node.attributes.length; i++) {
      const attr = node.attributes[i];
      obj[`@${attr.name}`] = parsePrimitive(attr.value);
    }
  }
  
  let textContent = '';
  let hasElementChild = false;
  const childrenGroup = {};
  
  // Loop through child nodes
  for (let i = 0; i < node.childNodes.length; i++) {
    const child = node.childNodes[i];
    if (child.nodeType === 1) {
      hasElementChild = true;
      const name = child.nodeName;
      const parsedChild = parseDomNode(child);
      
      if (!childrenGroup[name]) {
        childrenGroup[name] = [];
      }
      childrenGroup[name].push(parsedChild);
    } else if (child.nodeType === 3 || child.nodeType === 4) { // Text or CDATA node
      textContent += child.nodeValue;
    }
  }
  
  textContent = textContent.trim();
  
  if (!hasElementChild) {
    const value = parsePrimitive(textContent);
    if (hasAttributes) {
      obj['#text'] = value;
      return obj;
    }
    return value;
  }
  
  // Group duplicate nodes as array lists
  for (const name in childrenGroup) {
    const list = childrenGroup[name];
    if (list.length === 1) {
      obj[name] = list[0];
    } else {
      obj[name] = list;
    }
  }
  
  if (textContent && hasAttributes) {
    obj['#text'] = textContent;
  }
  
  return obj;
}

/**
 * Converts XML string into a JSON string
 */
export function xmlToJson(xmlString) {
  if (!xmlString.trim()) {
    throw new Error("Empty XML input.");
  }
  
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, "application/xml");
  
  // Check parsing errors
  const parseError = xmlDoc.querySelector("parsererror");
  if (parseError) {
    throw new Error(parseError.textContent || "XML parsing syntax error.");
  }
  
  const rootElement = xmlDoc.documentElement;
  const result = {};
  result[rootElement.nodeName] = parseDomNode(rootElement);
  
  return JSON.stringify(result, null, 2);
}

/**
 * Recursively converts a JS Object/Array/Primitive into XML tags
 */
export function jsonToXml(obj, rootName = 'root', indent = '  ', depth = 0) {
  const spaces = indent.repeat(depth);
  
  if (obj === null || obj === undefined) {
    return `${spaces}<${rootName} />`;
  }
  
  const type = typeof obj;
  
  if (type !== 'object') {
    // Escape standard XML entities
    const escapedVal = String(obj)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
    return `${spaces}<${rootName}>${escapedVal}</${rootName}>`;
  }
  
  // If it's an array, repeat tags of key rootName
  if (Array.isArray(obj)) {
    return obj.map(item => jsonToXml(item, rootName, indent, depth)).join('\n');
  }
  
  // If it's an object, serialize keys
  let attributesXml = '';
  let contentXml = '';
  let hasElementChildren = false;
  
  const keys = Object.keys(obj);
  
  // Filter attributes (@ prefixed) vs child tags
  const attributeKeys = keys.filter(k => k.startsWith('@'));
  const contentKeys = keys.filter(k => !k.startsWith('@') && k !== '#text');
  
  // Build attribute string
  for (const attrKey of attributeKeys) {
    const attrName = attrKey.substring(1);
    const attrVal = String(obj[attrKey])
      .replace(/"/g, '&quot;');
    attributesXml += ` ${attrName}="${attrVal}"`;
  }
  
  // Handle plain text property if exists
  if (obj['#text'] !== undefined) {
    const textVal = String(obj['#text'])
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    contentXml += textVal;
  }
  
  // Handle other keys
  if (contentKeys.length > 0) {
    hasElementChildren = true;
    const items = [];
    for (const key of contentKeys) {
      const val = obj[key];
      if (Array.isArray(val)) {
        items.push(val.map(item => jsonToXml(item, key, indent, depth + 1)).join('\n'));
      } else {
        items.push(jsonToXml(val, key, indent, depth + 1));
      }
    }
    contentXml += '\n' + items.join('\n') + `\n${spaces}`;
  }
  
  if (contentXml === '') {
    return `${spaces}<${rootName}${attributesXml} />`;
  }
  
  const opener = `<${rootName}${attributesXml}>`;
  const closer = `</${rootName}>`;
  return `${spaces}${opener}${contentXml}${closer}`;
}
