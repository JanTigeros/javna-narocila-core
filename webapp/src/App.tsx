import React, { useEffect, useState } from "react";
import EUView from "./components/EUView";
import EJNView from "./components/EJNVIew";

type EUItem = {
  title: string;
  href: string;
  statusText?: string;
  openingDate?: string;
  deadlineDate?: string;
  program?: string;
};

type EJNItem = {
  narocnik: string;
  naziv: string;
  faza: string;
  stevilka: string;
  datumObjave: string;
  povezava: string;
};

export default function App() {
  const [euData, setEuData] = useState<EUItem[]>([]);
  const [ejnData, setEjnData] = useState<EJNItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [scraping, setScraping] = useState(false);

  useEffect(() => {
    fetch("http://localhost:4000/api/data")
      .then((res) => res.json())
      .then((data) => {
        setEuData(data.eu || []);
        setEjnData(data.ejn || []);
      })
      .catch((err) => console.error("Napaka pri nalaganju podatkov:", err))
      .finally(() => setLoading(false));
  }, []);

  async function handleScrape() {
    try {
      setScraping(true);
      setLoading(true);

      // trigger server scrape
      const res = await fetch("http://localhost:4000/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const postResult = await res.json().catch(() => null);

      // refresh data from GET endpoint (server saves results to data.json)
      const dataRes = await fetch("http://localhost:4000/api/data");
      const data = await dataRes.json().catch(() => null);

      // Prefer the canonical data.json shape, fall back to POST result when needed
      setEuData((data && data.eu) || (postResult && postResult.results && postResult.results.eu) || []);
      setEjnData((data && data.ejn) || (postResult && postResult.results && postResult.results.ejn) || (postResult && postResult.results) || []);
    } catch (err) {
      console.error("Napaka pri zagonu iskanja:", err);
    } finally {
      setScraping(false);
      setLoading(false);
    }
  }

  if (loading) return <div className="p-8 text-center">⏳ Nalagam podatke...</div>;

  return (
    <div className="p-8 space-y-10">
      <h1 className="text-3xl font-bold text-center mb-4">📊 Javna naročila (EJN + EU Portal)</h1>

      <div className="flex justify-center mb-4">
        <button
          onClick={handleScrape}
          disabled={scraping}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
        >
          {scraping ? "Iskanje..." : "Najdi"}
        </button>
      </div>

      <section>
        <h2 className="text-2xl font-semibold mb-2">🇪🇺 EU Portal</h2>
        <EUView data={euData} />
      </section>

      <section>
        <h2 className="text-2xl font-semibold mt-8 mb-2">🇸🇮 EJN Portal</h2>
        <EJNView data={ejnData} />
      </section>
    </div>
  );
}