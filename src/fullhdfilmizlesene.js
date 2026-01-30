const BASE_URL = "https://www.fullhdfilmizlesene.tv";

const commonHeaders = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36"
};

// --- Manifest ---
async function getManifest() {
    return {
        id: "dev.turkish.fullhdfilmizlesene",
        version: 2,
        name: "Fullhdfilmizlesene",
        description: "film kaynağı",
        baseUrl: BASE_URL,
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
    if (url.startsWith("/")) return BASE_URL + url;
    return url;
}

// Film extract
function parseMovies(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    const items = [];

    doc.querySelectorAll("li.film").forEach(el => {
        const titleEl = el.querySelector("span.film-title");
        if (!titleEl) return;

        const title = titleEl.textContent.trim();
        if (!title) return;

        const aTag = el.querySelector("a");
        if (!aTag) return;

        const href = fixUrl(aTag.getAttribute("href"));

        const img = el.querySelector("img");
        let poster = "";
        if (img) {
            poster = img.getAttribute("data-src") || img.getAttribute("src") || "";
            poster = fixUrl(poster);
        }

        items.push({
            name: title,
            link: href,
            image: poster
        });
    });

    return items;
}

// --- Home ---
function getHome(cb) {
    const categories = [
        { title: "Homepage", url: "" },
        { title: "En Çok İzlenen Filmler", url: "en-cok-izlenen-filmler-izle-hd/" },
        { title: "IMDB Puanı Yüksek Filmler", url: "filmizle/imdb-puani-yuksek-filmler-izle-1/" },
        { title: "Aile Filmleri", url: "filmizle/aile-filmleri-hdf-izle/" },
        { title: "Aksiyon Filmleri", url: "filmizle/aksiyon-filmleri-hdf-izle/" },
        { title: "Animasyon Filmleri", url: "filmizle/animasyon-filmleri-fhd-izle/" },
        { title: "Belgeseller", url: "filmizle/belgesel-filmleri-izle/" },
        { title: "Bilim Kurgu Filmleri", url: "filmizle/bilim-kurgu-filmleri-izle-2/" }
    ];

    const results = [];
    let completed = 0;

    categories.forEach(cat => {
        const fullUrl = `${BASE_URL}/${cat.url}`;

        http_get(fullUrl, commonHeaders, res => {
            completed++;

            if (res && res.status === 200) {
                const items = parseMovies(res.body);
                results.push({
                    title: cat.title,
                    Data: items
                });
            }

            // Tüm kategoriler bittiğinde tek callback
            if (completed === categories.length) {
                cb(JSON.stringify(results));
            }
        });
    });
}
