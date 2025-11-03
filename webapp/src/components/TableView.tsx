export type RecordItem = {
  naročnik: string;
  predmet: string;
  status: string;
  številka: string;
  datum: string;
  povezava?: string;
};

interface TableViewProps {
  data: RecordItem[];
}

export default function TableView({ data }: TableViewProps) {
  return (
    <div className="overflow-x-auto bg-white rounded-xl shadow">
      <table className="min-w-full text-sm text-left">
        <thead className="bg-gray-100 text-gray-700 uppercase">
          <tr>
            <th className="px-4 py-2">Datum</th>
            <th className="px-4 py-2">Naročnik</th>
            <th className="px-4 py-2">Predmet</th>
            <th className="px-4 py-2">Številka</th>
            <th className="px-4 py-2">Status</th>
            <th className="px-4 py-2">Povezava</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={idx} className="border-t hover:bg-gray-50">
              <td className="px-4 py-2">{row.datum}</td>
              <td className="px-4 py-2">{row.naročnik}</td>
              <td className="px-4 py-2">{row.predmet}</td>
              <td className="px-4 py-2">{row.številka}</td>
              <td className="px-4 py-2">{row.status}</td>
              <td className="px-4 py-2">
                {row.povezava ? (
                  <a
                    href={row.povezava && (row.povezava.startsWith('http') || row.povezava.startsWith('https')) ? row.povezava : `https://www.enarocanje.si/${row.povezava}`}
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