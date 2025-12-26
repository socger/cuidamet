
import React, { useState, useRef, useEffect } from 'react';
import { CareCategory, Certificate, CertificateType, ServiceConfig, ProviderProfile, ProfileStatus, ServiceRates, PetAttributes, HousekeepingAttributes } from '../types';
import CameraIcon from './icons/CameraIcon';
import PhotoIcon from './icons/PhotoIcon';
import MapPinIcon from './icons/MapPinIcon';
import CurrencyEuroIcon from './icons/CurrencyEuroIcon';
import StarIcon from './icons/StarIcon';
import IdentificationIcon from './icons/IdentificationIcon';
import UserCircleIcon from './icons/UserCircleIcon';
import CheckCircleIcon from './icons/CheckCircleIcon';
import ChevronLeftIcon from './icons/ChevronLeftIcon';
import ChevronRightIcon from './icons/ChevronRightIcon';
import ElderlyIcon from './icons/ElderlyIcon';
import ChildIcon from './icons/ChildIcon';
import PetIcon from './icons/PetIcon';
import CleaningIcon from './icons/CleaningIcon';
import DocumentTextIcon from './icons/DocumentTextIcon';
import ClipboardDocumentListIcon from './icons/ClipboardDocumentListIcon';
import TrashIcon from './icons/TrashIcon';
import PaperClipIcon from './icons/PaperClipIcon';
import LockClosedIcon from './icons/LockClosedIcon';
import ExclamationTriangleIcon from './icons/ExclamationTriangleIcon';
import XCircleIcon from './icons/XCircleIcon';
import ChatBubbleLeftRightIcon from './icons/ChatBubbleLeftRightIcon';
import PencilIcon from './icons/PencilIcon';
import ClockIcon from './icons/ClockIcon';
import PlusCircleIcon from './icons/PlusCircleIcon';
import HeartHandshakeIcon from './icons/HeartHandshakeIcon';
import HealthIcon from './icons/HealthIcon';
import GpsFixedIcon from './icons/GpsFixedIcon';

interface OfferServiceProps {
  onComplete: (profileData: ProviderProfile) => void;
}

const serviceCategories = [
    { id: CareCategory.ELDERLY, label: 'Cuidado de Mayores', icon: ElderlyIcon, description: 'Asistencia, compañía y cuidados médicos', color: 'text-green-600', bg: 'bg-green-100', border: 'border-green-200' },
    { id: CareCategory.CHILDREN, label: 'Cuidado de Niños', icon: ChildIcon, description: 'Canguro, ayuda escolar y rutinas', color: 'text-slate-600', bg: 'bg-slate-200', border: 'border-slate-300' },
    { id: CareCategory.PETS, label: 'Mascotas', icon: PetIcon, description: 'Paseos, guardería y cuidados', color: 'text-orange-600', bg: 'bg-orange-100', border: 'border-orange-200' },
    { id: CareCategory.HOUSEKEEPING, label: 'Limpieza y Mantenimiento', icon: CleaningIcon, description: 'Hogar, cristales y reparaciones', color: 'text-blue-600', bg: 'bg-blue-100', border: 'border-blue-200' }
];

const languagesList = ['Español', 'Inglés', 'Francés', 'Alemán', 'Italiano', 'Portugués', 'Chino', 'Árabe'];
const availabilitySlots = ['Mañanas', 'Tardes', 'Noches', 'Fines de Semana', 'Interno/a'];

const MEDICAL_SKILLS = [
    'Alzheimer', 'Demencia Senil', 'Parkinson', 'Diabetes (Insulina)',
    'Movilidad Reducida (Grúa)', 'Recuperación Ictus', 'Cuidados Paliativos',
    'Post-operatorio', 'Sondaje / Curas', 'Diálisis', 'Ostomías'
];

const PET_TYPES = ['Perros', 'Gatos', 'Pequeños animales', 'Otros'];
const SERVICE_TASKS: Record<CareCategory, string[]> = {
    [CareCategory.ELDERLY]: ['Acompañamiento', 'Control Medicación', 'Aseo Personal', 'Comidas', 'Paseos', 'Gestión Citas', 'Estimulación Cognitiva', 'Compras'],
    [CareCategory.CHILDREN]: ['Llevar al colegio', 'Ayuda deberes', 'Juegos', 'Comidas', 'Baño', 'Noches', 'Idiomas', 'Necesidades Especiales'],
    [CareCategory.PETS]: ['Paseos', 'Visitas a domicilio', 'Alojamiento en mi casa', 'Guardería de día', 'Baño', 'Administración medicinas', 'Adiestramiento básico'],
    [CareCategory.HOUSEKEEPING]: ['Limpieza general', 'Planchado', 'Cocina', 'Cristales', 'Limpieza a fondo', 'Jardinería básica', 'Organización']
};

