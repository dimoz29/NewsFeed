import React, { useEffect, useMemo, useRef, useState } from "react";
import { Loader2, RefreshCw, Search, Globe, Filter, Moon, Sun, ExternalLink, Check, X, Newspaper } from "lucide-react";
import { XMLParser } from "fast-xml-parser";

/*
 * Greek Newsfeed — 50+ Greek news sources aggregated via RSS (Google News per-site feeds)
 * Uses a proxy (prefilled below) to bypass CORS when fetching RSS feeds.
 * Your proxy (Cloudflare Worker) is already set:
 *   https://jolly-fire-f0b4.deisun163.workers.dev/?url=
 */

const SITES = [
  { name: "Η Καθημερινή", domain: "kathimerini.gr" },
  { name: "Πρώτο Θέμα", domain: "protothema.gr" },
  { name: "ΤΑ ΝΕΑ", domain: "tanea.gr" },
  { name: "Το Βήμα", domain: "tovima.gr" },
  { name: "Η Ναυτεμπορική", domain: "naftemporiki.gr" },
  { name: "ΣΚΑΪ", domain: "skai.gr" },
  { name: "ERT News", domain: "ertnews.gr" },
  { name: "ANT1 News", domain: "ant1news.gr" },
  { name: "Alpha News", domain: "alphatv.gr" },
  { name: "STAR News", domain: "star.gr" },
  { name: "CNN Greece", domain: "cnn.gr" },
  { name: "in.gr", domain: "in.gr" },
  { name: "Έθνος", domain: "ethnos.gr" },
  { name: "Εφημερίδα των Συντακτών", domain: "efsyn.gr" },
  { name: "iefimerida", domain: "iefimerida.gr" },
  { name: "Lifo", domain: "lifo.gr" },
  { name: "Capital.gr", domain: "capital.gr" },
  { name: "Liberal", domain: "liberal.gr" },
  { name: "Mononews", domain: "mononews.gr" },
  { name: "News247", domain: "news247.gr" },
  { name: "Newsit", domain: "newsit.gr" },
  { name: "Zougla", domain: "zougla.gr" },
  { name: "Insider", domain: "insider.gr" },
  { name: "OT (Οικονομικός Ταχυδρόμος)", domain: "ot.gr" },
  { name: "The TOC", domain: "thetoc.gr" },
  { name: "Παραπολιτικά", domain: "parapolitika.gr" },
  { name: "Dikaiologitika", domain: "dikaiologitika.gr" },
  { name: "enikos", domain: "enikos.gr" },
  { name: "Αυγή", domain: "avgi.gr" },
  { name: "Ριζοσπάστης", domain: "rizospastis.gr" },
  { name: "HuffPost Greece", domain: "huffingtonpost.gr" },
  { name: "Reader", domain: "reader.gr" },
  { name: "PageNews", domain: "pagenews.gr" },
  { name: "ieidiseis", domain: "ieidiseis.gr" },
  { name: "Real.gr", domain: "real.gr" },
  { name: "Reporter.gr", domain: "reporter.gr" },
  { name: "BankingNews", domain: "bankingnews.gr" },
  { name: "Startupper", domain: "startupper.gr" },
  { name: "Law & Order", domain: "lawandorder.gr" },
  { name: "Newpost", domain: "newpost.gr" },
  { name: "Flash.gr", domain: "flash.gr" },
  { name: "Newsbomb", domain: "newsbomb.gr" },
  { name: "Sport24", domain: "sport24.gr" },
  { name: "Gazzetta", domain: "gazzetta.gr" },
  { name: "SDNA", domain: "sdna.gr" },
  { name: "Contra", domain: "contra.gr" },
  { name: "Insomnia (Tech)", domain: "insomnia.gr" },
  { name: "Techblog", domain: "techblog.gr" },
  { name: "SecNews", domain: "secnews.gr" },
  { name: "Μακεδονία (makthes)", domain: "makthes.gr" },
  { name: "Voria", domain: "voria.gr" },
  { name: "Cretapost", domain: "cretapost.gr" },
  { name: "Patris News", domain: "patrisnews.com" },
  { name: "Pelop.gr", domain: "pelop.gr" },
  { name: "Thestival", domain: "thestival.gr" },
  { name: "gr.euronews", domain: "gr.euronews.com" },
  { name: "Ypodomes (Infra)", domain: "ypodomes.com" },
  { name: "Fortune Greece", domain: "fortunegreece.com" },
  { name: "Ygeiamou", domain: "ygeiamou.gr" },
  { name: "AMNA (ΑΠΕ-ΜΠΕ)", domain: "amna.gr" }
];

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

