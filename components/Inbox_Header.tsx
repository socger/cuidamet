import React from "react";
import ChevronLeftIcon from "./icons/ChevronLeftIcon";

interface Chat_HeaderProps {
  providerName: string;
  providerPhotoUrl: string;
  onBack: () => void;
}

const Inbox_Header: React.FC<Chat_HeaderProps> = ({ providerName, providerPhotoUrl, onBack }) => {
  return (
    <header className="flex-shrink-0 bg-white/80 backdrop-blur-lg border-b border-slate-200 sticky top-0 z-40">
      <div className="container mx-auto px-4 h-16 flex items-center">
        <button
          onClick={onBack}
          className="p-2 -ml-2 text-slate-600 hover:text-teal-500 cursor-pointer"
          type="button"
        >
          <ChevronLeftIcon className="w-6 h-6" />
        </button>

        <h1 className="text-xl font-bold text-slate-800 ml-2">Buzón</h1>
      </div>
    </header>
  );
};

export default Inbox_Header;
