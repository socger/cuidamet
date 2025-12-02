import React from "react";
import ChevronLeftIcon from "./icons/ChevronLeftIcon";

interface ChatHeaderProps {
  providerName: string;
  providerPhotoUrl: string;
  onBack: () => void;
}

const Chat_Header: React.FC<ChatHeaderProps> = ({ providerName, providerPhotoUrl, onBack }) => {
  return (
    <header className="flex-shrink-0 bg-white/80 backdrop-blur-lg border-b border-slate-200 sticky top-0 z-40">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <button
          onClick={onBack}
          className="p-2 -ml-2 text-slate-600 hover:text-teal-500 cursor-pointer"
          type="button"
        >
          <ChevronLeftIcon className="w-6 h-6" />
        </button>

        <div className="text-center">
          <h1 className="text-lg font-normal text-slate-800">
            Chat con: 
            <span className="text-lg font-semibold text-slate-800"> {providerName}</span>
          </h1>
          <p className="text-xs text-slate-500">En línea</p>
        </div>

        <img
          src={providerPhotoUrl}
          alt={providerName}
          className="w-10 h-10 rounded-full object-cover"
        />
      </div>
    </header>
  );
};

export default Chat_Header;
