import React from "react";
import ShieldCheckIcon from "../../icons/ShieldCheckIcon";
import BellIcon from "../../icons/BellIcon";
import DocumentTextIcon from "../../icons/DocumentTextIcon";
import ChevronRightIcon from "../../icons/ChevronRightIcon";

interface AccountSettingsSectionProps {
  onNavigateSecurity: () => void;
  onNavigateNotifications: () => void;
  onNavigateLegal: () => void;
}

interface SettingsItemProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  subLabel?: string;
}

const SettingsItem: React.FC<SettingsItemProps> = ({
  icon,
  label,
  onClick,
  subLabel,
}) => (
  <button
    onClick={onClick}
    className="w-full flex items-center justify-between p-4 text-left transition-colors border-b border-slate-100 last:border-0 hover:bg-slate-50 text-slate-700"
  >
    <div className="flex items-center">
      <div className="text-slate-500 mr-4">
        {icon}
      </div>
      <div>
        <span className="font-medium block">{label}</span>
        {subLabel && (
          <span className="text-xs text-slate-400 font-normal">{subLabel}</span>
        )}
      </div>
    </div>
    <ChevronRightIcon className="w-5 h-5 text-slate-400" />
  </button>
);

const AccountSettingsSection: React.FC<AccountSettingsSectionProps> = ({
  onNavigateSecurity,
  onNavigateNotifications,
  onNavigateLegal,
}) => {
  return (
    <>
      <SettingsItem
        icon={<ShieldCheckIcon className="w-6 h-6" />}
        label="Seguridad y Contraseña"
        subLabel="Gestionar acceso y verificaciones"
        onClick={onNavigateSecurity}
      />
      <SettingsItem
        icon={<BellIcon className="w-6 h-6" />}
        label="Notificaciones"
        onClick={onNavigateNotifications}
      />
      <SettingsItem
        icon={<DocumentTextIcon className="w-6 h-6" />}
        label="Legal y privacidad"
        onClick={onNavigateLegal}
      />
    </>
  );
};

export default AccountSettingsSection;
