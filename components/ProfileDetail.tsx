import React from "react";
import { Provider, CareCategory, ServiceRates } from "../types";
import ChevronLeftIcon from "./icons/ChevronLeftIcon";
import StarIcon from "./icons/StarIcon";
import LocationPinIcon from "./icons/LocationPinIcon";
import InformationCircleIcon from "./icons/InformationCircleIcon";
import ShieldCheckIcon from "./icons/ShieldCheckIcon";
import CreditCardIcon from "./icons/CreditCardIcon";
import StarRating from "./StarRating";
import ChatBubbleLeftRightIcon from "./icons/ChatBubbleLeftRightIcon";
import CleaningIcon from "./icons/CleaningIcon";
import ClockIcon from "./icons/ClockIcon";
import ElderlyIcon from "./icons/ElderlyIcon";
import ChildIcon from "./icons/ChildIcon";
import PetIcon from "./icons/PetIcon";
import CheckCircleIcon from "./icons/CheckCircleIcon";
import AcademicCapIcon from "./icons/AcademicCapIcon";
import HeartIcon from "./icons/HeartIcon";

interface ProfileDetailProps {
  provider: Provider | null | undefined;
  isLoading: boolean;
  onBack: () => void;
  onBookNow: (providerId: number) => void;
  onContact: (providerId: number) => void;
}

// Mapping tasks to categories to visually group them in the profile
const CATEGORY_TASK_MAPPING: Record<CareCategory, string[]> = {
  [CareCategory.ELDERLY]: [
    "Asistencia en movilidad",
    "Control de medicación",
    "Nutrición y alimentación",
    "Paseos y ejercicio",
    "Supervisión nocturna",
    "Trámites médicos",
    "Tareas domésticas ligeras",
    "Higiene personal",
    "Gestión de Medicamentos",
    "Compañía",
    "Acompañamiento Hospitalario",
  ],
  [CareCategory.CHILDREN]: [
    "Cuidado en casa",
    "Recogida del colegio",
    "Ayuda con deberes",
    "Acompañamiento en actividades",
    "Atención especial",
    "Juegos y estimulación",
    "Preparación de comidas",
    "Ayuda en higiene",
    "Paseos",
    "Actividades deportivas",
    "Rutinas de sueño",
    "Canguro",
    "Tutorías",
    "Juegos creativos",
  ],
  [CareCategory.PETS]: [
    "Paseo",
    "Alimentación",
    "Administración de medicinas",
    "Baño/Higiene",
    "Guardería diurna",
    "Guardería nocturna",
    "Visitas veterinarias",
    "Juegos",
    "Paseo de Perros",
    "Cuidado a Domicilio",
    "Administración de Medicamentos",
  ],
  [CareCategory.HOUSEKEEPING]: [
    "Limpieza general",
    "Limpieza profunda",
    "Limpieza de cristales",
    "Limpieza de garajes",
    "Limpieza de comunidades",
    "Organización",
    "Lavado y planchado",
    "Limpieza post-obra",
    "Mantenimiento",
    "Desinfección",
    "Compras",
    "Tareas Domésticas Ligeras",
  ],
};

const CATEGORY_STYLES: Record<
  CareCategory,
  {
    bg: string;
    border: string;
    text: string;
    icon: React.ElementType;
    lightBg: string;
  }
> = {
  [CareCategory.ELDERLY]: {
    bg: "bg-green-50",
    border: "border-green-200",
    text: "text-green-700",
    lightBg: "bg-green-100",
    icon: ElderlyIcon,
  },
  [CareCategory.CHILDREN]: {
    bg: "bg-slate-50",
    border: "border-slate-200",
    text: "text-slate-700",
    lightBg: "bg-slate-100",
    icon: ChildIcon,
  },
  [CareCategory.PETS]: {
    bg: "bg-orange-50",
    border: "border-orange-200",
    text: "text-orange-700",
    lightBg: "bg-orange-100",
    icon: PetIcon,
  },
  [CareCategory.HOUSEKEEPING]: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-700",
    lightBg: "bg-blue-100",
    icon: CleaningIcon,
  },
};

const getBadgeStyle = (badge: string) => {
  if (badge.toLowerCase().includes("mejor valorado")) {
    return {
      icon: <StarIcon className="w-4 h-4 text-amber-600" />,
      style: "bg-amber-100 text-amber-800 border-amber-200",
    };
  }
  if (badge.toLowerCase().includes("experto")) {
    return {
      icon: <ShieldCheckIcon className="w-4 h-4 text-blue-600" />,
      style: "bg-blue-100 text-blue-800 border-blue-200",
    };
  }
  if (badge.toLowerCase().includes("rápida")) {
    return {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-4 h-4 text-green-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
      ),
      style: "bg-green-100 text-green-800 border-green-200",
    };
  }
  return { icon: null, style: "bg-slate-100 text-slate-800 border-slate-200" };
};

