import fs from "fs";
import puppeteer from "puppeteer";

/** 🔹 Uporabna funkcija za čakanje (namesto page.waitForTimeout) */
async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** 🔹 EJN scraper */
export async function scrapeEJN(
  page,
  { 
    tip = "Naročilo", 
    vrstaPredmeta = "Storitve", 
    cpvCode = ["30200000", "48000000", "72000000", "79000000"] } = {}
) {
  console.log("🔍 Zagon EJN scrapa...");

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  await page.goto("https://www.enarocanje.si/#/pregled-objav", {
    waitUntil: "networkidle2",
    timeout: 0,
  });
  await page.waitForSelector("label.form-label", { timeout: 20000 });
  await sleep(1000);

  console.log("⚙️ Nastavljam filtre...");

  // === 1️⃣ VRSTA PREDMETA ===
  try {
    await page.evaluate(() => {
      const label = [...document.querySelectorAll("label.form-label")]
      .find((el) => el.textContent.includes("Vrsta predmeta"));
      console.log("Label:", label ? "✅ najden" : "❌ ni najden");
      if (label) label.style.outline = "3px solid red";
      const input = label?.parentElement?.querySelector("input.form-input[type='button']");
      if (input) input.style.outline = "3px solid red";
      input?.scrollIntoView({ behavior: "smooth", block: "center" });
      input?.focus();

      if (input) {
        const eventOptions = { bubbles: true, cancelable: true, view: window };
        input.dispatchEvent(new MouseEvent("mouseover", eventOptions));
        input.dispatchEvent(new MouseEvent("mousedown", eventOptions));
        input.dispatchEvent(new MouseEvent("mouseup", eventOptions));
        input.dispatchEvent(new MouseEvent("click", eventOptions));
      }
    });

    // išči v razširjenem listboxu
    await page.evaluate((value) => {
      const openList =
        document.querySelector("div.list[aria-expanded='true']") ||
        document.querySelector("div.list.show");
      if (openList) openList.style.outline = "3px solid red";
      if (!openList) return false;
      const options = Array.from(openList.querySelectorAll("li, div"));
      const match = options.find((el) => el.textContent.trim() === value);
      if (match) match.style.outline = "3px solid red";
      match?.focus();
      if (match) {
        const eventOptions = { bubbles: true, cancelable: true, view: window };
        match.dispatchEvent(new MouseEvent("mouseover", eventOptions));
        match.dispatchEvent(new MouseEvent("mousedown", eventOptions));
        match.dispatchEvent(new MouseEvent("mouseup", eventOptions));
        match.dispatchEvent(new MouseEvent("click", eventOptions));
      }
      return !!match;
    }, vrstaPredmeta);

    console.log(`✅ Vrsta predmeta: ${vrstaPredmeta}`);
  } catch (e) {
    console.warn("⚠️ Vrsta predmeta ni uspela:", e.message);
  }

  await sleep(500);

  // === 2️⃣ PODROČJE NAROČILA (CPV KODA) ===
  try {
    const cpvCodes = Array.isArray(cpvCode) ? cpvCode : [cpvCode];

    await page.evaluate(() => {
      const label = [...document.querySelectorAll("label.form-label")]
        .find((el) => el.textContent.includes("Področje naročila"));
      if (label) label.style.outline = "3px solid red";
      const control = label?.parentElement?.querySelector(".vue-treeselect__control");
      control?.scrollIntoView({ behavior: "smooth", block: "center" });
      if (control) control.style.outline = "3px solid red";
      control?.click();
    });

    await sleep(500);

    for (const code of cpvCodes) {
      console.log(`🧩 Dodajam CPV kodo: ${code}`);

      await page.evaluate((code) => {
        const input = document.querySelector(".vue-treeselect__input");
        if (input) {
          input.focus();
          input.value = code;
          input.dispatchEvent(new Event("input", { bubbles: true }));
          if (input) input.style.outline = "3px solid red";
        }
      }, code);

      // Počakaj, da dropdown prikaže rezultate
      await page.waitForSelector(".vue-treeselect__option", { timeout: 5000 }).catch(() => {});
      await sleep(500);
      // Enter dvakrat – prvi izbere, drugi potrdi
      await page.keyboard.press("Enter");
      await sleep(500);
      await page.keyboard.press("Enter");

      console.log(`✅ Izbrana CPV koda: ${code}`);
      await sleep(500);
    }

    await sleep(500);
    console.log(`✅ CPV: ${cpvCode}`);
  } catch (e) {
    console.warn("⚠️ CPV ni uspela:", e.message);
  }

  // === 3️⃣ FAZA POSTOPKA ===
  try {
    await page.evaluate(() => {
      const label = [...document.querySelectorAll("label.form-label")]
        .find((el) => el.textContent.includes("Faza postopka"));
      if (label) label.style.outline = "3px solid red";
      const ul = label?.parentElement?.querySelector("ul.form-input.input");
      if (ul) ul.style.outline = "3px solid red";
      ul?.scrollIntoView({ behavior: "smooth", block: "center" });
      ul?.focus();
      if (ul) {
        const eventOptions = { bubbles: true, cancelable: true, view: window };
        ul.dispatchEvent(new MouseEvent("mouseover", eventOptions));
        ul.dispatchEvent(new MouseEvent("mousedown", eventOptions));
        ul.dispatchEvent(new MouseEvent("mouseup", eventOptions));
        ul.dispatchEvent(new MouseEvent("click", eventOptions));
      }
    });

    await page.evaluate((text) => {
      const openList =
        document.querySelector("div.list[aria-expanded='true']") ||
        document.querySelector("div.list.show");
      if (!openList) return false;
      const options = Array.from(openList.querySelectorAll("li"));
      const match = options.find((li) => li.textContent.trim() === text);
      match?.focus();
      if (match) {
        const eventOptions = { bubbles: true, cancelable: true, view: window };
        match.dispatchEvent(new MouseEvent("mouseover", eventOptions));
        match.dispatchEvent(new MouseEvent("mousedown", eventOptions));
        match.dispatchEvent(new MouseEvent("mouseup", eventOptions));
        match.dispatchEvent(new MouseEvent("click", eventOptions));
      }
      return !!match;
    }, tip);
    await sleep(500);

    console.log(`✅ Faza postopka: ${tip}`);
  } catch (e) {
    console.warn("⚠️ Faza postopka ni uspela:", e.message);
  }

  // === 4️⃣ DATUM OBJAVE ===
  try {
    await page.evaluate(() => {
      const label = [...document.querySelectorAll("label.form-label")]
        .find((el) => el.textContent.includes("Datum objave"));
      if (label) label.style.outline = "3px solid red";
      const input = label?.parentElement?.querySelector("input.form-input[type='button']");
      if (input) input.style.outline = "3px solid red";
      input?.scrollIntoView({ behavior: "smooth", block: "center" });
      input?.focus();
      if (input) {
        const eventOptions = { bubbles: true, cancelable: true, view: window };
        input.dispatchEvent(new MouseEvent("mouseover", eventOptions));
        input.dispatchEvent(new MouseEvent("mousedown", eventOptions));
        input.dispatchEvent(new MouseEvent("mouseup", eventOptions));
        input.dispatchEvent(new MouseEvent("click", eventOptions));
      }
    });

    await page.evaluate(() => {
      const openList =
        document.querySelector("div.list[aria-expanded='true']") ||
        document.querySelector("div.list.show");
      if (!openList) return false;
      const options = Array.from(openList.querySelectorAll("li, div"));
      const match = options.find((el) => el.textContent.includes("V zadnjih treh mesecih"));
      match?.focus();
      if (match) {
        const eventOptions = { bubbles: true, cancelable: true, view: window };
        match.dispatchEvent(new MouseEvent("mouseover", eventOptions));
        match.dispatchEvent(new MouseEvent("mousedown", eventOptions));
        match.dispatchEvent(new MouseEvent("mouseup", eventOptions));
        match.dispatchEvent(new MouseEvent("click", eventOptions));
      }
      return !!match;
    });
    await sleep(500);

    console.log("✅ Datum objave: V zadnjih treh mesecih");
  } catch (e) {
    console.warn("⚠️ Datum objave ni uspela:", e.message);
  }

  // === 5️⃣ Klik na gumb "Išči" ===
  try {
    await page.evaluate(() => {
      const btn = [...document.querySelectorAll("button")]
        .find((b) => b.textContent.trim() === "Išči");
      if (btn) btn.style.outline = "3px solid red";
      btn?.scrollIntoView({ behavior: "smooth", block: "center" });
      btn?.click();
    });
    console.log("🔎 Klik na Išči...");
  } catch (e) {
    console.warn("⚠️ Gumb 'Išči' ni bil najden:", e.message);
  }

  // === 6️⃣ Počakaj rezultate ===
  console.log("⌛ Čakam rezultate...");
  await page.waitForSelector("tbody tr", { timeout: 30000 }).catch(() => {});
  await sleep(10000);

  const results = await page.evaluate(() => {
    const rows = document.querySelectorAll("tbody tr");
    return Array.from(rows).map((row) => {
      const tds = Array.from(row.querySelectorAll("td")).map((td) => td.innerText.trim());
      const link = row.querySelector("a")?.href || "";
      return {
        narocnik: tds[0] || "",
        naziv: tds[1] || "",
        faza: tds[2] || "",
        stevilka: tds[3] || "",
        datumObjave: tds[4] || "",
        povezava: link,
      };
    });
  });

  console.log(`✅ Najdenih ${results.length} zapisov po filtrih.`);
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
  const browser = await puppeteer.launch({
    headless: true,     // 👈 prikaže okno brskalnika
    slowMo: 150,         // 👈 upočasni akcije (npr. 150 ms med kliki)
    defaultViewport: null, // 👈 omogoči polno okno
    args: ['--start-maximized'] // 👈 zaženem brskalnik čez cel ekran
  });
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
    //await browser.close();
  }
}

/** 🔹 Če zaženeš neposredno */
if (process.argv[1] && process.argv[1].endsWith("scraper.js")) {
  scrapeAll().catch((err) => console.error("Napaka pri scraping-u:", err));
}
