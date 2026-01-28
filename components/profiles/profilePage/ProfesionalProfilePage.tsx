import React, { useState } from "react";
import PageHeader from "../../PageHeader";
import { CareCategory, ProviderProfile, ServiceConfig } from "../../../types";
import MapPinIcon from "../../icons/MapPinIcon";
import StarIcon from "../../icons/StarIcon";
import PencilIcon from "../../icons/PencilIcon";
import AlertModal from "../../actions/AlertModal";
import ChevronRightIcon from "../../icons/ChevronRightIcon";
import PremiumSubscriptionModal from "../../PremiumSubscriptionModal";
import UserCircleIcon from "../../icons/UserCircleIcon";
import WalletIcon from "../../icons/WalletIcon";
import ShieldCheckIcon from "../../icons/ShieldCheckIcon";
import BellIcon from "../../icons/BellIcon";
import DocumentTextIcon from "../../icons/DocumentTextIcon";
import ArrowRightOnRectangleIcon from "../../icons/ArrowRightOnRectangleIcon";
import CameraIcon from "../../icons/CameraIcon";
import PhotoUploadModal from "../../photo/PhotoUploadModal";
import Resumen_PersonalInfo from "../resumenProfile/Resumen_PersonalInfo";
import Resumen_Services from "../resumenProfile/Resumen_Services";
import LogoutSection from "./LogoutSection";
import BriefcaseIcon from "@/components/icons/BriefcaseIcon";
import SupportSection from "./SupportSection";
import ProfesionalRegistration from "../createProfile/ProfesionalRegistration";
import AccountSettingsSection from "./AccountSettingsSection";

// Definición de categorías de servicio para el componente Resumen_Services
const serviceCategories = [
  {
    id: CareCategory.ELDERLY,
    label: "Cuidado de Mayores",
    icon: "/resources/icons/elderly-female-icon.svg",
    description: "Asistencia, compañía y cuidados médicos",
    color: "text-green-600",
    bg: "bg-green-100",
    border: "border-green-200",
  },
  {
    id: CareCategory.CHILDREN,
    label: "Cuidado de Niños",
    icon: "/resources/icons/baby-girl-icon.svg",
    description: "Canguro, ayuda escolar y rutinas",
    color: "text-slate-600",
    bg: "bg-slate-200",
    border: "border-slate-300",
  },
  {
    id: CareCategory.PETS,
    label: "Mascotas",
    icon: "/resources/icons/dog-puppy-face-icon.svg",
    description: "Paseos, guardería y cuidados",
    color: "text-orange-600",
    bg: "bg-orange-100",
    border: "border-orange-200",
  },
  {
    id: CareCategory.HOUSEKEEPING,
    label: "Limpieza y Mantenimiento",
    icon: "/resources/icons/housekeeping-icon.svg",
    description: "Hogar, cristales y reparaciones",
    color: "text-blue-600",
    bg: "bg-blue-100",
    border: "border-blue-200",
  },
];

interface ProfesionalProfilePageProps {
  onBack: () => void;
  onNavigateSecurity: () => void;
  onNavigateNotifications: () => void;
  onNavigateLegal: () => void;
  onNavigateSupport: () => void;
  onLogout: () => void;
  onSwitchToClient: () => void;
  profile?: ProviderProfile | null;
  onUpdateProfile?: (profile: ProviderProfile) => void;
}

// Default fallback data
const defaultDashboardData = {
  name: "Tu Nombre",
  photoUrl:
    "https://images.unsplash.com/photo-1511367461989-f85a21fda167?q=80&w=400&auto=format&fit=crop",
  location: "Tu Ubicación",
  email: "",
  phone: "",
  languages: [] as string[],
  earningsMonth: 0,
  profileViews: 0,
  responseRate: 100,
  rating: 5.0,
  reviewsCount: 0,
  upcomingJobs: [],
  activeServices: [] as {
    id: CareCategory;
    label: string;
    status: string;
    price: number;
  }[],
};

const categoryLabels: Record<CareCategory, string> = {
  [CareCategory.ELDERLY]: "Cuidado de Mayores",
  [CareCategory.CHILDREN]: "Cuidado de Niños",
  [CareCategory.PETS]: "Cuidado de Mascotas",
  [CareCategory.HOUSEKEEPING]: "Limpieza de Hogar",
};

interface SettingsItemProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  isDestructive?: boolean;
  subLabel?: string;
}

