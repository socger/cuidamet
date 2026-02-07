import React, { useState } from "react";
import HeartIcon from "../../icons/HeartIcon";
import Cog6ToothIcon from "../../icons/Cog6ToothIcon";
import ArrowRightOnRectangleIcon from "../../icons/ArrowRightOnRectangleIcon";
import AlertModal from "../../actions/AlertModal";
import ChevronRightIcon from "../../icons/ChevronRightIcon";
import ChatBubbleLeftRightIcon from "../../icons/ChatBubbleLeftRightIcon";
import InformationCircleIcon from "../../icons/InformationCircleIcon";
import MapPinIcon from "../../icons/MapPinIcon";
import { ClientProfile, CareCategory } from "../../../types";
import { getCategoryIcon, getCategoryLabel } from "../../../services/serviceConstants";
import BriefcaseIcon from "../../icons/BriefcaseIcon";
import PageHeader from "../../PageHeader";
import Resumen_PersonalInfo from "../resumenProfile/Resumen_PersonalInfo";
import SupportSection from "./SupportSection";
import FamiliarRegistration from "../createProfile/FamiliarRegistration";
import AccountSettingsSection from "./AccountSettingsSection";
import defaultUserAvatar from "../../../resources/images/default-user-avatar.jpg";

interface FamiliarProfilePageProps {
  clientProfile: ClientProfile | null;
  onNavigateFavorites: () => void;
  onNavigateSupport: () => void;
  onNavigateSecurity: () => void;
  onNavigateNotifications: () => void;
  onNavigateLegal: () => void;
  onSwitchToProvider: () => void;
  onBack: () => void;
  onLogout: () => void;
  onUpdateProfile?: (profile: ClientProfile) => void;
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

const FamiliarProfilePage: React.FC<FamiliarProfilePageProps> = ({
  clientProfile,
  onNavigateFavorites,
  onNavigateSupport,
  onNavigateSecurity,
  onNavigateNotifications,
  onNavigateLegal,
  onSwitchToProvider,
  onBack,
  onLogout,
  onUpdateProfile,
}) => {
  const [alertModal, setAlertModal] = useState<{
    isOpen: boolean;
    message: string;
    title?: string;
  }>({ isOpen: false, message: "" });
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Default guest data if no client profile exists
  const displayProfile = clientProfile || {
    firstName: "Usuario",
    lastName: "Invitado",
    photoUrl: defaultUserAvatar,
    email: "",
    phone: "",
    location: "",
    languages: [],
    preferences: [],
  };

  const allCategories = [
    CareCategory.ELDERLY,
    CareCategory.CHILDREN,
    CareCategory.PETS,
    CareCategory.HOUSEKEEPING,
  ];

  const handleProfileUpdate = (updatedProfile: ClientProfile) => {
    if (onUpdateProfile) {
      onUpdateProfile(updatedProfile);
    }
    setIsEditingProfile(false);
  };

  if (isEditingProfile) {
    return (
      <FamiliarRegistration
        initialData={clientProfile || undefined}
        onComplete={handleProfileUpdate}
        onBack={() => setIsEditingProfile(false)}
      />
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col">
      <PageHeader 
        title="Mi perfil familiar" 
        onBack={onBack} 
        rightAction={
          <button
            onClick={() => setIsEditingProfile(true)}
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
              displayProfile.photoUrl || defaultUserAvatar
            }
            name={`${displayProfile.firstName || ''} ${displayProfile.lastName || ''}`.trim() || "Usuario Invitado"}
            phone={displayProfile.phone}
            email={displayProfile.email}
            location={displayProfile.location}
            languages={displayProfile.languages}
            onLogout={onLogout}
          />
        </div>

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
                    title={getCategoryLabel(cat)}
                  >
                    <img
                      src={getCategoryIcon(cat)}
                      alt={getCategoryLabel(cat)}
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

        {/* CUENTA Section */}
        <div className="mt-2">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-4">
            Cuenta y seguridad
          </h3>
          <ul className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <ListItem
              icon={<BriefcaseIcon className="w-6 h-6" />}
              label="Cambiar a perfil profesional"
              onClick={onSwitchToProvider}
            />
            <AccountSettingsSection
              onNavigateSecurity={onNavigateSecurity}
              onNavigateNotifications={onNavigateNotifications}
              onNavigateLegal={onNavigateLegal}
            />
            <ListItem
              icon={<HeartIcon className="w-6 h-6" />}
              label="Favoritos"
              onClick={onNavigateFavorites}
            />
          </ul>
        </div>

        {/* CUIDAMET AL HABLA Section */}
        <SupportSection
          onNavigateSupport={onNavigateSupport}
        />

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

export default FamiliarProfilePage;
