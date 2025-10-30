import React, { useEffect, useMemo, useRef, useState } from "react";
import { Loader2, RefreshCw, Search, Globe, Filter, Moon, Sun, ExternalLink, Check, X, Newspaper } from "lucide-react";
import { XMLParser } from "fast-xml-parser";

/**
 * Greek Newsfeed App — updated:
 * - categories (topic filters)
 * - lazy thumbnails (extract og:image / feed enclosure / first image)
 * - mobile responsive layout
 * - uses Pages Function proxy at /api/proxy?url= (same-origin)
 */

/* -------------------------
   Configure sources + categories
   ------------------------- */
const SITES = [
  { name: "Η Καθημερινή", domain: "kathimerini.gr", category: "News" },
  { name: "Πρώτο Θέμα", domain: "protothema.gr", category: "News" },
  { name: "ΤΑ ΝΕΑ", domain: "tanea.gr", category: "News" },
  { name: "Το Βήμα", domain: "tovima.gr", category: "News" },
  { name: "Η Ναυτεμπορική", domain: "naftemporiki.gr", category: "Business" },
  { name: "ΣΚΑΪ", domain: "skai.gr", category: "News" },
  { name: "ERT News", domain: "ertnews.gr", category: "News" },
  { name: "ANT1 News", domain: "ant1news.gr", category: "News" },
  { name: "Alpha News", domain: "alphatv.gr", category: "News" },
  { name: "STAR News", domain: "star.gr", category: "News" },
  { name: "CNN Greece", domain: "cnn.gr", category: "News" },
  { name: "in.gr", domain: "in.gr", category: "News" },
  { name: "Έθνος", domain: "ethnos.gr", category: "News" },
  { name: "Εφ. των Συντακτών", domain: "efsyn.gr", category: "Opinion" },
  { name: "iefimerida", domain: "iefimerida.gr", category: "News" },
  { name: "Lifo", domain: "lifo.gr", category: "Culture" },
  { name: "Capital.gr", domain: "capital.gr", category: "Business" },
  { name: "Liberal", domain: "liberal.gr", category: "News" },
  { name: "Mononews", domain: "mononews.gr", category: "Business" },
  { name: "News247", domain: "news247.gr", category: "News" },
  { name: "Newsit", domain: "newsit.gr", category: "News" },
  { name: "Zougla", domain: "zougla.gr", category: "News" },
  { name: "Insider", domain: "insider.gr", category: "Business" },
  { name: "OT", domain: "ot.gr", category: "Business" },
  { name: "The TOC", domain: "thetoc.gr", category: "Culture" },
  { name: "Παραπολιτικά", domain: "parapolitika.gr", category: "Politics" },
  { name: "Dikaiologitika", domain: "dikaiologitika.gr", category: "News" },
  { name: "enikos", domain: "enikos.gr", category: "News" },
  { name: "Αυγή", domain: "avgi.gr", category: "Politics" },
  { name: "Ριζοσπάστης", domain: "rizospastis.gr", category: "Politics" },
  { name: "HuffPost Greece", domain: "huffingtonpost.gr", category: "Culture" },
  { name: "Reader", domain: "reader.gr", category: "Culture" },
  { name: "PageNews", domain: "pagenews.gr", category: "News" },
  { name: "ieidiseis", domain: "ieidiseis.gr", category: "News" },
  { name: "Real.gr", domain: "real.gr", category: "News" },
  { name: "Reporter.gr", domain: "reporter.gr", category: "News" },
  { name: "BankingNews", domain: "bankingnews.gr", category: "Business" },
  { name: "Startupper", domain: "startupper.gr", category: "Tech" },
  { name: "Law & Order", domain: "lawandorder.gr", category: "Crime" },
  { name: "Newpost", domain: "newpost.gr", category: "News" },
  { name: "Flash.gr", domain: "flash.gr", category: "News" },
  { name: "Newsbomb", domain: "newsbomb.gr", category: "News" },
  { name: "Sport24", domain: "sport24.gr", category: "Sports" },
  { name: "Gazzetta", domain: "gazzetta.gr", category: "Sports" },
  { name: "SDNA", domain: "sdna.gr", category: "Sports" },
  { name: "Contra", domain: "contra.gr", category: "Sports" },
  { name: "Insomnia", domain: "insomnia.gr", category: "Tech" },
  { name: "Techblog", domain: "techblog.gr", category: "Tech" },
  { name: "SecNews", domain: "secnews.gr", category: "Tech" },
  { name: "Μακεδονία", domain: "makthes.gr", category: "Local" },
  { name: "Voria", domain: "voria.gr", category: "Local" },
  { name: "Cretapost", domain: "cretapost.gr", category: "Local" },
  { name: "Patris News", domain: "patrisnews.com", category: "Local" },
  { name: "Pelop.gr", domain: "pelop.gr", category: "Local" },
  { name: "Thestival", domain: "thestival.gr", category: "Local" },
  { name: "Euronews GR", domain: "gr.euronews.com", category: "News" },
  { name: "Ypodomes", domain: "ypodomes.com", category: "Infra" },
  { name: "Fortune Greece", domain: "fortunegreece.com", category: "Business" },
  { name: "Ygeiamou", domain: "ygeiamou.gr", category: "Health" },
  { name: "AMNA", domain: "amna.gr", category: "News" },
];

