export type EUItem = {
  title: string;
  href: string;
  statusText?: string;
  openingDate?: string;
  deadlineDate?: string;
  program?: string;
  [key: string]: any;
};

interface EUViewProps {
  data: EUItem[];
}

export default function EUView({ data }: EUViewProps) {
  return (
    <div className="overflow-x-auto bg-white rounded-xl shadow">
      <table className="min-w-full text-sm text-left">
        <thead className="bg-gray-100 text-gray-700 uppercase">
          <tr>
            <th className="px-4 py-2">Naslov</th>
            <th className="px-4 py-2">Status</th>
            <th className="px-4 py-2">Opening date</th>
            <th className="px-4 py-2">Deadline</th>
            <th className="px-4 py-2">Program</th>
            <th className="px-4 py-2">Povezava</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={idx} className="border-t hover:bg-gray-50 align-top">
              <td className="px-4 py-2 max-w-xl break-words">{row.title}</td>
              <td className="px-4 py-2">{row.statusText || '-'}</td>
              <td className="px-4 py-2">{row.openingDate || '-'}</td>
              <td className="px-4 py-2">{row.deadlineDate || '-'}</td>
              <td className="px-4 py-2 max-w-2xl break-words">{row.program || '-'}</td>
              <td className="px-4 py-2">
                {row.href ? (
                  <a href={row.href} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
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
