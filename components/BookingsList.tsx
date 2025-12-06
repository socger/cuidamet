import React, { useEffect, useState } from 'react';
import { bookingService, Booking } from '../services/bookingService';
import CalendarDaysIcon from './icons/CalendarDaysIcon';
import ClockIcon from './icons/ClockIcon';
import CurrencyEuroIcon from './icons/CurrencyEuroIcon';
import PageHeader from './BookingList_Header';

interface BookingsListProps {
  onBack: () => void;
}

const BookingsList: React.FC<BookingsListProps> = ({ onBack }) => {
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    setBookings(bookingService.getBookings());
  }, []);

  const getStatusColor = (status: Booking['status']) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-slate-100 text-slate-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const getStatusLabel = (status: Booking['status']) => {
    switch (status) {
      case 'confirmed': return 'Confirmada';
      case 'completed': return 'Completada';
      case 'cancelled': return 'Cancelada';
      default: return status;
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col animate-fade-in pb-24">
      <PageHeader title="Mis Reservas" onBack={onBack} />
      
      <main className="flex-grow p-4 space-y-4">
        {bookings.length === 0 ? (
          <div className="text-center py-10 text-slate-500">
            <p>No tienes reservas realizadas.</p>
          </div>
        ) : (
          bookings.map((booking) => (
            <div key={booking.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center space-x-3">
                    <img 
                      src={booking.providerPhotoUrl} 
                      alt={booking.providerName} 
                      className="w-10 h-10 rounded-full object-cover border border-slate-100"
                    />
                    <div>
                      <h3 className="font-bold text-slate-800">{booking.providerName}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(booking.status)}`}>
                        {getStatusLabel(booking.status)}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="block font-bold text-teal-600 text-lg">{booking.totalCost.toFixed(2)}€</span>
                    <span className="text-xs text-slate-500">{booking.hours} horas</span>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-700">Inicio:</span>
                    <div className="flex items-center gap-2">
                      <CalendarDaysIcon className="w-4 h-4 text-slate-400" />
                      <span>{new Date(booking.startDate).toLocaleDateString()}</span>
                      <ClockIcon className="w-4 h-4 ml-2 text-slate-400" />
                      <span>{booking.startTime}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-700">Fin:</span>
                    <div className="flex items-center gap-2">
                      <CalendarDaysIcon className="w-4 h-4 text-slate-400" />
                      <span>{new Date(booking.endDate).toLocaleDateString()}</span>
                      <ClockIcon className="w-4 h-4 ml-2 text-slate-400" />
                      <span>{booking.endTime}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </main>
    </div>
  );
};

export default BookingsList;
