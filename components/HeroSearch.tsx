import React, { useState, useEffect } from "react";
import SearchIcon from "./icons/SearchIcon";

interface HeroSearchProps {
  onSearch: (query: string) => void;
  initialValue?: string;
}

const HeroSearch: React.FC<HeroSearchProps> = ({ onSearch, initialValue = "" }) => {
  const [query, setQuery] = useState(initialValue);

  // Update query when initialValue changes
  useEffect(() => {
    setQuery(initialValue);
  }, [initialValue]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query);
    }
  };

  return (
    <div className="max-w-4xl mx-auto mb-12">
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8">
        <img
          src="/resources/docs/logos/Logo CuidaMet_Horizontal.svg"
          alt="Cuidamet: Cuidamos de lo que te importa"
          className="h-10 w-auto flex-shrink-0 md:mt-2"
        />
        <div className="flex-1 text-center w-full">
          <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold leading-tight mb-4 md:mb-6">
            Encuentra cuidadores
            <br />
            <span className="bg-gradient-to-r from-teal-400 to-green-500 text-transparent bg-clip-text">
              de confianza
            </span>
            <br />
            cerca de ti
          </h2>

          <form
            onSubmit={handleFormSubmit}
            className="relative max-w-2xl mx-auto w-full md:px-0"
          >
            <div className="absolute inset-y-0 left-0 pl-4 md:pl-5 flex items-center pointer-events-none">
              <SearchIcon className="h-4 w-4 md:h-5 md:w-5 text-slate-400" />
            </div>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Nombre, servicio, ubicación..."
              className="w-full bg-white border-2 border-slate-200 rounded-full py-2.5 md:py-4 pl-10 md:pl-14 pr-24 md:pr-36 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition text-slate-700 placeholder:text-slate-400"
            />
            <button
              type="submit"
              className="absolute inset-y-0 right-0 flex items-center bg-teal-500 text-white font-semibold px-3 md:px-8 text-xs md:text-base rounded-full m-1 hover:bg-teal-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
            >
              Buscar
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default HeroSearch;
