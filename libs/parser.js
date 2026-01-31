// --- Mini DOM Node ---
class Node {
  constructor(tag = "", attrs = {}, children = [], parent = null, text = "") {
    this.tag = tag;
    this.attrs = attrs;
    this.children = children;
    this.parent = parent;
    this.text = text;
  }

  querySelector(selector) {
    if (matchesSelector(this, selector)) return this;
    for (const child of this.children) {
      const found = child.querySelector(selector);
      if (found) return found;
    }
    return null;
  }

  querySelectorAll(selector, acc = []) {
    if (matchesSelector(this, selector)) acc.push(this);
    for (const child of this.children) {
      child.querySelectorAll(selector, acc);
    }
    return acc;
  }

  textContent() {
    let t = this.text;
    for (const c of this.children) t += c.textContent();
    return t.trim();
  }

  getAttribute(name) {
    return this.attrs[name] || null;
  }
}

// --- Selector matcher ---
function matchesSelector(node, selector) {
  if (!node.tag) return false;
  if (selector.startsWith(".")) {
    return node.attrs.class?.split(" ").includes(selector.slice(1));
  } else if (selector.startsWith("#")) {
    return node.attrs.id === selector.slice(1);
  } else {
    return node.tag === selector;
  }
}

// --- HTML Parser ---
function parseHTML(html) {
  html = html.replace(/\n/g, "");
  const root = new Node("root", {}, []);
  let pos = 0;
  let stack = [root];

  const tagRegex = /<([a-zA-Z0-9\-]+)([^>]*)>|<\/([a-zA-Z0-9\-]+)>|([^<]+)/g;
  let m;
  while ((m = tagRegex.exec(html))) {
    const [full, openTag, attrStr, closeTag, text] = m;
    const current = stack[stack.length - 1];

    if (openTag) {
      const attrs = {};
      if (attrStr) {
        const attrRegex = /([a-zA-Z0-9\-:]+)="(.*?)"/g;
        let a;
        while ((a = attrRegex.exec(attrStr))) {
          attrs[a[1]] = a[2];
        }
      }
      const node = new Node(openTag, attrs, [], current);
      current.children.push(node);
      stack.push(node);
    } else if (closeTag) {
      stack.pop();
    } else if (text) {
      const t = text.trim();
      if (t) current.children.push(new Node("", {}, [], current, t));
    }
  }

  return root;
}

// --- Helpers ---
function fixUrl(url, base) {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  return new URL(url, base).href;
}
