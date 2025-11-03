import express from "express";
import fs from "fs";
import cors from "cors";
import { scrapeAll } from "./scraper.js";

const app = express();
app.use(cors());
app.use(express.json());

// API: zaženi scraper z določenimi filtri
app.post("/api/scrape", async (req, res) => {
  const filters = req.body || {};
  console.log("Prejeti filtri:", filters);

  // Shrani filtre v JSON (da jih scraper lahko uporabi)
  try {
    fs.writeFileSync("filters.json", JSON.stringify(filters, null, 2));
  } catch (err) {
    console.error('Ne morem zapisati filters.json', err);
  }

  // Zaženi scraper directly and return results
  try {
    const results = await scrapeAll(filters);
    res.json({ message: "Scrape končan", results });
  } catch (error) {
    console.error("Napaka pri scraperju:", error);
    res.status(500).json({ error: "Scraper failed", details: error?.message });
  }
});

app.get("/api/data", (req, res) => {
  const data = JSON.parse(fs.readFileSync("data.json", "utf8"));
  res.json(data);
});

app.listen(4000, () => console.log("✅ API server teče na http://localhost:4000"));