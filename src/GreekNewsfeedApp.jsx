"use client"

// src/GreekNewsfeedApp.jsx
import { useEffect, useRef, useState } from "react"

const Loader2Icon = () => (
  <svg className="animate-spin" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="M21 12a9 9 0 1 1-6.219-8.56" strokeWidth="2" strokeLinecap="round" />
  </svg>
)

const RefreshIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
  </svg>
)

const SearchIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
)

const FilterIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
)

const MoonIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
)

const SunIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
  </svg>
)

const ExternalLinkIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" />
  </svg>
)

const SparklesIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
  </svg>
)

const TrendingUpIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
    <polyline points="16 7 22 7 22 13" />
  </svg>
)

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
  { name: "Enikos", domain: "enikos.gr", category: "News" },
  { name: "Αυγή", domain: "avgi.gr", category: "Politics" },
  { name: "Ριζοσπάστης", domain: "rizospastis.gr", category: "Politics" },
  { name: "HuffPost Greece", domain: "huffingtonpost.gr", category: "Culture" },
  { name: "Reader", domain: "reader.gr", category: "Culture" },
  { name: "PageNews", domain: "pagenews.gr", category: "News" },
  { name: "Ieidiseis", domain: "ieidiseis.gr", category: "News" },
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
]

const CATEGORIES = Array.from(new Set(SITES.map((s) => s.category))).sort()

const CATEGORY_COLORS = {
  All: "bg-gradient-to-r from-fuchsia-500 to-pink-500",
  News: "bg-gradient-to-r from-blue-500 to-cyan-500",
  Business: "bg-gradient-to-r from-emerald-500 to-teal-500",
  Sports: "bg-gradient-to-r from-orange-500 to-red-500",
  Tech: "bg-gradient-to-r from-purple-500 to-indigo-500",
  Culture: "bg-gradient-to-r from-pink-500 to-rose-500",
  Politics: "bg-gradient-to-r from-amber-500 to-yellow-500",
  Opinion: "bg-gradient-to-r from-violet-500 to-purple-500",
  Crime: "bg-gradient-to-r from-red-600 to-rose-600",
  Local: "bg-gradient-to-r from-sky-500 to-blue-500",
  Infra: "bg-gradient-to-r from-slate-500 to-gray-500",
  Health: "bg-gradient-to-r from-green-500 to-emerald-500",
}

