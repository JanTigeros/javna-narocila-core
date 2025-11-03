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

  if (loading) return <div className="p-8 text-center">⏳ Nalagam podatke...</div>;

  return (
    <div className="p-8 space-y-10">
      <h1 className="text-3xl font-bold text-center mb-4">📊 Javna naročila (EJN + EU Portal)</h1>

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