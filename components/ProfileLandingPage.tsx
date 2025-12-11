
import React from 'react';
import PageHeader from './PageHeader';
import UserCircleIcon from './icons/UserCircleIcon';
import HeartIcon from './icons/HeartIcon';
import ChatBubbleLeftRightIcon from './icons/ChatBubbleLeftRightIcon';
import CalendarDaysIcon from './icons/CalendarDaysIcon';
import ChevronRightIcon from './icons/ChevronRightIcon';

interface ProfileLandingPageProps {
  onStart: () => void;
  onLogin: () => void;
  onBack: () => void;
}

const FeatureItem: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({ icon, title, description }) => (
  <div className="flex items-start space-x-4 p-4 bg-white rounded-xl border border-slate-100 shadow-sm">
    <div className="bg-teal-50 p-2 rounded-lg text-teal-600 shrink-0">
      {icon}
    </div>
    <div>
      <h3 className="font-bold text-slate-800 text-sm">{title}</h3>
      <p className="text-xs text-slate-500 mt-1 leading-relaxed">{description}</p>
    </div>
  </div>
);

const ProfileLandingPage: React.FC<ProfileLandingPageProps> = ({ onStart, onLogin, onBack }) => {
  return (
    <div className="bg-slate-50 min-h-screen flex flex-col">
      <PageHeader title="Tu Perfil" onBack={onBack} />
      
      <main className="flex-grow overflow-y-auto px-6 py-8 pb-32">
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-block p-4 bg-white rounded-full shadow-md mb-4 ring-4 ring-teal-50">
            <UserCircleIcon className="w-16 h-16 text-teal-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Bienvenido a tu espacio</h2>
          <p className="text-slate-600 text-sm max-w-xs mx-auto">
            Crea tu perfil para sacar el máximo partido a Cuidamet. Es gratis y rápido.
          </p>
        </div>

        <div className="space-y-3 mb-8 animate-fade-in">
          <FeatureItem 
            icon={<HeartIcon className="w-6 h-6" />} 
            title="Guarda tus favoritos" 
            description="Crea tu lista de cuidadores de confianza para tenerlos siempre a mano."
          />
          <FeatureItem 
            icon={<ChatBubbleLeftRightIcon className="w-6 h-6" />} 
            title="Contacta directamente" 
            description="Envía mensajes y chatea con los cuidadores antes de reservar."
          />
          <FeatureItem 
            icon={<CalendarDaysIcon className="w-6 h-6" />} 
            title="Gestiona tus reservas" 
            description="Lleva el control de tus citas y pagos desde un solo lugar."
          />
        </div>

        <div className="space-y-4 animate-fade-in">
          <button 
            onClick={onStart}
            className="w-full bg-teal-500 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-teal-500/20 hover:bg-teal-600 transition-all flex items-center justify-center group"
          >
            Crear mi perfil
            <ChevronRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </button>
          
          <div className="text-center">
            <p className="text-sm text-slate-500 mb-2">¿Ya tienes una cuenta?</p>
            <button 
              onClick={onLogin}
              className="text-teal-600 font-bold text-sm hover:underline px-4 py-2 rounded-lg hover:bg-teal-50 transition-colors"
            >
              Iniciar Sesión
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProfileLandingPage;
