<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Nigeria Updates</title>
  <style>
    body { font-family: Arial, sans-serif; background:#0d1117; color:#fff; margin:0; padding:20px; }
    header { display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; }
    h1 { font-size:22px; margin:0; }
    nav { display:flex; gap:10px; flex-wrap:wrap; }
    nav button { background:#161b22; border:0; color:#aaa; padding:8px 14px; border-radius:6px; cursor:pointer; }
    nav button.active, nav button:hover { background:#2ea043; color:#fff; }
    .grid { margin-top:20px; display:grid; grid-template-columns:repeat(auto-fill, minmax(280px,1fr)); gap:16px; }
    .card { background:#161b22; border-radius:8px; padding:14px; border:1px solid #30363d; display:flex; flex-direction:column; gap:8px; }
    .card:hover { transform:translateY(-4px); transition:.2s; }
    .title { font-weight:bold; font-size:15px; }
    .meta { font-size:12px; color:#aaa; }
    .link { margin-top:auto; font-size:13px; color:#2ea043; text-decoration:none; }
    .link:hover { text-decoration:underline; }
  </style>
</head>
<body>
  <header>
    <h1>🇳🇬 Nigeria Updates</h1>
    <nav>
      <button class="active" data-cat="Politics">Politics</button>
      <button data-cat="Government">Government</button>
      <button data-cat="Celebrity">Celebrity</button>
      <button data-cat="Ministry">Ministry</button>
    </nav>
  </header>

  <main>
    <div id="grid" class="grid"></div>
  </main>

  <script>
    const grid = document.getElementById("grid");

    // 🔑 Replace with your NewsAPI key
    const NEWS_API_KEY = ""; // example: "123abc456xyz"

    // Categories mapped
    const queries = {
      "Politics": "Nigeria Politics",
      "Government": "Nigeria Government",
      "Celebrity": "Nigeria Celebrity",
      "Ministry": "Nigeria Ministry"
    };

    // Load news (tries NewsAPI first, falls back to Google News RSS)
    async function loadNews(category) {
      grid.innerHTML = "<p>Loading " + category + " updates...</p>";

      try {
        let articles = [];

        // ✅ Try NewsAPI if key available
        if (NEWS_API_KEY) {
          const apiUrl = `https://newsapi.org/v2/everything?q=${encodeURIComponent(queries[category])}&language=en&apiKey=${NEWS_API_KEY}`;
          const res = await fetch(apiUrl);
          if (res.ok) {
            const data = await res.json();
            if (data.articles?.length) {
              articles = data.articles.slice(0, 12).map(a => ({
                title: a.title,
                link: a.url,
                date: new Date(a.publishedAt).toLocaleDateString()
              }));
            }
          }
        }

        // ❌ If NewsAPI fails → fallback to Google News RSS
        if (!articles.length) {
          const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(queries[category])}&hl=en-NG&gl=NG&ceid=NG:en`;
          const proxy = "https://api.allorigins.win/get?url=" + encodeURIComponent(rssUrl);
          const res = await fetch(proxy);
          const data = await res.json();
          const parser = new DOMParser();
          const xml = parser.parseFromString(data.contents, "text/xml");

          const items = xml.querySelectorAll("item");
          articles = Array.from(items).slice(0, 12).map(item => ({
            title: item.querySelector("title")?.textContent || "No title",
            link: item.querySelector("link")?.textContent || "#",
            date: new Date(item.querySelector("pubDate")?.textContent).toLocaleDateString()
          }));
        }

        // Render news cards
        grid.innerHTML = "";
        if (!articles.length) {
          grid.innerHTML = `<p>No ${category} updates found.</p>`;
          return;
        }

        articles.forEach(news => {
          const card = document.createElement("div");
          card.className = "card";
          card.innerHTML = `
            <div class="title">${news.title}</div>
            <div class="meta">${news.date}</div>
            <a class="link" href="${news.link}" target="_blank">Read more →</a>
          `;
          grid.appendChild(card);
        });

      } catch (e) {
        console.error(e);
        grid.innerHTML = `<p>Error loading ${category} news.</p>`;
      }
    }

    // Navigation buttons
    document.querySelectorAll("nav button").forEach(btn = {
      btn.addEventListener("click", () => {
        document.querySelectorAll("nav button").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        loadNews(btn.dataset.cat);
      });
    });

    // Default load
    loadNews("Politics");
  </script>
</body>
</html>
