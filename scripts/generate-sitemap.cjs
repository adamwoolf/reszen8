const { SitemapStream, streamToPromise } = require("sitemap");
const { createWriteStream } = require("fs");
const path = require("path");

const links = [
  { url: "/", changefreq: "weekly", priority: 1.0 },
  { url: "/about", changefreq: "monthly", priority: 0.8 },
  { url: "/meditations", changefreq: "weekly", priority: 0.9 },
];

const sitemap = new SitemapStream({ hostname: "https://reszen8.com" });

const outputPath = path.join(__dirname, "../public/sitemap.xml");
const writeStream = createWriteStream(outputPath);

// Write all the links to the stream BEFORE calling streamToPromise
(async () => {
  try {
    sitemap.pipe(writeStream);
    links.forEach((link) => sitemap.write(link));
    sitemap.end();

    await streamToPromise(sitemap);
    console.log("✅ sitemap.xml generated at public/sitemap.xml");
  } catch (err) {
    console.error("❌ Failed to generate sitemap:", err);
  }
})();
