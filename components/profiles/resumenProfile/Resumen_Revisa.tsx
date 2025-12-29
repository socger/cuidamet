import React from "react";

interface Resumen001Props {
  title: string;
  subtitle: string;
}

const Resumen_Revisa: React.FC<Resumen001Props> = ({ title, subtitle }) => {
  return (
    <div className="text-center">
      <h2 className="text-2xl font-bold text-slate-800">{title}</h2>
      <p className="text-slate-600 mt-2">{subtitle}</p>
    </div>
  );
};

export default Resumen_Revisa;
