import React, { useState } from "react";
import HeartIcon from "../../icons/HeartIcon";
import Cog6ToothIcon from "../../icons/Cog6ToothIcon";
import ArrowRightOnRectangleIcon from "../../icons/ArrowRightOnRectangleIcon";
import AlertModal from "../../AlertModal";
import ChevronRightIcon from "../../icons/ChevronRightIcon";
import ChatBubbleLeftRightIcon from "../../icons/ChatBubbleLeftRightIcon";
import InformationCircleIcon from "../../icons/InformationCircleIcon";
import MapPinIcon from "../../icons/MapPinIcon";
import { ClientProfile, CareCategory } from "../../../types";
import BriefcaseIcon from "../../icons/BriefcaseIcon";
import PageHeader from "../../PageHeader";
import Resumen_PersonalInfo from "../resumenProfile/Resumen_PersonalInfo";

interface ProfilePageProps {
  clientProfile: ClientProfile | null;
  onNavigateFavorites: () => void;
  onNavigateSettings: () => void;
  onNavigateSupport: () => void;
  onNavigateSupportChat: () => void;
  onSwitchToProvider: () => void;
  onBack: () => void;
}

interface ListItemProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  highlight?: boolean;
}

const ListItem: React.FC<ListItemProps> = ({
  icon,
  label,
  onClick,
  highlight,
}) => (
  <li className="border-b border-slate-200 last:border-b-0">
    <button
      onClick={onClick}
      className={`w-full flex items-center py-4 text-left hover:bg-slate-100 px-4 transition-colors ${
        highlight ? "hover:bg-red-50" : ""
      }`}
    >
      <div className={highlight ? "text-red-500" : "text-slate-600"}>
        {icon}
      </div>
      <span
        className={`ml-4 flex-grow font-medium ${
          highlight ? "text-red-600" : "text-slate-700"
        }`}
      >
        {label}
      </span>
      <ChevronRightIcon className={`w-5 h-5 ${
        highlight ? "text-red-400" : "text-slate-400"
      }`} />
    </button>
  </li>
);

