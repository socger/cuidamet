import React, { useState, useRef, useEffect } from "react";
import {
  CareCategory,
  ServiceConfig,
  ProviderProfile,
  ServiceRates,
  PetAttributes,
  HousekeepingAttributes,
  ServiceVariation,
  Certificate,
} from "../../../types";
import {
  serviceCategories,
  languagesList,
  MEDICAL_SKILLS,
  PET_TYPES,
  STANDARD_AVAILABILITY,
  CUSTOM_SERVICE_SUGGESTIONS,
  UNIT_OPTIONS,
  DEFAULT_SERVICE_VARIANTS,
  initialServiceConfig,
} from "../../../services/serviceConstants";
import { uploadCertificate } from "../../../utils/certificateUploadHelper";
import BottomNav from "../../BottomNav";
import PhotoCapture from "../../photo/PhotoCapture";
import AlertModal from "../../actions/AlertModal";
import PersonalInfo from "./PersonalInfo";
import Resumen_Revisa from "../resumenProfile/Resumen_Revisa";
import Resumen_PersonalInfo from "../resumenProfile/Resumen_PersonalInfo";
import Resumen_Services from "../resumenProfile/Resumen_Services";
import MapPinIcon from "../../icons/MapPinIcon";
import CurrencyEuroIcon from "../../icons/CurrencyEuroIcon";
import CheckCircleIcon from "../../icons/CheckCircleIcon";
import ChevronLeftIcon from "../../icons/ChevronLeftIcon";
import ChevronRightIcon from "../../icons/ChevronRightIcon";
import ClockIcon from "../../icons/ClockIcon";
import HealthIcon from "../../icons/HealthIcon";
import GpsFixedIcon from "../../icons/GpsFixedIcon";
import CalendarDaysIcon from "../../icons/CalendarDaysIcon";
import XMarkIcon from "../../icons/XMarkIcon";
import TrashIcon from "../../icons/TrashIcon";
import PlusCircleIcon from "../../icons/PlusCircleIcon";
import DocumentTextIcon from "../../icons/DocumentTextIcon";
import PaperClipIcon from "../../icons/PaperClipIcon";

interface ProfesionalRegistrationProps {
  onComplete: (profileData: ProviderProfile, deletedCertificateIds: number[]) => void;
  onCancel?: () => void;
  initialData?: Partial<ProviderProfile>;
  initialStep?: number;
  currentView?: string;
  onNavigateHome?: () => void;
  onNavigateFavorites?: () => void;
  onNavigateOffer?: () => void;
  onNavigateInbox?: () => void;
  onNavigateProfile?: () => void;
  onNavigateBookings?: () => void;
  unreadCount?: number;
  isAuthenticated?: boolean;
}

