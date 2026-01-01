import React from 'react';
import ExclamationTriangleIcon from '../icons/ExclamationTriangleIcon';
import XMarkIcon from '../icons/XMarkIcon';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'warning'
}) => {
  if (!isOpen) return null;

  const variantStyles = {
    danger: {
      iconBg: 'bg-red-50',
      iconColor: 'text-red-500',
      buttonBg: 'bg-red-500 hover:bg-red-600 shadow-red-500/20',
    },
    warning: {
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-500',
      buttonBg: 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20',
    },
    info: {
      iconBg: 'bg-teal-100',
      iconColor: 'text-teal-600',
      buttonBg: 'bg-teal-500 hover:bg-teal-600 shadow-teal-500/20',
    }
  };

  const styles = variantStyles[variant];

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

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
          <div className={`flex-shrink-0 w-10 h-10 ${styles.iconBg} rounded-full flex items-center justify-center`}>
            <ExclamationTriangleIcon className={`w-6 h-6 ${styles.iconColor}`} />
          </div>
          <p className="text-slate-600 text-sm leading-relaxed pt-1.5">{message}</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-slate-100 text-slate-700 px-4 py-3 rounded-xl font-semibold hover:bg-slate-200 transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            className={`flex-1 text-white px-4 py-3 rounded-xl font-semibold transition-colors shadow-lg ${styles.buttonBg}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
