import React, { useState } from "react";

interface FiltersProps {
  onClose: () => void;
  onSearch: (filters: any) => void;
}

const FiltersModal: React.FC<FiltersProps> = ({ onClose, onSearch }) => {
  const [filters, setFilters] = useState({
    keyword: "",
    narocnik: "",
    vrstaPostopka: "",
    datumOd: "",
    datumDo: "",
    euStatus: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-xl shadow-xl p-6 w-[500px]">
        <h2 className="text-xl font-bold mb-4">Filtri iskanja</h2>

        <div className="space-y-3">
          <input
            type="text"
            name="keyword"
            placeholder="Ključna beseda"
            className="w-full border p-2 rounded"
            onChange={handleChange}
          />
          <input
            type="text"
            name="narocnik"
            placeholder="Naročnik"
            className="w-full border p-2 rounded"
            onChange={handleChange}
          />
          <select
            name="vrstaPostopka"
            className="w-full border p-2 rounded"
            onChange={handleChange}
          >
            <option value="">Vrsta postopka</option>
            <option value="odprti">Odprti postopek</option>
            <option value="naročilo male vrednosti">Naročilo male vrednosti</option>
            <option value="pogajanja">Postopek s pogajanji</option>
          </select>

          <input
            type="text"
            name="euStatus"
            placeholder="EU portal status (npr. Open For Submission)"
            className="w-full border p-2 rounded"
            onChange={handleChange}
          />

          <div className="flex gap-2">
            <input
              type="date"
              name="datumOd"
              className="w-full border p-2 rounded"
              onChange={handleChange}
            />
            <input
              type="date"
              name="datumDo"
              className="w-full border p-2 rounded"
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="flex justify-between mt-6">
          <button onClick={onClose} className="px-4 py-2 border rounded">
            Nazaj
          </button>
          <button
            onClick={() => onSearch(filters)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Poišči
          </button>
        </div>
      </div>
    </div>
  );
};

export default FiltersModal;