const ActionButtons: React.FC<{
    title: string; 
    onBack: () => void;
    providerId: number;
    onContact: (providerId: number) => void;
    onBookNow: (providerId: number) => void;
}> = ({ 
    title,
    onBack,
    providerId, 
    onContact, 
    onBookNow 
}) => (
    <header className="flex-shrink-0 bg-white/80 backdrop-blur-lg border-b border-slate-200 sticky top-0 z-10">
        {title !== "" && (
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <button
                    onClick={onBack}
                    className="p-2 -ml-2 text-slate-600 hover:text-teal-500"
                >
                    <ChevronLeftIcon className="w-6 h-6" />
                </button>
                
                <h1 className="text-lg font-semibold text-slate-800">{title}</h1>
                <div className="w-6"></div>
            </div>
        )}

        {title == "" && (
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <button
                    onClick={onBack}
                    className="p-2 -ml-2 text-slate-600 hover:text-teal-500"
                >
                    <ChevronLeftIcon className="w-6 h-6" />
                </button>

                <div className="container mx-auto px-6 py-3 flex items-center gap-3">
                    <button
                        onClick={() => onContact(providerId)}
                        className="flex-1 bg-white border-2 border-slate-200 text-slate-700 px-4 py-3.5 rounded-xl font-bold hover:bg-slate-50 hover:border-slate-300 transition-colors flex items-center justify-center text-base"
                    >
                        <ChatBubbleLeftRightIcon className="w-5 h-5 mr-2" />
                        Chat
                    </button>

                    <button
                        onClick={() => onBookNow(providerId)}
                        className="flex-[2] bg-teal-600 text-white px-4 py-3.5 rounded-xl font-bold hover:bg-teal-700 transition-colors flex items-center justify-center text-base shadow-lg shadow-teal-500/30"
                    >
                        <CreditCardIcon className="w-5 h-5 mr-2" />
                        Reservar
                    </button>
                </div>

                <div className="w-6"></div>
            </div>
        )}
    </header>
);

