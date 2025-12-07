import React from 'react';
import CheckCircleIcon from './icons/CheckCircleIcon';
import XMarkIcon from './icons/XMarkIcon';

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
  title?: string;
}

const AlertModal: React.FC<AlertModalProps> = ({ isOpen, onClose, message, title = 'Información' }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[200] flex items-center justify-center animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl w-full max-w-sm mx-4 p-6 animate-scale-in shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-slate-800">{title}</h3>
          <button
            onClick={onClose}
            className="p-1.5 -mr-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Cerrar"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-start gap-3 mb-6">
          <div className="flex-shrink-0 w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
            <CheckCircleIcon className="w-6 h-6 text-teal-600" />
          </div>
          <p className="text-slate-600 text-sm leading-relaxed pt-1.5">{message}</p>
        </div>

        <button
          onClick={onClose}
          className="w-full bg-teal-500 text-white px-4 py-3 rounded-xl font-semibold hover:bg-teal-600 transition-colors shadow-lg shadow-teal-500/20"
        >
          Aceptar
        </button>
      </div>
    </div>
  );
};

export default AlertModal;
