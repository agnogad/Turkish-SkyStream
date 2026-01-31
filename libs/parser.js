/**
 * Professional HTML DOM Parser & CSS Selector Engine - OPTIMIZED & FIXED
 * Zero dependencies - Pure Node.js implementation
 * 
 * CRITICAL FIX: Properly handles <script> and <style> tags with raw content
 * Performance optimizations included
 */

// ============================================================================
// LEXER / TOKENIZER - FIXED FOR SCRIPT/STYLE TAGS
// ============================================================================

class HTMLTokenizer {
  constructor(html) {
    this.html = html;
    this.pos = 0;
    this.length = html.length;
    this.tokens = [];
  }

  tokenize() {
    while (this.pos < this.length) {
      if (this.html[this.pos] === '<') {
        this.parseTag();
      } else {
        this.parseText();
      }
    }
    return this.tokens;
  }

  parseTag() {
    const start = this.pos;
    this.pos++; // Skip '<'

    // Handle comments
    if (this.html.substr(this.pos, 3) === '!--') {
      this.parseComment();
      return;
    }

    // Handle DOCTYPE
    if (this.html.substr(this.pos, 8).toLowerCase() === '!doctype') {
      this.parseDoctype();
      return;
    }

    // Detect closing tag
    const isClosing = this.html[this.pos] === '/';
    if (isClosing) this.pos++;

    // Extract tag name
    const tagNameStart = this.pos;
    while (this.pos < this.length && 
           /[a-zA-Z0-9]/.test(this.html[this.pos])) {
      this.pos++;
    }
    const tagName = this.html.substring(tagNameStart, this.pos).toLowerCase();

    if (!tagName) {
      // Malformed tag, treat as text
      this.pos = start;
      this.parseText();
      return;
    }

    // Parse attributes (only for opening tags)
    const attributes = {};
    if (!isClosing) {
      this.parseAttributes(attributes);
    }

    // Check for self-closing
    const isSelfClosing = this.html[this.pos - 1] === '/' || 
                          this.isSelfClosingTag(tagName);

    // Find closing '>'
    while (this.pos < this.length && this.html[this.pos] !== '>') {
      this.pos++;
    }
    this.pos++; // Skip '>'

    this.tokens.push({
      type: isClosing ? 'tag-close' : (isSelfClosing ? 'tag-self-closing' : 'tag-open'),
      name: tagName,
      attributes: attributes
    });

    // CRITICAL FIX: Handle script and style tags specially
    // Their content should be treated as raw text until closing tag
    if (!isClosing && !isSelfClosing && (tagName === 'script' || tagName === 'style')) {
      this.parseRawContent(tagName);
    }
  }

  // NEW METHOD: Parse raw content for script/style tags
  parseRawContent(tagName) {
    const contentStart = this.pos;
    const closingTag = '</' + tagName;
    
    // Find the closing tag
    const closingIndex = this.html.toLowerCase().indexOf(closingTag, this.pos);
    
    if (closingIndex !== -1) {
      // Extract content between opening and closing tag
      const content = this.html.substring(contentStart, closingIndex);
      
      // Add as text token if not empty
      if (content.trim()) {
        this.tokens.push({
          type: 'text',
          content: content
        });
      }
      
      // Move position to the closing tag
      this.pos = closingIndex;
    } else {
      // No closing tag found, consume rest of document as content
      const content = this.html.substring(contentStart);
      if (content.trim()) {
        this.tokens.push({
          type: 'text',
          content: content
        });
      }
      this.pos = this.length;
    }
  }

