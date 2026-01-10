import React, { useState } from "react";
import ChevronRightIcon from "../../icons/ChevronRightIcon";
import ChevronLeftIcon from "../../icons/ChevronLeftIcon";
import CheckCircleIcon from "../../icons/CheckCircleIcon";
import XMarkIcon from "../../icons/XMarkIcon";
import PhoneIcon from "../../icons/PhoneIcon";
import MapPinIcon from "../../icons/MapPinIcon";
import GpsFixedIcon from "../../icons/GpsFixedIcon";
import PhotoCapture from "../../photo/PhotoCapture";
import PersonalInfo from "./PersonalInfo";
import AlertModal from "../../actions/AlertModal";
import Resumen_Revisa from "../resumenProfile/Resumen_Revisa";
import Resumen_PersonalInfo from "../resumenProfile/Resumen_PersonalInfo";
import { CareCategory, ClientProfile } from "../../../types";

interface FamiliarRegistrationProps {
  onComplete: (profileData: ClientProfile) => void;
  onBack: () => void;
  initialData?: ClientProfile;
}

const serviceCategories = [
  {
    id: CareCategory.ELDERLY,
    label: "Mayores",
    icon: "/resources/icons/elderly-female-icon.svg",
    color: "text-green-600",
    bg: "bg-green-100",
    border: "border-green-200",
  },
  {
    id: CareCategory.CHILDREN,
    label: "Niños",
    icon: "/resources/icons/baby-girl-icon.svg",
    color: "text-slate-600",
    bg: "bg-slate-200",
    border: "border-slate-300",
  },
  {
    id: CareCategory.PETS,
    label: "Mascotas",
    icon: "/resources/icons/dog-puppy-face-icon.svg",
    color: "text-orange-600",
    bg: "bg-orange-100",
    border: "border-orange-200",
  },
  {
    id: CareCategory.HOUSEKEEPING,
    label: "Limpieza",
    icon: "/resources/icons/housekeeping-icon.svg",
    color: "text-blue-600",
    bg: "bg-blue-100",
    border: "border-blue-200",
  },
];

const languagesList = [
  "Español",
  "Inglés",
  "Francés",
  "Alemán",
  "Italiano",
  "Portugués",
  "Chino",
  "Árabe",
];

