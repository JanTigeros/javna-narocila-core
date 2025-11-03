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
    console.log("⚙️  Izvajam avtomatsko izbiro filtrov...");

    // klik na "Napredno iskanje" (če obstaja)
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll("button, a, span"))
        .find(el => el.textContent && el.textContent.includes("Napredno iskanje"));
      if (btn && typeof btn.click === "function") btn.click();
    });

    await sleep(1000);

    // izberi "Vrsta objave" = Naročilo
    await page.evaluate(() => {
      const selects = Array.from(document.querySelectorAll("select"));
      const vrstaObjave = selects.find(sel =>
        sel.previousElementSibling && sel.previousElementSibling.textContent.includes("Vrsta objave")
      );
      if (vrstaObjave) {
        vrstaObjave.value = "Naročilo";
        vrstaObjave.dispatchEvent(new Event("change", { bubbles: true }));
      }
    });

    // izberi "Vrsta predmeta" = Storitve
    await page.evaluate(() => {
      const selects = Array.from(document.querySelectorAll("select"));
      const vrstaPredmeta = selects.find(sel =>
        sel.previousElementSibling && sel.previousElementSibling.textContent.includes("Vrsta predmeta")
      );
      if (vrstaPredmeta) {
        vrstaPredmeta.value = "Storitve";
        vrstaPredmeta.dispatchEvent(new Event("change", { bubbles: true }));
      }
    });

    // izberi "Datum objave" zadnji mesec
    await page.evaluate(() => {
      const selects = Array.from(document.querySelectorAll("select"));
      const datumObjave = selects.find(sel =>
        sel.previousElementSibling && sel.previousElementSibling.textContent.includes("Datum objave")
      );
      if (datumObjave) {
        datumObjave.value = "V zadnjem mesecu";
        datumObjave.dispatchEvent(new Event("change", { bubbles: true }));
      }
    });

    // klikni gumb "Poišči"
    await sleep(1000);
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll("button, a"))
        .find(el => el.textContent && el.textContent.includes("Poišči"));
      if (btn && typeof btn.click === "function") btn.click();
    });

    console.log("⌛ Čakam, da se rezultati naložijo...");
    await sleep(5000);
  } catch (e) {
    console.warn("⚠️ Napaka pri avtomatskem kliku filtrov:", e.message);
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