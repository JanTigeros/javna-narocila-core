import fs from "fs";
import puppeteer from "puppeteer";
import dayjs from "dayjs";
import customParseFormat from 'dayjs/plugin/customParseFormat.js';

dayjs.extend(customParseFormat);

async function scrapeEnarocanje(page, filters = {}) {
  console.log("🔍 Scraping: enarocanje.si");
  const url = "https://www.enarocanje.si/#/pregled-objav";
  await page.goto(url, { waitUntil: "networkidle0", timeout: 0 });

  // Wait for the page to load completely
  await page.waitForSelector('.ag-root-wrapper', { timeout: 30000 });
  
  // Apply filters if provided
  if (Object.keys(filters).length > 0) {
    // Click the filter button
    await page.waitForSelector('button[ng-click="filterbarCtrl.showFilter()"]');
    await page.click('button[ng-click="filterbarCtrl.showFilter()"]');
    
    // Wait for filter modal to appear
    await page.waitForSelector('.modal-content', { visible: true });

    if (filters.keyword) {
      // Type into the search field
      await page.waitForSelector('input[ng-model="filterbarCtrl.searchText"]');
      await page.type('input[ng-model="filterbarCtrl.searchText"]', filters.keyword);
    }

    if (filters.narocnik) {
      await page.waitForSelector('input[ng-model="filterbarCtrl.filter.narocnik"]');
      await page.type('input[ng-model="filterbarCtrl.filter.narocnik"]', filters.narocnik);
    }

    if (filters.datumOd) {
      await page.waitForSelector('input[ng-model="filterbarCtrl.filter.objavaDatumOd"]');
      const formattedDate = dayjs(filters.datumOd).format('DD.MM.YYYY');
      await page.type('input[ng-model="filterbarCtrl.filter.objavaDatumOd"]', formattedDate);
    }

    if (filters.datumDo) {
      await page.waitForSelector('input[ng-model="filterbarCtrl.filter.objavaDatumDo"]');
      const formattedDate = dayjs(filters.datumDo).format('DD.MM.YYYY');
      await page.type('input[ng-model="filterbarCtrl.filter.objavaDatumDo"]', formattedDate);
    }

    if (filters.vrstaPostopka) {
      await page.waitForSelector('select[ng-model="filterbarCtrl.filter.vrstaPostopka"]');
      await page.select('select[ng-model="filterbarCtrl.filter.vrstaPostopka"]', filters.vrstaPostopka);
    }

    // Apply filters by clicking the button
    await page.waitForSelector('button.btn-primary[ng-click="filterbarCtrl.applyFilter()"]');
    await page.click('button.btn-primary[ng-click="filterbarCtrl.applyFilter()"]');

    // Wait for table to update
    await page.waitForTimeout(2000);
  }

  // Handle pagination and scrape all pages
  const data = [];
  let hasMorePages = true;
  let pageNum = 1;

  while (hasMorePages) {
    // Wait for table content to load
    await page.waitForSelector('tbody tr');

    // Extract data from current page
    const pageData = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll("tbody tr"));
      if (!rows.length) return [];
      return rows.map((row) => {
        const cells = row.querySelectorAll("td span");
        return {
          naročnik: cells[0]?.innerText.trim() || "",
          predmet: cells[1]?.innerText.trim() || "",
          status: cells[2]?.innerText.trim() || "",
          številka: cells[3]?.innerText.trim() || "",
          datum: cells[4]?.innerText.trim() || "",
          povezava: row.querySelector("a")?.getAttribute("href") || "",
        };
      });
    });

    data.push(...pageData);

    // Check if there's a next page
    const hasNext = await page.evaluate(() => {
      const nextBtn = document.querySelector('button[ng-click="paginationCtrl.nextPage()"]');
      return nextBtn && !nextBtn.disabled;
    });

    if (hasNext && pageNum < 5) { // Limit to 5 pages to avoid too long scraping
      await page.click('button[ng-click="paginationCtrl.nextPage()"]');
      await page.waitForTimeout(2000); // Wait for new page to load
      pageNum++;
    } else {
      hasMorePages = false;
    }
  }

  console.log(`✅ enarocanje: najdenih ${data.length} zapisov`);
  return data;
}

async function scrapeEUPortal(page) {
  console.log("🔍 Scraping: EU funding portal");
  const url = "https://ec.europa.eu/info/funding-tenders/opportunities/portal/screen/opportunities/calls-for-proposals?order=DESC&pageNumber=1&pageSize=500&sortBy=startDate&isExactMatch=true&status=31094501,31094502";
  await page.goto(url, { waitUntil: "networkidle0", timeout: 0 });

  // Wait a bit for dynamic content to load
  try {
    await page.waitForTimeout(1500);
    await page.waitForSelector('sedia-result-card-calls-for-proposals, sedia-result-card, eui-card', { timeout: 7000 }).catch(() => {});
  } catch (e) {}

  // Try several selectors to be resilient to layout differences
  const data = await page.evaluate(() => {
    const results = [];

    const containers = Array.from(document.querySelectorAll('sedia-result-card-calls-for-proposals, sedia-result-card, eui-card'));
    for (const container of containers) {
      try {
        const a = container.querySelector('a.eui-u-text-link, a') || container.querySelector('eui-card-header-title a');
        const title = a ? (a.innerText || '').trim() : null;
        const href = a ? (a.href || a.getAttribute('href')) : null;

        // status chip (e.g., 'Open For Submission')
        const chip = container.querySelector('.eui-label') || container.querySelector('[data-e2e="eui-chip"]');
        const statusText = chip ? (chip.innerText || '').trim() : null;

        // try to capture opening and deadline dates from <strong> elements
        const strongs = Array.from(container.querySelectorAll('strong'))
          .map((s) => (s.innerText || '').trim())
          .filter(Boolean);
        // heuristics: first strong often opening, second often deadline
        const openingDate = strongs[0] || null;
        const deadlineDate = strongs[1] || null;

        // program / type info
        const programEl = Array.from(container.querySelectorAll('sedia-result-card-type, .eui-card-content, eui-card-content'))
          .map((n) => n.innerText || '')
          .join(' | ');

        if (title && href) {
          results.push({ title, href, statusText, openingDate, deadlineDate, program: programEl });
        }
      } catch (e) {
        // ignore
      }
    }

    // dedupe by href
    const dedup = [];
    const seen = new Set();
    for (const r of results) {
      const key = r.href || r.title;
      if (!key) continue;
      if (seen.has(key)) continue;
      seen.add(key);
      dedup.push(r);
    }
    return dedup;
  });

  console.log(`✅ EU portal: najdenih ${data.length} zapisov`);
  return data;
}

