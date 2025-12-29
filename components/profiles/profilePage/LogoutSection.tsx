import React from "react";
import ArrowRightOnRectangleIcon from "../../icons/ArrowRightOnRectangleIcon";
import ChevronRightIcon from "../../icons/ChevronRightIcon";

interface LogoutSectionProps {
  onLogout: () => void;
}

const LogoutSection: React.FC<LogoutSectionProps> = ({ onLogout }) => {
  return (
    <section>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-between p-4 text-left transition-colors border-b border-slate-100 last:border-0 hover:bg-red-50 text-red-600"
        >
          <div className="flex items-center">
            <div className="text-red-500 mr-4">
              <ArrowRightOnRectangleIcon className="w-6 h-6" />
            </div>
            <div>
              <span className="font-medium block">Cerrar Sesión</span>
            </div>
          </div>
          <ChevronRightIcon className="w-5 h-5 text-red-300" />
        </button>
      </div>
    </section>
  );
};

export default LogoutSection;
