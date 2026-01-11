import React from 'react';
import ChevronLeftIcon from '../icons/ChevronLeftIcon';

interface BookingList_HeaderProps {
  title: string;
  onBack: () => void;
  rightAction?: React.ReactNode;
}

const BookingList_Header: React.FC<BookingList_HeaderProps> = ({ title, onBack, rightAction }) => {
  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center">
          <button 
            onClick={onBack}
            className="p-2 -ml-2 mr-2 text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
            aria-label="Volver"
          >
            <ChevronLeftIcon className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-bold text-slate-800">{title}</h1>
        </div>
        {rightAction && (
          <div>{rightAction}</div>
        )}
      </div>
    </header>
  );
};

export default BookingList_Header;
