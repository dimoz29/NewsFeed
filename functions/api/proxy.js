/**
 * functions/api/proxy.js
 *
 * Cloudflare Pages Function that proxies an external URL and returns the upstream body.
 * Usage: /api/proxy?url=<encoded-url>
 *
 * This hides external worker URLs and provides a same-origin proxy for the frontend.
 */
export async function onRequest(context) {
  try {
    const url = new URL(context.request.url).searchParams.get("url");
    if (!url) return new Response("Missing url", { status: 400 });

    // Basic validation — only allow http/https
    if (!/^https?:\/\//i.test(url)) {
      return new Response("Invalid URL", { status: 400 });
    }

    // Fetch upstream
    const resp = await fetch(url, {
      // Custom UA helps some sites return full HTML
      headers: { "user-agent": "Mozilla/5.0 (compatible; NewsFeed/1.0; +https://example.com)" },
      // follow redirects
      redirect: "follow",
    });

    // Copy headers, but ensure CORS and cache-control are set
    const headers = new Headers(resp.headers);
    headers.set("access-control-allow-origin", "*");
    headers.set("cache-control", "public, max-age=60");
    // Keep content-type if available
    if (!headers.get("content-type")) headers.set("content-type", "application/xml; charset=utf-8");

    return new Response(resp.body, { status: resp.status, headers });
  } catch (err) {
    return new Response(String(err), { status: 500 });
  }
}
