"use client" // src/GreekNewsfeedApp.jsx
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
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
  </svg>
)

const TrendingUpIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
        <polyline points="16 7 22 7 22 13" />
    </svg>
)

/* ------------------------- Configure sources + categories ------------------------- */
const SITES = [
    { name: "Η Καθημερινή", domain: "kathimerini.gr", category: "News" },
    { name: "Πρώτο Θέμα", domain: "protothema.gr", category: "News" },
    { name: "ΤΑ ΝΕΑ", domain: "tanea.gr", category: "News" },
    { name: "Το Βήμα", domain: "tovima.gr", category: "News" },
    { name: "Η Ναυτεμπορική", domain: "naftemporiki.gr", category: "Business" },
    { name: "ΣΚΑΪ", domain: "skai.gr", category: "News" },
    { name: "ERT News", domain: "ertnews.gr", category: "News" },
    { name: "ANT1 News", domain: "ant1news.gr", category: "News" },
    // ... (rest of your SITES array)
]

const CATEGORIES = Array.from(new Set(SITES.map(s => s.category))).sort()

const CATEGORY_COLORS = {
  All: 'bg-gradient-to-r from-fuchsia-500 to-pink-500',
  News: 'bg-gradient-to-r from-blue-500 to-cyan-500',
  Business: 'bg-gradient-to-r from-emerald-500 to-teal-500',
  Sports: 'bg-gradient-to-r from-orange-500 to-red-500',
  Tech: 'bg-gradient-to-r from-purple-500 to-indigo-500',
  Culture: 'bg-gradient-to-r from-pink-500 to-rose-500',
  Politics: 'bg-gradient-to-r from-amber-500 to-yellow-500',
  // ... (rest of your CATEGORY_COLORS)
}

