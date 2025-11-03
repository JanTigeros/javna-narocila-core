export type RecordItem = {
  stevilka: string;
  nazivNarocila: string;
  naročnik: string;
  vrstaPredmeta: string;
  fazaPostopka: string;
  datumObjave: string;
  rokZaPrejem: string;
  povezava?: string;
};

interface TableViewProps {
  data: RecordItem[];
}

export default function TableView({ data }: TableViewProps) {
  if (!data || data.length === 0) {
    return <div className="text-gray-500">Ni podatkov za prikaz.</div>;
  }

  return (
    <div className="overflow-x-auto bg-white rounded-xl shadow">
      <table className="min-w-full text-sm text-left">
        <thead className="bg-gray-100 text-gray-700 uppercase">
          <tr>
            <th className="px-4 py-2">Številka</th>
            <th className="px-4 py-2">Naziv naročila</th>
            <th className="px-4 py-2">Naročnik</th>
            <th className="px-4 py-2">Vrsta predmeta</th>
            <th className="px-4 py-2">Faza postopka</th>
            <th className="px-4 py-2">Datum objave</th>
            <th className="px-4 py-2">Rok za prejem</th>
            <th className="px-4 py-2">Povezava</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={idx} className="border-t hover:bg-gray-50">
              <td className="px-4 py-2">{row.stevilka}</td>
              <td className="px-4 py-2">{row.nazivNarocila}</td>
              <td className="px-4 py-2">{row.naročnik}</td>
              <td className="px-4 py-2">{row.vrstaPredmeta}</td>
              <td className="px-4 py-2">{row.fazaPostopka}</td>
              <td className="px-4 py-2">{row.datumObjave}</td>
              <td className="px-4 py-2">{row.rokZaPrejem}</td>
              <td className="px-4 py-2">
                {row.povezava ? (
                  <a
                    href={row.povezava}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                  >
                    Preglej
                  </a>
                ) : (
                  "-"
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}