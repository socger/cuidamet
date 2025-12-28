
import React, { useState, useEffect } from 'react';
import XMarkIcon from './icons/XMarkIcon';
import ShieldCheckIcon from './icons/ShieldCheckIcon';
import MapPinIcon from './icons/MapPinIcon';
import ChartBarIcon from './icons/ChartBarIcon';
import TicketIcon from './icons/TicketIcon';
import StarIcon from './icons/StarIcon';
import CheckCircleIcon from './icons/CheckCircleIcon';
import CreditCardIcon from './icons/CreditCardIcon';
import LockClosedIcon from './icons/LockClosedIcon';
import ChevronLeftIcon from './icons/ChevronLeftIcon';

interface PremiumSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  isPremium: boolean;
  onUpdateStatus: (status: boolean, days?: number) => void;
}

const plans = [
  { days: 7, price: 2.99, label: 'Semanal' },
  { days: 15, price: 5.49, label: 'Quincenal' },
  { days: 30, price: 8.99, label: 'Mensual', recommended: true },
  { days: 60, price: 15.99, label: 'Bimestral' },
  { days: 90, price: 22.99, label: 'Trimestral', bestValue: true },
];

const benefits = [
  { icon: MapPinIcon, title: 'Posición Destacada', desc: 'Aparece primero en el mapa y listas.' },
  { icon: ShieldCheckIcon, title: 'Insignia PRO', desc: 'Distintivo exclusivo en tu perfil.' },
  { icon: ChartBarIcon, title: 'Estadísticas Avanzadas', desc: 'Descubre quién visita tu perfil.' },
  { icon: TicketIcon, title: 'Promociones', desc: 'Acceso a descuentos exclusivos.' },
  { icon: StarIcon, title: 'Prioridad', desc: 'Prioridad en notificaciones.' },
];