  parseAttributes(attributes) {
    while (this.pos < this.length) {
      // Skip whitespace
      while (this.pos < this.length && /\s/.test(this.html[this.pos])) {
        this.pos++;
      }

      // Check if we're at the end of the tag
      if (this.pos >= this.length || 
          this.html[this.pos] === '>' || 
          this.html[this.pos] === '/') {
        break;
      }

      // Parse attribute name
      const attrNameStart = this.pos;
      while (this.pos < this.length && 
             /[a-zA-Z0-9\-_:]/.test(this.html[this.pos])) {
        this.pos++;
      }
      const attrName = this.html.substring(attrNameStart, this.pos).toLowerCase();

      if (!attrName) break;

      // Skip whitespace
      while (this.pos < this.length && /\s/.test(this.html[this.pos])) {
        this.pos++;
      }

      // Check for '='
      let attrValue = '';
      if (this.html[this.pos] === '=') {
        this.pos++; // Skip '='
        
        // Skip whitespace
        while (this.pos < this.length && /\s/.test(this.html[this.pos])) {
          this.pos++;
        }

        // Parse attribute value
        if (this.html[this.pos] === '"' || this.html[this.pos] === "'") {
          // Quoted value
          const quote = this.html[this.pos];
          this.pos++;
          const valueStart = this.pos;
          while (this.pos < this.length && this.html[this.pos] !== quote) {
            this.pos++;
          }
          attrValue = this.html.substring(valueStart, this.pos);
          this.pos++; // Skip closing quote
        } else {
          // Unquoted value
          const valueStart = this.pos;
          while (this.pos < this.length && 
                 !/[\s>\/]/.test(this.html[this.pos])) {
            this.pos++;
          }
          attrValue = this.html.substring(valueStart, this.pos);
        }
      }

      attributes[attrName] = attrValue;
    }
  }

  parseText() {
    const start = this.pos;
    while (this.pos < this.length && this.html[this.pos] !== '<') {
      this.pos++;
    }
    const text = this.html.substring(start, this.pos);
    
    // Only add non-empty text nodes
    if (text.trim()) {
      this.tokens.push({
        type: 'text',
        content: text
      });
    }
  }

  parseComment() {
    this.pos += 3; // Skip '!--'
    
    while (this.pos < this.length) {
      if (this.html.substr(this.pos, 3) === '-->') {
        this.pos += 3;
        break;
      }
      this.pos++;
    }
  }

  parseDoctype() {
    while (this.pos < this.length && this.html[this.pos] !== '>') {
      this.pos++;
    }
    this.pos++; // Skip '>'
  }

  isSelfClosingTag(tagName) {
    return SELF_CLOSING_TAGS.has(tagName);
  }
}

const SELF_CLOSING_TAGS = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
  'link', 'meta', 'param', 'source', 'track', 'wbr'
]);

// ============================================================================
// DOM NODE
// ============================================================================

class DOMNode {
  constructor(type, name = null) {
    this.type = type;
    this.name = name;
    this.attributes = {};
    this.children = [];
    this.parent = null;
    this.textContent = '';
    this._classList = null;
    this._id = null;
  }

  appendChild(child) {
    child.parent = this;
    this.children.push(child);
  }

  getAttribute(name) {
    return this.attributes[name] || null;
  }

  hasAttribute(name) {
    return name in this.attributes;
  }

  get classList() {
    if (this._classList === null) {
      const classAttr = this.getAttribute('class');
      this._classList = classAttr ? classAttr.split(/\s+/).filter(c => c) : [];
    }
    return this._classList;
  }

  get id() {
    if (this._id === null) {
      this._id = this.getAttribute('id') || '';
    }
    return this._id || null;
  }

  get innerHTML() {
    return this.children.map(child => {
      if (child.type === 'text') {
        return child.textContent;
      } else {
        return child.outerHTML;
      }
    }).join('');
  }

  get outerHTML() {
    if (this.type === 'text') {
      return this.textContent;
    }

    let html = `<${this.name}`;
    
    for (const [key, value] of Object.entries(this.attributes)) {
      html += ` ${key}="${value}"`;
    }
    
    html += '>';
    html += this.innerHTML;
    html += `</${this.name}>`;
    
    return html;
  }

  getText() {
    if (this.type === 'text') {
      return this.textContent;
    }
    return this.children.map(child => child.getText()).join('');
  }
}

// ============================================================================
// DOM TREE BUILDER
// ============================================================================

class DOMTreeBuilder {
  constructor(tokens) {
    this.tokens = tokens;
    this.root = new DOMNode('element', 'root');
    this.stack = [this.root];
  }

  build() {
    for (const token of this.tokens) {
      switch (token.type) {
        case 'tag-open':
          this.handleOpenTag(token);
          break;
        case 'tag-close':
          this.handleCloseTag(token);
          break;
        case 'tag-self-closing':
          this.handleSelfClosingTag(token);
          break;
        case 'text':
          this.handleText(token);
          break;
      }
    }
    return this.root;
  }

