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
        name: "Fullhdfilmizlesene",
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
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    const items = [];

    doc.querySelectorAll("li.film").forEach(el => {
        const titleEl = el.querySelector("span.film-title");
        if (!titleEl) return;

        const title = titleEl.textContent.trim();
        if (!title) return;

        const aTag = el.querySelector("a");
        if (!aTag || !aTag.getAttribute("href")) return;

        const href = fixUrl(aTag.getAttribute("href"));

        const img = el.querySelector("img");
        let poster = "";
        if (img) {
            poster = img.getAttribute("data-src") || img.getAttribute("src") || "";
            if (poster) poster = fixUrl(poster);
        }

        items.push({
            title: title,
            url: href,
            posterUrl: poster
        });
    });

    return items;
}

function getHome(cb) {
    const categories = [
        { title: "Homepage", url: "" },
        { title: "En Çok İzlenen Filmler", url: "en-cok-izlenen-filmler-izle-hd/" },
        { title: "IMDB Puanı Yüksek Filmler", url: "filmizle/imdb-puani-yuksek-filmler-izle-1/" },
        { title: "Aile Filmleri", url: "filmizle/aile-filmleri-hdf-izle/" },
        { title: "Aksiyon Filmleri", url: "filmizle/aksiyon-filmleri-hdf-izle/" },
        { title: "Animasyon Filmleri", url: "filmizle/animasyon-filmleri-fhd-izle/" },
        { title: "Belgeseller", url: "filmizle/belgesel-filmleri-izle/" },
        { title: "Bilim Kurgu Filmleri", url: "filmizle/bilim-kurgu-filmleri-izle-2/" },
        { title: "Blu Ray Filmler", url: "filmizle/bluray-filmler-izle/" },
        { title: "Çizgi Filmler", url: "filmizle/cizgi-filmler-fhd-izle/" },
        { title: "Dram Filmleri", url: "filmizle/dram-filmleri-hd-izle/" },
        { title: "Fantastik Filmler", url: "filmizle/fantastik-filmler-hd-izle/" },
        { title: "Gerilim Filmleri", url: "filmizle/gerilim-filmleri-fhd-izle/" },
        { title: "Gizem Filmleri", url: "filmizle/gizem-filmleri-hd-izle/" },
        { title: "Hint Filmleri", url: "filmizle/hint-filmleri-fhd-izle/" },
        { title: "Komedi Filmleri", url: "filmizle/komedi-filmleri-fhd-izle/" },
        { title: "Korku Filmleri", url: "filmizle/korku-filmleri-izle-3/" },
        { title: "Macera Filmleri", url: "filmizle/macera-filmleri-fhd-izle/" },
        { title: "Müzikal Filmler", url: "filmizle/muzikal-filmler-izle/" },
        { title: "Polisiye Filmleri", url: "filmizle/polisiye-filmleri-izle/" },
        { title: "Psikolojik Filmler", url: "filmizle/psikolojik-filmler-izle/" },
        { title: "Romantik Filmler", url: "filmizle/romantik-filmler-fhd-izle/" },
        { title: "Savaş Filmleri", url: "filmizle/savas-filmleri-fhd-izle/" },
        { title: "Suç Filmleri", url: "filmizle/suc-filmleri-izle/" },
        { title: "Tarih Filmleri", url: "filmizle/tarih-filmleri-fhd-izle/" },
        { title: "Western Filmler", url: "filmizle/western-filmler-hd-izle-3/" },
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
