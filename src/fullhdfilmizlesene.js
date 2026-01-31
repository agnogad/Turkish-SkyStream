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
function parseMovies(html) {
    const items = [];
    const filmBlocks = html.match(/<li[^>]*class=["']film["'][\s\S]*?<\/li>/g) || [];

    filmBlocks.forEach(block => {
        const titleMatch = block.match(/class=["']film-title["'][^>]*>([^<]+)</);
        if (!titleMatch) return;

        const linkMatch = block.match(/<a[^>]+href=["']([^"']+)["']/);
        if (!linkMatch) return;

        const imgMatch = block.match(/<img[^>]+(data-src|src)=["']([^"']+)["']/);

        items.push({
            title: titleMatch[1].trim(),
            url: fixUrl(linkMatch[1]),
            posterUrl: imgMatch ? fixUrl(imgMatch[2]) : ""
        });
    });

    return items;
}

// --- HOME ---
async function getHome() {
    return new Promise(resolve => {
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
            const fullUrl = `${MAIN_URL}/${cat.url}`;

            http_get(fullUrl, commonHeaders, res => {
                completed++;

                if (res.status === 200) {
                    results[cat.title] = parseMovies(res.body);
                } else {
                    results[cat.title] = [];
                }

                if (completed === categories.length) {
                    resolve(results); // ✅ KRİTİK FIX
                }
            });
        });
    });
}
