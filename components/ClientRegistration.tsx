
import React, { useState, useRef, useEffect } from 'react';
import CameraIcon from './icons/CameraIcon';
import PhotoIcon from './icons/PhotoIcon';
import UserCircleIcon from './icons/UserCircleIcon';
import ChevronRightIcon from './icons/ChevronRightIcon';
import CheckCircleIcon from './icons/CheckCircleIcon';
import PhoneIcon from './icons/PhoneIcon';
import PageHeader from './PageHeader';
import { CareCategory, ClientProfile } from '../types';

interface ClientRegistrationProps {
  onComplete: (profileData: ClientProfile) => void;
  onBack: () => void;
}

const serviceCategories = [
    { id: CareCategory.ELDERLY, label: 'Mayores', icon: '/resources/icons/elderly-female-icon.svg', color: 'text-green-600', bg: 'bg-green-100', border: 'border-green-200' },
    { id: CareCategory.CHILDREN, label: 'Niños', icon: '/resources/icons/baby-girl-icon.svg', color: 'text-slate-600', bg: 'bg-slate-200', border: 'border-slate-300' },
    { id: CareCategory.PETS, label: 'Mascotas', icon: '/resources/icons/dog-puppy-face-icon.svg', color: 'text-orange-600', bg: 'bg-orange-100', border: 'border-orange-200' },
    { id: CareCategory.HOUSEKEEPING, label: 'Limpieza', icon: '/resources/icons/housekeeping-icon.svg', color: 'text-blue-600', bg: 'bg-blue-100', border: 'border-blue-200' }
];

