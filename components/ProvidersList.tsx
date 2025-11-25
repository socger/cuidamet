import React from "react";
import { CareCategory, Provider } from "../types";
import Header_ProviderList from "./Header_ProviderList";
import CategorySelector from "./CategorySelector";
import ProviderCard from "./ProviderCard";

interface ProvidersListProps {
  providers: Provider[];
  view: "providers" | "favorites";
  selectedCategory: CareCategory | "all";
  searchQuery: string;
  favorites: Set<number>;
  isLoading: boolean;
  locationError: string | null;
  userLocation: { latitude: number; longitude: number } | null;
  onSearchQueryChange: (query: string) => void;
  onSelectCategory: (category: CareCategory | "all") => void;
  onToggleFavorite: (providerId: number) => void;
  onViewProfile: (providerId: number) => void;
}

const ProvidersList: React.FC<ProvidersListProps> = ({
  providers,
  view,
  selectedCategory,
  searchQuery,
  favorites,
  isLoading,
  locationError,
  userLocation,
  onSearchQueryChange,
  onSelectCategory,
  onToggleFavorite,
  onViewProfile,
}) => {
  // Handler that clears search only when selecting "all"
  const handleCategorySelect = (category: CareCategory | "all") => {
    if (category === "all") {
      onSearchQueryChange(""); // Clear search input only for "Todos"
    }
    onSelectCategory(category); // Select category
  };

  // Filtering logic
  const baseProviders =
    view === "favorites"
      ? providers.filter((p) => favorites.has(p.id))
      : providers;

  const categoryFilteredProviders =
    selectedCategory === "all"
      ? baseProviders
      : baseProviders.filter((p) => p.categories.includes(selectedCategory));

  const searchedProviders =
    searchQuery.trim() === ""
      ? categoryFilteredProviders
      : categoryFilteredProviders.filter((provider) => {
          const query = searchQuery.toLowerCase().trim();

          const nameMatch = provider.name.toLowerCase().includes(query);
          const locationMatch = provider.location.toLowerCase().includes(query);
          const serviceMatch = provider.services.some((service) =>
            service.toLowerCase().includes(query)
          );
          const descriptionMatch = provider.descriptions.some((desc) =>
            desc.text.toLowerCase().includes(query)
          );

          return (
            nameMatch || locationMatch || serviceMatch || descriptionMatch
          );
        });

  const filteredProviders = searchedProviders.sort(
    (a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity)
  );

  return (
    <div className="min-h-screen bg-white text-slate-800 flex flex-col p-4 pb-24">
      <Header_ProviderList
        searchQuery={searchQuery}
        onSearchQueryChange={onSearchQueryChange}
      />

      <CategorySelector
        selectedCategory={selectedCategory}
        onSelectCategory={handleCategorySelect}
      />

      <main className="container mx-auto px-4 py-6 pb-24">
        {locationError && !userLocation && (
          <div
            className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4 rounded-md shadow"
            role="alert"
          >
            <p className="font-bold">Aviso de ubicación</p>
            <p>{locationError}</p>
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto"></div>
            <p className="mt-4 text-slate-500">Buscando cuidadores...</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {filteredProviders.length > 0 ? (
              filteredProviders.map((provider) => (
                // jerofa aqui están las card que presentan a los cuidadores
                <ProviderCard
                  key={provider.id}
                  provider={provider}
                  isFavorite={favorites.has(provider.id)}
                  onToggleFavorite={onToggleFavorite}
                  onViewProfile={onViewProfile}
                  currentCategory={selectedCategory}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                {view === "favorites" ? (
                  <>
                    <p className="text-slate-500">
                      Aún no tienes cuidadores favoritos.
                    </p>
                    <p className="text-slate-500 mt-1">
                      Pulsa el corazón en un perfil para añadirlo.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-slate-600 font-semibold text-lg">
                      No se encontraron resultados
                    </p>
                    <p className="text-slate-500 mt-1">
                      Prueba a cambiar los filtros o el término de búsqueda.
                    </p>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default ProvidersList;
