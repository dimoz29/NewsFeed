export default async function handler(req, res) {
  const url = req.query.url;
  if (!url) {
    return res.status(400).json({ error: "Missing ?url= parameter" });
  }

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; NewsfeedBot/1.0)",
        "Accept": "application/rss+xml, application/xml, text/xml",
      },
    });

    const data = await response.text();
    res.setHeader("Content-Type", "application/xml");
    res.status(200).send(data);
  } catch (err) {
    console.error("Proxy error:", err);
    res.status(500).json({ error: "Proxy fetch failed" });
  }
}