// Initial config for a new service
const initialServiceConfig: ServiceConfig = {
    completed: false,
    tasks: [],
    rates: { hourly: 10 },
    experience: '',
    certificates: [],
    availability: [],
    petAttributes: { acceptedPets: [], workZones: [], maxPets: 1 },
    housekeepingAttributes: { products: 'flexible', equipment: false, waste: false, eco: false },
    medicalSkills: []
};

const OfferService: React.FC<OfferServiceProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1); // 1: Profile, 2: Services Dashboard, 3: Summary
  const [editingCategory, setEditingCategory] = useState<CareCategory | null>(null);
  
  // General Profile Data
  const [profileData, setProfileData] = useState({
    name: '',
    location: '',
    languages: [] as string[],
    photoUrl: '',
  });

  // Specific Data per Service - Initialize all categories
  const [servicesData, setServicesData] = useState<Record<CareCategory, ServiceConfig>>(() => {
      const initial = {} as Record<CareCategory, ServiceConfig>;
      Object.values(CareCategory).forEach(cat => {
          initial[cat] = { ...initialServiceConfig };
      });
      return initial;
  });

  // Photo logic
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // Geolocation Logic
  const [isLocating, setIsLocating] = useState(false);

  // Cleanup stream
  useEffect(() => {
    return () => {
        if (stream) stream.getTracks().forEach(track => track.stop());
    };
  }, [stream]);

  // Attach stream to video
  useEffect(() => {
    if (isCameraActive && videoRef.current && stream) {
        videoRef.current.srcObject = stream;
    }
  }, [isCameraActive, stream]);

  const handleProfileChange = (field: string, value: any) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handleLanguageToggle = (lang: string) => {
    setProfileData(prev => ({
      ...prev,
      languages: prev.languages.includes(lang) 
        ? prev.languages.filter(l => l !== lang) 
        : [...prev.languages, lang]
    }));
  };

  // ---- Service Data Handlers ----

  const handleServiceDataChange = (category: CareCategory, field: keyof ServiceConfig, value: any) => {
      setServicesData(prev => ({
          ...prev,
          [category]: { ...prev[category], [field]: value }
      }));
  };

  const handleRateChange = (category: CareCategory, field: keyof ServiceRates, value: number) => {
      setServicesData(prev => ({
          ...prev,
          [category]: { 
              ...prev[category], 
              rates: { ...prev[category].rates, [field]: value } 
          }
      }));
  };

  const handleTaskToggle = (category: CareCategory, task: string) => {
      const currentTasks = servicesData[category].tasks;
      const newTasks = currentTasks.includes(task) 
        ? currentTasks.filter(t => t !== task) 
        : [...currentTasks, task];
      handleServiceDataChange(category, 'tasks', newTasks);
  };

  const handleAvailabilityToggle = (category: CareCategory, slot: string) => {
      const currentAvailability = servicesData[category].availability || [];
      const newAvailability = currentAvailability.includes(slot) 
        ? currentAvailability.filter(s => s !== slot) 
        : [...currentAvailability, slot];
      handleServiceDataChange(category, 'availability', newAvailability);
  };

  const handleMedicalSkillToggle = (category: CareCategory, skill: string) => {
      const currentSkills = servicesData[category].medicalSkills || [];
      const newSkills = currentSkills.includes(skill)
        ? currentSkills.filter(s => s !== skill)
        : [...currentSkills, skill];
      handleServiceDataChange(category, 'medicalSkills', newSkills);
  };

  // ---- Geolocation Logic ----
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
        alert('La geolocalización no está soportada en este navegador.');
        return;
    }

    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const { latitude, longitude } = position.coords;
            try {
                const response = await fetch(
                    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
                );
                const data = await response.json();
                
                const address = data.address;
                const locationParts = [
                    address.road,
                    address.neighbourhood || address.suburb,
                    address.city || address.town || address.village
                ].filter(Boolean);
                
                const locationStr = locationParts.length > 0 
                    ? locationParts.join(', ') 
                    : `Lat: ${latitude.toFixed(4)}, Lon: ${longitude.toFixed(4)}`;

                handleProfileChange('location', locationStr);
            } catch (error) {
                console.error('Error fetching address:', error);
                handleProfileChange('location', `Lat: ${latitude.toFixed(4)}, Lon: ${longitude.toFixed(4)}`);
            } finally {
                setIsLocating(false);
            }
        },
        (error) => {
            console.error('Error getting location:', error);
            alert('No pudimos obtener tu ubicación. Asegúrate de dar permisos al navegador.');
            setIsLocating(false);
        }
    );
  };

  // ---- Camera Logic ----
  
  const startCamera = async () => {
    try {
        // Try preferred settings
        const mediaStream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'user', width: { ideal: 1280 } } 
        });
        setStream(mediaStream);
        setIsCameraActive(true);
    } catch (err: any) {
        console.warn("Preferred camera constraints failed, retrying with basic config...", err);
        try {
            // Fallback to basic video constraint
            const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
            setStream(mediaStream);
            setIsCameraActive(true);
        } catch (fallbackErr) {
            console.error("Error accessing camera:", fallbackErr);
            alert("No se pudo iniciar la cámara. Por favor, sube una foto de la galería.");
            // Fallback to file input
            cameraInputRef.current?.click();
        }
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
        const context = canvasRef.current.getContext('2d');
        if (context) {
            canvasRef.current.width = videoRef.current.videoWidth;
            canvasRef.current.height = videoRef.current.videoHeight;
            context.translate(canvasRef.current.width, 0);
            context.scale(-1, 1);
            context.drawImage(videoRef.current, 0, 0);
            const dataUrl = canvasRef.current.toDataURL('image/jpeg');
            handleProfileChange('photoUrl', dataUrl);
            
            if (stream) {
                stream.getTracks().forEach(t => t.stop());
                setStream(null);
            }
            setIsCameraActive(false);
        }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files?.[0]) {
          const reader = new FileReader();
          reader.onload = (ev) => handleProfileChange('photoUrl', ev.target?.result);
          reader.readAsDataURL(e.target.files[0]);
      }
  };

  // ---- Navigation & Submit ----

  const handleSaveCategory = () => {
      if (editingCategory) {
          // Validate if needed
          handleServiceDataChange(editingCategory, 'completed', true);
          setEditingCategory(null);
      }
  };

  const nextStep = () => {
      if (step === 1) {
          if (!profileData.name || !profileData.location) return alert("Completa los campos obligatorios.");
          setStep(2);
      } else if (step === 2) {
          const hasCompleted = Object.values(servicesData).some((s: ServiceConfig) => s.completed);
          if (!hasCompleted) return alert("Completa al menos un servicio para continuar.");
          setStep(3);
      } else {
          confirmPublish();
      }
  };

  const prevStep = () => {
      if (editingCategory) {
          setEditingCategory(null); // Close editor
      } else {
          setStep(prev => prev - 1);
      }
  };

  const confirmPublish = () => {
      // Aggregate global availability
      const allAvailabilities = new Set<string>();
      Object.values(servicesData).forEach((s: any) => s.availability?.forEach((a: string) => allAvailabilities.add(a)));

      const finalProfile: ProviderProfile = {
          ...profileData,
          availability: Array.from(allAvailabilities),
          services: servicesData // Use the full servicesData object which tracks completion
      };
      onComplete(finalProfile);
  };

  // ---- Renders ----

  // Step 1: Personal Profile
  const renderProfileForm = () => (
      <div className="space-y-6 animate-fade-in">
          <div className="text-center">
              <h2 className="text-xl font-bold text-slate-800">Sobre ti</h2>
              <p className="text-slate-500 text-sm">Crea un perfil de confianza.</p>
          </div>

          {/* Photo Upload */}
          <div className="flex flex-col items-center">
              <div className="relative w-32 h-32 mb-4">
                  {isCameraActive ? (
                      <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover rounded-full border-4 border-white shadow-lg transform scale-x-[-1]" />
                  ) : (
                      <img 
                          src={profileData.photoUrl || 'https://via.placeholder.com/150?text=?'} 
                          alt="Profile" 
                          className="w-full h-full object-cover rounded-full border-4 border-white shadow-lg bg-slate-100"
                      />
                  )}
                  {!isCameraActive && !profileData.photoUrl && (
                      <div className="absolute inset-0 flex items-center justify-center text-slate-300">
                          <UserCircleIcon className="w-20 h-20" />
                      </div>
                  )}
              </div>
              
              <div className="flex gap-2">
                  {isCameraActive ? (
                      <button onClick={capturePhoto} className="bg-red-500 text-white px-4 py-2 rounded-full text-sm font-bold">Capturar</button>
                  ) : (
                      <>
                          <button onClick={startCamera} className="bg-teal-500 text-white px-4 py-2 rounded-full text-sm font-bold flex items-center"><CameraIcon className="w-4 h-4 mr-1"/> Cámara</button>
                          <button onClick={() => galleryInputRef.current?.click()} className="bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-full text-sm font-bold flex items-center"><PhotoIcon className="w-4 h-4 mr-1"/> Galería</button>
                      </>
                  )}
              </div>
              <input type="file" ref={cameraInputRef} onChange={handleFileChange} accept="image/*" capture="user" className="hidden" />
              <input type="file" ref={galleryInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
              <canvas ref={canvasRef} className="hidden" />
          </div>

          {/* Fields */}
          <div className="space-y-4">
              <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nombre y Apellidos</label>
                  <input type="text" value={profileData.name} onChange={e => handleProfileChange('name', e.target.value)} className="w-full p-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none" placeholder="Ej. Laura Martínez" />
              </div>
              <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Ubicación (Barrio/Ciudad)</label>
                  <div className="relative">
                      <input 
                        type="text" 
                        value={profileData.location} 
                        onChange={e => handleProfileChange('location', e.target.value)} 
                        className="w-full p-3 pl-10 pr-12 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none" 
                        placeholder="Ej. Chamberí, Madrid" 
                      />
                      <MapPinIcon className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                      
                      <button
                        type="button"
                        onClick={handleDetectLocation}
                        className="absolute right-2 top-2 p-1.5 text-teal-500 hover:bg-teal-50 rounded-lg transition-colors"
                        title="Detectar mi ubicación"
                        disabled={isLocating}
                      >
                        {isLocating ? (
                            <div className="w-5 h-5 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <GpsFixedIcon className="w-5 h-5" />
                        )}
                      </button>
                  </div>
              </div>
              
              <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Idiomas</label>
                  <div className="flex flex-wrap gap-2">
                      {languagesList.map(lang => (
                          <button 
                              key={lang} 
                              onClick={() => handleLanguageToggle(lang)}
                              className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${profileData.languages.includes(lang) ? 'bg-teal-50 border-teal-500 text-teal-700' : 'bg-white border-slate-200 text-slate-600'}`}
                          >
                              {lang}
                          </button>
                      ))}
                  </div>
              </div>
          </div>
      </div>
  );

  // Step 2: Services Dashboard
  const renderServicesDashboard = () => (
      <div className="space-y-6 animate-fade-in">
          <div className="text-center">
              <h2 className="text-xl font-bold text-slate-800">¿Qué servicios quieres ofrecer?</h2>
              <p className="text-slate-500 text-sm mt-1">Configura uno o varios servicios.</p>
          </div>
          <div className="grid grid-cols-1 gap-4">
              {serviceCategories.map(cat => {
                  const isCompleted = servicesData[cat.id].completed;
                  return (
                      <button
                          key={cat.id}
                          onClick={() => setEditingCategory(cat.id)}
                          className={`p-4 rounded-xl border-2 flex items-center text-left transition-all relative ${
                              isCompleted 
                              ? 'bg-white border-teal-500 shadow-sm' 
                              : 'bg-white border-slate-100 hover:border-slate-300'
                          }`}
                      >
                          <div className={`p-3 rounded-full mr-4 ${isCompleted ? 'bg-teal-50 text-teal-600' : 'bg-slate-50 text-slate-400'}`}>
                              <cat.icon className="w-6 h-6" />
                          </div>
                          <div className="flex-grow">
                              <h3 className={`font-bold ${isCompleted ? 'text-teal-900' : 'text-slate-700'}`}>{cat.label}</h3>
                              <p className="text-xs text-slate-500 mt-0.5">{isCompleted ? 'Completado' : 'Toque para configurar'}</p>
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
      const catInfo = serviceCategories.find(c => c.id === category);

      return (
          <div className="space-y-6 animate-slide-up">
              <div className={`flex items-center justify-between p-4 rounded-xl ${catInfo?.bg} border ${catInfo?.border} mb-6`}>
                  <div className="flex items-center">
                      <div className={`p-2 rounded-full bg-white/50 mr-3 ${catInfo?.color}`}>
                          {catInfo && <catInfo.icon className="w-6 h-6" />}
                      </div>
                      <h3 className={`font-bold text-lg ${catInfo?.color?.replace('text', 'text-slate')}`}>Editando: {catInfo?.label}</h3>
                  </div>
              </div>

              {/* Rates */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <div className="grid grid-cols-2 gap-4">
                      <div>
                          <label className="block text-sm font-bold text-slate-700 mb-1">Precio Hora</label>
                          <div className="relative">
                              <input 
                                type="number" 
                                value={config.rates.hourly || ''} 
                                onChange={e => handleRateChange(category, 'hourly', e.target.value === '' ? 0 : parseFloat(e.target.value))} 
                                className="w-full p-3 pl-8 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none" 
                              />
                              <CurrencyEuroIcon className="absolute left-2.5 top-3.5 w-5 h-5 text-slate-400" />
                          </div>
                      </div>
                      {category !== CareCategory.HOUSEKEEPING && (
                          <div>
                              <label className="block text-sm font-bold text-slate-700 mb-1">Precio Turno</label>
                              <div className="relative">
                                  <input 
                                    type="number" 
                                    value={config.rates.shift || ''} 
                                    onChange={e => handleRateChange(category, 'shift', e.target.value === '' ? 0 : parseFloat(e.target.value))} 
                                    placeholder="Opcional" 
                                    className="w-full p-3 pl-8 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none" 
                                  />
                                  <CurrencyEuroIcon className="absolute left-2.5 top-3.5 w-5 h-5 text-slate-400" />
                              </div>
                          </div>
                      )}
                  </div>
              </div>

              {/* Description */}
              <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Tu experiencia</label>
                  <textarea 
                      value={config.description || ''} 
                      onChange={e => handleServiceDataChange(category, 'description', e.target.value)} 
                      className="w-full p-3 bg-white border border-slate-300 rounded-xl h-32 focus:ring-2 focus:ring-teal-500 outline-none text-sm" 
                      placeholder={`Describe tu experiencia cuidando ${catInfo?.label.toLowerCase()}...`}
                  />
              </div>

              {/* Availability (Per Service) */}
              <div>
                  <label className="text-sm font-bold text-slate-700 mb-2 flex items-center">
                      <ClockIcon className="w-4 h-4 mr-1 text-teal-600" /> Disponibilidad para este servicio
                  </label>
                  <div className="flex flex-wrap gap-2">
                      {availabilitySlots.map(slot => (
                          <button 
                              key={slot} 
                              onClick={() => handleAvailabilityToggle(category, slot)}
                              className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${config.availability?.includes(slot) ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-white border-slate-200 text-slate-600'}`}
                          >
                              {slot}
                          </button>
                      ))}
                  </div>
              </div>

              {/* Medical Skills (Elderly Only) */}
              {category === CareCategory.ELDERLY && (
                  <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                      <h4 className="font-bold text-red-800 text-sm mb-3 flex items-center"><HealthIcon className="w-4 h-4 mr-1"/> Especialización y Patologías</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {MEDICAL_SKILLS.map(skill => (
                              <label key={skill} className="flex items-center space-x-2 cursor-pointer bg-white p-2 rounded border border-red-100">
                                  <input 
                                      type="checkbox" 
                                      checked={config.medicalSkills?.includes(skill)} 
                                      onChange={() => handleMedicalSkillToggle(category, skill)} 
                                      className="rounded text-red-600 focus:ring-red-500" 
                                  />
                                  <span className="text-xs font-medium text-slate-700">{skill}</span>
                              </label>
                          ))}
                      </div>
                  </div>
              )}

              {/* Tasks */}
              <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">¿Qué incluyes?</label>
                  <div className="flex flex-wrap gap-2">
                      {SERVICE_TASKS[category].map(task => (
                          <button 
                              key={task} 
                              onClick={() => handleTaskToggle(category, task)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${config.tasks.includes(task) ? 'bg-teal-50 border-teal-500 text-teal-700' : 'bg-white border-slate-200 text-slate-600'}`}
                          >
                              {task}
                          </button>
                      ))}
                  </div>
              </div>
          </div>
      );
  };

  // Step 3: Review
  const renderReview = () => {
      const completedServices = Object.keys(servicesData).filter(k => servicesData[k as CareCategory].completed) as CareCategory[];
      
      return (
        <div className="space-y-6 animate-fade-in">
            <div className="text-center">
                <h2 className="text-xl font-bold text-slate-800">Revisa tu perfil</h2>
                <p className="text-slate-500 text-sm">Así te verán los clientes.</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-teal-500 h-20 relative"></div>
                <div className="px-4 pb-4 -mt-10 relative">
                    <img src={profileData.photoUrl || 'https://via.placeholder.com/150'} className="w-20 h-20 rounded-full border-4 border-white shadow-md object-cover" alt="Me" />
                    <div className="mt-2">
                        <h3 className="font-bold text-lg text-slate-800">{profileData.name}</h3>
                        <div className="flex items-center text-slate-500 text-sm">
                            <MapPinIcon className="w-4 h-4 mr-1" /> {profileData.location}
                        </div>
                    </div>
                </div>
                
                <div className="px-4 pb-4 space-y-4">
                    {completedServices.map(cat => {
                        const config = servicesData[cat];
                        const catInfo = serviceCategories.find(c => c.id === cat);
                        
                        if (!catInfo) return null;

                        return (
                            <div key={cat} className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                                <div className="flex justify-between items-center mb-2">
                                    <div className="flex items-center">
                                        <catInfo.icon className={`w-5 h-5 mr-2 ${catInfo.color}`} />
                                        <span className="font-bold text-slate-700 text-sm">{catInfo.label}</span>
                                    </div>
                                    <span className="font-bold text-teal-600 text-sm">{config.rates.hourly}€/h</span>
                                </div>
                                {config.availability && config.availability.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-2 mb-2">
                                        {config.availability.map(slot => (
                                            <span key={slot} className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{slot}</span>
                                        ))}
                                    </div>
                                )}
                                <div className="flex flex-wrap gap-1">
                                    {config.tasks.slice(0, 3).map(t => (
                                        <span key={t} className="text-[10px] bg-white border border-slate-200 text-slate-500 px-2 py-0.5 rounded-full">{t}</span>
                                    ))}
                                    {config.tasks.length > 3 && <span className="text-[10px] text-slate-400 px-1">+{config.tasks.length - 3} más</span>}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
      );
  };

  return (
    <div className="fixed inset-0 bg-slate-50 z-50 flex flex-col animate-fade-in">
      {/* Stepper Header */}
      <div className="bg-white border-b border-slate-200 p-4 pt-safe-top">
          <div className="flex items-center justify-between mb-4">
              <h1 className="text-lg font-bold text-slate-800">
                  {step === 1 ? 'Perfil Personal' : step === 2 ? (editingCategory ? 'Configuración' : 'Mis Servicios') : 'Resumen'}
              </h1>
              <span className="text-sm font-medium text-teal-600">{step} de 3</span>
          </div>
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div 
                  className="h-full bg-teal-500 transition-all duration-300 ease-out rounded-full"
                  style={{ width: `${(step / 3) * 100}%` }}
              ></div>
          </div>
      </div>

      <main className="flex-grow overflow-y-auto p-4 pb-24">
          {step === 1 && renderProfileForm()}
          {step === 2 && (editingCategory ? renderServiceEditor(editingCategory) : renderServicesDashboard())}
          {step === 3 && renderReview()}
      </main>

      <footer className="bg-white border-t border-slate-200 p-4 safe-area-bottom flex justify-between items-center">
          <button onClick={prevStep} className="px-6 py-3 text-slate-600 font-bold hover:bg-slate-50 rounded-xl transition-colors">
              {editingCategory ? 'Cancelar' : (step > 1 ? 'Atrás' : '')}
          </button>
          
          {editingCategory ? (
              <button 
                  onClick={handleSaveCategory}
                  className="px-8 py-3 bg-teal-500 text-white font-bold rounded-xl hover:bg-teal-600 transition-colors shadow-lg shadow-teal-500/30 flex items-center"
              >
                  Guardar y Volver <CheckCircleIcon className="w-5 h-5 ml-2" />
              </button>
          ) : (
              <button 
                  onClick={step === 3 ? confirmPublish : nextStep}
                  className="px-8 py-3 bg-teal-500 text-white font-bold rounded-xl hover:bg-teal-600 transition-colors shadow-lg shadow-teal-500/30 flex items-center"
              >
                  {step === 3 ? 'Publicar Perfil' : 'Siguiente'}
                  {step < 3 && <ChevronRightIcon className="w-5 h-5 ml-2" />}
              </button>
          )}
      </footer>
    </div>
  );
};

export default OfferService;