const ProfesionalRegistration: React.FC<ProfesionalRegistrationProps> = ({
  onComplete,
  onCancel,
  initialData,
  initialStep = 1,
  currentView = "offer",
  onNavigateHome = () => {},
  onNavigateFavorites = () => {},
  onNavigateOffer = () => {},
  onNavigateInbox = () => {},
  onNavigateProfile = () => {},
  onNavigateBookings = () => {},
  unreadCount = 0,
  isAuthenticated = true,
}) => {
  console.log('🎨 ProfesionalRegistration renderizado con initialData:', initialData);
  console.log('🎨 photoUrl en initialData:', initialData?.photoUrl);
  
  const [step, setStep] = useState(initialStep); // 1: Profile, 2: Services Dashboard, 3: Summary
  const [editingCategory, setEditingCategory] = useState<CareCategory | null>(
    null
  );

  // Custom Service Builder State
  const [customServiceInput, setCustomServiceInput] = useState({
    name: "",
    price: "",
    unit: "servicio",
  });

  // General Profile Data
  const [profileData, setProfileData] = useState({
    firstName: initialData?.firstName || "",
    lastName: initialData?.lastName || "",
    email: initialData?.email || "",
    phone: initialData?.phone || "",
    location: initialData?.location || "",
    languages: initialData?.languages || ([] as string[]),
    photoUrl: initialData?.photoUrl || "",
    coordinates: initialData?.coordinates || undefined as
      | { latitude: number; longitude: number }
      | undefined,
  });

  console.log('🎨 profileData inicial:', profileData);
  console.log('🎨 photoUrl en profileData:', profileData.photoUrl);

  // Specific Data per Service - Initialize all categories with default variations
  const [servicesData, setServicesData] = useState<
    Record<CareCategory, ServiceConfig>
  >(() => {
    const initial = {} as Record<CareCategory, ServiceConfig>;
    Object.values(CareCategory).forEach((cat) => {
      // Use initialData services if available, otherwise use defaults
      if (initialData?.services && initialData.services[cat]) {
        initial[cat] = {
          ...initialServiceConfig,
          ...initialData.services[cat],
          variations: initialData.services[cat].variations && initialData.services[cat].variations.length > 0
            ? JSON.parse(JSON.stringify(initialData.services[cat].variations))
            : JSON.parse(JSON.stringify(DEFAULT_SERVICE_VARIANTS[cat])),
        };
      } else {
        initial[cat] = {
          ...initialServiceConfig,
          variations: JSON.parse(JSON.stringify(DEFAULT_SERVICE_VARIANTS[cat])), // Deep copy to avoid reference issues
        };
      }
    });
    return initial;
  });

  const certInputRef = useRef<HTMLInputElement>(null);

  // Track de certificados eliminados (IDs de base de datos)
  const [deletedCertificateIds, setDeletedCertificateIds] = useState<number[]>([]);

  // Geolocation Logic
  const [isLocating, setIsLocating] = useState(false);

  // Modal States
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [tempTime, setTempTime] = useState({ start: "", end: "" });
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [tempSelectedDates, setTempSelectedDates] = useState<string[]>([]);
  const [alertModal, setAlertModal] = useState<{
    isOpen: boolean;
    message: string;
    title?: string;
  }>({ isOpen: false, message: "" });

  const handleProfileChange = (field: string, value: any) => {
    setProfileData((prev) => ({ ...prev, [field]: value }));
  };

  const handleLanguageToggle = (lang: string) => {
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

  // ---- Service Data Handlers ----

  const handleServiceDataChange = (
    category: CareCategory,
    field: keyof ServiceConfig,
    value: any
  ) => {
    setServicesData((prev) => ({
      ...prev,
      [category]: { ...prev[category], [field]: value },
    }));
  };

  const handleVariationToggle = (category: CareCategory, index: number) => {
    const currentVariations = [...servicesData[category].variations];
    currentVariations[index].enabled = !currentVariations[index].enabled;
    handleServiceDataChange(category, "variations", currentVariations);
  };

  const handleVariationPriceChange = (
    category: CareCategory,
    index: number,
    price: number
  ) => {
    const currentVariations = [...servicesData[category].variations];
    currentVariations[index].price = price;
    handleServiceDataChange(category, "variations", currentVariations);
  };

  const handleAddCustomService = (category: CareCategory) => {
    if (!customServiceInput.name.trim() || !customServiceInput.price) return;

    const newVariation: ServiceVariation = {
      name: customServiceInput.name,
      price: parseFloat(customServiceInput.price),
      unit: customServiceInput.unit,
      enabled: true,
      description: "Servicio personalizado",
      isCustom: true,
    };

    const currentVariations = [
      ...servicesData[category].variations,
      newVariation,
    ];
    handleServiceDataChange(category, "variations", currentVariations);
    setCustomServiceInput({ name: "", price: "", unit: "servicio" });
  };

  const handleDeleteCustomService = (category: CareCategory, index: number) => {
    const currentVariations = [...servicesData[category].variations];
    currentVariations.splice(index, 1);
    handleServiceDataChange(category, "variations", currentVariations);
  };

  const handleAddAvailabilityTag = (category: CareCategory, tag: string) => {
    const current = servicesData[category].availability || [];
    if (!current.includes(tag)) {
      handleServiceDataChange(category, "availability", [...current, tag]);
    }
  };

  const handleRemoveAvailabilityTag = (category: CareCategory, tag: string) => {
    const current = servicesData[category].availability || [];
    handleServiceDataChange(
      category,
      "availability",
      current.filter((t) => t !== tag)
    );
  };

  const handleToggleAvailability = (category: CareCategory, tag: string) => {
    const current = servicesData[category].availability || [];
    const newAvailability = current.includes(tag)
      ? current.filter((t) => t !== tag)
      : [...current, tag];
    handleServiceDataChange(category, "availability", newAvailability);
  };

  const handleMedicalSkillToggle = (category: CareCategory, skill: string) => {
    const currentSkills = servicesData[category].medicalSkills || [];
    const newSkills = currentSkills.includes(skill)
      ? currentSkills.filter((s) => s !== skill)
      : [...currentSkills, skill];
    handleServiceDataChange(category, "medicalSkills", newSkills);
  };

  // ---- Certificate Handlers ----
  const handleCertificateUpload = async (
    category: CareCategory,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      await uploadCertificate({
        file,
        servicesData,
        category,
        onError: (message, title = "Error") => {
          setAlertModal({
            isOpen: true,
            title,
            message
          });
        },
        onSuccess: (newCert, category) => {
          const currentCerts = servicesData[category].certificates || [];
          handleServiceDataChange(category, "certificates", [
            ...currentCerts,
            newCert,
          ]);
        }
      });
    }
  };

  const handleRemoveCertificate = (category: CareCategory, certId: string) => {
    const currentCerts = servicesData[category].certificates || [];
    
    // Detectar si es un certificado de BD (ID numérico < 1000000)
    const certIdNum = Number(certId);
    const isDbId = !isNaN(certIdNum) && certIdNum < 1000000;
    
    // Si es de BD, añadir a la lista de eliminados
    if (isDbId) {
      console.log(`🗑️ Marcando certificado ${certId} para eliminar de BD`);
      setDeletedCertificateIds(prev => [...prev, certIdNum]);
    }
    
    // Eliminar del estado local
    handleServiceDataChange(
      category,
      "certificates",
      currentCerts.filter((c) => c.id !== certId)
    );
  };

  // ---- Modal Logic Handlers ----

  const openTimeModal = () => {
    setTempTime({ start: "", end: "" });
    setShowTimeModal(true);
  };

  const saveTime = () => {
    if (editingCategory && tempTime.start && tempTime.end) {
      const timeString = `${tempTime.start} - ${tempTime.end}`;
      handleAddAvailabilityTag(editingCategory, timeString);
      handleServiceDataChange(editingCategory, "schedule", tempTime);
      setShowTimeModal(false);
    }
  };

  const openCalendarModal = () => {
    if (editingCategory) {
      setTempSelectedDates(servicesData[editingCategory].specificDates || []);
      setCalendarMonth(new Date());
      setShowCalendarModal(true);
    }
  };

  const toggleDateSelection = (dateStr: string) => {
    setTempSelectedDates((prev) =>
      prev.includes(dateStr)
        ? prev.filter((d) => d !== dateStr)
        : [...prev, dateStr]
    );
  };

  const saveCalendar = () => {
    if (editingCategory) {
      const oldSpecificDates =
        servicesData[editingCategory].specificDates || [];
      const oldFormattedDates = oldSpecificDates.map((d) =>
        new Date(d).toLocaleDateString("es-ES", {
          day: "numeric",
          month: "short",
        })
      );

      handleServiceDataChange(
        editingCategory,
        "specificDates",
        tempSelectedDates
      );

      const newFormattedDates = tempSelectedDates.map((d) => {
        const date = new Date(d);
        return date.toLocaleDateString("es-ES", {
          day: "numeric",
          month: "short",
        });
      });

      const currentTags = servicesData[editingCategory].availability || [];
      // Remove old dates that might have been deselected
      const tagsWithoutOldDates = currentTags.filter(
        (tag) => !oldFormattedDates.includes(tag)
      );
      // Add new dates
      const newTags = [
        ...new Set([...tagsWithoutOldDates, ...newFormattedDates]),
      ];

      handleServiceDataChange(editingCategory, "availability", newTags);
      setShowCalendarModal(false);
    }
  };

  // ---- Geolocation Logic ----
  const handleDetectLocation = async () => {
    if (!navigator.geolocation) {
      setAlertModal({
        isOpen: true,
        message: "La geolocalización no está soportada en este navegador.",
        title: "Error",
      });
      return;
    }

    setIsLocating(true);

    try {
      const { getCurrentLocation } = await import('../../../services/geocodingService');
      const result = await getCurrentLocation();
      
      // Guardar coordenadas para el mapa del perfil
      handleProfileChange("coordinates", result.coordinates);
      // Guardar dirección (puede ser coordenadas si falló la geocodificación)
      handleProfileChange("location", result.address);
      
      // Si hubo un error en la geocodificación pero tenemos coordenadas, mostrar aviso
      if (result.error) {
        console.warn('Geocodificación falló, usando coordenadas:', result.error);
      }
    } catch (error: any) {
      console.error("Error getting location:", error.message);
      setAlertModal({
        isOpen: true,
        message:
          "No pudimos obtener tu ubicación. Asegúrate de dar permisos al navegador.",
        title: "Error de ubicación",
      });
    } finally {
      setIsLocating(false);
    }
  };

  // ---- Navigation & Submit ----

  const handleSaveCategory = () => {
    if (editingCategory) {
      handleServiceDataChange(editingCategory, "completed", true);

      // Update hourly rate based on the first enabled variation for legacy support/filtering
      const activeVariations = servicesData[editingCategory].variations.filter(
        (v) => v.enabled
      );
      if (activeVariations.length > 0) {
        const minPrice = Math.min(...activeVariations.map((v) => v.price));
        handleServiceDataChange(editingCategory, "rates", {
          ...servicesData[editingCategory].rates,
          hourly: minPrice,
        });
      }

      setEditingCategory(null);
      // Reset custom input
      setCustomServiceInput({ name: "", price: "", unit: "servicio" });
    }
  };

  const nextStep = () => {
    if (step === 1) {
      const errors: string[] = [];
      
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
      const hasCompleted = Object.values(servicesData).some(
        (s: unknown) => (s as ServiceConfig).completed
      );
      if (!hasCompleted) {
        setAlertModal({
          isOpen: true,
          message: "Completa al menos un servicio para continuar.",
          title: "Servicios requeridos",
        });
        return;
      }
      setStep(3);
    } else {
      confirmPublish();
    }
  };

  const prevStep = () => {
    if (editingCategory) {
      setEditingCategory(null); // Close editor
    } else {
      setStep((prev) => prev - 1);
    }
  };

  const confirmPublish = () => {
    console.log('🟢 [PROFESIONAL_REGISTRATION] confirmPublish iniciado');
    console.log('🟢 [PROFESIONAL_REGISTRATION] servicesData:', servicesData);
    
    // Verificar certificados en servicesData
    Object.entries(servicesData).forEach(([key, service]) => {
      if (service.certificates && service.certificates.length > 0) {
        console.log(`🟢 [PROFESIONAL_REGISTRATION] Servicio "${key}" tiene ${service.certificates.length} certificados:`, service.certificates);
      } else {
        console.log(`🟢 [PROFESIONAL_REGISTRATION] Servicio "${key}" NO tiene certificados`);
      }
    });
    
    const allAvailabilities = new Set<string>();
    Object.values(servicesData).forEach((s: any) =>
      s.availability?.forEach((a: string) => allAvailabilities.add(a))
    );

    const fullName = [profileData.firstName, profileData.lastName]
      .filter(Boolean)
      .join(' ')
      .trim() || 'Usuario';

    const finalProfile: ProviderProfile = {
      ...profileData,
      id: initialData?.id, // Preservar el ID si existe (para actualizaciones)
      name: fullName,
      availability: Array.from(allAvailabilities),
      services: servicesData,
    };
    
    console.log('🟢 [PROFESIONAL_REGISTRATION] finalProfile creado:', JSON.stringify(finalProfile, null, 2));
    console.log('🟢 [PROFESIONAL_REGISTRATION] deletedCertificateIds:', deletedCertificateIds);
    console.log('🟢 [PROFESIONAL_REGISTRATION] Llamando a onComplete...');
    onComplete(finalProfile, deletedCertificateIds);
    // NOTA: NO resetear aquí - se hará en App.tsx después de guardar exitosamente
  };

  // ---- Helper Renders for Modals ----

  const renderTimeModal = () => (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl">
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
          <ClockIcon className="w-5 h-5 mr-2 text-teal-500" /> Especificar Horas
        </h3>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">
              Desde
            </label>
            <input
              type="time"
              value={tempTime.start}
              onChange={(e) =>
                setTempTime({ ...tempTime, start: e.target.value })
              }
              className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">
              Hasta
            </label>
            <input
              type="time"
              value={tempTime.end}
              onChange={(e) =>
                setTempTime({ ...tempTime, end: e.target.value })
              }
              className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <button
            onClick={() => setShowTimeModal(false)}
            className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-50 rounded-lg"
          >
            Cancelar
          </button>
          <button
            onClick={saveTime}
            className="px-4 py-2 bg-teal-500 text-white font-medium rounded-lg hover:bg-teal-600"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );

  const renderCalendarModal = () => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay(); // 0 = Sun
    const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1; // Mon = 0

    const days = [];
    for (let i = 0; i < adjustedFirstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);

    const changeMonth = (offset: number) => {
      setCalendarMonth(new Date(year, month + offset, 1));
    };

    return (
      <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 animate-fade-in">
        <div className="bg-white rounded-2xl w-full max-w-sm p-4 shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={() => changeMonth(-1)}
              className="p-1 hover:bg-slate-100 rounded-full"
            >
              <ChevronLeftIcon className="w-5 h-5 text-slate-500" />
            </button>
            <span className="font-bold text-slate-800 capitalize">
              {calendarMonth.toLocaleDateString("es-ES", {
                month: "long",
                year: "numeric",
              })}
            </span>
            <button
              onClick={() => changeMonth(1)}
              className="p-1 hover:bg-slate-100 rounded-full"
            >
              <ChevronRightIcon className="w-5 h-5 text-slate-500" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {["L", "M", "X", "J", "V", "S", "D"].map((d) => (
              <span key={d} className="text-xs font-bold text-slate-400">
                {d}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1 mb-6">
            {days.map((day, idx) => {
              if (!day) return <div key={idx}></div>;
              const dateStr = new Date(year, month, day)
                .toISOString()
                .split("T")[0];
              const isSelected = tempSelectedDates.includes(dateStr);
              return (
                <button
                  key={idx}
                  onClick={() => toggleDateSelection(dateStr)}
                  className={`h-9 w-9 rounded-full text-sm flex items-center justify-center transition-colors ${
                    isSelected
                      ? "bg-teal-500 text-white font-bold"
                      : "hover:bg-slate-100 text-slate-700"
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowCalendarModal(false)}
              className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-50 rounded-lg"
            >
              Cancelar
            </button>
            <button
              onClick={saveCalendar}
              className="px-4 py-2 bg-teal-500 text-white font-medium rounded-lg hover:bg-teal-600"
            >
              Guardar Selección
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ---- Renders ----

  // Step 1: Personal Profile
  const renderProfileForm = () => (
    <div className="space-y-6 animate-fade-in">
      {/* <div className="text-center">
              <h2 className="text-xl font-bold text-slate-800">Sobre ti</h2>
              <p className="text-slate-500 text-sm">Crea un perfil de confianza.</p>
          </div> */}

      {/* Photo Upload */}
      <PhotoCapture
        photoUrl={profileData.photoUrl}
        onPhotoChange={(url) => handleProfileChange("photoUrl", url)}
        title="Añade tu foto de perfil"
        subtitle="Una foto profesional genera más confianza en los clientes."
        size="medium"
      />

      {/* Fields */}
      <PersonalInfo
        firstName={profileData.firstName}
        lastName={profileData.lastName}
        email={profileData.email}
        phone={profileData.phone}
        location={profileData.location}
        languages={profileData.languages}
        languagesList={languagesList}
        isLocating={isLocating}
        onFirstNameChange={(value) => handleProfileChange("firstName", value)}
        onLastNameChange={(value) => handleProfileChange("lastName", value)}
        onEmailChange={(value) => handleProfileChange("email", value)}
        onPhoneChange={(value) => handleProfileChange("phone", value)}
        onLocationChange={(value) => handleProfileChange("location", value)}
        onLanguageToggle={handleLanguageToggle}
        onDetectLocation={handleDetectLocation}
      />
    </div>
  );

  // Step 2: Services Dashboard
  const renderServicesDashboard = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center">
        <h2 className="text-xl font-bold text-slate-800">
          ¿Qué servicios quieres ofrecer?
        </h2>
        <p className="text-slate-500 text-sm mt-1">
          Configura uno o varios servicios.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4">
        {serviceCategories.map((cat) => {
          const isCompleted = servicesData[cat.id].completed;
          return (
            <button
              key={cat.id}
              onClick={() => setEditingCategory(cat.id)}
              className={`p-4 rounded-xl border-2 flex items-center text-left transition-all relative ${
                isCompleted
                  ? "bg-white border-teal-500 shadow-sm"
                  : "bg-white border-slate-100 hover:border-slate-300"
              }`}
            >
              <div
                className={`p-3 rounded-full mr-4 ${
                  isCompleted
                    ? "bg-teal-50"
                    : "bg-slate-50"
                }`}
              >
                <img 
                  src={cat.icon} 
                  alt={cat.label} 
                  className="w-6 h-6"
                />
              </div>
              <div className="flex-grow">
                <h3
                  className={`font-bold ${
                    isCompleted ? "text-teal-900" : "text-slate-700"
                  }`}
                >
                  {cat.label}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isCompleted ? "Completado" : "Toque para configurar"}
                </p>
              </div>
              <div className="ml-auto">
                {isCompleted ? (
                  <div className="bg-teal-500 text-white p-1 rounded-full">
                    <CheckCircleIcon className="w-5 h-5" />
                  </div>
                ) : (
                  <ChevronRightIcon className="w-5 h-5 text-slate-300" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );

  // Step 2 (Sub-View): Service Editor
  const renderServiceEditor = (category: CareCategory) => {
    const config = servicesData[category];
    const catInfo = serviceCategories.find((c) => c.id === category);
    const variations = config.variations || [];

    // Filter out custom schedule items for the "tags" display so we don't duplicate standard buttons
    const specificTags =
      config.availability?.filter(
        (tag) => !STANDARD_AVAILABILITY.includes(tag)
      ) || [];

    return (
      <div className="space-y-6 animate-slide-up">
        <div
          className={`flex items-center justify-between p-4 rounded-xl ${catInfo?.bg} border ${catInfo?.border} mb-6`}
        >
          <div className="flex items-center">
            <div
              className={`p-2 rounded-full bg-white/50 mr-3`}
            >
              {catInfo && (
                <img 
                  src={catInfo.icon} 
                  alt={catInfo.label} 
                  className="w-6 h-6"
                />
              )}
            </div>
            <h3
              className={`font-bold text-lg ${catInfo?.color?.replace(
                "text",
                "text-slate"
              )}`}
            >
              Editando: {catInfo?.label}
            </h3>
          </div>
        </div>

        {/* Specific Services & Pricing */}
        <div>
          <h4 className="font-bold text-slate-800 text-sm mb-3 uppercase tracking-wide">
            Servicios y Tarifas
          </h4>
          <div className="space-y-3">
            {variations.map((variant, index) => (
              <div
                key={index}
                className={`p-4 rounded-xl border-2 transition-all ${
                  variant.enabled || variant.isCustom
                    ? "bg-white border-teal-500 shadow-sm"
                    : "bg-slate-50 border-slate-200"
                } ${variant.isCustom ? "bg-teal-50/50" : ""}`}
              >
                <div className="flex items-start justify-between">
                  {/* Unified Toggle Section */}
                  <div
                    className="flex items-start flex-1 cursor-pointer"
                    onClick={() => handleVariationToggle(category, index)}
                  >
                    <div
                      className={`mt-1 mr-3 flex-shrink-0 w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                        variant.enabled
                          ? "bg-teal-500 border-teal-500"
                          : "bg-white border-slate-300"
                      }`}
                    >
                      {variant.enabled && (
                        <CheckCircleIcon className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h5
                          className={`font-bold ${
                            variant.enabled ? "text-teal-900" : "text-slate-600"
                          }`}
                        >
                          {variant.name}
                        </h5>
                        {variant.isCustom && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteCustomService(category, index);
                            }}
                            className="text-slate-400 hover:text-red-500 transition-colors p-0.5"
                            title="Eliminar servicio personalizado"
                          >
                            <TrashIcon className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 leading-snug pr-2">
                        {variant.description}
                      </p>
                    </div>
                  </div>

                  {/* Price Section */}
                  {variant.enabled && (
                    <div className="flex flex-col items-end pl-2">
                      <div className="relative w-24">
                        <input
                          type="number"
                          value={variant.price || ""}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) =>
                            handleVariationPriceChange(
                              category,
                              index,
                              e.target.value === ""
                                ? 0
                                : parseFloat(e.target.value)
                            )
                          }
                          className="w-full p-2 pl-3 pr-8 bg-white border border-slate-300 rounded-lg text-right font-bold text-slate-800 focus:ring-2 focus:ring-teal-500 outline-none text-sm"
                          placeholder="0"
                        />
                        <span className="absolute right-3 top-2 text-slate-400 font-bold">
                          €
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 mt-1 uppercase font-medium">
                        {variant.unit}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Add Custom Service Section */}
          <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200 border-dashed">
            <h5 className="font-bold text-slate-700 text-sm mb-3">
              Servicio Personalizado
            </h5>
            <p className="text-xs text-slate-500 mb-3">
              Añade un servicio específico que no esté en la lista anterior.
            </p>

            <div className="flex flex-col gap-3">
              <input
                type="text"
                placeholder="Nombre del servicio (ej. Clases de pintura)"
                value={customServiceInput.name}
                onChange={(e) =>
                  setCustomServiceInput({
                    ...customServiceInput,
                    name: e.target.value,
                  })
                }
                className="w-full p-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-sm"
              />
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <input
                    type="number"
                    placeholder="Precio"
                    value={customServiceInput.price}
                    onChange={(e) =>
                      setCustomServiceInput({
                        ...customServiceInput,
                        price: e.target.value,
                      })
                    }
                    className="w-full p-3 pl-3 pr-8 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-sm"
                  />
                  <span className="absolute right-3 top-3 text-slate-400 font-bold">
                    €
                  </span>
                </div>
                <select
                  value={customServiceInput.unit}
                  onChange={(e) =>
                    setCustomServiceInput({
                      ...customServiceInput,
                      unit: e.target.value,
                    })
                  }
                  className="flex-1 p-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-sm"
                >
                  {UNIT_OPTIONS.map((u) => (
                    <option key={u} value={u}>
                      / {u}
                    </option>
                  ))}
                </select>
              </div>

              {/* Suggestions Chips */}
              <div className="flex flex-wrap gap-2 mt-1">
                {CUSTOM_SERVICE_SUGGESTIONS[category].map((sug) => (
                  <button
                    key={sug}
                    onClick={() =>
                      setCustomServiceInput((prev) => ({ ...prev, name: sug }))
                    }
                    className="px-2 py-1 bg-white border border-slate-200 rounded-md text-xs text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    {sug}
                  </button>
                ))}
              </div>

              <button
                onClick={() => handleAddCustomService(category)}
                disabled={!customServiceInput.name || !customServiceInput.price}
                className="mt-2 w-full bg-slate-800 text-white py-2.5 rounded-xl font-bold text-sm hover:bg-slate-900 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center justify-center"
              >
                <PlusCircleIcon className="w-4 h-4 mr-2" /> Añadir Servicio
              </button>
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">
            Tu experiencia
          </label>
          <textarea
            value={config.description || ""}
            onChange={(e) =>
              handleServiceDataChange(category, "description", e.target.value)
            }
            className="w-full p-3 bg-white border border-slate-300 rounded-xl h-32 focus:ring-2 focus:ring-teal-500 outline-none text-sm"
            placeholder={`Describe tu experiencia cuidando ${catInfo?.label.toLowerCase()}...`}
          />
        </div>

        {/* Availability (New Modals) */}
        <div>
          <label className="text-sm font-bold text-slate-700 mb-2 flex items-center">
            <ClockIcon className="w-4 h-4 mr-1 text-teal-600" /> Disponibilidad
            para este servicio
          </label>

          {/* Standard Options */}
          <div className="flex flex-wrap gap-2 mb-3">
            {STANDARD_AVAILABILITY.map((option) => (
              <button
                key={option}
                onClick={() => handleToggleAvailability(category, option)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                  config.availability?.includes(option)
                    ? "bg-teal-50 border-teal-500 text-teal-700"
                    : "bg-white border-slate-200 text-slate-600"
                }`}
              >
                {option}
              </button>
            ))}
          </div>

          <div className="flex gap-3 mb-3">
            <button
              onClick={openTimeModal}
              className="flex-1 bg-white border border-slate-300 text-slate-700 py-2.5 rounded-xl font-medium text-sm flex items-center justify-center hover:bg-slate-50 transition-colors"
            >
              <ClockIcon className="w-4 h-4 mr-2 text-slate-500" /> Especificar
              Horas
            </button>
            <button
              onClick={openCalendarModal}
              className="flex-1 bg-white border border-slate-300 text-slate-700 py-2.5 rounded-xl font-medium text-sm flex items-center justify-center hover:bg-slate-50 transition-colors"
            >
              <CalendarDaysIcon className="w-4 h-4 mr-2 text-slate-500" />{" "}
              Especificar Días
            </button>
          </div>

          {/* Active Specific Availability Tags (Only custom ones) */}
          <div className="flex flex-wrap gap-2">
            {specificTags.length > 0
              ? specificTags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="flex items-center px-3 py-1.5 rounded-lg bg-teal-50 text-teal-700 text-sm font-medium border border-teal-100"
                  >
                    {tag}
                    <button
                      onClick={() => handleRemoveAvailabilityTag(category, tag)}
                      className="ml-2 hover:text-red-500"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </span>
                ))
              : // Only show fallback message if standard options aren't selected either
                (!config.availability || config.availability.length === 0) && (
                  <p className="text-xs text-slate-400 italic">
                    No has añadido disponibilidad específica.
                  </p>
                )}
          </div>
        </div>

        {/* Certificates Section */}
        <div className="mt-4 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-bold text-slate-700 flex items-center">
              <DocumentTextIcon className="w-4 h-4 mr-2 text-teal-600" />{" "}
              Certificados y Documentación
            </label>
            {(() => {
              const maxCerts = Number(import.meta.env.VITE_MAX_CERTIFICATES_PER_USER) || 10;
              // Contar TODOS los certificados del usuario (todas las categorías)
              const totalCertificates = Object.values(servicesData).reduce(
                (total, service) => total + ((service as any).certificates?.length || 0),
                0
              );
              const remaining = maxCerts - totalCertificates;
              
              return (
                <div className="flex items-center gap-2">
                  <div className="text-xs text-slate-500">
                    <span className={`font-semibold ${totalCertificates >= maxCerts ? 'text-red-600' : 'text-teal-600'}`}>
                      {totalCertificates}
                    </span>
                    <span className="text-slate-400">/{maxCerts}</span>
                  </div>
                  {totalCertificates >= maxCerts && (
                    <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">
                      Límite alcanzado
                    </span>
                  )}
                </div>
              );
            })()}
          </div>

          <div className="space-y-3">
            {config.certificates?.map((cert) => (
              <div
                key={cert.id}
                className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl"
              >
                <div className="flex items-center overflow-hidden">
                  <div className="bg-slate-100 p-2 rounded-lg mr-3 flex-shrink-0">
                    <PaperClipIcon className="w-4 h-4 text-slate-500" />
                  </div>
                  <div className="truncate">
                    <p className="text-sm font-medium text-slate-700 truncate">
                      {cert.fileName || cert.name}
                    </p>
                    <p className="text-xs text-slate-400">
                      Subido el {new Date(cert.dateAdded).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveCertificate(category, cert.id)}
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            ))}

            <div
              onClick={() => certInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-50 hover:border-teal-400 transition-all group"
            >
              <div className="bg-slate-100 p-3 rounded-full mb-2 group-hover:bg-teal-50 transition-colors">
                <PaperClipIcon className="w-6 h-6 text-slate-400 group-hover:text-teal-500" />
              </div>
              <p className="text-sm font-medium text-slate-600 group-hover:text-teal-600">
                Sube tu CV o Certificados
              </p>
              {(() => {
                const maxCerts = Number(import.meta.env.VITE_MAX_CERTIFICATES_PER_USER) || 10;
                // Contar TODOS los certificados (global)
                const totalCertificates = Object.values(servicesData).reduce(
                  (total, service) => total + ((service as any).certificates?.length || 0),
                  0
                );
                const remaining = maxCerts - totalCertificates;
                return (
                  <>
                    <p className="text-xs text-slate-400 mt-1">
                      PDF, JPG o PNG (Máx {import.meta.env.VITE_MAX_CERTIFICATE_SIZE_MB || 5}MB)
                    </p>
                    {remaining > 0 && remaining <= 3 && (
                      <p className="text-xs text-orange-600 font-medium mt-1">
                        Solo puedes subir {remaining} certificado{remaining !== 1 ? 's' : ''} más en total
                      </p>
                    )}
                  </>
                );
              })()}
            </div>
            <input
              type="file"
              ref={certInputRef}
              onChange={(e) => handleCertificateUpload(category, e)}
              className="hidden"
              accept=".pdf,.jpg,.jpeg,.png"
            />
          </div>
        </div>

        {/* Medical Skills (Elderly Only) */}
        {category === CareCategory.ELDERLY && (
          <div className="bg-red-50 p-4 rounded-xl border border-red-100 mt-4">
            <h4 className="font-bold text-red-800 text-sm mb-3 flex items-center">
              <HealthIcon className="w-4 h-4 mr-1" /> Especialización y
              Patologías
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {MEDICAL_SKILLS.map((skill) => (
                <label
                  key={skill}
                  className="flex items-center space-x-2 cursor-pointer bg-white p-2 rounded border border-red-100"
                >
                  <input
                    type="checkbox"
                    checked={config.medicalSkills?.includes(skill)}
                    onChange={() => handleMedicalSkillToggle(category, skill)}
                    className="rounded text-red-600 focus:ring-red-500"
                  />
                  <span className="text-xs font-medium text-slate-700">
                    {skill}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Step 3: Review
  const renderReview = () => {
    const completedServices = Object.keys(servicesData).filter(
      (k) => servicesData[k as CareCategory].completed
    ) as CareCategory[];

    return (
      <div className="space-y-6 animate-fade-in">
        <Resumen_Revisa
          title="Revisa tu perfil"
          subtitle="Verifica que todo esté correcto antes de continuar."
        />

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <Resumen_PersonalInfo
            photoUrl={profileData.photoUrl || "https://via.placeholder.com/150"}
            name={[profileData.firstName, profileData.lastName].filter(Boolean).join(' ').trim() || 'Usuario'}
            phone={profileData.phone}
            email={profileData.email}
            location={profileData.location}
            languages={profileData.languages}
          />

          <Resumen_Services
            completedServices={completedServices}
            servicesData={servicesData}
            serviceCategories={serviceCategories}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-slate-50 z-50 flex flex-col animate-fade-in">
      {/* Stepper Header */}
      <div className="bg-white border-b border-slate-200 p-2 sm:p-4 pt-safe-top">
        <div className="flex items-center justify-between mb-2 sm:mb-4">
          <div className="flex items-center gap-1.5 sm:gap-3">
            {(step > 1 || editingCategory) && (
              <button
                onClick={prevStep}
                className="p-1 sm:p-1.5 -ml-1 sm:-ml-1.5 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                aria-label="Atrás"
              >
                <ChevronLeftIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            )}

            <span className="text-xs sm:text-sm font-medium text-teal-600">{step} de 3</span>

            <h1 className="text-sm sm:text-lg font-bold text-slate-800">
              {step === 1
                ? initialData ? "Perfil profesional" : "Perfil profesional"
                : step === 2
                ? editingCategory
                  ? "Configuración"
                  : "Mis servicios"
                : "Resumen"}
            </h1>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-3">

            {editingCategory ? (
              <button
                onClick={handleSaveCategory}
                className="px-2 sm:px-4 py-1 sm:py-1.5 bg-teal-500 text-white text-xs sm:text-sm font-bold rounded-lg hover:bg-teal-600 transition-colors shadow-sm flex items-center"
              >
                <span className="hidden sm:inline">Guardar</span>
                <span className="sm:hidden">OK</span>
                <CheckCircleIcon className="w-3 h-3 sm:w-4 sm:h-4 ml-0.5 sm:ml-1" />
              </button>
            ) : step < 3 ? (
              <button
                onClick={nextStep}
                className="px-2 sm:px-4 py-1 sm:py-1.5 bg-teal-500 text-white text-xs sm:text-sm font-bold rounded-lg hover:bg-teal-600 transition-colors shadow-sm flex items-center"
              >
                Siguiente <ChevronRightIcon className="w-3 h-3 sm:w-4 sm:h-4 ml-0.5 sm:ml-1" />
              </button>
            ) : (
              <button
                onClick={confirmPublish}
                className="px-2 sm:px-4 py-1 sm:py-1.5 bg-teal-500 text-white text-xs sm:text-sm font-bold rounded-lg hover:bg-teal-600 transition-colors shadow-sm flex items-center"
              >
                <span className="hidden sm:inline">{initialData ? "Guardar cambios" : "Finalizar"}</span>
                <span className="sm:hidden">OK</span>
              </button>
            )}

            {onCancel && (
              <button
                onClick={onCancel}
                className="p-1 sm:p-1.5 -mr-1 sm:-mr-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                aria-label="Cancelar"
                title="Cancelar registro"
              >
                <XMarkIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            )}
          </div>
        </div>
        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-teal-500 transition-all duration-300 ease-out rounded-full"
            style={{ width: `${(step / 3) * 100}%` }}
          ></div>
        </div>
      </div>

      <main className="flex-grow overflow-y-auto px-6 py-6 pb-24">
        <div className="container mx-auto max-w-md pb-24">
          {step === 1 && renderProfileForm()}
          {step === 2 &&
            (editingCategory
              ? renderServiceEditor(editingCategory)
              : renderServicesDashboard())}
          {step === 3 && renderReview()}
        </div>
      </main>

      <BottomNav
        currentView={currentView}
        onNavigateHome={onNavigateHome}
        onNavigateFavorites={onNavigateFavorites}
        onNavigateOffer={onNavigateOffer}
        onNavigateInbox={onNavigateInbox}
        onNavigateProfile={onNavigateProfile}
        onNavigateBookings={onNavigateBookings}
        unreadCount={unreadCount}
        isAuthenticated={isAuthenticated}
      />

      {showTimeModal && renderTimeModal()}
      {showCalendarModal && renderCalendarModal()}

      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={() => setAlertModal({ isOpen: false, message: "" })}
        message={alertModal.message}
        title={alertModal.title}
      />
    </div>
  );
};

export default ProfesionalRegistration;