const ClientRegistration: React.FC<ClientRegistrationProps> = ({ onComplete, onBack }) => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<CareCategory[]>([]);
  
  // Camera & Photo Logic State
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // Cleanup stream on unmount
  useEffect(() => {
    return () => {
        if (stream) stream.getTracks().forEach(track => track.stop());
    };
  }, [stream]);

  // Attach stream to video element
  useEffect(() => {
    if (isCameraActive && videoRef.current && stream) {
        videoRef.current.srcObject = stream;
    }
  }, [isCameraActive, stream]);

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

  const stopCamera = () => {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const context = canvas.getContext('2d');
        if (context) {
            // Mirror effect
            context.translate(canvas.width, 0);
            context.scale(-1, 1);
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL('image/png');
            setPhotoUrl(dataUrl);
            stopCamera();
        }
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        if (!validTypes.includes(file.type) || file.size > 5 * 1024 * 1024) {
            alert('El archivo debe ser JPG o PNG y menor de 5MB.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            if (event.target?.result) {
                setPhotoUrl(event.target.result as string);
            }
        };
        reader.readAsDataURL(e.target.files[0]);
    }
  };

  const toggleCategory = (id: CareCategory) => {
    setSelectedCategories(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isValidPhone = (phone: string): boolean => {
    // Valida teléfonos españoles: 9 dígitos, puede empezar con +34 o 0034, permite espacios y guiones
    const phoneRegex = /^(\+34|0034)?\s?[6-9]\d{1}\s?\d{3}\s?\d{3}$|^(\+34|0034)?\s?[6-9]\d{8}$/;
    return phoneRegex.test(phone.trim());
  };

  const isStepValid = (): boolean => {
    if (step === 1) {
      return name.trim() !== '' && email.trim() !== '' && isValidEmail(email) && phone.trim() !== '' && isValidPhone(phone);
    }
    return true;
  };

  const handleNext = () => {
    if (step === 1) {
        if (!isStepValid()) return;
        if (isCameraActive) stopCamera();
        setStep(2);
    } else if (step === 2) {
       const profile: ClientProfile = {
        name,
        email,
        phone,
        photoUrl: photoUrl || 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?q=80&w=200', // Fallback image
        preferences: selectedCategories
      };
      onComplete(profile);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-50 z-50 flex flex-col animate-fade-in">
      <PageHeader 
        title={step === 1 ? "Crea tu Perfil" : "Preferencias"} 
        onBack={step === 1 ? () => { if(isCameraActive) stopCamera(); onBack(); } : () => setStep(1)} 
      />
      
      <main className="flex-grow overflow-y-auto px-6 py-6 pb-6">
        <div className="container mx-auto max-w-md pb-24">
            {step === 1 && (
            <div className="space-y-6 animate-fade-in">
                <div className="text-center">
                    <h2 className="text-xl font-bold text-slate-800">Añade tu foto de perfil</h2>
                    <p className="text-slate-600 text-sm mt-1">Una buena foto genera confianza. Asegúrate de que se vea bien tu rostro.</p>
                </div>

                {/* Camera / Photo Section */}
                <div className="flex flex-col items-center">
                    <div className="relative w-48 h-48 mb-6">
                        <div className="w-full h-full rounded-full border-[5px] border-white shadow-xl overflow-hidden bg-slate-100 flex items-center justify-center relative z-10 ring-1 ring-slate-200">
                            {isCameraActive ? (
                                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover transform scale-x-[-1]" />
                            ) : photoUrl ? (
                                <img src={photoUrl} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <UserCircleIcon className="w-32 h-32 text-slate-300" />
                            )}
                        </div>
                    </div>

                    {/* Hidden Inputs and Canvas */}
                    <input type="file" ref={cameraInputRef} onChange={handlePhotoChange} className="hidden" accept="image/*" capture="user" />
                    <input type="file" ref={galleryInputRef} onChange={handlePhotoChange} className="hidden" accept="image/*" />
                    <canvas ref={canvasRef} className="hidden" />

                    {/* Buttons */}
                    <div className="w-full space-y-3">
                        {!isCameraActive ? (
                            <>
                                <button 
                                    onClick={startCamera} 
                                    className="w-full bg-teal-500 text-white py-3 rounded-xl font-semibold flex items-center justify-center hover:bg-teal-600 transition-colors shadow-md"
                                >
                                    <CameraIcon className="w-5 h-5 mr-2" /> Usar Cámara
                                </button>
                                <button 
                                    onClick={() => galleryInputRef.current?.click()} 
                                    className="w-full bg-white border-2 border-teal-500 text-teal-600 py-3 rounded-xl font-semibold flex items-center justify-center hover:bg-teal-50 transition-colors"
                                >
                                    <PhotoIcon className="w-5 h-5 mr-2" /> Elegir de la Galería
                                </button>
                            </>
                        ) : (
                            <div className="flex gap-3 w-full">
                                <button 
                                    onClick={stopCamera} 
                                    className="flex-1 bg-slate-200 text-slate-700 py-3 rounded-xl font-semibold hover:bg-slate-300 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button 
                                    onClick={capturePhoto} 
                                    className="flex-1 bg-teal-500 text-white py-3 rounded-xl font-semibold hover:bg-teal-600 transition-colors shadow-md"
                                >
                                    Capturar
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Form Fields */}
                <div className="space-y-4 pt-2">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Nombre Completo</label>
                        <input 
                            type="text" 
                            value={name} 
                            onChange={(e) => setName(e.target.value)} 
                            placeholder="Ej. María García"
                            className="w-full bg-white p-3.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none text-slate-800"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                        <input 
                            type="email" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            placeholder="tu-email@ejemplo.com"
                            className={`w-full bg-white p-3.5 border rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none text-slate-800 ${
                              email && !isValidEmail(email) ? 'border-red-500' : 'border-slate-300'
                            }`}
                        />
                        {email && !isValidEmail(email) && (
                          <p className="text-red-500 text-sm mt-1">Por favor, introduce un email válido</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Teléfono</label>
                        <div className="relative">
                            <input 
                                type="tel" 
                                value={phone} 
                                onChange={(e) => setPhone(e.target.value)} 
                                placeholder="600 000 000"
                                className={`w-full bg-white p-3.5 pl-12 border rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none text-slate-800 ${
                                  phone && !isValidPhone(phone) ? 'border-red-500' : 'border-slate-300'
                                }`}
                            />
                            <PhoneIcon className="absolute top-1/2 left-4 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        </div>
                        {phone && !isValidPhone(phone) && (
                          <p className="text-red-500 text-sm mt-1">Por favor, introduce un teléfono válido (9 dígitos)</p>
                        )}
                    </div>
                </div>
            </div>
            )}

            {step === 2 && (
            <div className="space-y-6 animate-fade-in">
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-slate-800">¿Qué estás buscando?</h2>
                    <p className="text-slate-600 mt-2">Selecciona los servicios que te interesan (puedes cambiarlo luego).</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    {serviceCategories.map(cat => {
                        const isSelected = selectedCategories.includes(cat.id);
                        return (
                            <button
                                key={cat.id}
                                onClick={() => toggleCategory(cat.id)}
                                className={`relative p-4 rounded-2xl border-2 transition-all duration-200 flex flex-col items-center justify-center text-center h-36 ${
                                    isSelected 
                                    ? `${cat.bg} ${cat.border} ring-1 ring-offset-1 ring-teal-500` 
                                    : 'bg-white border-slate-100 hover:border-slate-200 hover:shadow-sm'
                                }`}
                            >
                                {isSelected && (
                                    <div className="absolute top-2 right-2 text-teal-600">
                                        <CheckCircleIcon className="w-6 h-6" />
                                    </div>
                                )}
                                <div className={`p-3 rounded-full mb-3 ${isSelected ? 'bg-white/50' : 'bg-slate-50'} ${cat.color}`}>
                                    <img src={cat.icon} alt={cat.label} className="w-8 h-8 opacity-70" />
                                </div>
                                <span className={`font-bold ${isSelected ? 'text-slate-800' : 'text-slate-600'}`}>{cat.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>
            )}
            
            {/* Botón Siguiente - Sticky al final del contenido visible */}
            <div className="mt-8 bg-white border-t border-slate-200 p-4 rounded-xl shadow-sm sticky bottom-20">
              <button 
                onClick={handleNext}
                disabled={!isStepValid()}
                className="w-full bg-teal-500 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-teal-500/20 hover:bg-teal-600 transition-all disabled:bg-slate-300 disabled:shadow-none flex items-center justify-center"
              >
                {step === 1 ? 'Siguiente' : 'Finalizar Registro'} 
                {step === 1 && <ChevronRightIcon className="w-5 h-5 ml-2 stroke-2" />}
              </button>
            </div>
        </div>
      </main>
    </div>
  );
};

export default ClientRegistration;
