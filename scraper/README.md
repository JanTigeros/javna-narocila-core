# Scraper API

This folder contains a small Express API that runs Puppeteer scrapers for:

- https://www.enarocanje.si/#/pregled-objav (eNaročanje)
- EU Funding Portal (calls for proposals)

Features:
- POST /api/scrape runs the scrapers (accepts optional JSON filters) and returns combined results.
- GET /api/data returns the last saved `data.json`.
- The scrapers are ESM modules in `scraper.js` and export `scrapeAll(filters)`.

Quick start (PowerShell):

```powershell
cd "c:\Users\jansa\Documents\CORE\JAVNA-NAROČILA\scraper"
npm install
npm start
```

Then open the webapp (run the React app) or trigger a scrape manually:

```powershell
Invoke-RestMethod -Uri 'http://localhost:4000/api/scrape' -Method Post -Body (ConvertTo-Json @{}) -ContentType 'application/json'
```

Notes:
- Puppeteer downloads Chromium during `npm install`. If Chromium cannot start in your environment, you can tweak `scraper.scrapeAll` to pass launch args like `--no-sandbox` or set `executablePath` to an installed Chrome.
- Filters sent to `/api/scrape` are saved to `filters.json` and can be used by the scrapers.
- The webapp in `../webapp` is set up to call `/api/scrape` on load and display results in two tables (eNaročanje and EU).