export default function GreekNewsfeedApp() {
    const [dark, setDark] = useState(true) // Assuming default dark mode
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [items, setItems] = useState([])
    const [visibleItems, setVisibleItems] = useState([])
    const [query, setQuery] = useState("")
    const [selectedCategory, setSelectedCategory] = useState("All")
    const [page, setPage] = useState(1)
    
    useEffect(() => {
        loadAll() // Load news on initial render
    }, [])
    
    const loadAll = async () => {
        setLoading(true)
        setError(null)
        setItems([])
        setVisibleItems([])
        setPage(1)

        try {
            const promises = SITES.map(site =>
                fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(`https://${site.domain}/rss`)}`)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(`Network response was not ok for ${site.domain}`);
                        }
                        return response.json();
                    })
                    .then(data => {
                        const parser = new DOMParser();
                        const xmlDoc = parser.parseFromString(data.contents, "text/xml");
                        const siteItems = Array.from(xmlDoc.querySelectorAll("item")).map(item => {
                            const title = item.querySelector("title")?.textContent || "";
                            const link = item.querySelector("link")?.textContent || "";
                            const pubDate = item.querySelector("pubDate")?.textContent || null;
                            const description = item.querySelector("description")?.textContent || "";
                            const enclosure = item.querySelector("enclosure");
                            const thumbnail = enclosure ? enclosure.getAttribute("url") : null;
                            
                            return {
                                id: link, // Use link as a unique ID
                                title,
                                link,
                                pubDatetime: pubDate ? new Date(pubDate) : new Date(),
                                source: site.name,
                                category: site.category,
                                description,
                                thumbnail
                            };
                        });
                        return siteItems;
                    })
            );

            const results = await Promise.allSettled(promises);
            
            const allItems = results
                .filter(result => result.status === 'fulfilled' && Array.isArray(result.value))
                .flatMap(result => result.value);

            if (allItems.length === 0) {
              throw new Error("No articles could be fetched from any source.");
            }

            allItems.sort((a, b) => b.pubDatetime - a.pubDatetime);
            
            setItems(allItems);
            filterAndPaginate(allItems, query, selectedCategory, 1);

        } catch (err) {
            console.error(err);
            setError("Failed to load news. Some sources might be unavailable.");
        } finally {
            setLoading(false);
        }
    };
    
    // Helper function to handle filtering and pagination
    const filterAndPaginate = (allItems, currentQuery, currentCategory, currentPage) => {
        const filtered = allItems.filter(item => {
            const matchesCategory = currentCategory === 'All' || item.category === currentCategory;
            const matchesQuery = !currentQuery || item.title.toLowerCase().includes(currentQuery.toLowerCase());
            return matchesCategory && matchesQuery;
        });
        setVisibleItems(filtered.slice(0, currentPage * 10));
    };

    // Effects for filtering and pagination
    useEffect(() => {
        setPage(1); // Reset page when query or category changes
        filterAndPaginate(items, query, selectedCategory, 1);
    }, [query, selectedCategory, items]);
    
    const handleLoadMore = () => {
        const newPage = page + 1;
        setPage(newPage);
        filterAndPaginate(items, query, selectedCategory, newPage);
    };

    // ... (rest of your component rendering logic)
    // The JSX part of your component remains the same.
    // Make sure to replace the placeholder `timeAgo` function and other event handlers if they are not implemented.
    
    // Example timeAgo function
    const timeAgo = (date) => {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + " years ago";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + " months ago";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + " days ago";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + " hours ago";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + " minutes ago";
        return Math.floor(seconds) + " seconds ago";
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white">
            {/* ... Your existing JSX for header, filters, etc. ... */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {error && (
                    <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400">
                        <strong>Σφάλμα: </strong>{error}
                    </div>
                )}
                {loading && items.length === 0 && (
                    <div className="flex items-center justify-center gap-3 py-12 text-slate-400">
                        <Loader2Icon />
                        <span className="text-lg">Loading news...</span>
                    </div>
                )}
                <div className="grid gap-4 sm:gap-6">
                    {visibleItems.map((it, idx) => (
                        <article key={it.id} className="group rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-6 transition-all hover:shadow-xl hover:shadow-fuchsia-500/10 hover:border-fuchsia-500/30 animate-fade-in" style={{ animationDelay: `${Math.min(idx * 30, 300)}ms` }}>
                            {/* ... Your article rendering logic ... */}
                             <div className="flex-1 min-w-0">
                                <a href={it.link} target="_blank" rel="noreferrer" className="block group-hover:text-fuchsia-400 transition-colors">
                                    <h2 className="text-lg sm:text-xl font-semibold leading-snug mb-2 line-clamp-2 text-white">{it.title}</h2>
                                </a>
                                <div className="flex flex-wrap items-center gap-2 text-sm text-slate-400 mb-3">
                                    <span className="font-medium text-slate-300">{it.source}</span>
                                    <span>&middot;</span>
                                    <span>{timeAgo(it.pubDatetime)}</span>
                                    <span className={`px-2.5 py-0.5 rounded-full text-white text-xs font-medium ${CATEGORY_COLORS[it.category] || CATEGORY_COLORS['News']}`}>{it.category}</span>
                                </div>
                                {/* ... other details ... */}
                            </div>
                        </article>
                    ))}
                </div>
                {!loading && visibleItems.length < items.filter(item => (selectedCategory === 'All' || item.category === selectedCategory) && (!query || item.title.toLowerCase().includes(query.toLowerCase()))).length && (
                    <div className="mt-8 flex justify-center">
                        <button onClick={handleLoadMore} className="px-8 py-3.5 rounded-2xl bg-fuchsia-600 text-white hover:bg-fuchsia-500 font-medium transition-all hover:shadow-lg hover:shadow-fuchsia-500/25">
                            Load More
                        </button>
                    </div>
                )}
                {!loading && visibleItems.length === 0 && !error && (
                    <div className="text-center py-12 text-slate-400">
                        <p className="text-lg">Δεν βρέθηκαν αποτελέσματα</p>
                    </div>
                )}
            </main>
            {/* ... Your existing JSX for footer ... */}
        </div>
    )
}