export default function GreekNewsfeedApp() {
  const defaultProxy = "/api/proxy?url="
  useEffect(() => {
    try {
      localStorage.removeItem("grnews_proxy")
    } catch (e) {}
  }, [])
  const [proxy] = useState(defaultProxy)

  const [dark, setDark] = useState(() => (localStorage.getItem("grnews_dark") || "true") === "true")

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [items, setItems] = useState([])
  const [visibleItems, setVisibleItems] = useState([])
  const [query, setQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [page, setPage] = useState(1)

  const readSetRef = useRef(new Set())
  const thumbsRef = useRef(new Map())

  const loadAll = async () => {
    setLoading(true)
    setError(null)
    setItems([])
    setVisibleItems([])
    setPage(1)

    try {
      // Simulate fetching data
      const fetchedItems = [
        // Example items
      ]
      setItems(fetchedItems)
      setVisibleItems(fetchedItems.slice(0, 10))
    } catch (err) {
      setError("Failed to load news")
    } finally {
      setLoading(false)
    }
  }

  const timeAgo = (date) => {
    // Implement timeAgo logic
    return "just now"
  }

  const onMarkRead = (id) => {
    readSetRef.current.add(id)
  }

  const onUnmarkRead = (id) => {
    readSetRef.current.delete(id)
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-900/80 border-b border-slate-800">
        <div className="bg-gradient-to-r from-fuchsia-600 via-pink-600 to-fuchsia-600 py-1">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center gap-2 text-white text-xs sm:text-sm font-medium">
              <SparklesIcon />
              <span>Ζωντανές ειδήσεις από 50+ ελληνικές πηγές</span>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-500 to-pink-500 rounded-2xl blur-sm opacity-50" />
                <div className="relative w-12 h-12 bg-gradient-to-br from-fuchsia-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <TrendingUpIcon />
                </div>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
                  NewsFeed
                </h1>
                <p className="text-xs sm:text-sm text-slate-400">Ελληνικά Νέα</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setDark((d) => !d)}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors"
                aria-label="Toggle theme"
              >
                {dark ? <SunIcon /> : <MoonIcon />}
              </button>

              <button
                onClick={loadAll}
                disabled={loading}
                className="p-2.5 rounded-xl bg-fuchsia-600 text-white hover:bg-fuchsia-500 transition-colors disabled:opacity-50"
                aria-label="Refresh"
              >
                {loading ? <Loader2Icon /> : <RefreshIcon />}
              </button>
            </div>
          </div>

          <div className="mt-4">
            <div className="relative max-w-2xl">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <SearchIcon />
              </div>
              <input
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-800 border border-slate-700 outline-none focus:ring-2 ring-fuchsia-500/50 transition-all text-base text-white placeholder-slate-400"
                placeholder="Αναζήτηση ειδήσεων..."
                value={query}
                onChange={(e) => {
                  setPage(1)
                  setQuery(e.target.value)
                }}
              />
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 bg-slate-900/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-3 overflow-x-auto no-scrollbar">
              <div className="flex items-center gap-2 text-sm text-slate-400 whitespace-nowrap">
                <FilterIcon />
                <span className="hidden sm:inline">Κατηγορίες</span>
              </div>

              <button
                onClick={() => {
                  setSelectedCategory("All")
                  setPage(1)
                }}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                  selectedCategory === "All"
                    ? `${CATEGORY_COLORS["All"]} text-white shadow-lg shadow-fuchsia-500/25`
                    : "bg-slate-800 hover:bg-slate-700 text-slate-300"
                }`}
              >
                Όλα
              </button>

              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setSelectedCategory(cat)
                    setPage(1)
                  }}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                    selectedCategory === cat
                      ? `${CATEGORY_COLORS[cat] || CATEGORY_COLORS["News"]} text-white shadow-lg`
                      : "bg-slate-800 hover:bg-slate-700 text-slate-300"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400">
            <strong>Σφάλμα:</strong> {error}
          </div>
        )}

        {loading && items.length === 0 && (
          <div className="flex items-center justify-center gap-3 py-12 text-slate-400">
            <Loader2Icon />
            <span className="text-lg">Φόρτωση ειδήσεων...</span>
          </div>
        )}

        <div className="grid gap-4 sm:gap-6">
          {visibleItems.map((it, idx) => {
            const isRead = readSetRef.current.has(it.id)
            const thumb = thumbsRef.current.get(it.id) || it.thumbnail || ""

            return (
              <article
                key={it.id}
                className={`group rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-6 transition-all hover:shadow-xl hover:shadow-fuchsia-500/10 hover:border-fuchsia-500/30 animate-fade-in ${
                  isRead ? "opacity-60" : ""
                }`}
                style={{ animationDelay: `${Math.min(idx * 30, 300)}ms` }}
              >
                <div className="flex gap-4 sm:gap-6">
                  {thumb ? (
                    <a
                      href={it.link}
                      target="_blank"
                      rel="noreferrer"
                      className="hidden sm:block flex-shrink-0 w-40 h-28 rounded-xl overflow-hidden relative group-hover:scale-[1.02] transition-transform"
                    >
                      <img src={thumb || "/placeholder.svg"} alt="" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  ) : (
                    <div className="hidden sm:block flex-shrink-0 w-40 h-28 rounded-xl bg-gradient-to-br from-fuchsia-500/10 to-pink-500/10" />
                  )}

                  <div className="flex-1 min-w-0">
                    <a
                      href={it.link}
                      target="_blank"
                      rel="noreferrer"
                      className="block group-hover:text-fuchsia-400 transition-colors"
                    >
                      <h2 className="text-lg sm:text-xl font-semibold leading-snug mb-2 line-clamp-2 text-white">
                        {it.title}
                      </h2>
                    </a>

                    <div className="flex flex-wrap items-center gap-2 text-sm text-slate-400 mb-3">
                      <span className="font-medium text-slate-300">{it.source}</span>
                      <span>•</span>
                      <time>{timeAgo(it.pubDate)}</time>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-white text-xs font-medium ${
                          CATEGORY_COLORS[it.category] || CATEGORY_COLORS["News"]
                        }`}
                      >
                        {it.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={it.link}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-sm font-medium transition-colors text-white"
                      >
                        Διαβάστε
                        <ExternalLinkIcon />
                      </a>

                      {!isRead ? (
                        <button
                          onClick={() => onMarkRead(it.id)}
                          className="px-4 py-2 rounded-xl bg-fuchsia-600 text-white hover:bg-fuchsia-500 text-sm font-medium transition-colors"
                        >
                          Σήμανση
                        </button>
                      ) : (
                        <button
                          onClick={() => onUnmarkRead(it.id)}
                          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-sm font-medium transition-colors text-white"
                        >
                          Επαναφορά
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Mobile thumbnail */}
                {thumb && (
                  <div className="mt-4 block sm:hidden">
                    <a href={it.link} target="_blank" rel="noreferrer" className="block rounded-xl overflow-hidden">
                      <img src={thumb || "/placeholder.svg"} alt="" className="w-full h-48 object-cover" />
                    </a>
                  </div>
                )}
              </article>
            )
          })}
        </div>

        {visibleItems.length < items.length && (
          <div className="mt-8 flex justify-center">
            <button
              onClick={() => setPage((p) => p + 1)}
              className="px-8 py-3.5 rounded-2xl bg-fuchsia-600 text-white hover:bg-fuchsia-500 font-medium transition-all hover:shadow-lg hover:shadow-fuchsia-500/25"
            >
              Φόρτωση περισσότερων ({visibleItems.length} / {items.length})
            </button>
          </div>
        )}

        {!loading && visibleItems.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            <p className="text-lg">Δεν βρέθηκαν αποτελέσματα</p>
          </div>
        )}
      </main>

      <footer className="border-t border-slate-800 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-sm text-slate-400">
          <p>Συγκεντρωτικό newsfeed από 50+ ελληνικές πηγές ειδήσεων</p>
        </div>
      </footer>
    </div>
  )
}
