import React, { useState } from "react";
import { CareCategory } from "../types";
import SearchIcon from "./icons/SearchIcon";
import ShieldCheckIcon from "./icons/ShieldCheckIcon";
import LocationPinIcon from "./icons/LocationPinIcon";
import SparklesIcon from "./icons/SparklesIcon";
import QueueListIcon from "./icons/QueueListIcon";
import MapIcon from "./icons/MapIcon";
import ChatBubbleLeftRightIcon from "./icons/ChatBubbleLeftRightIcon";
import CheckCircleIcon from "./icons/CheckCircleIcon";
import ShareIcon from "./icons/ShareIcon";
import StarIcon from "./icons/StarIcon";
import ClockIcon from "./icons/ClockIcon";
import { CATEGORIES } from "@/to_delete/constants";
import SeniorsIcon from "./icons/SeniorsIcon";
import KidsIcon from "./icons/KidsIcon";
import PetsIcon from "./icons/PetsIcon";
import BroomIcon from "./icons/BroomIcon";
import CategoryIcon from "./icons/CategoryIcon";

// START - NEW in cuidamet_5
  const CategoryCard: React.FC<{
    categoryKey: string;
    category: { name: string };
    icon: React.ReactNode;
    imageUrl: string;
  }> = ({ categoryKey, category, icon, imageUrl }) => (
    <div
      key={categoryKey}
      className="relative rounded-xl overflow-hidden group h-40 transform hover:scale-105 active:scale-100 transition-all duration-300 shadow-lg hover:shadow-xl active:shadow-md"
    >
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-110"
        style={{ backgroundImage: `url(${imageUrl})` }}
      />
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm group-hover:bg-black/50 transition-colors duration-300" />
      <div className="relative z-10 p-4 flex flex-col h-full justify-end items-start text-white">
        {React.cloneElement(icon as React.ReactElement, {
          className: "w-10 h-10 mb-2",
        })}
        <h3 className="text-2xl font-bold tracking-tight">{category.name}</h3>
      </div>
    </div>
  );
// END - NEW in cuidamet_5

