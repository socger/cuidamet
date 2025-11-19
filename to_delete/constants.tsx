import React from "react";
import { ServiceCategory } from "./types";
// import { ServiceCategory } from "./types";

export const CATEGORIES: Record<
  ServiceCategory,
  { name: string; color: string; bgColor: string }
> = {
  mayores: { name: "Mayores", color: "text-blue-800", bgColor: "bg-blue-100" },
  niños: { name: "Niños", color: "text-green-800", bgColor: "bg-green-100" },
  mascotas: {
    name: "Mascotas",
    color: "text-orange-800",
    bgColor: "bg-orange-100",
  },
  limpieza: {
    name: "CuidaClean",
    color: "text-purple-800",
    bgColor: "bg-purple-100",
  },
};