export default function GreekNewsfeedApp() {
  const defaultProxy = "https://jolly-fire-f0b4.deisun163.workers.dev/?url=";
  const [dark, setDark] = useState(() => (localStorage.getItem("grnews_dark") || "true") === "true");
  const [proxy, setProxy] = useState(() => LS.getProxy() || defaultProxy);
  const [query, setQuery] = useState("");
  const [selectedSites, setSelectedSites] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [perPage] = useState(60);
  const readSetRef = useRef(LS.getReadSet());

  useEffect(() => { document.documentElement.classList.toggle("dark", dark); localStorage.setItem("grnews_dark", String(dark)); }, [dark]);
  useEffect(() => { if (proxy) LS.setProxy(proxy); }, [proxy]);

  const visibleItems = useMemo(() => {
    const filtered = items.filter(it => {
      const matchQuery = !query || it.title.toLowerCase().includes(query.toLowerCase());
      const matchSite = selectedSites.length === 0 || selectedSites.includes(it.source);
      return matchQuery && matchSite;
    });
    return filtered.slice(0, page * perPage);
  }, [items, query, selectedSites, page, perPage]);

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
      if (j.rss && j.rss.channel) {
        const ch = j.rss.channel;
        const arr = Array.isArray(ch.item) ? ch.item : ch.item ? [ch.item] : [];
        return arr.map((it) => ({
          id: (it.link && typeof it.link === "string" && it.link.includes("/articles/CB")) ? it.link : (it.guid?.["#text"] || it.guid || it.link || it.title),
          title: it.title || "(χωρίς τίτλο)",
          link: typeof it["link"] === "object" ? (it["link"]["#text"] || "") : (it.link || ""),
          pubDate: new Date(it.pubDate || it.published || it.updated || Date.now()),
          source: sourceDomain,
        }));
      }
      if (j.feed && j.feed.entry) {
        const arr = Array.isArray(j.feed.entry) ? j.feed.entry : [j.feed.entry];
        return arr.map((it) => {
          let link = "";
          if (Array.isArray(it.link)) {
            const alt = it.link.find((l) => l["@_rel"] === "alternate");
            link = alt?.["@_href"] || it.link[0]?.["@_href"] || "";
          } else if (it.link?.["@_href"]) { link = it.link["@_href"]; }
          return {
            id: it.id || link || it.title,
            title: it.title?.["#text"] || it.title || "(χωρίς τίτλο)",
            link,
            pubDate: new Date(it.updated || it.published || Date.now()),
            source: sourceDomain,
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
          <div className="flex items-center gap-2 text-sm opacity-80"><Filter className="w-4 h-4" /> Φίλτρα Πηγών:</div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
            {SITES.map((s) => {
              const active = selectedSites.includes(s.domain);
              return (
                <button
                  key={s.domain}
                  onClick={() => { setPage(1); toggleSite(s.domain); }}
                  className={`px-3 py-1.5 rounded-full border ${active ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900" : "bg-white dark:bg-zinc-800"} border-zinc-200 dark:border-zinc-700 whitespace-nowrap`}
                  title={s.domain}
                >
                  {active ? <Check className="inline w-3.5 h-3.5 mr-1" /> : <Globe className="inline w-3.5 h-3.5 mr-1 opacity-60" />} {s.name}
                </button>
              );
            })}
            {selectedSites.length > 0 && (
              <button onClick={() => setSelectedSites([])} className="px-3 py-1.5 rounded-full border bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 whitespace-nowrap">
                <X className="inline w-3.5 h-3.5 mr-1" /> Καθαρισμός
              </button>
            )}
          </div>

          <div className="ml-auto flex items-center gap-2">
            <input
              className="min-w-[320px] px-3 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 outline-none focus:ring-2 ring-zinc-300 dark:ring-zinc-700"
              placeholder="Proxy URL (π.χ. https://proxy.example.com/?url=)"
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
            return (
              <li key={it.id} className={`rounded-2xl border p-4 bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 ${isRead ? "opacity-70" : ""}`}>
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <a className="font-semibold hover:underline break-words" href={it.link} target="_blank" rel="noreferrer">
                      {it.title}
                    </a>
                    <div className="text-sm opacity-70 mt-1 flex items-center gap-2">
                      <span className="truncate" title={it.source}>{it.source}</span>
                      <span>•</span>
                      <time title={it.pubDate.toString()}>{timeAgo(it.pubDate)} ago</time>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <a className="inline-flex items-center gap-1 text-sm px-3 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-600" href={it.link} target="_blank" rel="noreferrer">
                      Άνοιγμα <ExternalLink className="w-4 h-4" />
                    </a>
                    {!isRead ? (
                      <button onClick={() => onMarkRead(it.id)} className="text-sm px-3 py-1.5 rounded-full bg-zinc-900 text-white dark:bg-white dark:text-zinc-900">Σήμανση ως αναγνωσμένο</button>
                    ) : (
                      <button onClick={() => onUnmarkRead(it.id)} className="text-sm px-3 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-700">Επαναφορά</button>
                    )}
                  </div>
                </div>
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
        Χτισμένο με React + Tailwind. Οι πηγές φορτώνονται μέσω Google News RSS ανά ιστότοπο. Το proxy είναι προ-συμπληρωμένο.
      </footer>
    </div>
  );
}