const FamiliarRegistration: React.FC<FamiliarRegistrationProps> = ({
  onComplete,
  onBack,
  initialData,
}) => {
  const [step, setStep] = useState(1);
  const [profileData, setProfileData] = useState({
    name: initialData?.name || "",
    email: initialData?.email || "",
    phone: initialData?.phone || "",
    location: initialData?.location || "",
    languages: initialData?.languages || ([] as string[]),
    photoUrl: initialData?.photoUrl || "",
    coordinates: undefined as
      | { latitude: number; longitude: number }
      | undefined,
  });
  const [selectedCategories, setSelectedCategories] = useState<CareCategory[]>(
    initialData?.preferences || []
  );
  const [isLocating, setIsLocating] = useState(false);
  const [alertModal, setAlertModal] = useState<{
    isOpen: boolean;
    message: string;
    title?: string;
  }>({ isOpen: false, message: "" });

  const handleProfileChange = (field: string, value: any) => {
    setProfileData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleCategory = (id: CareCategory) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const toggleLanguage = (lang: string) => {
    setProfileData((prev) => ({
      ...prev,
      languages: prev.languages.includes(lang)
        ? prev.languages.filter((l) => l !== lang)
        : [...prev.languages, lang],
    }));
  };

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isValidPhone = (phone: string): boolean => {
    // Valida teléfonos españoles: 9 dígitos, puede empezar con +34 o 0034, permite espacios y guiones
    const phoneRegex =
      /^(\+34|0034)?\s?[6-9]\d{1}\s?\d{3}\s?\d{3}$|^(\+34|0034)?\s?[6-9]\d{8}$/;
    return phoneRegex.test(phone.trim());
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setAlertModal({
        isOpen: true,
        message: "La geolocalización no está soportada en este navegador.",
        title: "Error",
      });
      return;
    }

    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        handleProfileChange("coordinates", { latitude, longitude });

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
            {
              headers: {
                "Accept-Language": "es-ES,es;q=0.9",
              },
            }
          );

          if (!response.ok) {
            throw new Error("Network response was not ok");
          }

          const data = await response.json();

          if (data.error) {
            throw new Error(data.error);
          }

          const address = data.address || {};
          const locationParts = [
            address.road || address.pedestrian,
            address.neighbourhood || address.suburb,
            address.city || address.town || address.village,
          ].filter(Boolean);

          const locationStr =
            locationParts.length > 0
              ? locationParts.join(", ")
              : `Lat: ${latitude.toFixed(4)}, Lon: ${longitude.toFixed(4)}`;

          handleProfileChange("location", locationStr);
        } catch (error) {
          console.warn("Error fetching address:", error);
          handleProfileChange(
            "location",
            `Lat: ${latitude.toFixed(4)}, Lon: ${longitude.toFixed(4)}`
          );
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        console.error("Error getting location:", error.message);
        setAlertModal({
          isOpen: true,
          message:
            "No pudimos obtener tu ubicación. Asegúrate de dar permisos al navegador.",
          title: "Error de ubicación",
        });
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  };

  const isStepValid = (): boolean => {
    if (step === 1) {
      return (
        profileData.name.trim() !== "" &&
        profileData.email.trim() !== "" &&
        isValidEmail(profileData.email) &&
        profileData.phone.trim() !== "" &&
        isValidPhone(profileData.phone) &&
        profileData.location.trim() !== ""
      );
    }
    return true;
  };

  const handleNext = () => {
    if (step === 1) {
      const errors: string[] = [];
      
      if (profileData.name.trim() === "") {
        errors.push("Nombre");
      }
      if (profileData.email.trim() === "") {
        errors.push("Email");
      } else if (!isValidEmail(profileData.email)) {
        errors.push("Email (formato inválido)");
      }
      if (profileData.phone.trim() === "") {
        errors.push("Teléfono");
      } else if (!isValidPhone(profileData.phone)) {
        errors.push("Teléfono (formato inválido)");
      }
      if (profileData.location.trim() === "") {
        errors.push("Ubicación");
      }
      
      if (errors.length > 0) {
        setAlertModal({
          isOpen: true,
          message: `Por favor completa: ${errors.join(", ")}`,
          title: "Campos requeridos",
        });
        return;
      }
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    } else if (step === 3) {
      const profile: ClientProfile = {
        name: profileData.name,
        email: profileData.email,
        phone: profileData.phone,
        location: profileData.location,
        languages: profileData.languages,
        photoUrl:
          profileData.photoUrl ||
          "https://images.unsplash.com/photo-1511367461989-f85a21fda167?q=80&w=200",
        preferences: selectedCategories,
      };
      onComplete(profile);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-50 z-50 flex flex-col animate-fade-in">
      {/* Stepper Header */}
      <div className="bg-white border-b border-slate-200 p-2 sm:p-4 pt-safe-top">
        <div className="flex items-center justify-between mb-2 sm:mb-4">
          <div className="flex items-center gap-1.5 sm:gap-3">
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="p-1 sm:p-1.5 -ml-1 sm:-ml-1.5 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                aria-label="Atrás"
              >
                <ChevronLeftIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            )}

            <span className="text-xs sm:text-sm font-medium text-teal-600">{step} de 3</span>

            <h1 className="text-sm sm:text-lg font-bold text-slate-800">
              {step === 1
                ? initialData ? "Editar perfil" : "Perfil familiar"
                : step === 2
                ? "Preferencias"
                : "Resumen"}
            </h1>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-3">

            <button
              onClick={handleNext}
              className="px-2 sm:px-4 py-1 sm:py-1.5 bg-teal-500 text-white text-xs sm:text-sm font-bold rounded-lg hover:bg-teal-600 transition-colors shadow-sm flex items-center"
            >
              {step === 1
                ? "Siguiente"
                : step === 2
                ? "Siguiente"
                : initialData ? <><span className="hidden sm:inline">Guardar cambios</span><span className="sm:hidden">OK</span></> : <><span className="hidden sm:inline">Finalizar</span><span className="sm:hidden">OK</span></>}
              {step < 3 && <ChevronRightIcon className="w-3 h-3 sm:w-4 sm:h-4 ml-0.5 sm:ml-1" />}
            </button>

            <button
              onClick={onBack}
              className="p-1 sm:p-1.5 -mr-1 sm:-mr-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              aria-label="Cancelar"
              title="Cancelar registro"
            >
              <XMarkIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-teal-500 transition-all duration-300 ease-out rounded-full"
            style={{ width: `${(step / 3) * 100}%` }}
          ></div>
        </div>
      </div>

      <main className="flex-grow overflow-y-auto px-6 py-6 pb-6">
        <div className="container mx-auto max-w-md pb-24">
          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              {/* Camera / Photo Section */}
              <PhotoCapture
                photoUrl={profileData.photoUrl}
                onPhotoChange={(url) => handleProfileChange("photoUrl", url)}
                title="Añade tu foto de perfil"
                subtitle="Una buena foto genera confianza. Asegúrate de que se vea bien tu rostro."
                size="medium"
              />

              {/* Form Fields */}
              <div className="pt-2">
                <PersonalInfo
                  name={profileData.name}
                  email={profileData.email}
                  phone={profileData.phone}
                  location={profileData.location}
                  languages={profileData.languages}
                  languagesList={languagesList}
                  isLocating={isLocating}
                  onNameChange={(value) => handleProfileChange("name", value)}
                  onEmailChange={(value) => handleProfileChange("email", value)}
                  onPhoneChange={(value) => handleProfileChange("phone", value)}
                  onLocationChange={(value) =>
                    handleProfileChange("location", value)
                  }
                  onLanguageToggle={toggleLanguage}
                  onDetectLocation={handleDetectLocation}
                />
                {profileData.email && !isValidEmail(profileData.email) && (
                  <p className="text-red-500 text-sm mt-1">
                    Por favor, introduce un email válido
                  </p>
                )}
                {profileData.phone && !isValidPhone(profileData.phone) && (
                  <p className="text-red-500 text-sm mt-1">
                    Por favor, introduce un teléfono válido (9 dígitos)
                  </p>
                )}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800">
                  ¿Qué estás buscando?
                </h2>
                <p className="text-slate-600 mt-2">
                  Selecciona los servicios que te interesan (puedes cambiarlo
                  luego).
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {serviceCategories.map((cat) => {
                  const isSelected = selectedCategories.includes(cat.id);
                  return (
                    <button
                      key={cat.id}
                      onClick={() => toggleCategory(cat.id)}
                      className={`relative p-4 rounded-2xl border-2 transition-all duration-200 flex flex-col items-center justify-center text-center h-36 ${
                        isSelected
                          ? `${cat.bg} ${cat.border} ring-1 ring-offset-1 ring-teal-500`
                          : "bg-white border-slate-100 hover:border-slate-200 hover:shadow-sm"
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-2 right-2 text-teal-600">
                          <CheckCircleIcon className="w-6 h-6" />
                        </div>
                      )}
                      <div
                        className={`p-3 rounded-full mb-3 ${
                          isSelected ? "bg-white/50" : "bg-slate-50"
                        } ${cat.color}`}
                      >
                        <img
                          src={cat.icon}
                          alt={cat.label}
                          className="w-8 h-8 opacity-70"
                        />
                      </div>
                      <span
                        className={`font-bold ${
                          isSelected ? "text-slate-800" : "text-slate-600"
                        }`}
                      >
                        {cat.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-fade-in">
              <Resumen_Revisa
                title="Revisa tu perfil"
                subtitle="Verifica que todo esté correcto antes de continuar."
              />

              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <Resumen_PersonalInfo
                  photoUrl={
                    profileData.photoUrl ||
                    "https://images.unsplash.com/photo-1511367461989-f85a21fda167?q=80&w=200"
                  }
                  name={profileData.name}
                  phone={profileData.phone}
                  email={profileData.email}
                  location={profileData.location}
                  languages={profileData.languages}
                />

                {selectedCategories.length > 0 && (
                  <div className="px-4 pb-4 border-t border-slate-100 pt-4">
                    <h4 className="text-sm font-bold text-slate-700 mb-3">
                      Servicios de interés
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedCategories.map((catId) => {
                        const cat = serviceCategories.find(
                          (c) => c.id === catId
                        );
                        if (!cat) return null;
                        return (
                          <div
                            key={catId}
                            className={`${cat.bg} ${cat.border} border-2 rounded-lg p-3 flex items-center gap-2`}
                          >
                            <img
                              src={cat.icon}
                              alt={cat.label}
                              className="w-6 h-6 opacity-70"
                            />
                            <span className="font-medium text-sm text-slate-700">
                              {cat.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
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

export default FamiliarRegistration;
