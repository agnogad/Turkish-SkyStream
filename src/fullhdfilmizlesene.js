class HTMLTokenizer{constructor(t){this.html=t,this.pos=0,this.length=t.length,this.tokens=[]}tokenize(){for(;this.pos<this.length;)"<"===this.html[this.pos]?this.parseTag():this.parseText();return this.tokens}parseTag(){let t=this.pos;if(this.pos++,"!--"===this.html.substr(this.pos,3)){this.parseComment();return}if("!doctype"===this.html.substr(this.pos,8).toLowerCase()){this.parseDoctype();return}let s="/"===this.html[this.pos];s&&this.pos++;let e=this.pos;for(;this.pos<this.length&&/[a-zA-Z0-9]/.test(this.html[this.pos]);)this.pos++;let i=this.html.substring(e,this.pos).toLowerCase();if(!i){this.pos=t,this.parseText();return}let h={};s||this.parseAttributes(h);let r="/"===this.html[this.pos-1]||this.isSelfClosingTag(i);for(;this.pos<this.length&&">"!==this.html[this.pos];)this.pos++;this.pos++,this.tokens.push({type:s?"tag-close":r?"tag-self-closing":"tag-open",name:i,attributes:h}),s||r||"script"!==i&&"style"!==i||this.parseRawContent(i)}parseRawContent(t){let s=this.pos,e=this.html.toLowerCase().indexOf("</"+t,this.pos);if(-1!==e){let i=this.html.substring(s,e);i.trim()&&this.tokens.push({type:"text",content:i}),this.pos=e}else{let h=this.html.substring(s);h.trim()&&this.tokens.push({type:"text",content:h}),this.pos=this.length}}parseAttributes(t){for(;this.pos<this.length;){for(;this.pos<this.length&&/\s/.test(this.html[this.pos]);)this.pos++;if(this.pos>=this.length||">"===this.html[this.pos]||"/"===this.html[this.pos])break;let s=this.pos;for(;this.pos<this.length&&/[a-zA-Z0-9\-_:]/.test(this.html[this.pos]);)this.pos++;let e=this.html.substring(s,this.pos).toLowerCase();if(!e)break;for(;this.pos<this.length&&/\s/.test(this.html[this.pos]);)this.pos++;let i="";if("="===this.html[this.pos]){for(this.pos++;this.pos<this.length&&/\s/.test(this.html[this.pos]);)this.pos++;if('"'===this.html[this.pos]||"'"===this.html[this.pos]){let h=this.html[this.pos];this.pos++;let r=this.pos;for(;this.pos<this.length&&this.html[this.pos]!==h;)this.pos++;i=this.html.substring(r,this.pos),this.pos++}else{let l=this.pos;for(;this.pos<this.length&&!/[\s>\/]/.test(this.html[this.pos]);)this.pos++;i=this.html.substring(l,this.pos)}}t[e]=i}}parseText(){let t=this.pos;for(;this.pos<this.length&&"<"!==this.html[this.pos];)this.pos++;let s=this.html.substring(t,this.pos);s.trim()&&this.tokens.push({type:"text",content:s})}parseComment(){for(this.pos+=3;this.pos<this.length;){if("-->"===this.html.substr(this.pos,3)){this.pos+=3;break}this.pos++}}parseDoctype(){for(;this.pos<this.length&&">"!==this.html[this.pos];)this.pos++;this.pos++}isSelfClosingTag(t){return SELF_CLOSING_TAGS.has(t)}}const SELF_CLOSING_TAGS=new Set(["area","base","br","col","embed","hr","img","input","link","meta","param","source","track","wbr"]);class DOMNode{constructor(t,s=null){this.type=t,this.name=s,this.attributes={},this.children=[],this.parent=null,this.textContent="",this._classList=null,this._id=null}appendChild(t){t.parent=this,this.children.push(t)}getAttribute(t){return this.attributes[t]||null}hasAttribute(t){return t in this.attributes}get classList(){if(null===this._classList){let t=this.getAttribute("class");this._classList=t?t.split(/\s+/).filter(t=>t):[]}return this._classList}get id(){return null===this._id&&(this._id=this.getAttribute("id")||""),this._id||null}get innerHTML(){return this.children.map(t=>"text"===t.type?t.textContent:t.outerHTML).join("")}get outerHTML(){if("text"===this.type)return this.textContent;let t=`<${this.name}`;for(let[s,e]of Object.entries(this.attributes))t+=` ${s}="${e}"`;return t+=">",t+=this.innerHTML,t+=`</${this.name}>`}getText(){return"text"===this.type?this.textContent:this.children.map(t=>t.getText()).join("")}}class DOMTreeBuilder{constructor(t){this.tokens=t,this.root=new DOMNode("element","root"),this.stack=[this.root]}build(){for(let t of this.tokens)switch(t.type){case"tag-open":this.handleOpenTag(t);break;case"tag-close":this.handleCloseTag(t);break;case"tag-self-closing":this.handleSelfClosingTag(t);break;case"text":this.handleText(t)}return this.root}handleOpenTag(t){let s=new DOMNode("element",t.name);s.attributes=t.attributes,this.currentNode().appendChild(s),this.stack.push(s)}handleCloseTag(t){for(let s=this.stack.length-1;s>=0;s--)if(this.stack[s].name===t.name){this.stack.splice(s);return}}handleSelfClosingTag(t){let s=new DOMNode("element",t.name);s.attributes=t.attributes,this.currentNode().appendChild(s)}handleText(t){let s=new DOMNode("text");s.textContent=t.content,this.currentNode().appendChild(s)}currentNode(){return this.stack[this.stack.length-1]}}class CSSSelector{constructor(t){this.selector=t.trim(),this._parsedCache=null,this._isSimple=null}matches(t){return"element"===t.type&&((null===this._parsedCache&&(this._parsedCache=this.parseSelector(this.selector),this._isSimple=1===this._parsedCache.length),this._isSimple)?this.matchesSimpleSelector(t,this._parsedCache[0].selector):this.matchesComplexSelector(t,this._parsedCache))}parseSelector(t){let s=[],e="",i=0,h=!1,r=t.length;for(;i<r;){let l=t[i];if("["===l)h=!0,e+=l,i++;else if("]"===l)h=!1,e+=l,i++;else if(h||">"!==l){if(h||"+"!==l){if(!h&&/\s/.test(l)&&e.trim()){let o=i;for(;o<r&&/\s/.test(t[o]);)o++;o<r&&">"!==t[o]&&"+"!==t[o]?(s.push({selector:e.trim(),combinator:null}),s.push({combinator:"descendant"}),e="",i=o):i++}else e+=l,i++}else for(e.trim()&&s.push({selector:e.trim(),combinator:null}),s.push({combinator:"adjacent"}),e="",i++;i<r&&/\s/.test(t[i]);)i++}else for(e.trim()&&s.push({selector:e.trim(),combinator:null}),s.push({combinator:"child"}),e="",i++;i<r&&/\s/.test(t[i]);)i++}return e.trim()&&s.push({selector:e.trim(),combinator:null}),1===s.length?[s[0]]:s}matchesComplexSelector(t,s){let e=s.filter(t=>t.selector).map(t=>t.selector),i=s.filter(t=>t.combinator).map(t=>t.combinator),h=e[e.length-1];if(!this.matchesSimpleSelector(t,h))return!1;let r=t;for(let l=e.length-2;l>=0;l--){let o=e[l],n=i[l];if("child"===n){if(!(r=r.parent)||!this.matchesSimpleSelector(r,o))return!1}else if("descendant"===n){let a=!1;for(r=r.parent;r;){if(this.matchesSimpleSelector(r,o)){a=!0;break}r=r.parent}if(!a)return!1}else if("adjacent"===n){let p=r.parent;if(!p)return!1;let c=p.children.filter(t=>"element"===t.type),u=c.indexOf(r);if(u<=0||(r=c[u-1],!this.matchesSimpleSelector(r,o)))return!1}}return!0}matchesSimpleSelector(t,s){let e=s;if("."===e[0]&&/^\.[a-zA-Z0-9_-]+$/.test(e))return t.classList.includes(e.substring(1));if("#"===e[0]&&/^#[a-zA-Z0-9_-]+$/.test(e))return t.id===e.substring(1);if(/^[a-zA-Z0-9]+$/.test(e))return t.name===e;let i=e.match(/^([a-zA-Z0-9]+)/);if(i){if(t.name!==i[1])return!1;e=e.substring(i[0].length)}let h=e.match(/\.[a-zA-Z0-9_-]+/g);if(h){let r=t.classList;for(let l of h){let o=l.substring(1);if(!r.includes(o))return!1}e=e.replace(/\.[a-zA-Z0-9_-]+/g,"")}let n=e.match(/#([a-zA-Z0-9_-]+)/);if(n){if(t.id!==n[1])return!1;e=e.replace(/#[a-zA-Z0-9_-]+/,"")}let a=e.match(/\[([^\]]+)\]/g);if(a)for(let p of a){let c=p.substring(1,p.length-1),u=c.match(/^([^=]+)=(.+)$/);if(u){let[,m,f]=u;if(m=m.trim(),((f=f.trim()).startsWith('"')&&f.endsWith('"')||f.startsWith("'")&&f.endsWith("'"))&&(f=f.substring(1,f.length-1)),t.getAttribute(m)!==f)return!1}else if(!t.hasAttribute(c.trim()))return!1}return!0}}class Soup{constructor(t){let s=new HTMLTokenizer(t),e=s.tokenize(),i=new DOMTreeBuilder(e);this.root=i.build(),this._selectorCache=new Map}find(t){let s=this._getCachedSelector(t);return this._findFirst(this.root,s)}find_all(t){let s=this._getCachedSelector(t),e=[];return this._findAll(this.root,s,e),e}select(t){return this.find_all(t)}_getCachedSelector(t){return this._selectorCache.has(t)||this._selectorCache.set(t,new CSSSelector(t)),this._selectorCache.get(t)}_findFirst(t,s){if("element"===t.type&&s.matches(t))return t;for(let e of t.children){let i=this._findFirst(e,s);if(i)return i}return null}_findAll(t,s,e){for(let i of("element"===t.type&&s.matches(t)&&e.push(t),t.children))this._findAll(i,s,e)}prettify(){return this.root.innerHTML}getText(){return this.root.getText()}}"undefined"!=typeof module&&module.exports&&(module.exports={Soup,DOMNode,CSSSelector});

const MAIN_URL = "https://www.fullhdfilmizlesene.tv";

const commonHeaders = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36"
};

// --- Manifest ---
async function getManifest() {
    return {
        id: "com.turkish.repo.fullhdfilmizlesene",
        version: 2,
        name: "fullhdfilmizlesene",
        description: "film kaynağı",
        baseUrl: MAIN_URL,
        lang: "tr",
        hasSearch: true,
        bg: "#000000",
        fg: "#FFFFFF"
    };
}

// --- Helpers ---
function fixUrl(url) {
    if (!url) return "";
    if (url.startsWith("//")) return "https:" + url;
    if (url.startsWith("/")) return MAIN_URL + url;
    return url;
}



// Film extract
function findIn(parent, selector) {
    // Basit sınıf seçimi kontrolü (Örn: .film-title)
    const isClass = selector.startsWith('.');
    const target = isClass ? selector.slice(1) : selector;

    // Dökümantasyondaki DOM Node API: node.children bir dizidir.
    for (const child of parent.children) {
        if (child.type === 'element') {
            if (isClass && child.classList.includes(target)) return child;
            if (!isClass && child.name === target) return child;
            
            // Alt çocuklarda rekürsif arama
            const found = findIn(child, selector);
            if (found) return found;
        }
    }
    return null;
}

function parseMovies(html) {
    const soup = new Soup(html); //
    const items = [];
    const filmBlocks = soup.select('li.film'); //

    filmBlocks.forEach(block => {
        // 1. Başlık Çekme
        const titleNode = findIn(block, '.film-title');
        const titleText = titleNode ? titleNode.getText().trim() : 'Bulunamadı'; //

        // 2. Link Çekme
        const linkNode = findIn(block, '.tt');
        const url = linkNode ? linkNode.getAttribute('href') : null; //

        // 3. Resim Çekme
        const imgNode = findIn(block, 'img');
        const posterUrl = imgNode ? imgNode.getAttribute('data-src') : ""; //

        // Sadece geçerli verileri ekle
        if (url) {
            items.push({
                title: titleText,
                url: url,
                posterUrl: posterUrl
            });
        }
    });

    return items;
}

// --- HOME ---
async function getHome() {
    return new Promise(resolve => {
        const categories = [
            { title: "Homepage", url: "" },
            { title: "Top 10", url: "en-cok-izlenen-filmler-izle-hd/" },
            { title: "IMDB Puanı Yüksek Filmler", url: "filmizle/imdb-puani-yuksek-filmler-izle-1/" },
            { title: "Aksiyon Filmleri", url: "filmizle/aksiyon-filmleri-hdf-izle/" },
            { title: "Bilim Kurgu Filmleri", url: "filmizle/bilim-kurgu-filmleri-izle-2/" },
            { title: "Yerli Filmler", url: "filmizle/yerli-filmler-hd-izle/" }
        ];

        const results = {};
        let completed = 0;

        categories.forEach(cat => {
            const fullUrl = `${MAIN_URL}/${cat.url}`;

            http_get(fullUrl, commonHeaders, res => {
                completed++;

                if (res.status === 200) {
                	const datam = parseMovies(res.body);
                if(datam.length > 0){
                    results[cat.title] = datam; 
                } 
                } 
                if (completed === categories.length) {
                    resolve(results); // ✅ KRİTİK FIX
                }
            });
        });
    });
}

