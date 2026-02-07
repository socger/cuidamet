import React from "react";
import PhoneIcon from "../../icons/PhoneIcon";
import MapPinIcon from "../../icons/MapPinIcon";
import MailIcon from "../../icons/MailIcon";
import LogoutSection from "../profilePage/LogoutSection";

interface ResumenPersonalInfoProps {
  photoUrl: string;
  name: string;
  phone: string;
  email: string;
  location?: string;
  languages?: string[];
  onLogout?: () => void;
}

const Resumen_PersonalInfo: React.FC<ResumenPersonalInfoProps> = ({
  photoUrl,
  name,
  phone,
  email,
  location,
  languages = [],
  onLogout,
}) => {
  return (
    <>
      <div className="bg-teal-500 h-20 relative flex items-center justify-end px-4">
        {onLogout && (
          <div className="scale-75 origin-right">
            <LogoutSection onLogout={onLogout} />
          </div>
        )}
      </div>
      <div className="px-4 pb-4 -mt-10 relative">
        <img
          src={photoUrl}
          className="w-20 h-20 rounded-full border-4 border-white shadow-md object-cover"
          alt="Perfil"
        />
        <div className="mt-3">
          <h3 className="font-bold text-lg text-slate-800">{name}</h3>
          <div className="flex flex-col gap-1 mt-2">
            <div className="flex items-center text-slate-600 text-sm">
              <PhoneIcon className="w-4 h-4 mr-2 text-teal-500" />
              {phone}
            </div>
            <div className="flex items-center text-slate-600 text-sm">
              <MailIcon className="w-4 h-4 mr-2 text-teal-500" />
              {email}
            </div>
            {location && (
              <div className="flex items-center text-slate-500 text-sm">
                <MapPinIcon className="w-4 h-4 mr-2 text-teal-500" /> {location}
              </div>
            )}
            {languages.length > 0 && (
              <div>
                <p className="text-xs text-slate-500 mb-2 font-medium mt-4">Idiomas</p>
                <div className="flex flex-wrap gap-1 mt-2">
                    {languages.map((lang) => (
                    <span
                        key={lang}
                        // className="text-[10px] bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full font-medium mb-2"
                        className="px-2.5 py-1 bg-teal-100 text-teal-700 text-xs rounded-lg border border-teal-100 font-medium"
                    >
                        {lang}
                    </span>
                    ))}
                </div>
              </div>
            )}{" "}
          </div>
        </div>
      </div>
    </>
  );
};

export default Resumen_PersonalInfo;