  handleOpenTag(token) {
    const node = new DOMNode('element', token.name);
    node.attributes = token.attributes;
    
    this.currentNode().appendChild(node);
    this.stack.push(node);
  }

  handleCloseTag(token) {
    for (let i = this.stack.length - 1; i >= 0; i--) {
      if (this.stack[i].name === token.name) {
        this.stack.splice(i);
        return;
      }
    }
  }

  handleSelfClosingTag(token) {
    const node = new DOMNode('element', token.name);
    node.attributes = token.attributes;
    this.currentNode().appendChild(node);
  }

  handleText(token) {
    const node = new DOMNode('text');
    node.textContent = token.content;
    this.currentNode().appendChild(node);
  }

  currentNode() {
    return this.stack[this.stack.length - 1];
  }
}

// ============================================================================
// CSS SELECTOR ENGINE
// ============================================================================

class CSSSelector {
  constructor(selector) {
    this.selector = selector.trim();
    this._parsedCache = null;
    this._isSimple = null;
  }

  matches(node) {
    if (node.type !== 'element') return false;

    if (this._parsedCache === null) {
      this._parsedCache = this.parseSelector(this.selector);
      this._isSimple = this._parsedCache.length === 1;
    }

    if (this._isSimple) {
      return this.matchesSimpleSelector(node, this._parsedCache[0].selector);
    } else {
      return this.matchesComplexSelector(node, this._parsedCache);
    }
  }

  parseSelector(selector) {
    const parts = [];
    let current = '';
    let i = 0;
    let insideBrackets = false;
    const len = selector.length;

    while (i < len) {
      const char = selector[i];
      
      if (char === '[') {
        insideBrackets = true;
        current += char;
        i++;
      } else if (char === ']') {
        insideBrackets = false;
        current += char;
        i++;
      } else if (!insideBrackets && char === '>') {
        if (current.trim()) {
          parts.push({ selector: current.trim(), combinator: null });
        }
        parts.push({ combinator: 'child' });
        current = '';
        i++;
        while (i < len && /\s/.test(selector[i])) i++;
      } else if (!insideBrackets && char === '+') {
        if (current.trim()) {
          parts.push({ selector: current.trim(), combinator: null });
        }
        parts.push({ combinator: 'adjacent' });
        current = '';
        i++;
        while (i < len && /\s/.test(selector[i])) i++;
      } else if (!insideBrackets && /\s/.test(char) && current.trim()) {
        let j = i;
        while (j < len && /\s/.test(selector[j])) j++;
        
        if (j < len && selector[j] !== '>' && selector[j] !== '+') {
          parts.push({ selector: current.trim(), combinator: null });
          parts.push({ combinator: 'descendant' });
          current = '';
          i = j;
        } else {
          i++;
        }
      } else {
        current += char;
        i++;
      }
    }

    if (current.trim()) {
      parts.push({ selector: current.trim(), combinator: null });
    }

    return parts.length === 1 ? [parts[0]] : parts;
  }

  matchesComplexSelector(node, parts) {
    const selectors = parts.filter(p => p.selector).map(p => p.selector);
    const combinators = parts.filter(p => p.combinator).map(p => p.combinator);

    const rightmost = selectors[selectors.length - 1];
    if (!this.matchesSimpleSelector(node, rightmost)) {
      return false;
    }

    let currentNode = node;
    for (let i = selectors.length - 2; i >= 0; i--) {
      const selector = selectors[i];
      const combinator = combinators[i];

      if (combinator === 'child') {
        currentNode = currentNode.parent;
        if (!currentNode || !this.matchesSimpleSelector(currentNode, selector)) {
          return false;
        }
      } else if (combinator === 'descendant') {
        let found = false;
        currentNode = currentNode.parent;
        while (currentNode) {
          if (this.matchesSimpleSelector(currentNode, selector)) {
            found = true;
            break;
          }
          currentNode = currentNode.parent;
        }
        if (!found) return false;
      } else if (combinator === 'adjacent') {
        const parent = currentNode.parent;
        if (!parent) return false;
        const siblings = parent.children.filter(c => c.type === 'element');
        const index = siblings.indexOf(currentNode);
        if (index <= 0) return false;
        currentNode = siblings[index - 1];
        if (!this.matchesSimpleSelector(currentNode, selector)) {
          return false;
        }
      }
    }

    return true;
  }

