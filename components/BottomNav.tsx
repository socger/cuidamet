import React from 'react';
import CuidametLogoIconSvg from '../resources/logos/Logo CuidaMet_Icono.svg';
import PlusCircleIcon from './icons/PlusCircleIcon';
import InboxIcon from './icons/InboxIcon';
import UserIcon from './icons/UserIcon';
import ClipboardDocumentListIcon from './icons/ClipboardDocumentListIcon';
import { UserRole } from '../types';

interface BottomNavProps {
    currentView: 'landing' | 'providers' | 'offer' | 'inbox' | 'chat' | 'myProfile' | 'map' | 'bookings';
    onNavigateHome: () => void;
    onNavigateOffer: () => void;
    onNavigateInbox: () => void;
    onNavigateProfile: () => void;
    onNavigateBookings: () => void;
    unreadCount: number;
    isAuthenticated: boolean;
    activeRole?: UserRole | null;
}

const BottomNav: React.FC<BottomNavProps> = ({ currentView, onNavigateHome, onNavigateOffer, onNavigateInbox, onNavigateProfile, onNavigateBookings, unreadCount, isAuthenticated, activeRole }) => {
    const navItems = [
        { key: 'home', icon: null, label: 'Inicio', active: currentView === 'landing', action: onNavigateHome },
        { key: 'offer', icon: PlusCircleIcon, label: 'Ofrecer', active: currentView === 'offer', action: onNavigateOffer },
        { key: 'bookings', icon: ClipboardDocumentListIcon, label: 'Reservas', active: currentView === 'bookings', action: onNavigateBookings },
        { key: 'inbox', icon: InboxIcon, label: 'Buzón', active: currentView === 'inbox', action: onNavigateInbox },
        { key: 'profile', icon: UserIcon, label: 'Tú', active: currentView === 'myProfile', action: onNavigateProfile },
    ];

    const regularItems = navItems.filter(item => item.key !== 'offer');
    const offerItem = navItems.find(item => item.key === 'offer');

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-teal-50/100 border-t border-slate-200 z-[1000]">
            <div className="container mx-auto h-20">
                <div className="flex justify-around items-center h-full">
                    {/* First two items */}
                    {regularItems.slice(0, 2).map((item) => (
                        <button
                            key={item.key}
                            onClick={item.action}
                            className="flex flex-col items-center justify-center text-center py-2 w-1/5 group hover:bg-slate-50 transition-colors focus:outline-none"
                            aria-label={item.label}
                        >
                            {item.key === 'home' ? (
                                <img 
                                    src={CuidametLogoIconSvg} 
                                    alt="Inicio" 
                                    className={`h-6 w-6 mb-1 transition-all ${
                                        item.active 
                                            ? '' 
                                            : '[filter:grayscale(100%)_brightness(0.4)] group-hover:[filter:none]'
                                    }`}
                                />
                            ) : (
                                item.icon && <item.icon className={`h-6 w-6 mb-1 transition-colors ${item.active ? 'text-teal-500' : 'text-slate-500 group-hover:text-teal-500'}`} />
                            )}
                            <span className={`text-xs font-medium transition-colors ${item.active ? 'text-teal-500' : 'text-slate-600 group-hover:text-teal-500'}`}>
                                {item.label}
                            </span>
                        </button>
                    ))}

                    {/* Central prominent button */}
                    {offerItem && (
                        <div className="w-1/5 flex justify-center">
                             <button
                                onClick={activeRole === 'client' ? undefined : offerItem.action}
                                disabled={activeRole === 'client'}
                                className="flex flex-col items-center justify-center text-center group focus:outline-none"
                                aria-label={offerItem.label}
                            >
                                <div className={`rounded-full w-16 h-16 flex items-center justify-center shadow-lg transform -translate-y-5 transition-all duration-300 ${
                                    activeRole === 'client'
                                        ? 'bg-slate-300 text-slate-400 cursor-not-allowed'
                                        : 'bg-teal-500 text-white group-hover:bg-teal-600 group-hover:scale-105 group-focus:ring-2 group-focus:ring-offset-2 group-focus:ring-teal-500'
                                }`}>
                                    <offerItem.icon className="w-8 h-8"/>
                                </div>
                                <span className={`text-xs font-medium transition-colors transform -translate-y-3.5 ${
                                    activeRole === 'client'
                                        ? 'text-slate-400'
                                        : offerItem.active ? 'text-teal-500' : 'text-slate-600 group-hover:text-teal-500'
                                }`}>
                                    {offerItem.label}
                                </span>
                            </button>
                        </div>
                    )}
                    
                    {/* Last items (now 3 items: bookings, inbox, profile) */}
                    {regularItems.slice(2).map((item) => (
                        <button
                            key={item.key}
                            onClick={item.action}
                            className="relative flex flex-col items-center justify-center text-center py-2 w-1/5 group hover:bg-slate-50 transition-colors focus:outline-none"
                            aria-label={item.label}
                        >
                            <div className="relative">
                                <item.icon className={`h-6 w-6 mb-1 transition-colors ${item.active ? 'text-teal-500' : 'text-slate-500 group-hover:text-teal-500'}`} />
                                {item.key === 'inbox' && isAuthenticated && unreadCount > 0 && (
                                    <div className="absolute -top-1 -right-2 bg-red-500 text-white text-xs font-semibold rounded-full h-5 w-5 flex items-center justify-center border-2 border-white">
                                        {unreadCount}
                                    </div>
                                )}
                            </div>
                            <span className={`text-xs font-medium transition-colors ${item.active ? 'text-teal-500' : 'text-slate-600 group-hover:text-teal-500'}`}>
                                {item.label}
                            </span>
                        </button>
                    ))}
                </div>
            </div>
        </nav>
    );
};

export default BottomNav;