const SettingsItem: React.FC<SettingsItemProps> = ({
  icon,
  label,
  onClick,
  isDestructive,
  subLabel,
}) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center justify-between p-4 text-left transition-colors border-b border-slate-100 last:border-0 hover:bg-slate-50 ${
      isDestructive ? "text-red-600" : "text-slate-700"
    }`}
  >
    <div className="flex items-center">
      <div
        className={`${isDestructive ? "text-red-500" : "text-slate-500"} mr-4`}
      >
        {icon}
      </div>
      <div>
        <span className="font-medium block">{label}</span>
        {subLabel && (
          <span className="text-xs text-slate-400 font-normal">{subLabel}</span>
        )}
      </div>
    </div>
    <ChevronRightIcon
      className={`w-5 h-5 ${isDestructive ? "text-red-300" : "text-slate-400"}`}
    />
  </button>
);

interface PremiumPromoButtonProps {
  isPremium: boolean;
  onClick: () => void;
}

const PremiumPromoButton: React.FC<PremiumPromoButtonProps> = ({
  isPremium,
  onClick,
}) => (
  <div className="mb-6">
    <button
      onClick={onClick}
      className={`w-full p-4 rounded-2xl flex items-center justify-between shadow-sm transition-all relative overflow-hidden group ${
        isPremium
          ? "bg-gradient-to-r from-amber-400 to-orange-500 text-white"
          : "bg-white border border-slate-200 hover:border-amber-300"
      }`}
    >
      <div className="flex items-center relative z-[5]">
        <div
          className={`p-3 rounded-full mr-4 ${
            isPremium
              ? "bg-white/20 text-white"
              : "bg-amber-50 text-amber-500"
          }`}
        >
          <StarIcon className="w-6 h-6" />
        </div>

        <div className="text-left">
          <h3
            className={`font-bold text-lg ${
              isPremium ? "text-white" : "text-slate-800"
            }`}
          >
            {isPremium ? "Cuidamet PRO Activo" : "Hazte Cuidamet PRO"}
          </h3>
          <p
            className={`text-sm ${
              isPremium ? "text-white/90" : "text-slate-500"
            }`}
          >
            {isPremium
              ? "Tu perfil está destacado."
              : "Consigue hasta 3x más contactos."}
          </p>
        </div>
      </div>

      <div
        className={`p-2 rounded-full ${
          isPremium
            ? "bg-white/20 text-white"
            : "bg-slate-50 text-slate-400 group-hover:text-amber-500 group-hover:bg-amber-50"
        } transition-colors relative z-[5]`}
      >
        <ChevronRightIcon className="w-5 h-5" />
      </div>

      {/* Decorative background for free users */}
      {!isPremium && (
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-amber-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
      )}
    </button>
  </div>
);

const ProfesionalProfilePage: React.FC<ProfesionalProfilePageProps> = ({
  onBack,
  onNavigateSecurity,
  onNavigateNotifications,
  onNavigateLegal,
  onNavigateSupport,
  onLogout,
  onSwitchToClient,
  profile,
  onUpdateProfile,
}) => {
  const [alertModal, setAlertModal] = useState<{
    isOpen: boolean;
    message: string;
    title?: string;
  }>({ isOpen: false, message: "" });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingServices, setIsEditingServices] = useState(false);

  const [isPremium, setIsPremium] = useState(false);
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);

  const handleUpdateStatus = (status: boolean) => {
    setIsPremium(status);
  };

  // Merge props profile with default data
  const displayProfile = profile
    ? {
        ...defaultDashboardData,
        name: `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || "Usuario Nuevo",
        photoUrl: profile.photoUrl || defaultDashboardData.photoUrl,
        location: profile.location || "Ubicación no definida",
        email: profile.email || "",
        phone: profile.phone || "",
        languages: profile.languages || [],
        activeServices: (
          Object.entries(profile.services) as [string, ServiceConfig][]
        )
          .filter(([_, conf]) => conf.completed)
          .map(([catId, conf]) => ({
            id: catId as CareCategory,
            label: categoryLabels[catId as CareCategory],
            status: "active",
            price: conf.rates.hourly || 0,
          })),
      }
    : defaultDashboardData;

  const handleProfileUpdate = (updatedProfile: ProviderProfile) => {
    if (onUpdateProfile) {
      onUpdateProfile(updatedProfile);
    }
    setIsEditingProfile(false);
    setIsEditingServices(false);
  };

  if (isEditingProfile) {
    return (
      <ProfesionalRegistration
        initialData={profile || undefined}
        onComplete={handleProfileUpdate}
        onCancel={() => setIsEditingProfile(false)}
      />
    );
  }

  if (isEditingServices) {
    return (
      <ProfesionalRegistration
        initialData={profile || undefined}
        initialStep={2}
        onComplete={handleProfileUpdate}
        onCancel={() => setIsEditingServices(false)}
      />
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col">
      <PageHeader
        title="Mi perfil profesional"
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

      <main className="container mx-auto px-4 py-6 pb-28 flex-grow overflow-y-auto">
        {/* BLOCK 1: Identity & General Info */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-6">

          <Resumen_PersonalInfo
            photoUrl={displayProfile.photoUrl || "https://via.placeholder.com/150"}
            name={displayProfile.name}
            phone={displayProfile.phone}
            email={displayProfile.email}
            location={displayProfile.location}
            languages={displayProfile.languages}
          />

        </div>

        {/* BLOCK 2: Metrics */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 p-2 opacity-5">
              <WalletIcon className="w-12 h-12 text-teal-600" />
            </div>
            <p className="text-xs font-medium text-slate-500 uppercase">
              Ingresos Mes
            </p>
            <p className="text-2xl font-bold text-slate-800 mt-1">
              {displayProfile.earningsMonth}€
            </p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <p className="text-xs font-medium text-slate-500 uppercase">
              Valoración
            </p>
            <div className="flex items-center mt-1">
              <span className="text-2xl font-bold text-slate-800 mr-2">
                {displayProfile.rating.toFixed(1)}
              </span>
              <div className="flex">
                <StarIcon className="w-4 h-4 text-amber-400" />
              </div>
            </div>
          </div>
        </div>

        {/* BLOCK 3: Cuidamet PRO Promo */}
        {/* Jerofa de momento el código de abajo lo comento --- hay que contratar primero pasarela de pago
          <PremiumPromoButton
            isPremium={isPremium}
            onClick={() => setIsPremiumModalOpen(true)}
          />
        */}
        
        {/* BLOCK 4: Services */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-3 px-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Mis Servicios y tarifas
            </h3>
            <button
              onClick={() => setIsEditingServices(true)}
              className="text-teal-500 font-semibold text-sm hover:text-teal-600 transition-colors"
            >
              + Añadir
            </button>
          </div>

          {profile?.services ? (
            <Resumen_Services
              completedServices={Object.keys(profile.services).filter(
                (key) => profile.services[key as CareCategory].completed
              ) as CareCategory[]}
              servicesData={profile.services}
              serviceCategories={serviceCategories}
            />
          ) : (
            <div className="text-center py-8 bg-white rounded-xl border-2 border-dashed border-slate-200">
              <p className="text-slate-500 text-sm mb-3">
                No tienes servicios activos.
              </p>
            </div>
          )}




        </section>

        {/* BLOCK 5: Account & Settings */}
        <section className="mb-6">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-4">
            Cuenta y seguridad
          </h3>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <SettingsItem
              icon={<BriefcaseIcon className="w-6 h-6" />}
              label="Cambiar a perfil familiar"
              subLabel="Modo profesional"
              onClick={onSwitchToClient}
            />
            <AccountSettingsSection
              onNavigateSecurity={onNavigateSecurity}
              onNavigateNotifications={onNavigateNotifications}
              onNavigateLegal={onNavigateLegal}
            />
          </div>
        </section>

        {/* BLOCK 6: Cuidamet al Habla */}
        <SupportSection
          onNavigateSupport={onNavigateSupport}
        />

        {/* BLOCK 7: Logout */}
        <div className="mt-8">
          <LogoutSection onLogout={onLogout} />
        </div>
      </main>

      <PremiumSubscriptionModal
        isOpen={isPremiumModalOpen}
        onClose={() => setIsPremiumModalOpen(false)}
        isPremium={isPremium}
        onUpdateStatus={handleUpdateStatus}
      />

      <PhotoUploadModal
        isOpen={isPhotoModalOpen}
        onClose={() => setIsPhotoModalOpen(false)}
        onTakePhoto={() => {
          // Fallback to alert/file picker logic as this page doesn't have the full inline camera
          alert("La cámara no está disponible aquí. Usa el editor completo.");
          setIsPhotoModalOpen(false);
        }}
        onChooseFromGallery={() => {
          // Direct to edit profile for gallery picking
          setIsPhotoModalOpen(false);
        }}
      />

      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={() => setAlertModal({ isOpen: false, message: "" })}
        message={alertModal.message}
        title={alertModal.title}
      />
    </div>
  );
};

export default ProfesionalProfilePage;