const ProfilePage: React.FC<ProfilePageProps> = ({
  clientProfile,
  onNavigateFavorites,
  onNavigateSettings,
  onNavigateSupport,
  onNavigateSupportChat,
  onSwitchToProvider,
  onBack,
}) => {
  const [alertModal, setAlertModal] = useState<{
    isOpen: boolean;
    message: string;
    title?: string;
  }>({ isOpen: false, message: "" });

  // Default guest data if no client profile exists
  const displayProfile = clientProfile || {
    name: "Usuario Invitado",
    photoUrl:
      "https://images.unsplash.com/photo-1511367461989-f85a21fda167?q=80&w=400&auto=format&fit=crop", // Generic placeholder
    email: "",
    phone: "",
    location: "",
    languages: [],
    preferences: [],
  };

  const getCategoryIcon = (cat: CareCategory): string => {
    const iconMap: Record<CareCategory, string> = {
      [CareCategory.ELDERLY]: "/resources/icons/elderly-female-icon.svg",
      [CareCategory.CHILDREN]: "/resources/icons/baby-girl-icon.svg",
      [CareCategory.PETS]: "/resources/icons/dog-puppy-face-icon.svg",
      [CareCategory.HOUSEKEEPING]: "/resources/icons/housekeeping-icon.svg",
    };

    return iconMap[cat] || "";
  };

  const getCategoryName = (cat: CareCategory): string => {
    const nameMap: Record<CareCategory, string> = {
      [CareCategory.ELDERLY]: "Mayores",
      [CareCategory.CHILDREN]: "Niños",
      [CareCategory.PETS]: "Mascotas",
      [CareCategory.HOUSEKEEPING]: "Limpieza",
    };
    return nameMap[cat] || cat;
  };

  const allCategories = [
    CareCategory.ELDERLY,
    CareCategory.CHILDREN,
    CareCategory.PETS,
    CareCategory.HOUSEKEEPING,
  ];

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col">
      <PageHeader 
        title="Mi perfil familiar" 
        onBack={onBack} 
        rightAction={
          <button
            onClick={() => 
              setAlertModal({
                isOpen: true,
                message: "Sección disponible próximamente.",
                title: "Editar perfil",
              })
            }
            className="text-teal-600 font-semibold text-sm"
          >
            Editar
          </button>
        }
      />

      <main className="container mx-auto px-4 py-6 pb-36 flex-grow">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-6">
          <Resumen_PersonalInfo
            photoUrl={
              displayProfile.photoUrl || "https://via.placeholder.com/150"
            }
            name={displayProfile.name}
            phone={displayProfile.phone}
            email={displayProfile.email}
            location={displayProfile.location}
            languages={displayProfile.languages}
          />
        </div>

        {/* User Info Header */}
        {/* <div className="flex items-center space-x-4 py-6 px-2">
                <div className="relative">
                    <img
                        src={displayProfile.photoUrl}
                        alt="User Avatar"
                        className="w-16 h-16 rounded-full object-cover border-2 shadow-md border-white"
                    />
                </div>
                <div>
                    <div className="flex items-center">
                        <h2 className="text-xl font-bold text-slate-800">{displayProfile.name}</h2>
                    </div>
                    <p className="text-sm text-teal-600 font-medium bg-teal-50 px-2 py-0.5 rounded-full inline-block mt-1">Perfil Familiar</p>
                </div>
            </div> */}

        {/* Preferences / Needs Section */}
        <div className="mb-6">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-4">
            Mis necesidades
          </h3>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
            <div className="flex space-x-2">
              {allCategories.map((cat) => {
                const isSelected = displayProfile.preferences.includes(cat);
                return (
                  <div
                    key={cat}
                    className={`w-12 h-12 rounded-full flex items-center justify-center shadow-sm transition-all duration-300 ${
                      isSelected
                        ? "bg-teal-500 shadow-lg shadow-teal-500/50"
                        : "bg-white border border-slate-200"
                    }`}
                    title={getCategoryName(cat)}
                  >
                    <img
                      src={getCategoryIcon(cat)}
                      alt={getCategoryName(cat)}
                      className={`w-7 h-7 transition-all duration-300 ${
                        isSelected ? "brightness-0 invert" : "opacity-70"
                      }`}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Location & Languages Section */}
        {/* {(displayProfile.location || displayProfile.languages.length > 0) && (
          <div className="mb-6 px-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Mis detalles
            </h3>
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-3">
              {displayProfile.location && (
                <div className="flex items-center text-slate-700">
                  <MapPinIcon className="w-4 h-4 mr-2 text-teal-500" />
                  <span className="text-sm">{displayProfile.location}</span>
                </div>
              )}
              {displayProfile.languages.length > 0 && (
                <div>
                  <p className="text-xs text-slate-500 mb-2 font-medium">
                    Idiomas
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {displayProfile.languages.map((lang) => (
                      <span
                        key={lang}
                        className="px-2.5 py-1 bg-teal-50 text-teal-700 text-xs rounded-lg border border-teal-100 font-medium"
                      >
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )} */}

        {/* CUENTA Section */}
        <div className="mt-2">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-4">
            CUENTA
          </h3>
          <ul className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <ListItem
              icon={<BriefcaseIcon className="w-6 h-6" />}
              label="Cambiar a modo Cuidador"
              onClick={onSwitchToProvider}
            />
            <ListItem
              icon={<HeartIcon className="w-6 h-6" />}
              label="Favoritos"
              onClick={onNavigateFavorites}
            />
            <ListItem
              icon={<Cog6ToothIcon className="w-6 h-6" />}
              label="Configuración"
              onClick={onNavigateSettings}
            />
          </ul>
        </div>

        {/* CUIDAMET AL HABLA Section */}
        <div className="mt-8">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-4">
            CUIDAMET AL HABLA
          </h3>
          <ul className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <ListItem
              icon={<ChatBubbleLeftRightIcon className="w-6 h-6" />}
              label="Chat de soporte"
              onClick={onNavigateSupportChat}
            />
            <ListItem
              icon={<InformationCircleIcon className="w-6 h-6" />}
              label="¿Necesitas ayuda?"
              onClick={onNavigateSupport}
            />
          </ul>
        </div>

        {/* Logout Section */}
        <div className="mt-8">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-4">
            SESIÓN
          </h3>
          <ul className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <ListItem
              icon={<ArrowRightOnRectangleIcon className="w-6 h-6" />}
              label="Cerrar Sesión"
              onClick={() =>
                setAlertModal({
                  isOpen: true,
                  message: "Cerrando sesión...",
                  title: "Cerrar sesión",
                })
              }
              highlight
            />
          </ul>
        </div>
        
      </main>

      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={() => setAlertModal({ isOpen: false, message: "" })}
        message={alertModal.message}
        title={alertModal.title}
      />
    </div>
  );
};

export default ProfilePage;
