import React from "react";
import PhoneIcon from "../../icons/PhoneIcon";
import MapPinIcon from "../../icons/MapPinIcon";
import MailIcon from "../../icons/MailIcon";

interface ResumenPersonalInfoProps {
  photoUrl: string;
  name: string;
  phone: string;
  email: string;
  location?: string;
  languages?: string[];
}

const Resumen_PersonalInfo: React.FC<ResumenPersonalInfoProps> = ({
  photoUrl,
  name,
  phone,
  email,
  location,
  languages = [],
}) => {
  return (
    <>
      <div className="bg-teal-500 h-20 relative"></div>
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
              <PhoneIcon className="w-4 h-4 mr-2" />
              {phone}
            </div>
            <div className="flex items-center text-slate-600 text-sm">
              <MailIcon className="w-4 h-4 mr-2" />
              {email}
            </div>{" "}
            {location && (
              <div className="flex items-center text-slate-500 text-sm mt-2">
                <MapPinIcon className="w-4 h-4 mr-1" /> {location}
              </div>
            )}
            {languages.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {languages.map((lang) => (
                  <span
                    key={lang}
                    className="text-[10px] bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full font-medium"
                  >
                    {lang}
                  </span>
                ))}
              </div>
            )}{" "}
          </div>
        </div>
      </div>
    </>
  );
};

export default Resumen_PersonalInfo;
