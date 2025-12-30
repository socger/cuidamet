import React from "react";
import ChatBubbleLeftRightIcon from "../../icons/ChatBubbleLeftRightIcon";
import InformationCircleIcon from "../../icons/InformationCircleIcon";
import ChevronRightIcon from "../../icons/ChevronRightIcon";

interface SupportSectionProps {
  onNavigateSupportChat: () => void;
  onNavigateSupport: () => void;
}

interface ListItemProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  highlight?: boolean;
}

const ListItem: React.FC<ListItemProps> = ({
  icon,
  label,
  onClick,
  highlight,
}) => (
  <li className="border-b border-slate-200 last:border-b-0">
    <button
      onClick={onClick}
      className={`w-full flex items-center py-4 text-left hover:bg-slate-100 px-4 transition-colors ${
        highlight ? "hover:bg-red-50" : ""
      }`}
    >
      <div className={highlight ? "text-red-500" : "text-slate-600"}>
        {icon}
      </div>
      <span
        className={`ml-4 flex-grow font-medium ${
          highlight ? "text-red-600" : "text-slate-700"
        }`}
      >
        {label}
      </span>
      <ChevronRightIcon className={`w-5 h-5 ${
        highlight ? "text-red-400" : "text-slate-400"
      }`} />
    </button>
  </li>
);

const SupportSection: React.FC<SupportSectionProps> = ({
  onNavigateSupportChat,
  onNavigateSupport,
}) => {
  return (
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
  );
};

export default SupportSection;
