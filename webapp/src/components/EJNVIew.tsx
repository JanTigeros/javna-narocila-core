export type EJNItem = {
  narocnik: string;
  naziv: string;
  faza: string;
  stevilka: string;
  datumObjave: string;
  povezava: string;
};

interface EJNViewProps {
  data: EJNItem[];
}

export default function EJNView({ data }: EJNViewProps) {
  return (
    <div className="overflow-x-auto bg-white rounded-xl shadow">
      <table className="min-w-full text-sm text-left">
        <thead className="bg-gray-100 text-gray-700 uppercase">
          <tr>
            <th className="px-4 py-2">Naročnik</th>
            <th className="px-4 py-2">Naziv</th>
            <th className="px-4 py-2">Faza</th>
            <th className="px-4 py-2">Številka</th>
            <th className="px-4 py-2">Datum objave</th>
            <th className="px-4 py-2">Povezava</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={idx} className="border-t hover:bg-gray-50">
              <td className="px-4 py-2">{row.narocnik}</td>
              <td className="px-4 py-2 max-w-xl break-words">{row.naziv}</td>
              <td className="px-4 py-2">{row.faza}</td>
              <td className="px-4 py-2">{row.stevilka}</td>
              <td className="px-4 py-2">{row.datumObjave}</td>
              <td className="px-4 py-2">
                {row.povezava ? (
                  <a href={row.povezava} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                    Odpri
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