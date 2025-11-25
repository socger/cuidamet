import React from 'react';
import SearchIcon from './icons/SearchIcon';
import CuidametLogo from './CuidametLogo';

interface HeaderProps {
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
}

const Header_ProviderList: React.FC<HeaderProps> = ({ searchQuery, onSearchQueryChange }) => {
  return (
      // <header className="py-4">
    <header className="py-4 bg-white/90 backdrop-blur-lg sticky top-0 z-40 border-b border-slate-200">
      <div className="container mx-auto">
        <img
          src="/resources/docs/logos/Logo CuidaMet_Horizontal.svg"
          alt="Cuidamet: Cuidamos de lo que te importa"
          className="h-12 w-auto"
        />
      </div>

            {/* <form
              // onSubmit={handleFormSubmit}
              className="relative max-w-lg mx-auto w-full mb-10"
            >
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <SearchIcon className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="search"
                // value={query}
                // onChange={(e) => setQuery(e.target.value)}
                placeholder="Nombre, servicio, ubicación..."
                className="w-full bg-white border border-slate-300 rounded-full py-4 pl-12 pr-32 text-base focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition text-slate-800"
              />
              <button
                type="submit"
                className="absolute inset-y-0 right-0 flex items-center bg-teal-500 text-white font-semibold px-6 rounded-full m-1.5 hover:bg-teal-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
              >
                Buscar
              </button>
            </form>
 */}
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between gap-4 h-16">
          <div className="flex-shrink-0">
            <a href="/">
              <CuidametLogo />
            </a>
          </div>

          <div className="flex-1 min-w-0">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon className="h-5 w-5 text-slate-400" />
              </div>
              
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchQueryChange(e.target.value)}
                placeholder="Busca por nombre, servicio, zona..."
                className="w-full bg-slate-100 border border-slate-200 rounded-lg py-2 pl-10 pr-4 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header_ProviderList;
