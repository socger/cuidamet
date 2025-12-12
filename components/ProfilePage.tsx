
import React from 'react';
import HeartIcon from './icons/HeartIcon';
import Cog6ToothIcon from './icons/Cog6ToothIcon';
import ArrowRightOnRectangleIcon from './icons/ArrowRightOnRectangleIcon';
import ChevronRightIcon from './icons/ChevronRightIcon';
import ChatBubbleLeftRightIcon from './icons/ChatBubbleLeftRightIcon';
import InformationCircleIcon from './icons/InformationCircleIcon';
import { ClientProfile, CareCategory } from '../types';
import ElderlyIcon from './icons/ElderlyIcon';
import ChildIcon from './icons/ChildIcon';
import PetIcon from './icons/PetIcon';
import CleaningIcon from './icons/CleaningIcon';
import BriefcaseIcon from './icons/BriefcaseIcon';
import PageHeader from './PageHeader';

interface ProfilePageProps {
  clientProfile: ClientProfile | null;
  onNavigateFavorites: () => void;
  onNavigateSettings: () => void;
  onNavigateSupport: () => void;
  onNavigateSupportChat: () => void;
  onSwitchToProvider: () => void;
  onBack: () => void;
}

interface ListItemProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  highlight?: boolean;
}

const ListItem: React.FC<ListItemProps> = ({ icon, label, onClick, highlight }) => (
  <li className="border-b border-slate-200 last:border-b-0">
    <button
      onClick={onClick}
      className={`w-full flex items-center py-4 text-left hover:bg-slate-100 px-4 transition-colors ${highlight ? 'bg-amber-50/50' : ''}`}
    >
      <div className={highlight ? 'text-amber-500' : 'text-slate-600'}>{icon}</div>
      <span className={`ml-4 flex-grow font-medium ${highlight ? 'text-amber-800' : 'text-slate-700'}`}>{label}</span>
      <ChevronRightIcon className="w-5 h-5 text-slate-400" />
    </button>
  </li>
);

const ProfilePage: React.FC<ProfilePageProps> = ({ 
  clientProfile,
  onNavigateFavorites, 
  onNavigateSettings, 
  onNavigateSupport,
  onNavigateSupportChat,
  onSwitchToProvider,
  onBack
}) => {
  
  // Default guest data if no client profile exists
  const displayProfile = clientProfile || {
      name: 'Usuario Invitado',
      photoUrl: 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?q=80&w=400&auto=format&fit=crop', // Generic placeholder
      email: '',
      phone: '',
      preferences: []
  };

  const getCategoryIcon = (cat: CareCategory) => {
      switch(cat) {
          case CareCategory.ELDERLY: return <ElderlyIcon className="w-5 h-5" />;
          case CareCategory.CHILDREN: return <ChildIcon className="w-5 h-5" />;
          case CareCategory.PETS: return <PetIcon className="w-5 h-5" />;
          case CareCategory.HOUSEKEEPING: return <CleaningIcon className="w-5 h-5" />;
          default: return null;
      }
  };

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col">
        <PageHeader title="Mi Perfil" onBack={onBack} />
        <main className="container mx-auto px-4 py-6 pb-36 flex-grow">
            {/* User Info Header */}
            <div className="flex items-center space-x-4 py-6 px-2">
                <div className="relative">
                    <img
                        src={displayProfile.photoUrl}
                        alt="User Avatar"
                        className="w-16 h-16 rounded-full object-cover border-2 shadow-md border-white"
                    />
                </div>
                <div>
                    <div className="flex items-center">
                        <h2 className="text-xl font-bold text-slate-800">{displayProfile.name}</h2>
                    </div>
                    <p className="text-sm text-teal-600 font-medium bg-teal-50 px-2 py-0.5 rounded-full inline-block mt-1">Perfil Familiar</p>
                </div>
            </div>

            {/* Preferences / Needs Section */}
            {displayProfile.preferences.length > 0 && (
                <div className="mb-6 px-2">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Mis necesidades</h3>
                    <div className="flex space-x-2">
                        {displayProfile.preferences.map(pref => (
                            <div key={pref} className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-500 shadow-sm border border-slate-200" title={pref}>
                                {getCategoryIcon(pref)}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* CUENTA Section */}
            <div className="mt-2">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-4">
                CUENTA
                </h3>
                <ul className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <ListItem
                        icon={<BriefcaseIcon className="w-6 h-6" />}
                        label="Cambiar a modo Cuidador"
                        onClick={onSwitchToProvider}
                    />
                    <ListItem
                        icon={<HeartIcon className="w-6 h-6" />}
                        label="Favoritos"
                        onClick={onNavigateFavorites}
                    />
                     <ListItem
                        icon={<Cog6ToothIcon className="w-6 h-6" />}
                        label="Configuración"
                        onClick={onNavigateSettings}
                    />
                </ul>
            </div>

            {/* CUIDAMET AL HABLA Section */}
            <div className="mt-8">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-4">
                CUIDAMET AL HABLA
                </h3>
                <ul className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <ListItem
                        icon={<ChatBubbleLeftRightIcon className="w-6 h-6" />}
                        label="Chat de soporte"
                        onClick={onNavigateSupportChat}
                    />
                    <ListItem
                        icon={<InformationCircleIcon className="w-6 h-6" />}
                        label="¿Necesitas ayuda?"
                        onClick={onNavigateSupport}
                    />
                </ul>
            </div>
            
             {/* Logout Button */}
            <div className="mt-10 px-2">
                <button
                onClick={() => alert('Cerrando sesión...')}
                className="w-full flex items-center justify-center py-3 text-center text-red-500 font-medium hover:bg-red-50 rounded-xl transition-colors border border-transparent hover:border-red-100"
                >
                <ArrowRightOnRectangleIcon className="w-6 h-6 mr-2" />
                Cerrar Sesión
                </button>
            </div>

        </main>
    </div>
  );
};

export default ProfilePage;