export async function scrapeAll(filters = {}) {
  console.log("🔍 Zagon scraperja (oba vira)...");

  // Clear previous results to avoid showing stale data while scraping
  try {
    const init = { enarocanje: [], eu: [], scrapedAt: null };
    fs.writeFileSync('data.json', JSON.stringify(init, null, 2), 'utf-8');
    console.log('ℹ️ Obstoječi data.json je bil počistjen');
  } catch (e) {
    console.warn('Neuspešno brisanje data.json pred scrapingom:', e);
  }

  const browser = await puppeteer.launch({ headless: true });
  try {
    const page1 = await browser.newPage();
    const page2 = await browser.newPage();

    // Run both scrapers in parallel using the same browser
    const [enarocanjeData, euData] = await Promise.all([
      scrapeEnarocanje(page1),
      scrapeEUPortal(page2),
    ]);

    // Apply filters server-side so the UI can control targeted scraping without brittle page interactions.
    const applyDateParse = (value) => {
      if (!value) return null;
      // try ISO-like parse
      const iso = Date.parse(value);
      if (!isNaN(iso)) return new Date(iso);
      // try dd.mm.yyyy
      const m = value.match(/(\d{1,2})\.(\d{1,2})\.(\d{4})/);
      if (m) {
        const day = parseInt(m[1], 10);
        const month = parseInt(m[2], 10) - 1;
        const year = parseInt(m[3], 10);
        return new Date(year, month, day);
      }
      // try '03 December 2025' style
      const parsed = Date.parse(value);
      if (!isNaN(parsed)) return new Date(parsed);
      return null;
    };

    const filterEnarocanje = (items) => {
      return items.filter((it) => {
        if (!it) return false;
        // filter by narocnik
        if (filters.narocnik && !(it.naročnik || it.narocnik || '').toLowerCase().includes(filters.narocnik.toLowerCase())) return false;
        // filter by vrstaPostopka (e.g., 'naročilo') -> check status
        if (filters.vrstaPostopka && !((it.status || it.faza || '').toLowerCase().includes(filters.vrstaPostopka.toLowerCase()))) return false;
        // date range
        if ((filters.datumOd || filters.datumDo) && it.datum) {
          const d = applyDateParse(it.datum);
          if (d) {
            if (filters.datumOd) {
              const from = applyDateParse(filters.datumOd);
              if (from && d < from) return false;
            }
            if (filters.datumDo) {
              const to = applyDateParse(filters.datumDo);
              if (to && d > to) return false;
            }
          }
        }
        // keyword search
        if (filters.keyword) {
          const text = ((it.naročnik || '') + ' ' + (it.predmet || '') + ' ' + (it.status || '')).toLowerCase();
          if (!text.includes(filters.keyword.toLowerCase())) return false;
        }
        return true;
      });
    };

    const filterEU = (items) => {
      return items.filter((it) => {
        if (!it) return false;
        if (filters.keyword) {
          const text = ((it.title || '') + ' ' + (it.program || '')).toLowerCase();
          if (!text.includes(filters.keyword.toLowerCase())) return false;
        }
        if (filters.euStatus) {
          const st = (it.statusText || '').toLowerCase();
          if (!st.includes(filters.euStatus.toLowerCase())) return false;
        }
        // date range (openingDate / deadlineDate)
        if ((filters.datumOd || filters.datumDo) && (it.openingDate || it.deadlineDate)) {
          const dStr = it.openingDate || it.deadlineDate;
          const d = applyDateParse(dStr);
          if (d) {
            if (filters.datumOd) {
              const from = applyDateParse(filters.datumOd);
              if (from && d < from) return false;
            }
            if (filters.datumDo) {
              const to = applyDateParse(filters.datumDo);
              if (to && d > to) return false;
            }
          }
        }
        return true;
      });
    };

    const enar = filterEnarocanje(enarocanjeData);
    const eu = filterEU(euData);

    const combined = { enarocanje: enar, eu: eu, scrapedAt: new Date().toISOString(), raw: { enarocanje: enarocanjeData, eu: euData } };

    // Save combined results so server /api/data can serve it
    fs.writeFileSync('data.json', JSON.stringify(combined, null, 2), 'utf-8');
    console.log('✅ Shranjeni rezultati v data.json');
    return combined;
  } finally {
    await browser.close();
  }
}

// If run directly (node scraper.js), execute a full scrape and write data.json
if (process.argv[1] && process.argv[1].endsWith('scraper.js')) {
  scrapeAll().catch((err) => console.error('Napaka pri scraping-u:', err));
}