const CATEGORIES = Array.from(new Set(SITES.map(s => s.category))).sort();

/* -------------------------
   Utilities
   ------------------------- */
const toGoogleNewsRss = (domain) =>
  `https://news.google.com/rss/search?q=site:${encodeURIComponent(domain)}&hl=el&gl=GR&ceid=GR:el`;

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  textNodeName: "#text",
});

const timeAgo = (date) => {
  const sec = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
  if (sec < 60) return `${sec}s`;
  const m = Math.floor(sec / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d`;
  const w = Math.floor(d / 7);
  if (w < 4) return `${w}w`;
  const months = Math.floor(d / 30);
  if (months < 12) return `${months}mo`;
  const y = Math.floor(d / 365);
  return `${y}y`;
};

const LS = {
  getProxy() { return localStorage.getItem("grnews_proxy") || ""; },
  setProxy(v) { localStorage.setItem("grnews_proxy", v); },
  getReadSet() {
    try { return new Set(JSON.parse(localStorage.getItem("grnews_read") || "[]")); } catch { return new Set(); }
  },
  saveReadSet(s) { localStorage.setItem("grnews_read", JSON.stringify(Array.from(s))); },
};

/* -------------------------
   Component
   ------------------------- */
export default function GreekNewsfeedApp() {
  // default proxy is same-origin Pages Function
  const defaultProxy = "/api/proxy?url=";
  const [dark, setDark] = useState(() => (localStorage.getItem("grnews_dark") || "true") === "true");
  const [proxy, setProxy] = useState(() => LS.getProxy() || defaultProxy);
  const [query, setQuery] = useState("");
  const [selectedSites, setSelectedSites] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [perPage] = useState(60);
  const readSetRef = useRef(LS.getReadSet());
  // thumbnails cache: id -> url
  const thumbsRef = useRef(new Map());

  useEffect(() => { document.documentElement.classList.toggle("dark", dark); localStorage.setItem("grnews_dark", String(dark)); }, [dark]);
  useEffect(() => { if (proxy) LS.setProxy(proxy); }, [proxy]);

  const visibleItems = useMemo(() => {
    const filtered = items.filter(it => {
      const matchQuery = !query || it.title.toLowerCase().includes(query.toLowerCase());
      const matchSite = selectedSites.length === 0 || selectedSites.includes(it.source);
      const matchCategory = selectedCategory === "All" || (it.category || "News") === selectedCategory;
      return matchQuery && matchSite && matchCategory;
    });
    return filtered.slice(0, page * perPage);
  }, [items, query, selectedSites, selectedCategory, page, perPage]);

  const toggleSite = (domain) => {
    setSelectedSites((prev) => prev.includes(domain) ? prev.filter(d => d !== domain) : [...prev, domain]);
  };

  const fetchWithProxy = async (url) => {
    const finalUrl = proxy ? `${proxy}${encodeURIComponent(url)}` : url;
    const r = await fetch(finalUrl);
    if (!r.ok) throw new Error(`HTTP ${r.status} for ${url}`);
    const text = await r.text();
    return text;
  };

  const parseRss = (xml, sourceDomain) => {
    try {
      const j = parser.parse(xml);
      // RSS
      if (j.rss && j.rss.channel) {
        const ch = j.rss.channel;
        const arr = Array.isArray(ch.item) ? ch.item : ch.item ? [ch.item] : [];
        return arr.map((it) => {
          // attempt to find thumbnail in the feed item
          const media = it["media:content"] || it["media:thumbnail"] || it.enclosure;
          let thumb = "";
          if (media) {
            if (typeof media === "object" && media["@_url"]) thumb = media["@_url"];
            else if (typeof media === "string") thumb = media;
            else if (Array.isArray(media) && media[0]?.["@_url"]) thumb = media[0]["@_url"];
          }
          return ({
            id: (it.link && typeof it.link === "string" && it.link.includes("/articles/CB")) ? it.link : (it.guid?.["#text"] || it.guid || it.link || it.title),
            title: it.title || "(χωρίς τίτλο)",
            link: typeof it["link"] === "object" ? (it["link"]["#text"] || "") : (it.link || ""),
            pubDate: new Date(it.pubDate || it.published || it.updated || Date.now()),
            source: sourceDomain,
            category: (SITES.find(s => s.domain === sourceDomain)?.category) || "News",
            thumbnail: thumb || "",
          });
        });
      }
      // Atom
      if (j.feed && j.feed.entry) {
        const arr = Array.isArray(j.feed.entry) ? j.feed.entry : [j.feed.entry];
        return arr.map((it) => {
          let link = "";
          if (Array.isArray(it.link)) {
            const alt = it.link.find((l) => l["@_rel"] === "alternate");
            link = alt?.["@_href"] || it.link[0]?.["@_href"] || "";
          } else if (it.link?.["@_href"]) { link = it.link["@_href"]; }
          // check for media/content
          const media = it["media:content"] || it.content;
          let thumb = "";
          if (media && typeof media === "object" && media["@_url"]) thumb = media["@_url"];
          return {
            id: it.id || link || it.title,
            title: it.title?.["#text"] || it.title || "(χωρίς τίτλο)",
            link,
            pubDate: new Date(it.updated || it.published || Date.now()),
            source: sourceDomain,
            category: (SITES.find(s => s.domain === sourceDomain)?.category) || "News",
            thumbnail: thumb || "",
          };
        });
      }
    } catch (e) {
      console.warn("Parse error", e);
    }
    return [];
  };

  const loadAll = async () => {
    setLoading(true); setError(null); setItems([]); setPage(1);
    try {
      const feeds = SITES.map(s => ({ ...s, url: toGoogleNewsRss(s.domain) }));
      const results = await Promise.allSettled(feeds.map(async (s) => {
        const xml = await fetchWithProxy(s.url);
        const items = parseRss(xml, s.domain);
        return items;
      }));
      const list = [];
      for (const r of results) {
        if (r.status === "fulfilled") list.push(...r.value);
        else console.warn("Feed failed", r.reason);
      }
      const seen = new Set();
      const dedup = list.filter(it => {
        const key = (it.link || it.title || "").toLowerCase().trim();
        if (!key) return false;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      dedup.sort((a, b) => (b.pubDate?.getTime?.() || 0) - (a.pubDate?.getTime?.() || 0));
      setItems(dedup);
    } catch (e) {
      setError(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAll(); }, []);

  const onMarkRead = (id) => {
    const s = readSetRef.current; s.add(id); readSetRef.current = new Set(s); LS.saveReadSet(readSetRef.current); setItems([...items]);
  };
  const onUnmarkRead = (id) => {
    const s = readSetRef.current; s.delete(id); readSetRef.current = new Set(s); LS.saveReadSet(readSetRef.current); setItems([...items]);
  };

  /* -------------------------
     Thumbnail extraction
     - If item.thumbnail exists use it
     - Otherwise lazily fetch article HTML via proxy and parse og:image or first <img>
     ------------------------- */
  const fetchThumbnailFor = async (item) => {
    if (!item?.link) return;
    if (thumbsRef.current.has(item.id)) return; // cached
    if (item.thumbnail) {
      thumbsRef.current.set(item.id, item.thumbnail);
      return;
    }
    try {
      const html = await fetchWithProxy(item.link);
      // parse HTML for og:image, twitter:image, link[rel=image_src], first <img>
      const parserDOM = new DOMParser();
      const doc = parserDOM.parseFromString(html, "text/html");
      const metaOg = doc.querySelector("meta[property='og:image']") || doc.querySelector("meta[name='og:image']");
      let url = metaOg?.getAttribute("content") || "";
      if (!url) {
        const metaTw = doc.querySelector("meta[name='twitter:image']");
        url = metaTw?.getAttribute("content") || "";
      }
      if (!url) {
        const linkImg = doc.querySelector("link[rel='image_src']");
        url = linkImg?.getAttribute("href") || "";
      }
      if (!url) {
        const firstImg = doc.querySelector("img");
        url = firstImg?.getAttribute("src") || "";
      }
      // normalize relative URL
      if (url && url.startsWith("//")) url = window.location.protocol + url;
      if (url && url.startsWith("/")) {
        try {
          const u = new URL(item.link);
          url = `${u.origin}${url}`;
        } catch {}
      }
      // save if valid
      if (url) thumbsRef.current.set(item.id, url);
      else thumbsRef.current.set(item.id, "");
    } catch (err) {
      thumbsRef.current.set(item.id, "");
    }
  };

  // Load thumbnails for currently visible items (lazy)
  useEffect(() => {
    if (!visibleItems.length) return;
    visibleItems.slice(0, 30).forEach(it => {
      if (!thumbsRef.current.has(it.id)) {
        // schedule but don't block rendering
        fetchThumbnailFor(it);
      }
    });
    // force a re-render after small delay so newly fetched thumbs show up
    const t = setInterval(() => setItems(i => [...i]), 1000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleItems]);

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100">
      <header className="sticky top-0 z-20 backdrop-blur supports-[backdrop-filter]:bg-white/70 supports-[backdrop-filter]:dark:bg-zinc-900/60 border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
          <Newspaper className="w-6 h-6" />
          <h1 className="font-semibold text-xl">Greek Newsfeed — 50+ Πηγές</h1>
          <div className="ml-auto flex items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 opacity-60" />
              <input
                className="pl-9 pr-3 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 outline-none focus:ring-2 ring-zinc-300 dark:ring-zinc-700"
                placeholder="Αναζήτηση τίτλου…"
                value={query}
                onChange={(e) => { setPage(1); setQuery(e.target.value); }}
              />
            </div>
            <button onClick={() => setDark(d => !d)} className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800">
              {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button onClick={loadAll} disabled={loading} className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 pb-3 flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2 text-sm opacity-80"><Filter className="w-4 h-4" /> Κατηγορίες:</div>

          <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
            <button
              onClick={() => { setSelectedCategory("All"); setPage(1); }}
              className={`px-3 py-1.5 rounded-full border ${selectedCategory === "All" ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900" : "bg-white dark:bg-zinc-800"} border-zinc-200 dark:border-zinc-700 whitespace-nowrap`}
            >Όλα</button>

            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => { setSelectedCategory(cat); setPage(1); }}
                className={`px-3 py-1.5 rounded-full border ${selectedCategory === cat ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900" : "bg-white dark:bg-zinc-800"} border-zinc-200 dark:border-zinc-700 whitespace-nowrap`}
              >{cat}</button>
            ))}
          </div>

          <div className="ml-auto flex items-center gap-2">
            <input
              className="min-w-[240px] px-3 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 outline-none focus:ring-2 ring-zinc-300 dark:ring-zinc-700"
              placeholder="Proxy URL (π.χ. https://example.com/api/proxy?url=)"
              value={proxy}
              onChange={(e) => setProxy(e.target.value)}
              onBlur={() => LS.setProxy(proxy)}
            />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-100 text-red-900 dark:bg-red-900/30 dark:text-red-200">
            Σφάλμα: {error}
          </div>
        )}

        {loading && items.length === 0 && (
          <div className="flex items-center gap-2 opacity-80"><Loader2 className="w-5 h-5 animate-spin" /> Φόρτωση ειδήσεων…</div>
        )}

        <ul className="grid gap-3">
          {visibleItems.map((it) => {
            const isRead = readSetRef.current.has(it.id);
            const thumb = thumbsRef.current.get(it.id) || it.thumbnail || "";

            return (
              <li key={it.id} className={`rounded-2xl border p-4 bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 ${isRead ? "opacity-70" : ""}`}>
                <div className="flex gap-3 items-start">
                  {/* Thumbnail (responsive) */}
                  {thumb ? (
                    <a href={it.link} target="_blank" rel="noreferrer" className="flex-shrink-0 w-28 h-20 overflow-hidden rounded-lg hidden sm:block">
                      <img src={thumb} alt="" className="w-full h-full object-cover" />
                    </a>
                  ) : (
                    <div className="flex-shrink-0 w-28 h-20 bg-zinc-100 dark:bg-zinc-700 rounded-lg hidden sm:block" />
                  )}

                  <div className="flex-1 min-w-0">
                    <a className="font-semibold hover:underline break-words text-sm sm:text-base" href={it.link} target="_blank" rel="noreferrer">
                      {it.title}
                    </a>
                    <div className="text-xs sm:text-sm opacity-70 mt-1 flex items-center gap-2">
                      <span className="truncate max-w-[9rem]" title={it.source}>{it.source}</span>
                      <span>•</span>
                      <time title={it.pubDate.toString()}>{timeAgo(it.pubDate)} ago</time>
                      <span>•</span>
                      <span className="px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-700 text-[11px]">{it.category}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <a className="inline-flex items-center gap-1 text-sm px-2 py-1 rounded-full bg-zinc-100 dark:bg-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-600" href={it.link} target="_blank" rel="noreferrer">
                      Άνοιγμα <ExternalLink className="w-4 h-4" />
                    </a>
                    {!isRead ? (
                      <button onClick={() => onMarkRead(it.id)} className="text-sm px-3 py-1.5 rounded-full bg-zinc-900 text-white dark:bg-white dark:text-zinc-900">Σήμανση</button>
                    ) : (
                      <button onClick={() => onUnmarkRead(it.id)} className="text-sm px-3 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-700">Επαναφορά</button>
                    )}
                  </div>
                </div>

                {/* Mobile: show thumbnail inline below title for small screens */}
                {thumb && (
                  <div className="mt-3 block sm:hidden">
                    <a href={it.link} target="_blank" rel="noreferrer" className="block w-full h-44 overflow-hidden rounded-lg">
                      <img src={thumb} alt="" className="w-full h-full object-cover" />
                    </a>
                  </div>
                )}
              </li>
            );
          })}
        </ul>

        {visibleItems.length < items.length && (
          <div className="mt-6 flex justify-center">
            <button onClick={() => setPage(p => p + 1)} className="px-4 py-2 rounded-xl border bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700">
              Φόρτωση περισσότερων ({visibleItems.length}/{items.length})
            </button>
          </div>
        )}

        {!loading && visibleItems.length === 0 && (
          <div className="opacity-70">Δεν βρέθηκαν αποτελέσματα με τα τρέχοντα φίλτρα.</div>
        )}
      </main>

      <footer className="py-10 text-center opacity-70">
        Χτισμένο με React + Tailwind. Πηγές ομαδοποιημένες ανά κατηγορία. Thumbnails λαμβάνονται από το feed ή από το og:image.
      </footer>
    </div>
  );
}