interface LandingPageProps {
  onCategorySelect: (category: CareCategory) => void;
  onShowAll: () => void;
  onNavigateMap: () => void;
  onSearch: (query: string) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({
  onCategorySelect,
  onShowAll,
  onNavigateMap,
  onSearch,
}) => {
  const [query, setQuery] = useState("");

  // START  - NEW in cuidamet_5
    const categoryImages = {
      mayores:
        "/resources/images/cuidado_de_mayores.jpg",
      niños:
        "/resources/images/cuidado_de_ninos.avif",
      mascotas:
        "/resources/images/cuidado_de_mascotas_002.avif",
      limpieza:
        "/resources/images/cuidado_de_limpieza.avif",
    };
  // END - NEW in cuidamet_5

  const categories = [
    {
      id: CareCategory.ELDERLY,
      name: "Cuidado de Mayores",
      imageUrl: "/resources/images/cuidado_de_mayores.jpg",
      // Estas dos propiedades las hemos quitado para que las imágenes de servicios no tengan degradados
      // colorClass: "from-green-600/90",
      // shadowClass: "hover:shadow-green-500/30",
    },
    {
      id: CareCategory.CHILDREN,
      name: "Cuidado de Niños",
      imageUrl: "/resources/images/cuidado_de_ninos.avif",
      // Estas dos propiedades las hemos quitado para que las imágenes de servicios no tengan degradados
      // colorClass: "from-slate-600/90", // Gray
      // shadowClass: "hover:shadow-slate-500/30",
    },
    {
      id: CareCategory.PETS,
      name: "Cuidado de Mascotas",
      imageUrl: "/resources/images/cuidado_de_mascotas.avif",
      // Estas dos propiedades las hemos quitado para que las imágenes de servicios no tengan degradados
      // colorClass: "from-orange-600/90",
      // shadowClass: "hover:shadow-orange-500/30",
    },
    {
      id: CareCategory.HOUSEKEEPING,
      name: "Limpieza de Hogar",
      imageUrl: "/resources/images/cuidado_de_limpieza.avif",
      // Estas dos propiedades las hemos quitado para que las imágenes de servicios no tengan degradados
      // colorClass: "from-blue-600/90",
      // shadowClass: "hover:shadow-blue-500/30",
    },
  ];

  const features = [
    {
      icon: ShieldCheckIcon,
      title: "Confianza y Seguridad",
      description:
        "Perfiles verificados y valoraciones de otros usuarios para que elijas con total tranquilidad.",
    },
    {
      icon: LocationPinIcon,
      title: "Cerca de Ti",
      description:
        "Usa tu ubicación para encontrar a los mejores cuidadores en tu propio barrio.",
    },
    {
      icon: SparklesIcon,
      title: "Fácil y Rápido",
      description:
        "Contacta y contrata en muy pocos pasos de forma segura e intuitiva desde nuestra aplicación.",
    },
  ];

  const securityFeatures = [
    {
      icon: ShieldCheckIcon,
      title: "Verificación estricta",
      description: "DNI, certificados y antecedentes verificados",
    },
    {
      icon: StarIcon,
      title: "Valoraciones reales",
      description:
        "Opiniones honestas de otros usuarios para ayudarte a decidir.",
    },
    {
      icon: LocationPinIcon,
      title: "Geolocalización",
      description: "Encuentra profesionales en tu zona al instante",
    },
    {
      icon: ClockIcon,
      title: "Disponibilidad 24/7",
      description: "Modo urgente para necesidades inmediatas",
    },
  ];

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: "Cuidamet",
      text: "¡Encuentra cuidadores de confianza cerca de ti con Cuidamet! Te la recomiendo.",
      url: window.location.origin,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback for desktop or unsupported browsers
        await navigator.clipboard.writeText(shareData.url);
        alert(
          "¡Enlace de la app copiado al portapapeles! Compártelo con quien quieras."
        );
      }
    } catch (err: any) {
      if (err.name !== "AbortError") {
        console.error("Error al compartir:", err);
        alert("No se pudo compartir la aplicación.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-800 flex flex-col pb-24">
      <main className="container mx-auto px-4 flex-grow flex flex-col justify-center">
        <div className="py-8">
          <div className="max-w-4xl mx-auto mb-12">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8">
              <img
                src="/resources/docs/logos/Logo CuidaMet_Horizontal.svg"
                alt="Cuidamet: Cuidamos de lo que te importa"
                className="h-10 w-auto flex-shrink-0 md:mt-2"
              />
              <div className="flex-1 text-center w-full">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-6">
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
                  className="relative max-w-2xl mx-auto w-full"
                >
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                    <SearchIcon className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Nombre, servicio, ubicación..."
                    className="w-full bg-white border-2 border-slate-200 rounded-full py-4 pl-14 pr-36 text-base focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition text-slate-700 placeholder:text-slate-400"
                  />
                  <button
                    type="submit"
                    className="absolute inset-y-0 right-0 flex items-center bg-teal-500 text-white font-semibold px-8 rounded-full m-1 hover:bg-teal-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                  >
                    Buscar
                  </button>
                </form>
              </div>
            </div>
          </div>

          <h3 className="text-center text-xl font-semibold text-teal-600 mb-8 mt-12">
            ¿Qué tipo de servicio estás buscando?
          </h3>

          {/* START - IMAGENES principales SERVICIOS - 001 */}
            <div className="grid grid-cols-2 gap-4 max-w-4xl mx-auto">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => onCategorySelect(cat.id)}
                  // La propiedad cat.shadowClass la hemos quitado para que las imágenes de servicios no tengan degradados
                  // className={`relative aspect-[4/3] rounded-xl overflow-hidden group shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 ${cat.shadowClass}`}
                  className={`relative aspect-[4/3] rounded-xl overflow-hidden group shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1`}
                >
                  <img
                    src={cat.imageUrl}
                    alt={cat.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />

                  <div
                    // La propiedad cat.colorClass la hemos quitado para que las imágenes de servicios no tengan degradados
                    // className={`absolute inset-0 bg-gradient-to-t ${cat.colorClass} to-transparent transition-opacity duration-300`}
                    className={`absolute inset-0 bg-gradient-to-t to-transparent transition-opacity duration-300`}
                  ></div>

                  <div className="absolute inset-0 flex items-end p-4">
                    <h3 className="text-white text-lg sm:text-xl font-bold leading-tight drop-shadow-md text-left">
                      {cat.name}
                    </h3>
                  </div>
                </button>
              ))}
            </div>
          {/* END - IMAGENES principales SERVICIOS - 001 */}




          {/* How it works Section */}
          <section className="mt-16 text-center">
            <h2 className="text-3xl font-bold text-slate-800 mb-3">
              ¿Cómo funciona Cuidamet?
            </h2>

            <p className="max-w-xl mx-auto text-slate-600 mb-12">
              Tres pasos simples para encontrar tu cuidador ideal
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-4xl mx-auto">
              {/* Step 1 */}
              <div className="flex flex-col items-center">
                <div className="bg-teal-100 rounded-full p-5 mb-4 inline-block">
                  <SearchIcon className="w-10 h-10 text-teal-500" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">
                  1. Busca
                </h3>
                <p className="text-slate-500 leading-relaxed">
                  Filtra por ubicación, disponibilidad, tipo de servicio y
                  valoraciones. Encuentra cuidadores cerca de ti.
                </p>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col items-center">
                <div className="bg-teal-100 rounded-full p-5 mb-4 inline-block">
                  <ChatBubbleLeftRightIcon className="w-10 h-10 text-teal-500" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">
                  2. Conecta
                </h3>
                <p className="text-slate-500 leading-relaxed">
                  Chatea directamente y programa videollamadas. Conoce a los
                  candidatos antes de decidir.
                </p>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col items-center">
                <div className="bg-teal-100 rounded-full p-5 mb-4 inline-block">
                  <CheckCircleIcon className="w-10 h-10 text-teal-500" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">
                  3. Contrata
                </h3>
                <p className="text-slate-500 leading-relaxed">
                  Reserva con pago seguro incluido. Sistema de valoraciones para
                  garantizar calidad.
                </p>
              </div>
            </div>
          </section>

          {/* Buttons: "Ver todos los servicios" & "Buscar en el mapa" */}
          <div className="mt-16 max-w-4xl mx-auto space-y-4">
            <div className="grid grid-cols-2 gap-3 md:gap-4 max-w-4xl mx-auto">
              <div className="col-span-2 my-4">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={onShowAll}
                    // Quitamos a los botones los bordes de color verde
                    // className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-full transition-all duration-300 bg-gradient-to-r from-teal-500 to-green-500 text-white font-semibold shadow-lg hover:shadow-xl hover:shadow-teal-500/30 transform hover:-translate-y-0.5 border-2 border-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                    className="w-full flex items-center justify-center gap-2 px-8 py-4 rounded-full transition-all duration-300 bg-gradient-to-r from-teal-500 to-green-500 text-white font-semibold shadow-lg hover:shadow-xl hover:shadow-teal-500/30 transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                  >
                    <QueueListIcon className="w-5 h-5" />
                    <span>Ver todos los servicios</span>
                  </button>

                  <button
                    onClick={onNavigateMap}
                    // Quitamos a los botones los bordes de color verde
                    // className="relative w-full flex items-center justify-center gap-2 px-6 py-3 rounded-full font-semibold text-white overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-teal-500/40 transform hover:-translate-y-1 transition-all duration-500 group border-2 border-teal-600 focus:outline-none focus:ring-4 focus:ring-teal-500/50"
                    className="relative w-full flex items-center justify-center gap-2 px-8 py-4 rounded-full font-semibold text-white overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-teal-500/40 transform hover:-translate-y-1 transition-all duration-500 group focus:outline-none focus:ring-4 focus:ring-teal-500/50"
                  >
                    <div
                      className="absolute inset-0 bg-cover bg-center filter blur-md scale-110 transition-all duration-500 group-hover:blur-sm group-hover:scale-100"
                      style={{
                        backgroundImage: "url('/resources/images/tierra.jpeg')",
                      }}
                      aria-hidden="true"
                    ></div>
                    <div
                      className="absolute inset-0 bg-gradient-to-t from-teal-600/80 via-teal-500/50 to-transparent transition-colors duration-500"
                      aria-hidden="true"
                    ></div>
                    <div className="relative z-10 flex items-center justify-center drop-shadow-md">
                      <MapIcon className="w-5 h-5" />
                      <span>Buscar en el mapa</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <section className="mt-16 md:mt-24 text-center">
            <h2 className="text-3xl font-bold text-slate-800 mb-4">
              Tu tranquilidad, nuestra prioridad
            </h2>

            <p className="max-w-2xl mx-auto text-slate-600 mb-12">
              Te conectamos con los mejores profesionales para el cuidado de los
              que más quieres.
            </p>

            {/* START - CARDS: CONFIANZA Y SEGURIDAD, CERCA DETI y FACIL Y RAPIDO - 001 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
                {features.map((feature, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div className="bg-teal-100/70 rounded-full p-4 mb-4">
                      <feature.icon className="w-8 h-8 text-teal-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-800 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-slate-500 text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                ))}
              </div>
            {/* END - CARDS: CONFIANZA Y SEGURIDAD, CERCA DETI y FACIL Y RAPIDO - 001 */}
          </section>

          <section className="mt-16 text-center">
            <h3 className="text-xl font-semibold text-slate-700 mb-4">
              ¿Te gusta Cuidamet?
            </h3>

            <p className="max-w-md mx-auto text-slate-500 mb-6">
              Ayúdanos a crecer y a que más gente encuentre al cuidador
              perfecto. ¡Comparte la aplicación con tus amigos y familiares!
            </p>

            <button
              onClick={handleShare}
              className="inline-flex items-center justify-center bg-gradient-to-r from-teal-500 to-green-500 text-white px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-teal-500/50 shadow-lg hover:shadow-xl hover:shadow-teal-500/30 transform hover:-translate-y-1"
            >
              <ShareIcon className="w-6 h-6 mr-3" />
              Compartir la aplicación
            </button>
          </section>

          <section className="mt-20 py-16 bg-teal-50/70 rounded-3xl">
            <div className="container mx-auto px-4 text-center">
              <h2 className="text-3xl font-bold text-slate-800 mb-12">
                Tu seguridad es nuestra prioridad
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
                {securityFeatures.map((feature, index) => {
                  const IconComponent = feature.icon;
                  return (
                    <div
                      key={index}
                      className="bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-white/50 text-center flex flex-col items-center transform hover:-translate-y-1 transition-transform duration-300"
                    >
                      <div className="text-teal-500 mb-3">
                        <IconComponent className="w-8 h-8" />
                      </div>
                      <h3 className="text-sm font-semibold text-slate-800 mb-1">
                        {feature.title}
                      </h3>
                      <p className="text-slate-500 text-xs leading-snug">
                        {feature.description}
                      </p>
                    </div>
                  );
                })}
              </div>


            </div>
          </section>




        </div>
      </main>
    </div>
  );
};

export default LandingPage;
