import React from "react";
import MapPinIcon from "../../icons/MapPinIcon";
import GpsFixedIcon from "../../icons/GpsFixedIcon";

interface PersonalInfoFormProps {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  languages: string[];
  languagesList: string[];
  isLocating?: boolean;
  onPhoneChange: (value: string) => void;
  onLocationChange: (value: string) => void;
  onLanguageToggle: (lang: string) => void;
  onDetectLocation?: () => void;
}

const PersonalInfoForm: React.FC<PersonalInfoFormProps> = ({
  firstName,
  lastName,
  email,
  phone,
  location,
  languages,
  languagesList,
  isLocating = false,
  onPhoneChange,
  onLocationChange,
  onLanguageToggle,
  onDetectLocation,
}) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Nombre
        </label>
        <input
          type="text"
          value={firstName}
          readOnly
          className="w-full p-3 bg-slate-100 border border-slate-300 rounded-xl text-slate-600 cursor-not-allowed"
          placeholder="Nombre"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Apellido
        </label>
        <input
          type="text"
          value={lastName}
          readOnly
          className="w-full p-3 bg-slate-100 border border-slate-300 rounded-xl text-slate-600 cursor-not-allowed"
          placeholder="Apellido"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Email
        </label>
        <input
          type="email"
          value={email}
          readOnly
          className="w-full p-3 bg-slate-100 border border-slate-300 rounded-xl text-slate-600 cursor-not-allowed"
          placeholder="tu-email@ejemplo.com"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Teléfono
        </label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => onPhoneChange(e.target.value)}
          className="w-full p-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
          placeholder="Ej. 612 345 678"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Ubicación (barrio/ciudad)
        </label>
        <div className="relative">
          <input
            type="text"
            value={location}
            onChange={(e) => onLocationChange(e.target.value)}
            className="w-full p-3 pl-10 pr-12 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
            placeholder="Ej. Chamberí, Madrid"
          />
          <MapPinIcon className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
          {onDetectLocation && (
            <button
              type="button"
              onClick={onDetectLocation}
              className="absolute right-2 top-2 p-1.5 text-teal-500 hover:bg-teal-50 rounded-lg transition-colors"
              title="Detectar mi ubicación"
              disabled={isLocating}
            >
              {isLocating ? (
                <div className="w-5 h-5 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <GpsFixedIcon className="w-5 h-5" />
              )}
            </button>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Idiomas
        </label>
        <div className="flex flex-wrap gap-2">
          {languagesList.map((lang) => (
            <button
              key={lang}
              onClick={() => onLanguageToggle(lang)}
              className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                languages.includes(lang)
                  ? "bg-teal-50 border-teal-500 text-teal-700"
                  : "bg-white border-slate-200 text-slate-600"
              }`}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PersonalInfoForm;
