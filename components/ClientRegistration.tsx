
import React, { useState } from 'react';
import ChevronRightIcon from './icons/ChevronRightIcon';
import ChevronLeftIcon from './icons/ChevronLeftIcon';
import CheckCircleIcon from './icons/CheckCircleIcon';
import PhoneIcon from './icons/PhoneIcon';
import PhotoCapture from './PhotoCapture';
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
      {/* Stepper Header */}
      <div className="bg-white border-b border-slate-200 p-4 pt-safe-top">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-lg font-bold text-slate-800">
            {step === 1 ? "Crea tu Perfil" : "Preferencias"}
          </h1>
          <span className="text-sm font-medium text-teal-600">{step} de 2</span>
        </div>
        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-teal-500 transition-all duration-300 ease-out rounded-full"
            style={{ width: `${(step / 2) * 100}%` }}
          ></div>
        </div>
      </div>
      
      <main className="flex-grow overflow-y-auto px-6 py-6 pb-6">
        <div className="container mx-auto max-w-md pb-24">
            {step === 1 && (
            <div className="space-y-6 animate-fade-in">
                {/* Camera / Photo Section */}
                <PhotoCapture 
                  photoUrl={photoUrl}
                  onPhotoChange={setPhotoUrl}
                  title="Añade tu foto de perfil"
                  subtitle="Una buena foto genera confianza. Asegúrate de que se vea bien tu rostro."
                  size="large"
                />

                {/* Form Fields */}
                <div className="space-y-4 pt-2">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Nombre y apellidos</label>
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
            
            {/* Navigation Buttons - Sticky al final del contenido visible */}
            <div className="mt-8 bg-white border-t border-slate-200 p-4 rounded-xl shadow-sm flex justify-between items-center sticky bottom-20">
              <button 
                onClick={() => setStep(1)}
                className="px-6 py-3 text-slate-600 font-bold hover:bg-slate-50 rounded-xl transition-colors"
              >
                {step > 1 ? 'Atrás' : ''}
              </button>
              
              <button 
                onClick={handleNext}
                disabled={!isStepValid()}
                className="px-8 py-3 bg-teal-500 text-white font-bold rounded-xl hover:bg-teal-600 transition-colors shadow-lg shadow-teal-500/30 flex items-center disabled:bg-slate-300 disabled:shadow-none"
              >
                {step === 1 ? 'Siguiente' : 'Finalizar Registro'} 
                {step === 1 && <ChevronRightIcon className="w-5 h-5 ml-2" />}
              </button>
            </div>
        </div>
      </main>
    </div>
  );
};

export default ClientRegistration;
