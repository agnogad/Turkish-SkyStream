
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

