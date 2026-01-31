const mainUrl = "https://www.fullhdfilmizlesene.tv";
var MAIN_URL ="https://www.fullhdfilmizlesene.tv";

const commonHeaders = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36"
};

const externalHeaders = {
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
    if (url.startsWith("/")) return mainUrl + url;
    return url;
}

function decodeHtml(html) {
    if (!html) return "";
    return html.replace(/&#(\d+);/g, function (match, dec) {
        return String.fromCharCode(dec);
    }).replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'")
        .replace(/&apos;/g, "'");
}

// Film extract için
function parseMovies(html) {
    const items = [];

    // <li class="film"> ... </li>
    const filmBlocks = html.match(/<li[^>]*class=["']film["'][\s\S]*?<\/li>/g) || [];

    filmBlocks.forEach(block => {
        // title
        const titleMatch = block.match(/class=["']film-title["'][^>]*>([^<]+)</);
        if (!titleMatch) return;

        const title = titleMatch[1].trim();
        if (!title) return;

        // link
        const linkMatch = block.match(/<a[^>]+href=["']([^"']+)["']/);
        if (!linkMatch) return;

        const link = fixUrl(linkMatch[1]);

        // image
        const imgMatch = block.match(/<img[^>]+(data-src|src)=["']([^"']+)["']/);
        let image = "";
        if (imgMatch) image = fixUrl(imgMatch[2]);

        items.push({
            title: title,
            url: link,
            posterUrl: image
        });
    });
    return items;
}

async function getHome() {
    const categories = [
        { title: "Homepage", url: "" },
        { title: "En Çok İzlenen Filmler", url: "en-cok-izlenen-filmler-izle-hd/" },
        { title: "IMDB Puanı Yüksek Filmler", url: "filmizle/imdb-puani-yuksek-filmler-izle-1/" },
        { title: "Aksiyon Filmleri", url: "filmizle/aksiyon-filmleri-hdf-izle/" },
        { title: "Bilim Kurgu Filmleri", url: "filmizle/bilim-kurgu-filmleri-izle-2/" },
        { title: "Yerli Filmler", url: "filmizle/yerli-filmler-hd-izle/" }
    ];

    const results = {};
    let completed = 0;

    categories.forEach(cat => {
        const fullUrl = `${mainUrl}/${cat.url}`;

        http_get(fullUrl, commonHeaders, res => {
            completed++;

            if (res.status === 200) {
                const items = parseMovies(res.body);
                results[cat.title] = items; // 🔴 ASIL OLAY BURASI
            } else {
                results[cat.title] = [];
            }

            // Tüm kategoriler bitince TEK SEFER callback
            if (completed === categories.length) {
                return results;
            }
        });
    });
}

