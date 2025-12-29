import React, { useState } from "react";
import PageHeader from "../../PageHeader";
import { CareCategory, ProviderProfile, ServiceConfig } from "../../../types";
import MapPinIcon from "../../icons/MapPinIcon";
import StarIcon from "../../icons/StarIcon";
import PencilIcon from "../../icons/PencilIcon";
import AlertModal from "../../AlertModal";
import ChevronRightIcon from "../../icons/ChevronRightIcon";
import PremiumSubscriptionModal from "../../PremiumSubscriptionModal";
import UserCircleIcon from "../../icons/UserCircleIcon";
import WalletIcon from "../../icons/WalletIcon";
import ShieldCheckIcon from "../../icons/ShieldCheckIcon";
import BellIcon from "../../icons/BellIcon";
import DocumentTextIcon from "../../icons/DocumentTextIcon";
import ArrowRightOnRectangleIcon from "../../icons/ArrowRightOnRectangleIcon";
import CameraIcon from "../../icons/CameraIcon";
import PhotoUploadModal from "../../PhotoUploadModal";
import Resumen_PersonalInfo from "../resumenProfile/Resumen_PersonalInfo";

interface MyCaregiverProfilePageProps {
  onBack: () => void;
  onNavigateEditProfile: (category: CareCategory | null) => void;
  onNavigateSecurity: () => void;
  onNavigateNotifications: () => void;
  onNavigateLegal: () => void;
  onLogout: () => void;
  onSwitchToClient: () => void;
  profile?: ProviderProfile | null;
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

const MyCaregiverProfilePage: React.FC<MyCaregiverProfilePageProps> = ({
  onBack,
  onNavigateEditProfile,
  onNavigateSecurity,
  onNavigateNotifications,
  onNavigateLegal,
  onLogout,
  onSwitchToClient,
  profile,
}) => {
  const [alertModal, setAlertModal] = useState<{
    isOpen: boolean;
    message: string;
    title?: string;
  }>({ isOpen: false, message: "" });

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
        name: profile.name || "Usuario Nuevo",
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

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col">
      <PageHeader
        title="Mi perfil profesional"
        onBack={onBack}
        rightAction={
          <button
            onClick={() => 
              // onNavigateEditProfile(null)
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

          {/* Cover / Header - Unified Layout */}
          {/* <div className="bg-gradient-to-r from-teal-500 to-teal-600 pt-8 pb-6 px-6 relative flex flex-col items-center text-center">
            <button
              onClick={onSwitchToClient}
              className="absolute top-4 right-4 bg-white/20 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1.5 rounded-full hover:bg-white/30 transition-colors flex items-center border border-white/30 shadow-sm"
            >
              <UserCircleIcon className="w-3.5 h-3.5 mr-1" />
              Modo Familiar
            </button>

            <div className="relative group mb-3">
              <img
                src={displayProfile.photoUrl}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover border-4 border-white/30 shadow-lg bg-white/10"
              />
              <button
                onClick={() => setIsPhotoModalOpen(true)}
                className="absolute bottom-0 right-0 bg-slate-800 text-white p-1.5 rounded-full border border-white/30 shadow-sm hover:bg-teal-500 transition-colors"
              >
                <CameraIcon className="w-4 h-4" />
              </button>
            </div>

            <h2 className="text-2xl font-bold text-white">
              {displayProfile.name}
            </h2>
            <div className="flex items-center text-sm text-teal-50 mt-1 mb-3">
              <MapPinIcon className="w-4 h-4 mr-1 opacity-80" />{" "}
              {displayProfile.location}
            </div>

            <button
              onClick={() => onNavigateEditProfile(null)}
              className="text-xs bg-white/20 text-white px-4 py-1.5 rounded-full font-semibold hover:bg-white/30 transition-colors flex items-center"
            >
              <PencilIcon className="w-3 h-3 mr-1.5" /> Editar Perfil
            </button>
          </div> */}

          {/* Details Section */}
          {/* <div className="px-5 py-5">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Mis Detalles
              </h3>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-xs text-slate-500 mb-1.5 font-medium">
                  Idiomas
                </p>
                <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                  {displayProfile.languages.length > 0 ? (
                    displayProfile.languages.map((lang) => (
                      <span
                        key={lang}
                        className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs rounded-lg border border-slate-200 font-medium"
                      >
                        {lang}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400 italic">
                      Sin especificar
                    </span>
                  )}
                </div>
              </div>

              {displayProfile.email && (
                <div>
                  <p className="text-xs text-slate-500 mb-1.5 font-medium">
                    Email
                  </p>
                  <p className="text-sm text-slate-700">{displayProfile.email}</p>
                </div>
              )}
              
              {displayProfile.phone && (
                <div>
                  <p className="text-xs text-slate-500 mb-1.5 font-medium">
                    Teléfono
                  </p>
                  <p className="text-sm text-slate-700">{displayProfile.phone}</p>
                </div>
              )}
            </div>
          </div> */}
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
        <div className="mb-6">
          <button
            onClick={() => setIsPremiumModalOpen(true)}
            className={`w-full p-4 rounded-2xl flex items-center justify-between shadow-sm transition-all relative overflow-hidden group ${
              isPremium
                ? "bg-gradient-to-r from-amber-400 to-orange-500 text-white"
                : "bg-white border border-slate-200 hover:border-amber-300"
            }`}
          >
            <div className="flex items-center relative z-10">
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
              } transition-colors relative z-10`}
            >
              <ChevronRightIcon className="w-5 h-5" />
            </div>

            {/* Decorative background for free users */}
            {!isPremium && (
              <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-amber-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            )}
          </button>
        </div>

        {/* BLOCK 4: Services */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="font-bold text-slate-800">
              Mis Servicios y Tarifas
            </h3>
            <button
              onClick={() => onNavigateEditProfile(CareCategory.ELDERLY)}
              className="text-teal-600 text-xs font-medium flex items-center bg-teal-50 px-2 py-1 rounded-lg hover:bg-teal-100"
            >
              + Añadir
            </button>
          </div>
          <div className="space-y-3">
            {displayProfile.activeServices.map((service) => (
              <div
                key={service.id}
                className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative group hover:border-teal-300 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                        service.id === CareCategory.ELDERLY
                          ? "bg-green-100 text-green-600"
                          : service.id === CareCategory.CHILDREN
                          ? "bg-slate-100 text-slate-600"
                          : service.id === CareCategory.PETS
                          ? "bg-orange-100 text-orange-600"
                          : "bg-blue-100 text-blue-600"
                      }`}
                    >
                      <StarIcon className="w-5 h-5" />{" "}
                      {/* Placeholder for dynamic category icon if needed */}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800">
                        {service.label}
                      </h4>
                      <p className="text-sm text-teal-600 font-semibold">
                        {service.price}€{" "}
                        <span className="text-slate-400 font-normal">
                          / hora
                        </span>
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => onNavigateEditProfile(service.id)}
                    className="px-3 py-1.5 bg-slate-50 text-slate-600 text-xs font-bold rounded-lg border border-slate-200 hover:bg-teal-50 hover:text-teal-700 hover:border-teal-200 transition-all"
                  >
                    Editar
                  </button>
                </div>
              </div>
            ))}
            {displayProfile.activeServices.length === 0 && (
              <div className="text-center py-8 bg-white rounded-xl border-2 border-dashed border-slate-200">
                <p className="text-slate-500 text-sm mb-3">
                  No tienes servicios activos.
                </p>
                <button
                  onClick={() => onNavigateEditProfile(CareCategory.ELDERLY)}
                  className="text-teal-600 font-bold text-sm hover:underline"
                >
                  Configurar mis servicios
                </button>
              </div>
            )}
          </div>
        </section>

        {/* BLOCK 5: Account & Settings */}
        <section className="mb-6">
          <h3 className="font-bold text-slate-800 mb-3 px-1">
            Cuenta y Seguridad
          </h3>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <SettingsItem
              icon={<ShieldCheckIcon className="w-6 h-6" />}
              label="Seguridad y Contraseña"
              subLabel="Gestionar acceso y verificaciones"
              onClick={onNavigateSecurity}
            />
            <SettingsItem
              icon={<BellIcon className="w-6 h-6" />}
              label="Notificaciones"
              onClick={onNavigateNotifications}
            />
            <SettingsItem
              icon={<DocumentTextIcon className="w-6 h-6" />}
              label="Legal y Privacidad"
              onClick={onNavigateLegal}
            />
          </div>
        </section>

        {/* BLOCK 6: Logout */}
        <section>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <SettingsItem
              icon={<ArrowRightOnRectangleIcon className="w-6 h-6" />}
              label="Cerrar Sesión"
              onClick={onLogout}
              isDestructive
            />
          </div>
        </section>
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
          onNavigateEditProfile(null);
        }}
        onChooseFromGallery={() => {
          // Direct to edit profile for gallery picking
          setIsPhotoModalOpen(false);
          onNavigateEditProfile(null);
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

export default MyCaregiverProfilePage;