  matchesSimpleSelector(node, selector) {
    let remaining = selector;
    
    // Fast paths
    if (remaining[0] === '.' && /^\.[a-zA-Z0-9_-]+$/.test(remaining)) {
      return node.classList.includes(remaining.substring(1));
    }
    
    if (remaining[0] === '#' && /^#[a-zA-Z0-9_-]+$/.test(remaining)) {
      return node.id === remaining.substring(1);
    }
    
    if (/^[a-zA-Z0-9]+$/.test(remaining)) {
      return node.name === remaining;
    }
    
    // Complex selector
    let tagMatch = remaining.match(/^([a-zA-Z0-9]+)/);
    if (tagMatch) {
      if (node.name !== tagMatch[1]) return false;
      remaining = remaining.substring(tagMatch[0].length);
    }

    let classMatches = remaining.match(/\.[a-zA-Z0-9_-]+/g);
    if (classMatches) {
      const nodeClasses = node.classList;
      for (const classMatch of classMatches) {
        const className = classMatch.substring(1);
        if (!nodeClasses.includes(className)) return false;
      }
      remaining = remaining.replace(/\.[a-zA-Z0-9_-]+/g, '');
    }

    let idMatch = remaining.match(/#([a-zA-Z0-9_-]+)/);
    if (idMatch) {
      if (node.id !== idMatch[1]) return false;
      remaining = remaining.replace(/#[a-zA-Z0-9_-]+/, '');
    }

    let attrMatches = remaining.match(/\[([^\]]+)\]/g);
    if (attrMatches) {
      for (const attrMatch of attrMatches) {
        const attrContent = attrMatch.substring(1, attrMatch.length - 1);
        
        const eqMatch = attrContent.match(/^([^=]+)=(.+)$/);
        if (eqMatch) {
          let [, attrName, attrValue] = eqMatch;
          attrName = attrName.trim();
          attrValue = attrValue.trim();
          
          if ((attrValue.startsWith('"') && attrValue.endsWith('"')) ||
              (attrValue.startsWith("'") && attrValue.endsWith("'"))) {
            attrValue = attrValue.substring(1, attrValue.length - 1);
          }
          
          if (node.getAttribute(attrName) !== attrValue) {
            return false;
          }
        } else {
          if (!node.hasAttribute(attrContent.trim())) {
            return false;
          }
        }
      }
    }

    return true;
  }
}

// ============================================================================
// SOUP CLASS
// ============================================================================

class Soup {
  constructor(html) {
    const tokenizer = new HTMLTokenizer(html);
    const tokens = tokenizer.tokenize();
    const builder = new DOMTreeBuilder(tokens);
    this.root = builder.build();
    this._selectorCache = new Map();
  }

  find(selector) {
    const cssSelector = this._getCachedSelector(selector);
    return this._findFirst(this.root, cssSelector);
  }

  find_all(selector) {
    const cssSelector = this._getCachedSelector(selector);
    const results = [];
    this._findAll(this.root, cssSelector, results);
    return results;
  }

  select(selector) {
    return this.find_all(selector);
  }

  _getCachedSelector(selector) {
    if (!this._selectorCache.has(selector)) {
      this._selectorCache.set(selector, new CSSSelector(selector));
    }
    return this._selectorCache.get(selector);
  }

  _findFirst(node, cssSelector) {
    if (node.type === 'element' && cssSelector.matches(node)) {
      return node;
    }

    for (const child of node.children) {
      const result = this._findFirst(child, cssSelector);
      if (result) return result;
    }

    return null;
  }

  _findAll(node, cssSelector, results) {
    if (node.type === 'element' && cssSelector.matches(node)) {
      results.push(node);
    }

    for (const child of node.children) {
      this._findAll(child, cssSelector, results);
    }
  }

  prettify() {
    return this.root.innerHTML;
  }

  getText() {
    return this.root.getText();
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Soup, DOMNode, CSSSelector };
}
