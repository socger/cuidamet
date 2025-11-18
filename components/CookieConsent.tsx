import React, { useState, useEffect } from 'react';
import ShieldCheckIcon from './icons/ShieldCheckIcon';

const CookieConsent: React.FC = () => {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Verificar si el usuario ya aceptó las cookies
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      // Pequeño delay para que la animación se vea bien
      setTimeout(() => setShowBanner(true), 1000);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    setShowBanner(false);
  };

  const handleReject = () => {
    localStorage.setItem('cookieConsent', 'rejected');
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <>
      {/* Overlay oscuro de fondo */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 fade-in" />
      
      {/* Banner de cookies */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 slide-up">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
          <div className="p-6 md:p-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-400 to-green-500 flex items-center justify-center shadow-lg">
                  <ShieldCheckIcon className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-slate-800 mb-2">
                  Tu privacidad es importante
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  Utilizamos cookies para mejorar tu experiencia en Cuidamet, personalizar el contenido 
                  y analizar el tráfico. Al continuar navegando, aceptas nuestra{' '}
                  <a href="#" className="text-teal-600 hover:text-teal-700 font-semibold underline">
                    Política de Privacidad
                  </a>{' '}
                  y el uso de cookies.
                </p>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex flex-col sm:flex-row gap-3 justify-end">
              <button
                onClick={handleReject}
                className="px-6 py-3 rounded-xl font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2"
              >
                Solo necesarias
              </button>
              <button
                onClick={handleAccept}
                className="px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-teal-500 to-green-500 hover:from-teal-600 hover:to-green-600 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
              >
                Aceptar todas
              </button>
            </div>

            {/* Link a configuración detallada */}
            <div className="mt-4 text-center">
              <button 
                className="text-sm text-slate-500 hover:text-slate-700 underline transition-colors"
                onClick={handleReject}
              >
                Configurar preferencias de cookies
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CookieConsent;
