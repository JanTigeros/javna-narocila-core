import fs from "fs";
import puppeteer from "puppeteer";

/** 🔹 Uporabna funkcija za čakanje (namesto page.waitForTimeout) */
async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/** 🔹 EJN scraper */
async function scrapeEJN(page) {
  console.log("🔍 Zagon EJN scrapa...");

  const url = "https://www.enarocanje.si/#/pregled-objav";
  await page.goto(url, { waitUntil: "networkidle0", timeout: 0 });

  // Počakaj, da se UI naloži
  await sleep(2000);

  try {
    console.log("⚙️ Izvajam avtomatsko izbiro filtrov...");

    // Počakaj, da se Vue aplikacija naloži
    await page.waitForSelector(".vue-treeselect__input", { timeout: 20000 });
    await sleep(2500);

    // Funkcija za varno simulacijo klika
    const safeClick = async (selector, matchText) => {
      await page.evaluate((sel, txt) => {
        const el = Array.from(document.querySelectorAll(sel))
          .find(e => e.textContent && (!txt || e.textContent.includes(txt)));
        if (el) {
          el.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
          el.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
          el.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        }
      }, selector, matchText);
    };

    // === 1️⃣ Vrsta predmeta: Storitve ===
    await safeClick("label.form-label", "Vrsta predmeta");
    await sleep(1000);
    await safeClick("li, div", "Storitve");
    await sleep(1500);
    console.log("✅ Izbrana vrsta predmeta: Storitve");

    // === 2️⃣ CPV koda: 48000000 ===
    await safeClick("label.form-label", "Področje naročila");
    await sleep(1500);
    await page.evaluate(() => {
      const input = document.querySelector(".vue-treeselect__input");
      if (input) {
        input.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
        input.dispatchEvent(new Event('focus', { bubbles: true }));
        input.value = "48000000";
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      }
    });
    await sleep(2000);
    await safeClick(".vue-treeselect__option", "48000000");
    console.log("✅ Izbrana CPV koda: 48000000");

    // === 3️⃣ Faza postopka: Naročilo ===
    await safeClick("label.form-label", "Faza postopka");
    await sleep(1000);
    await safeClick("li", "Naročilo");
    await sleep(1000);
    console.log("✅ Izbrana faza postopka: Naročilo");

    // === 4️⃣ Datum objave: V zadnjih treh mesecih ===
    await safeClick("label.form-label", "Datum objave");
    await sleep(1000);
    await safeClick("li", "V zadnjih treh mesecih");
    await sleep(1500);
    console.log("✅ Izbran datum objave: V zadnjih treh mesecih");

    // Hitri screenshot brez zamrznitve
    await page.screenshot({
      path: 'filters-debug.png',
      fullPage: false,
      clip: { x: 0, y: 0, width: 1280, height: 900 }
    });

    // === 5️⃣ Klikni “Išči” ===
    await safeClick("button", "Išči");
    console.log("⌛ Čakam, da se rezultati naložijo...");
    await sleep(5000);

    // Hitri screenshot brez zamrznitve
    await page.screenshot({
      path: 'filters-debug-2.png',
      fullPage: false,
      clip: { x: 0, y: 0, width: 1280, height: 900 }
    });
    console.log("⌛ Čakanje končano.");

    console.log("✅ Filtri dejansko uporabljeni!");
  } catch (e) {
    console.warn("⚠️ Napaka pri nastavitvi filtrov:", e.message);
  }

  // Pridobi vse rezultate iz tabele
  const results = await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll("tr"));
    const data = [];

    for (const row of rows) {
      const cells = Array.from(row.querySelectorAll("td"));
      if (cells.length < 6) continue;
      data.push({
        narocnik: cells[0]?.innerText.trim(),
        naziv: cells[1]?.innerText.trim(),
        faza: cells[2]?.innerText.trim(),
        stevilka: cells[3]?.innerText.trim(),
        datumObjave: cells[4]?.innerText.trim(),
        povezava: row.querySelector("a")?.href || null,
      });
    }
    return data;
  });

  console.log(`✅ Najdenih ${results.length} zapisov`);
  return results;
}

/** 🔹 EU portal scraper */
async function scrapeEUPortal(page) {
  console.log("🔍 Zagon EU portal scrapa...");
  const url =
    "https://ec.europa.eu/info/funding-tenders/opportunities/portal/screen/opportunities/calls-for-proposals?order=DESC&pageNumber=1&pageSize=100";
  await page.goto(url, { waitUntil: "networkidle0", timeout: 0 });

  await sleep(2000);

  const data = await page.evaluate(() => {
    const results = [];
    const cards = document.querySelectorAll(
      "sedia-result-card-calls-for-proposals, sedia-result-card, eui-card"
    );

    cards.forEach((card) => {
      const title = card.querySelector("a")?.innerText?.trim();
      const href = card.querySelector("a")?.href;
      const status = card.querySelector(".eui-label")?.innerText?.trim();
      if (title && href) results.push({ title, href, status });
    });

    return results;
  });

  console.log(`✅ EU portal: ${data.length} zapisov`);
  return data;
}

/** 🔹 Glavna funkcija */
export async function scrapeAll() {
  console.log("🚀 Začnem scrapeAll...");
  const browser = await puppeteer.launch({ headless: true });
  const pageEJN = await browser.newPage();
  const pageEU = await browser.newPage();

  try {
    const [ejnData, euData] = await Promise.all([
      scrapeEJN(pageEJN),
      scrapeEUPortal(pageEU),
    ]);

    const combined = {
      ejn: ejnData,
      eu: euData,
      scrapedAt: new Date().toISOString(),
    };

    fs.writeFileSync("data.json", JSON.stringify(combined, null, 2), "utf-8");
    console.log("💾 Podatki shranjeni v data.json");
    return combined;
  } catch (err) {
    console.error("❌ scrapeAll napaka:", err);
    throw err;
  } finally {
    await browser.close();
  }
}

/** 🔹 Če zaženeš neposredno */
if (process.argv[1] && process.argv[1].endsWith("scraper.js")) {
  scrapeAll().catch((err) => console.error("Napaka pri scraping-u:", err));
}