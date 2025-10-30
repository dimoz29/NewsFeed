export default async function handler(req, res) {
  const target = req.query.url;
  if (!target) return res.status(400).json({ error: "Missing ?url= parameter" });

  try {
    const response = await fetch(target, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; GreekNewsfeedBot/1.0)",
        "Accept": "application/rss+xml, application/xml, text/xml, text/html",
      },
    });

    const contentType = response.headers.get("content-type") || "";
    const data = await response.text();
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Content-Type", contentType.includes("xml") ? "application/xml" : "text/html");
    res.status(200).send(data);
  } catch (err) {
    console.error("Proxy error:", err);
    res.status(500).json({ error: "Proxy fetch failed" });
  }
}
