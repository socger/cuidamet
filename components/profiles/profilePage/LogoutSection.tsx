import React, { useState } from "react";
import ArrowRightOnRectangleIcon from "../../icons/ArrowRightOnRectangleIcon";
import ConfirmModal from "../../actions/ConfirmModal";

interface LogoutSectionProps {
  onLogout: () => void;
}

const LogoutSection: React.FC<LogoutSectionProps> = ({ onLogout }) => {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  return (
    <>
      <section>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <button
            onClick={() => setIsConfirmOpen(true)}
            className="w-full flex items-center justify-between p-4 text-left transition-colors hover:bg-red-50 text-red-600"
          >
            <div className="flex items-center">
              <div className="text-red-500 mr-4">
                <ArrowRightOnRectangleIcon className="w-6 h-6" />
              </div>
              <div>
                <span className="font-medium block">Cerrar Sesión</span>
                <span className="text-xs text-slate-400 font-normal">
                  Salir de tu cuenta
                </span>
              </div>
            </div>
          </button>
        </div>
      </section>

      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={onLogout}
        title="¿Cerrar sesión?"
        message="¿Estás seguro de que quieres cerrar sesión? Tendrás que volver a iniciar sesión para acceder a tu cuenta."
        confirmText="Cerrar sesión"
        cancelText="Cancelar"
        variant="danger"
      />
    </>
  );
};

export default LogoutSection;
