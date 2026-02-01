/**
 * Constantes y configuraciones de servicios para perfiles de proveedores
 * Usado por: ProfesionalRegistration.tsx y OfferService.tsx
 */

import { CareCategory, ServiceConfig, ServiceVariation } from "../types";

// Categorías de servicios con información visual
export const serviceCategories = [
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

// Lista de idiomas disponibles
export const languagesList = [
  "Español",
  "Inglés",
  "Francés",
  "Alemán",
  "Italiano",
  "Portugués",
  "Chino",
  "Árabe",
];

// Habilidades médicas especializadas (para cuidado de mayores)
export const MEDICAL_SKILLS = [
  "Alzheimer",
  "Demencia Senil",
  "Parkinson",
  "Diabetes (Insulina)",
  "Movilidad Reducida (Grúa)",
  "Recuperación Ictus",
  "Cuidados Paliativos",
  "Post-operatorio",
  "Sondaje / Curas",
  "Diálisis",
  "Ostomías",
];

// Tipos de mascotas aceptadas
export const PET_TYPES = ["Perros", "Gatos", "Pequeños animales", "Otros"];

// Opciones de disponibilidad estándar
export const STANDARD_AVAILABILITY = [
  "Mañanas",
  "Tardes",
  "Noches",
  "Fines de Semana",
  "Interno/a",
];

// Sugerencias de servicios personalizados por categoría
export const CUSTOM_SERVICE_SUGGESTIONS: Record<CareCategory, string[]> = {
  [CareCategory.ELDERLY]: [
    "Peluquería",
    "Podología",
    "Manicura",
    "Transporte",
    "Fisioterapia",
  ],
  [CareCategory.CHILDREN]: [
    "Clases particulares",
    "Idiomas",
    "Cocina",
    "Música",
    "Logopedia",
  ],
  [CareCategory.PETS]: [
    "Adiestramiento",
    "Baño",
    "Corte de uñas",
    "Transporte",
    "Peluquería",
  ],
  [CareCategory.HOUSEKEEPING]: [
    "Jardinería",
    "Cristales",
    "Cocina",
    "Organización",
    "Pequeñas reparaciones",
  ],
};

// Opciones de unidades para precios
export const UNIT_OPTIONS = [
  "hora",
  "servicio",
  "noche",
  "día",
  "paseo",
  "visita",
  "mes",
];

/**
 * Helper function para obtener precios desde variables de entorno
 * con fallback a valor por defecto
 */
export const getEnvPrice = (key: string, defaultValue: number): number => {
  const value = import.meta.env[key];
  return value ? parseFloat(value) : defaultValue;
};

/**
 * Variaciones de servicios predeterminadas con precios por categoría
 */
export const DEFAULT_SERVICE_VARIANTS: Record<CareCategory, ServiceVariation[]> = {
  [CareCategory.ELDERLY]: [
    {
      name: "Acompañamiento",
      price: getEnvPrice('VITE_PRICE_ELDERLY_COMPANIONSHIP', 12),
      unit: "hora",
      enabled: false,
      description: "Compañía en casa, paseos y conversación.",
    },
    {
      name: "Cuidado Personal",
      price: getEnvPrice('VITE_PRICE_ELDERLY_PERSONAL_CARE', 15),
      unit: "hora",
      enabled: false,
      description: "Ayuda con aseo, vestido y movilidad.",
    },
    {
      name: "Cuidado Nocturno",
      price: getEnvPrice('VITE_PRICE_ELDERLY_NIGHT_CARE', 80),
      unit: "noche",
      enabled: false,
      description: "Vigilancia y asistencia durante la noche.",
    },
    {
      name: "Gestión Médica",
      price: getEnvPrice('VITE_PRICE_ELDERLY_MEDICAL_MANAGEMENT', 20),
      unit: "visita",
      enabled: false,
      description: "Control de medicación, curas o acompañamiento al médico.",
    },
    {
      name: "Interno/a",
      price: getEnvPrice('VITE_PRICE_ELDERLY_LIVE_IN', 1200),
      unit: "mes",
      enabled: false,
      description: "Cuidado permanente viviendo en el domicilio.",
    },
  ],
  [CareCategory.CHILDREN]: [
    {
      name: "Canguro / Niñera",
      price: getEnvPrice('VITE_PRICE_CHILDREN_BABYSITTER', 12),
      unit: "hora",
      enabled: false,
      description: "Cuidado puntual o recurrente en casa.",
    },
    {
      name: "Recogida Colegio",
      price: getEnvPrice('VITE_PRICE_CHILDREN_SCHOOL_PICKUP', 10),
      unit: "trayecto",
      enabled: false,
      description: "Acompañamiento seguro desde el colegio a casa.",
    },
    {
      name: "Ayuda Deberes",
      price: getEnvPrice('VITE_PRICE_CHILDREN_HOMEWORK_HELP', 15),
      unit: "hora",
      enabled: false,
      description: "Apoyo escolar y tutoría.",
    },
    {
      name: "Cuidado Nocturno",
      price: getEnvPrice('VITE_PRICE_CHILDREN_NIGHT_CARE', 70),
      unit: "noche",
      enabled: false,
      description: "Cuidado de niños durante la noche.",
    },
  ],
  [CareCategory.PETS]: [
    {
      name: "Paseo de perros",
      price: getEnvPrice('VITE_PRICE_PETS_DOG_WALKING', 10),
      unit: "paseo",
      enabled: false,
      description: "Paseo de 1 hora por tu barrio o parque.",
    },
    {
      name: "Alojamiento",
      price: getEnvPrice('VITE_PRICE_PETS_ACCOMMODATION', 25),
      unit: "noche",
      enabled: false,
      description: "Tu mascota duerme en mi casa.",
    },
    {
      name: "Visita a domicilio",
      price: getEnvPrice('VITE_PRICE_PETS_HOME_VISIT', 12),
      unit: "visita",
      enabled: false,
      description: "Alimentación, limpieza y juego en tu casa.",
    },
    {
      name: "Guardería de día",
      price: getEnvPrice('VITE_PRICE_PETS_DAY_CARE', 20),
      unit: "día",
      enabled: false,
      description: "Cuidado diurno en mi casa.",
    },
  ],
  [CareCategory.HOUSEKEEPING]: [
    {
      name: "Limpieza General",
      price: getEnvPrice('VITE_PRICE_HOUSEKEEPING_GENERAL_CLEANING', 12),
      unit: "hora",
      enabled: false,
      description: "Mantenimiento semanal del hogar.",
    },
    {
      name: "Limpieza a Fondo",
      price: getEnvPrice('VITE_PRICE_HOUSEKEEPING_DEEP_CLEANING', 50),
      unit: "servicio",
      enabled: false,
      description: "Limpieza profunda (cocina, baños, cristales).",
    },
    {
      name: "Planchado",
      price: getEnvPrice('VITE_PRICE_HOUSEKEEPING_IRONING', 12),
      unit: "hora",
      enabled: false,
      description: "Servicio exclusivo de planchado.",
    },
    {
      name: "Cocina",
      price: getEnvPrice('VITE_PRICE_HOUSEKEEPING_COOKING', 15),
      unit: "hora",
      enabled: false,
      description: "Preparación de menús semanales.",
    },
  ],
};

/**
 * Helper para obtener el label de una categoría
 */
export const getCategoryLabel = (categoryId: CareCategory): string => {
  const category = serviceCategories.find(cat => cat.id === categoryId);
  return category?.label || "Categoría desconocida";
};

/**
 * Helper para obtener el icono de una categoría
 */
export const getCategoryIcon = (categoryId: CareCategory): string => {
  const category = serviceCategories.find(cat => cat.id === categoryId);
  return category?.icon || "";
};

/**
 * Helper para obtener una categoría completa por ID
 */
export const getCategoryById = (categoryId: CareCategory) => {
  return serviceCategories.find(cat => cat.id === categoryId);
};

/**
 * Mapeo directo de CareCategory a label (generado automáticamente)
 */
export const categoryLabels: Record<CareCategory, string> = {
  [CareCategory.ELDERLY]: "Cuidado de Mayores",
  [CareCategory.CHILDREN]: "Cuidado de Niños",
  [CareCategory.PETS]: "Cuidado de Mascotas",
  [CareCategory.HOUSEKEEPING]: "Limpieza de Hogar",
};

/**
 * Configuración inicial para un nuevo servicio
 */
export const initialServiceConfig: ServiceConfig = {
  completed: false,
  tasks: [],
  variations: [], // Se pobla dinámicamente desde DEFAULT_SERVICE_VARIANTS
  rates: { hourly: 10 },
  experience: "",
  certificates: [],
  availability: [],
  schedule: { startTime: "", endTime: "" },
  specificDates: [],
  petAttributes: { acceptedPets: [], workZones: [], maxPets: 1 },
  housekeepingAttributes: {
    products: "flexible",
    equipment: false,
    waste: false,
    eco: false,
  },
  medicalSkills: [],
};