const ProfileDetail: React.FC<ProfileDetailProps> = ({
  provider,
  isLoading,
  onBack,
  onBookNow,
  onContact,
}) => {
  if (isLoading) {
    return (
        <div className="bg-white min-h-screen flex flex-col animate-fade-in">
            <ActionButtons
                title="Cargando Perfil..."
                onBack={onBack}
                providerId={provider.id}
                onContact={onContact}
                onBookNow={onBookNow}
            />

            <main className="flex-grow flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
            </main>
        </div>
    );
  }

  if (!provider) {
    return (
        <div className="bg-white min-h-screen flex flex-col animate-fade-in">
            <ActionButtons
                title="Error"
                onBack={onBack}
                providerId={provider.id}
                onContact={onContact}
                onBookNow={onBookNow}
            />

            <main className="flex-grow flex flex-col items-center justify-center text-center px-4">
                <InformationCircleIcon className="w-16 h-16 text-slate-300 mb-4" />

                <h2 className="text-xl font-semibold text-slate-700">
                No se pudo encontrar el perfil
                </h2>

                <p className="text-slate-500 mt-2">
                Lo sentimos, no pudimos cargar los datos del cuidador.
                </p>
                
                <button
                onClick={onBack}
                className="mt-6 bg-teal-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-teal-600 transition-colors"
                >
                Volver
                </button>
            </main>
        </div>
    );
  }

  return (
    <div className="bg-white min-h-screen flex flex-col animate-fade-in">
        <ActionButtons
            title=""
            onBack={onBack}
            providerId={provider.id}
            onContact={onContact}
            onBookNow={onBookNow}
        />

        <main className="flex-grow overflow-y-auto pb-28 bg-slate-50">
            {/* User Info */}
            <section className="bg-white pb-6 pt-6 text-center border-b border-slate-100 shadow-sm mb-6">
                <div className="container mx-auto px-4">
                <img
                    src={provider.photoUrl}
                    alt={provider.name}
                    className="w-28 h-28 rounded-full mx-auto ring-4 ring-white shadow-lg object-cover"
                />
                <h2 className="text-2xl font-bold text-slate-800 mt-4">
                    {provider.name}
                </h2>
                <div className="flex items-center justify-center space-x-2 mt-2">
                    <div className="flex items-center text-amber-500">
                    <StarIcon className="w-5 h-5" />
                    <span className="ml-1 font-bold text-slate-700">
                        {provider.rating.toFixed(1)}
                    </span>
                    </div>
                    <span className="text-slate-300">|</span>
                    <span className="text-slate-500">
                    {provider.reviewsCount} valoraciones
                    </span>
                </div>
                <div className="flex items-center justify-center text-slate-500 mt-1 text-sm">
                    <LocationPinIcon className="w-4 h-4 mr-1" />
                    <span>{provider.location}</span>
                </div>

                {/* Languages & Availability Tags */}
                <div className="mt-3 flex flex-wrap justify-center gap-2">
                    {provider.languages?.map((lang) => (
                    <span
                        key={lang}
                        className="px-2 py-1 bg-slate-50 text-slate-600 text-xs rounded-md border border-slate-200 font-medium flex items-center"
                    >
                        <svg
                        className="w-3 h-3 mr-1 opacity-50"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
                        />
                        </svg>
                        {lang}
                    </span>
                    ))}
                    {provider.availability?.map((slot) => (
                    <span
                        key={slot}
                        className="px-2 py-1 bg-teal-50 text-teal-700 text-xs rounded-md border border-teal-100 font-medium flex items-center"
                    >
                        <ClockIcon className="w-3 h-3 mr-1 opacity-70" /> {slot}
                    </span>
                    ))}
                </div>

                {provider.badges && provider.badges.length > 0 && (
                    <div className="mt-4 flex flex-wrap justify-center gap-2">
                    {provider.badges.map((badge) => {
                        const { icon, style } = getBadgeStyle(badge);
                        return (
                        <div
                            key={badge}
                            className={`flex items-center text-xs font-semibold px-3 py-1 rounded-full border ${style}`}
                        >
                            {icon}
                            <span className="ml-1.5">{badge}</span>
                        </div>
                        );
                    })}
                    </div>
                )}
                </div>
            </section>

            <div className="container mx-auto px-4 space-y-6">
                {/* Medical Specialities Section - Modeled after Depencare */}
                {provider.medicalSkills && provider.medicalSkills.length > 0 && (
                <div className="bg-white rounded-2xl border border-red-100 shadow-sm overflow-hidden">
                    <div className="bg-red-50 p-3 flex items-center border-b border-red-100">
                    <HeartIcon className="w-5 h-5 text-red-500 mr-2" />
                    <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide">
                        Especialización Médica y Patologías
                    </h3>
                    </div>
                    <div className="p-4">
                    <p className="text-xs text-slate-500 mb-3">
                        Experiencia verificada en el cuidado de:
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {provider.medicalSkills.map((skill, index) => (
                        <span
                            key={index}
                            className="inline-flex items-center px-3 py-1.5 rounded-full bg-white border border-red-200 text-red-700 text-xs font-bold shadow-sm"
                        >
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-2"></span>
                            {skill}
                        </span>
                        ))}
                    </div>
                    </div>
                </div>
                )}

                {/* Unified Services Section */}
                <div>
                <h3 className="font-bold text-lg text-slate-800 mb-3 px-1">
                    Servicios y Tarifas
                </h3>
                <div className="space-y-4">
                    {provider.categories.map((cat) => {
                    const theme = CATEGORY_STYLES[cat];
                    const rates = provider.detailedRates?.[cat] || {
                        hourly: provider.hourlyRate,
                    };
                    const description = provider.descriptions.find(
                        (d) => d.category === cat
                    )?.text;
                    const training = provider.specificTraining?.[cat];

                    // Filter services/tasks that belong to this category
                    const includedTasks = provider.services.filter((s) =>
                        CATEGORY_TASK_MAPPING[cat].some(
                        (mapping) =>
                            s.toLowerCase().includes(mapping.toLowerCase()) ||
                            mapping.toLowerCase().includes(s.toLowerCase())
                        )
                    );

                    return (
                        <div
                        key={cat}
                        className={`rounded-2xl border ${theme.border} bg-white overflow-hidden shadow-sm`}
                        >
                        {/* Header */}
                        <div
                            className={`${theme.bg} p-4 flex justify-between items-start border-b ${theme.border}`}
                        >
                            <div className="flex items-center">
                            <div
                                className={`p-2 rounded-full ${theme.lightBg} mr-3`}
                            >
                                <theme.icon className={`w-6 h-6 ${theme.text}`} />
                            </div>
                            <div>
                                <h4 className={`font-bold text-base ${theme.text}`}>
                                {cat === CareCategory.ELDERLY
                                    ? "Cuidado de Mayores"
                                    : cat === CareCategory.CHILDREN
                                    ? "Cuidado de Niños"
                                    : cat === CareCategory.PETS
                                    ? "Cuidado de Mascotas"
                                    : "Limpieza y Hogar"}
                                </h4>
                                <div className="text-xs text-slate-500 mt-0.5">
                                Servicio completo
                                </div>
                            </div>
                            </div>
                            <div className="text-right">
                            <span className="block text-2xl font-bold text-slate-800 leading-none">
                                {rates.hourly}€
                            </span>
                            <span className="text-xs text-slate-500">/ hora</span>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-4 space-y-4">
                            {/* Description */}
                            {description && (
                            <div>
                                <p className="text-slate-600 text-sm leading-relaxed italic">
                                "{description}"
                                </p>
                            </div>
                            )}

                            {/* Included Tasks Pills */}
                            {includedTasks.length > 0 && (
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                                Incluye
                                </p>
                                <div className="flex flex-wrap gap-2">
                                {includedTasks.map((task) => (
                                    <span
                                    key={task}
                                    className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-medium border border-slate-200"
                                    >
                                    <CheckCircleIcon
                                        className={`w-3.5 h-3.5 mr-1.5 ${theme.text}`}
                                    />
                                    {task}
                                    </span>
                                ))}
                                </div>
                            </div>
                            )}

                            {/* Specific Training Highlight */}
                            {training && (
                            <div
                                className={`p-3 rounded-xl border border-dashed ${theme.border} ${theme.bg} flex items-start`}
                            >
                                <AcademicCapIcon
                                className={`w-5 h-5 mr-2 mt-0.5 ${theme.text}`}
                                />
                                <div>
                                <p
                                    className={`text-xs font-bold ${theme.text} mb-0.5`}
                                >
                                    Formación Específica
                                </p>
                                <p className="text-xs text-slate-700">{training}</p>
                                </div>
                            </div>
                            )}

                            {/* Rate Details/Extras */}
                            {(rates.shift ||
                            rates.urgentSurcharge ||
                            (rates.extras && rates.extras.length > 0)) && (
                            <div className="pt-3 border-t border-slate-100">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                                Tarifas extra
                                </p>
                                <div className="grid grid-cols-2 gap-2">
                                {rates.shift && (
                                    <div className="flex justify-between items-center text-xs bg-slate-50 p-2 rounded">
                                    <span className="text-slate-600">
                                        Jornada/Servicio
                                    </span>
                                    <span className="font-semibold text-slate-800">
                                        {rates.shift}€
                                    </span>
                                    </div>
                                )}
                                {rates.urgentSurcharge && (
                                    <div className="flex justify-between items-center text-xs bg-amber-50 p-2 rounded">
                                    <span className="text-amber-700">Urgencia</span>
                                    <span className="font-semibold text-amber-800">
                                        +{rates.urgentSurcharge}%
                                    </span>
                                    </div>
                                )}
                                {rates.extras?.map((extra, idx) => (
                                    <div
                                    key={idx}
                                    className="flex justify-between items-center text-xs bg-slate-50 p-2 rounded"
                                    >
                                    <span
                                        className="text-slate-600 truncate mr-2"
                                        title={extra.name}
                                    >
                                        {extra.name}
                                    </span>
                                    <span className="font-semibold text-slate-800">
                                        +{extra.price}€
                                    </span>
                                    </div>
                                ))}
                                </div>
                            </div>
                            )}
                        </div>
                        </div>
                    );
                    })}
                </div>
                </div>

                {/* Reviews Section */}
                {provider.reviews && provider.reviews.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm mt-6">
                    <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-lg text-slate-800">
                        Valoraciones
                    </h3>
                    <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                        {provider.reviews.length} verificadas
                    </span>
                    </div>
                    <ul className="space-y-6">
                    {provider.reviews.map((review) => (
                        <li
                        key={review.id}
                        className="flex items-start space-x-4 pb-6 border-b border-slate-100 last:border-0 last:pb-0"
                        >
                        <img
                            src={review.authorPhotoUrl}
                            alt={review.authorName}
                            className="w-10 h-10 rounded-full object-cover border border-slate-200"
                        />
                        <div className="flex-1">
                            <div className="flex justify-between items-center mb-1">
                            <p className="font-bold text-sm text-slate-800">
                                {review.authorName}
                            </p>
                            <p className="text-xs text-slate-400">{review.date}</p>
                            </div>
                            <StarRating rating={review.rating} className="mb-2" />
                            <p className="text-sm text-slate-600 leading-relaxed">
                            {review.comment}
                            </p>
                        </div>
                        </li>
                    ))}
                    </ul>
                </div>
                )}

                {/* Verifications Section */}
                <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm mt-6">
                <h3 className="font-bold text-lg text-slate-800 mb-4">
                    Verificaciones
                </h3>
                <div className="grid grid-cols-1 gap-3">
                    {provider.verifications.map((verification) => (
                    <div
                        key={verification}
                        className="flex items-center p-3 bg-slate-50 rounded-xl border border-slate-100"
                    >
                        <div className="bg-green-100 rounded-full p-1.5 mr-3">
                        <ShieldCheckIcon className="w-5 h-5 text-green-600" />
                        </div>
                        <span className="text-slate-700 text-sm font-medium">
                        {verification}
                        </span>
                    </div>
                    ))}
                </div>
                </div>
            </div>
        </main>
    </div>
  );
};

export default ProfileDetail;
