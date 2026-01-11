import React from "react";
import ChevronLeftIcon from "../icons/ChevronLeftIcon";
import { Provider } from "../../types";

interface BookingPage_HeaderProps {
  provider: Provider;
  title: string;
  onBack: () => void;
  rightAction?: React.ReactNode;
}

const BookingPage_Header: React.FC<BookingPage_HeaderProps> = ({
  provider,
  title,
  onBack,
  rightAction,
}) => (
  <header className="flex-shrink-0 bg-white/80 backdrop-blur-lg border-b border-slate-200 sticky top-0 z-10">
    <div className="container mx-auto px-4 h-16 flex items-center justify-between">
      <div className="flex items-center">
        <button
          onClick={onBack}
          className="p-2 -ml-2 text-slate-600 hover:text-teal-500"
        >
          <ChevronLeftIcon className="w-6 h-6" />
        </button>

        {/* <h1 className="text-lg font-semibold text-slate-800 ml-4">{title}</h1> */}
        <p className="text-sm text-slate-500">{title}</p>
        <p className="text-lg font-bold text-slate-800 pl-2">{provider.name}</p>
        <p className="text-lg font-bold text-teal-600 pl-2">{provider.hourlyRate}€ / hora</p>
      </div>
      
      <div className="flex items-center gap-3">
        {rightAction && <div className="flex-shrink-0">{rightAction}</div>}
        <img
          src={provider.photoUrl}
          alt={provider.name}
          className="w-10 h-10 rounded-full object-cover"
        />
      </div>
    </div>
  </header>
);

export default BookingPage_Header;