const PremiumSubscriptionModal: React.FC<PremiumSubscriptionModalProps> = ({ isOpen, onClose, isPremium, onUpdateStatus }) => {
  const [step, setStep] = useState<'selection' | 'payment' | 'manage'>('selection');
  const [selectedPlan, setSelectedPlan] = useState(plans[2]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [remainingDays, setRemainingDays] = useState(30);

  // Reset to correct view on open
  useEffect(() => {
    if (isOpen) {
      setStep(isPremium ? 'manage' : 'selection');
    }
  }, [isOpen, isPremium]);

  if (!isOpen) return null;

  const handleSelectPlan = (plan: typeof plans[0]) => {
    setSelectedPlan(plan);
    setStep('payment');
  };

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onUpdateStatus(true, selectedPlan.days);
      setRemainingDays(selectedPlan.days);
      setStep('manage');
    }, 2000);
  };

  const handleCancelSubscription = () => {
    if (window.confirm('¿Estás seguro de que quieres cancelar tu suscripción PRO? Perderás tu posición destacada y estadísticas al finalizar el periodo actual.')) {
      onUpdateStatus(false);
      onClose();
    }
  };

  const handleBack = () => {
    if (step === 'payment') {
      setStep('selection');
    } else {
      onClose();
    }
  };

  const renderSelection = () => (
    <div className="p-6 h-full flex flex-col">
      <div className="text-center mb-6 flex-shrink-0">
        <div className="inline-block p-3 rounded-full bg-gradient-to-br from-amber-300 to-orange-500 shadow-lg mb-3">
          <StarIcon className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">Cuidamet <span className="text-amber-500">PRO</span></h2>
        <p className="text-sm text-slate-600">Destaca y multiplica tus contactos.</p>
      </div>

      <div className="flex-grow overflow-y-auto -mx-6 px-6 pb-4">
          <div className="mb-6 grid grid-cols-1 gap-2">
            {benefits.slice(0,3).map((b, i) => (
              <div key={i} className="flex items-center p-2 bg-slate-50 rounded-lg border border-slate-100">
                <div className="bg-amber-100 p-1.5 rounded-md text-amber-600 mr-3">
                  <b.icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">{b.title}</h3>
                  <p className="text-xs text-slate-500">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <h3 className="font-bold text-slate-800 mb-3">Elige tu tarifa</h3>
          <div className="space-y-3">
            {plans.map((plan) => (
              <button
                key={plan.days}
                onClick={() => handleSelectPlan(plan)}
                className="w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all relative overflow-hidden border-slate-200 hover:border-amber-300 bg-white hover:shadow-md"
              >
                {plan.recommended && (
                  <div className="absolute top-0 right-0 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-bl-lg uppercase tracking-wider">
                    Recomendado
                  </div>
                )}
                 {plan.bestValue && (
                  <div className="absolute top-0 right-0 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-bl-lg uppercase tracking-wider">
                    Mejor Precio
                  </div>
                )}
                <div className="text-left">
                  <p className="font-bold text-slate-800 text-lg">{plan.label}</p>
                  <p className="text-sm text-slate-500">{plan.days} días de acceso</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-slate-800">{plan.price}€</p>
                </div>
              </button>
            ))}
          </div>
      </div>
    </div>
  );

  const renderPayment = () => (
    <div className="p-6">
      <h2 className="text-xl font-bold text-slate-800 mb-1">Finalizar Compra</h2>
      <p className="text-sm text-slate-500 mb-6">Estás adquiriendo Cuidamet PRO por <strong>{selectedPlan.days} días</strong>.</p>

      <form onSubmit={handlePayment} className="space-y-4">
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-4">
             <div className="flex justify-between items-center mb-4">
                 <span className="font-medium text-slate-700">Total a pagar</span>
                 <span className="text-2xl font-bold text-amber-600">{selectedPlan.price}€</span>
             </div>
             <div className="h-px bg-slate-200 my-2"></div>
             <p className="text-xs text-slate-400">Renovación manual. No te cobraremos automáticamente al finalizar el periodo.</p>
        </div>

        <div>
             <label className="block text-sm font-medium text-slate-700 mb-2">Método de Pago</label>
             <div className="grid grid-cols-2 gap-3 mb-4">
                 <button type="button" className="flex items-center justify-center py-3 border-2 border-amber-500 bg-amber-50 text-amber-800 rounded-lg font-medium">
                     <CreditCardIcon className="w-5 h-5 mr-2" /> Tarjeta
                 </button>
                 <button type="button" className="flex items-center justify-center py-3 border border-slate-200 bg-white text-slate-600 rounded-lg hover:bg-slate-50 font-medium">
                     <span className="italic font-bold font-serif">Pay</span><span className="italic font-bold font-serif text-blue-600">Pal</span>
                 </button>
             </div>
        </div>

        <div className="space-y-3">
            <input type="text" placeholder="Número de tarjeta" className="w-full p-3 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none" required />
            <div className="grid grid-cols-2 gap-3">
                <input type="text" placeholder="MM/AA" className="w-full p-3 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none" required />
                <input type="text" placeholder="CVC" className="w-full p-3 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none" required />
            </div>
            <input type="text" placeholder="Nombre del titular" className="w-full p-3 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none" required />
        </div>

        <button 
            type="submit"
            disabled={isProcessing}
            className="w-full bg-amber-500 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-amber-600 transition-all mt-4 flex items-center justify-center"
        >
            {isProcessing ? 'Procesando...' : (
                <>
                    <LockClosedIcon className="w-5 h-5 mr-2" /> Pagar {selectedPlan.price}€
                </>
            )}
        </button>
      </form>
    </div>
  );

  const renderManage = () => (
    <div className="p-6 text-center">
         <div className="inline-block p-4 rounded-full bg-green-100 text-green-600 mb-4 animate-bounce">
            <ShieldCheckIcon className="w-16 h-16" />
         </div>
         <h2 className="text-2xl font-bold text-slate-800 mb-2">¡Eres Cuidamet PRO!</h2>
         <p className="text-slate-600 mb-8">Tu suscripción está activa y tus beneficios están habilitados.</p>

         <div className="bg-slate-50 rounded-xl border border-slate-200 p-6 mb-8">
             <div className="grid grid-cols-2 divide-x divide-slate-200">
                 <div className="text-center px-2">
                     <p className="text-xs text-slate-500 uppercase tracking-wide font-bold">Tiempo Restante</p>
                     <p className="text-3xl font-bold text-amber-500 mt-1">{remainingDays}</p>
                     <p className="text-xs text-slate-400">días</p>
                 </div>
                 <div className="text-center px-2">
                     <p className="text-xs text-slate-500 uppercase tracking-wide font-bold">Estado</p>
                     <div className="inline-flex items-center bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-bold mt-2">
                        <CheckCircleIcon className="w-4 h-4 mr-1" /> Activo
                     </div>
                 </div>
             </div>
         </div>

         <div className="space-y-3">
             <button 
                onClick={onClose}
                className="w-full bg-slate-800 text-white py-3 rounded-xl font-bold hover:bg-slate-900 transition-colors"
             >
                Volver a mi Perfil
             </button>
             <button 
                onClick={handleCancelSubscription}
                className="w-full bg-white border border-red-200 text-red-500 py-3 rounded-xl font-medium hover:bg-red-50 transition-colors text-sm"
             >
                Cancelar Suscripción
             </button>
             <p className="text-xs text-slate-400 mt-2">
                Al cancelar, mantendrás tus beneficios hasta el final del periodo ({remainingDays} días), pero no se renovará.
             </p>
         </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center pointer-events-none">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto transition-opacity" onClick={onClose}></div>
      <div className="bg-white w-full max-w-md sm:rounded-2xl rounded-t-2xl shadow-2xl pointer-events-auto relative overflow-hidden max-h-[90vh] flex flex-col animate-slide-up-fast">
        {/* Header with Back Navigation */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 sticky top-0 bg-white z-10">
             <div className="flex items-center">
                 <button onClick={handleBack} className="p-2 -ml-2 mr-2 text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
                     <ChevronLeftIcon className="w-6 h-6" />
                 </button>
                 <h3 className="font-bold text-slate-800">
                    {step === 'manage' ? 'Gestionar Suscripción' : 'Cuidamet Premium'}
                 </h3>
             </div>
        </div>

        {/* Content Scrollable */}
        <div className="overflow-y-auto h-full">
            {step === 'selection' && renderSelection()}
            {step === 'payment' && renderPayment()}
            {step === 'manage' && renderManage()}
        </div>
      </div>
    </div>
  );
};

export default PremiumSubscriptionModal;
