/**
 * Cloudflare Pages Function that proxies an external URL and returns the upstream body.
 * Usage: /api/proxy?url=<encoded-url>
 *
 * This hides your worker.dev external URL and gives the frontend a same-origin
 * proxy at /api/proxy. It also returns CORS header for browser requests.
 */
export async function onRequest(context) {
  try {
    const url = new URL(context.request.url).searchParams.get("url");
    if (!url) return new Response("Missing url", { status: 400 });

    // Fetch upstream (you can optionally add rate limiting / caching here)
    const resp = await fetch(url, {
      headers: { "user-agent": "Mozilla/5.0 (compatible)" },
    });

    const headers = new Headers(resp.headers);
    // Ensure we return CORS so the browser can read it
    headers.set("access-control-allow-origin", "*");
    // Make sure content type is preserved
    const contentType = headers.get("content-type") || "application/xml; charset=utf-8";
    headers.set("content-type", contentType);
    // Light cache to reduce repeated upstream calls
    headers.set("cache-control", "public, max-age=60");

    return new Response(resp.body, { status: resp.status, headers });
  } catch (err) {
    return new Response(String(err), { status: 500 });
  }
}
