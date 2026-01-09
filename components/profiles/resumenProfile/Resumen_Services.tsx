import React from "react";
import { CareCategory, ServiceConfig } from "../../../types";

interface ServiceCategoryInfo {
  id: CareCategory;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  color: string;
  bg: string;
  border: string;
}

interface ResumenServicesProps {
  completedServices: CareCategory[];
  servicesData: Record<CareCategory, ServiceConfig>;
  serviceCategories: ServiceCategoryInfo[];
}

const Resumen_Services: React.FC<ResumenServicesProps> = ({
  completedServices,
  servicesData,
  serviceCategories,
}) => {
  return (
    <div className="px-4 pb-4 space-y-4">
      {completedServices.map((cat) => {
        const config = servicesData[cat];
        const catInfo = serviceCategories.find((c) => c.id === cat);
        const activeVariations = config.variations.filter((v) => v.enabled);

        if (!catInfo) return null;

        return (
          <div
            key={cat}
            className="bg-slate-50 p-3 rounded-lg border border-slate-100"
          >
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center">
                <catInfo.icon className={`w-5 h-5 mr-2 ${catInfo.color}`} />
                <span className="font-bold text-slate-700 text-sm">
                  {catInfo.label}
                </span>
              </div>
              <span className="font-bold text-teal-600 text-sm">
                Desde{" "}
                {Math.min(...(activeVariations.map((v) => v.price) || [0]))}€
              </span>
            </div>
            {config.availability && config.availability.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2 mb-2">
                {config.availability.map((slot, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full"
                  >
                    {slot}
                  </span>
                ))}
              </div>
            )}
            <div className="space-y-1">
              {activeVariations.slice(0, 3).map((v) => (
                <div
                  key={v.name}
                  className="flex justify-between items-center text-[10px] bg-white border border-slate-200 px-2 py-1 rounded"
                >
                  <span className="text-slate-600 font-medium">{v.name}</span>
                  <span className="text-slate-800 font-bold">
                    {v.price}€ / {v.unit}
                  </span>
                </div>
              ))}
              {activeVariations.length > 3 && (
                <div className="text-[10px] text-center text-slate-400 italic">
                  +{activeVariations.length - 3} más
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Resumen_Services;
