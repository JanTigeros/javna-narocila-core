import { useState, useEffect } from "react";
import TableView, { type RecordItem } from "./components/TableView";
import FiltersModal from "./components/FiltersModal";
import EUView, { type EUItem } from "./components/EUView";

interface Filters {
  keyword?: string;
  narocnik?: string;
  vrstaPostopka?: string;
  datumOd?: string;
  datumDo?: string;
  euStatus?: string;
  // reserved for future filter options
}

export default function App() {
  const [enarocanjeData, setEnarocanjeData] = useState<RecordItem[]>([]);
  const [euData, setEuData] = useState<EUItem[]>([]);
  const [filters, setFilters] = useState<Filters>({});
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const runScrape = async (useFilters: Filters = {}) => {
    setLoading(true);
    try {
      // call the backend scraper endpoint; server is expected at localhost:4000
      const res = await fetch("http://localhost:4000/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(useFilters),
      });
      const json = await res.json();
      const results = json.results || json.results || json;

      // server writes combined object with keys 'enarocanje' and 'eu'
      if (results && results.enarocanje) setEnarocanjeData(results.enarocanje as RecordItem[]);
      if (results && results.eu) setEuData(results.eu as EUItem[]);

      // if server returned top-level combined
      if (!results && json.results) {
        const r = json.results;
        if (r.enarocanje) setEnarocanjeData(r.enarocanje);
        if (r.eu) setEuData(r.eu);
      }
    } catch (err) {
      console.error("Napaka pri klicu /api/scrape:", err);
      // fallback: try to read a local data.json (public/data.json) — legacy format is an array of enarocanje items
      try {
        const local = await fetch('/data.json');
        if (local.ok) {
          const arr = await local.json();
          // assume it's enarocanje array
          setEnarocanjeData(arr as RecordItem[]);
        }
      } catch (e) {
        console.error('Fallback local data.json failed', e);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // automatically trigger scrape on app load
    runScrape(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (newFilters: Filters) => {
    setFilters(newFilters);
    setShowFilters(false);
    // rerun scrape with updated filters
    runScrape(newFilters);
  };

  // Filter enarocanje preview to only show items where status/faza = 'naročilo'
  const enarocanjeFiltered = enarocanjeData.filter((it) => {
    const status = (it.status || "").toLowerCase();
    return status.includes("naročilo") || status.includes("faza: naročilo") || status.includes("naročilo");
  });

  // Also limit to items with current date (published/open today).
  // We use a permissive matcher that looks for day, month and year components inside the date text.
  const isDateToday = (text = "") => {
    if (!text) return false;
    const now = new Date();
    // Try to parse textual dates like '30 October 2025' or ISO-like values
    const parsed = Date.parse(text);
    if (!isNaN(parsed)) {
      const pd = new Date(parsed);
      return pd.getFullYear() === now.getFullYear() && pd.getMonth() === now.getMonth() && pd.getDate() === now.getDate();
    }

    // Fallback: numeric-pattern matching (dd.mm.yyyy, dd/mm/yyyy, yyyy-mm-dd, or presence of day/month/year tokens)
    const dayNum = String(now.getDate());
    const dayNumP = dayNum.padStart(2, "0");
    const monthNum = String(now.getMonth() + 1);
    const monthNumP = monthNum.padStart(2, "0");
    const year = String(now.getFullYear());
    const t = (text || "").replace(/\s+/g, "");
    return (
      (t.includes(dayNum) && t.includes(monthNum) && t.includes(year)) ||
      t.includes(`${dayNumP}.${monthNumP}.${year}`) ||
      t.includes(`${dayNum}.${monthNum}.${year}`) ||
      t.includes(`${dayNumP}/${monthNumP}/${year}`) ||
      t.includes(`${year}-${monthNumP}-${dayNumP}`)
    );
  };

  const enarocanjeToday = enarocanjeFiltered.filter((it) => isDateToday(it.datum));
  const euToday = euData.filter((it) => isDateToday(it.openingDate || it.startDate || it.published || it.created || it.deadlineDate));

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Pregled objav</h1>
        <div className="flex gap-2">
          <button onClick={() => setShowFilters(true)} className="px-3 py-2 border rounded">
            Nastavi filtre
          </button>
          <button onClick={() => runScrape(filters)} className="px-3 py-2 bg-blue-600 text-white rounded">
            Osveži (scrape)
          </button>
        </div>
      </div>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">eNaročanje — faza = "naročilo" (danes)</h2>
        {loading ? <div>Scraping ...</div> : <TableView data={enarocanjeToday} />}
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">EU Portal — (danes)</h2>
        {loading ? <div>Scraping ...</div> : <EUView data={euToday} />}
      </section>

      {showFilters && (
        <FiltersModal onClose={() => setShowFilters(false)} onSearch={handleSearch} />
      )}
    </div>
  );
}