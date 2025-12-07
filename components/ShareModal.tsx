import React, { useState } from 'react';
import XMarkIcon from './icons/XMarkIcon';
import StarIcon from './icons/StarIcon';
import LocationPinIcon from './icons/LocationPinIcon';
import { Provider } from '../types';
import AlertModal from './AlertModal';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  provider: Provider;
}

const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, provider }) => {
  const [alertModal, setAlertModal] = useState<{ isOpen: boolean; message: string; title?: string }>({ isOpen: false, message: '' });
  
  if (!isOpen) return null;

  const profileUrl = `${window.location.origin}?provider=${provider.id}`;
  const shareText = `¡Mira el perfil de ${provider.name} en Cuidamet!`;

  const handleWhatsAppShare = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${shareText} ${profileUrl}`)}`;
    window.open(whatsappUrl, '_blank');
    onClose();
  };

  const handleEmailShare = () => {
    const subject = encodeURIComponent(`Te recomiendo a ${provider.name} en Cuidamet`);
    const body = encodeURIComponent(`Hola,\n\nTe recomiendo el perfil de ${provider.name} en Cuidamet.\n\nPuedes ver su perfil aquí: ${profileUrl}\n\n¡Saludos!`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    onClose();
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl);
      setAlertModal({ isOpen: true, message: `¡Enlace de ${provider.name} copiado al portapapeles!`, title: '¡Copiado!' });
      onClose();
    } catch (err) {
      console.error('Error al copiar:', err);
      setAlertModal({ isOpen: true, message: 'No se pudo copiar el enlace', title: 'Error' });
    }
  };

  const handleMoreOptions = async () => {
    const shareData = {
      title: `${provider.name} - Cuidamet`,
      text: shareText,
      url: profileUrl,
    };
    
    try {
      if (navigator.share) {
        await navigator.share(shareData);
        onClose();
      } else {
        // Fallback for desktop or unsupported browsers
        await navigator.clipboard.writeText(profileUrl);
        setAlertModal({ isOpen: true, message: `¡Enlace del perfil de ${provider.name} copiado al portapapeles! Compártelo donde quieras.`, title: '¡Copiado!' });
        onClose();
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Error al compartir:', err);
        setAlertModal({ isOpen: true, message: 'No se pudo compartir el perfil.', title: 'Error' });
      }
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[200] flex items-center justify-center animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl w-full max-w-md mx-4 p-6 animate-scale-in shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-slate-800">Compartir perfil</h3>
          <button
            onClick={onClose}
            className="p-1.5 -mr-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Cerrar"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Provider Card */}
        <div className="bg-white rounded-xl p-4 mb-6 border-2 border-slate-100">
          <div className="flex items-center gap-3">
            <img 
              src={provider.photoUrl} 
              alt={provider.name}
              className="w-16 h-16 rounded-full object-cover shadow-md"
            />
            <div className="flex-1">
              <h4 className="font-bold text-slate-800 text-base">{provider.name}</h4>
              <div className="flex items-center gap-1.5 text-sm mt-0.5">
                <StarIcon className="w-4 h-4 text-amber-400 fill-current" />
                <span className="font-bold text-slate-800">{provider.rating.toFixed(1)}</span>
                <span className="text-slate-400">({provider.reviewsCount} val.)</span>
              </div>
              <div className="flex items-center text-slate-500 text-xs mt-1">
                <LocationPinIcon className="w-3.5 h-3.5 mr-1" />
                <span>{provider.location}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-5">
          {/* WhatsApp */}
          <button
            onClick={handleWhatsAppShare}
            className="flex flex-col items-center gap-2.5 p-4 rounded-xl bg-green-50 hover:bg-green-100 transition-all group"
          >
            <div className="flex-shrink-0 w-14 h-14 bg-green-500 rounded-full flex items-center justify-center group-hover:scale-105 transition-transform shadow-sm">
              <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            </div>
            <span className="text-sm font-semibold text-slate-700">WhatsApp</span>
          </button>

          {/* Email */}
          <button
            onClick={handleEmailShare}
            className="flex flex-col items-center gap-2.5 p-4 rounded-xl bg-blue-50 hover:bg-blue-100 transition-all group"
          >
            <div className="flex-shrink-0 w-14 h-14 bg-blue-500 rounded-full flex items-center justify-center group-hover:scale-105 transition-transform shadow-sm">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-slate-700">Email</span>
          </button>

          {/* Copiar */}
          <button
            onClick={handleCopyLink}
            className="flex flex-col items-center gap-2.5 p-4 rounded-xl bg-slate-100 hover:bg-slate-200 transition-all group"
          >
            <div className="flex-shrink-0 w-14 h-14 bg-slate-600 rounded-full flex items-center justify-center group-hover:scale-105 transition-transform shadow-sm">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-slate-700">Copiar</span>
          </button>
        </div>

        <button
          onClick={handleMoreOptions}
          className="w-full py-3 text-slate-600 font-semibold hover:bg-slate-50 rounded-xl transition-colors"
        >
          Más opciones...
        </button>
      </div>
      <AlertModal 
        isOpen={alertModal.isOpen}
        onClose={() => setAlertModal({ isOpen: false, message: '' })}
        message={alertModal.message}
        title={alertModal.title}
      />
    </div>
  );
};

export default ShareModal;
