
import React from 'react';
import PageHeader from './PageHeader';
import HandRaisedIcon from './icons/HandRaisedIcon';
import SearchIcon from './icons/SearchIcon';
import ChevronRightIcon from './icons/ChevronRightIcon';
import Resumen_PersonalInfo from './profiles/resumenProfile/Resumen_PersonalInfo';
import { tokenStorage } from '../services/authService';
import defaultUserAvatar from '../resources/images/default-user-avatar.jpg';

interface RoleSelectionProps {
  onSelectProvider: () => void;
  onSelectSeeker: () => void;
  onBack: () => void;
  isAuthenticated?: boolean;
  onLogout?: () => void;
}

const RoleSelection: React.FC<RoleSelectionProps> = ({ 
  onSelectProvider, 
  onSelectSeeker, 
  onBack,
  isAuthenticated = false,
  onLogout
}) => {
  // Obtener datos del usuario autenticado
  const user = isAuthenticated ? tokenStorage.getUser() : null;
  
  // Construir el nombre completo del usuario
  const userName = user 
    ? [user.firstName, user.lastName].filter(Boolean).join(' ') || user.username || 'Usuario'
    : 'Usuario';
  
  // Datos básicos del usuario (sin perfil creado aún)
  const userPhone = user?.phone || user?.username || 'Pendiente de completar';
  const userLocation = user?.location;
  const userLanguages = user?.languages || [];
  
  return (
    <div className="fixed inset-0 bg-slate-50 z-50 flex flex-col animate-fade-in">
      <PageHeader title="Selecciona tu perfil" onBack={onBack} />
      
      <main className="flex-1 overflow-y-auto px-6 pt-8 pb-28">
        {/* Mostrar información del usuario solo si está autenticado */}
        {isAuthenticated && user && (
          <div className="max-w-2xl mx-auto mb-6 bg-white rounded-2xl shadow-md overflow-hidden">
            <Resumen_PersonalInfo
              photoUrl={defaultUserAvatar}
              name={userName}
              phone={userPhone}
              email={user.email}
              location={userLocation}
              languages={userLanguages}
              onLogout={onLogout}
            />
          </div>
        )}
        
        <div className="text-center mb-8">
             <h2 className="text-2xl font-bold text-slate-800">¿Qué deseas hacer hoy?</h2>
             <p className="text-slate-600 mt-2">Elige cómo quieres usar Cuidamet.</p>
        </div>

        <div className="space-y-6 max-w-2xl mx-auto">
        {/* Seeker Option */}
        <button 
            onClick={onSelectSeeker}
            className="relative group overflow-hidden bg-white rounded-3xl p-6 border border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 text-left w-full"
        >
             <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                 <SearchIcon className="w-32 h-32 text-teal-600" />
             </div>
             <div className="relative z-10">
                 <div className="w-14 h-14 bg-teal-100 rounded-2xl flex items-center justify-center mb-4 text-teal-600 group-hover:bg-teal-500 group-hover:text-white transition-colors">
                     <SearchIcon className="w-8 h-8" />
                 </div>
                 <h3 className="text-xl font-bold text-slate-800 mb-2">Crea tu perfil familiar</h3>
                 <p className="text-slate-600 text-sm leading-relaxed mb-4">
                     Encuentra y contrata a profesionales de confianza para tus necesidades.
                 </p>
                 <div className="flex items-center text-teal-600 font-semibold text-sm group-hover:translate-x-2 transition-transform">
                     ¿Empezamos? <ChevronRightIcon className="w-4 h-4 ml-1" />
                 </div>
             </div>
        </button>

        {/* Provider Option */}
        <button 
            onClick={onSelectProvider}
            className="relative group overflow-hidden bg-white rounded-3xl p-6 border border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 text-left w-full"
        >
             <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                 <HandRaisedIcon className="w-32 h-32 text-blue-600" />
             </div>
             <div className="relative z-10">
                 <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-4 text-blue-600 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                     <HandRaisedIcon className="w-8 h-8" />
                 </div>
                 <h3 className="text-xl font-bold text-slate-800 mb-2">Crea tu perfil profesional</h3>
                 <p className="text-slate-600 text-sm leading-relaxed mb-4">
                     Ofrece tus servicios, gestiona tu disponibilidad y revisa tus reservas.
                 </p>
                 <div className="flex items-center text-blue-600 font-semibold text-sm group-hover:translate-x-2 transition-transform">
                     ¿Empezamos? <ChevronRightIcon className="w-4 h-4 ml-1" />
                 </div>
             </div>
        </button>
        </div>
      </main>
    </div>
  );
};

export default RoleSelection;
