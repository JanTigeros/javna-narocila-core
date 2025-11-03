import React, { useState } from "react";

interface FiltersProps {
  onClose: () => void;
  onSearch: (filters: any) => void;
}

const FiltersModal: React.FC<FiltersProps> = ({ onClose, onSearch }) => {
  const [filters, setFilters] = useState({
    narocnik: "",
    maticna: "",
    nazivNarocila: "",
    stevilkaNarocila: "",
    vrstaPredmeta: "Storitve",
    nazivSklopa: "",
    fazaPostopka: "Naročilo",
    datumObjave: "V zadnjem mesecu",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white rounded-xl shadow-xl p-6 w-[500px]">
        <h2 className="text-xl font-bold mb-4">Filtri iskanja</h2>

        <div className="space-y-3">
          {[
            { name: "narocnik", label: "Naziv naročnika" },
            { name: "maticna", label: "Matična številka" },
            { name: "nazivNarocila", label: "Naziv javnega naročila" },
            { name: "stevilkaNarocila", label: "JN številka" },
            { name: "nazivSklopa", label: "Naziv sklopa javnega naročila" },
          ].map((input) => (
            <input
              key={input.name}
              type="text"
              name={input.name}
              placeholder={input.label}
              className="w-full border p-2 rounded"
              onChange={handleChange}
              value={(filters as any)[input.name]}
            />
          ))}

          <select
            name="vrstaPredmeta"
            className="w-full border p-2 rounded"
            onChange={handleChange}
            value={filters.vrstaPredmeta}
          >
            <option value="Storitve">Storitve</option>
            <option value="Blago">Blago</option>
            <option value="Gradnje">Gradnje</option>
          </select>

          <select
            name="fazaPostopka"
            className="w-full border p-2 rounded"
            onChange={handleChange}
            value={filters.fazaPostopka}
          >
            <option value="- izberi -">- izberi -</option>
            <option value="Načrtovanje">Načrtovanje</option>
            <option value="Naročilo">Naročilo</option>
            <option value="Predhodna transparentnost">
              Predhodna transparentnost
            </option>
            <option value="Rezultat">Rezultat</option>
            <option value="Sprememba pogodbe">Sprememba pogodbe</option>
          </select>

          <select
            name="datumObjave"
            className="w-full border p-2 rounded"
            onChange={handleChange}
            value={filters.datumObjave}
          >
            <option value="V zadnjem mesecu">V zadnjem mesecu</option>
            <option value="V zadnjem tednu">V zadnjem tednu</option>
            <option value="Danes">Danes</option>
          </select>
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