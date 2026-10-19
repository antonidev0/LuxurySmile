import { FaTeethOpen, FaTooth } from "react-icons/fa";
import { MdCleaningServices, MdHealthAndSafety, MdLocalHospital, MdAutoAwesome } from "react-icons/md";

export const TREATMENTS = [
  {
    id: "general",
    title: "Odontología general",
    short: "Diagnóstico, prevención y tratamiento de los problemas dentales más comunes.",
    icon: FaTooth,
    includes: ["Evaluación integral", "Restauraciones (resinas)", "Tratamiento de caries", "Extracciones simples"],
  },
  {
    id: "limpieza",
    title: "Limpieza profesional",
    short: "Eliminamos placa y sarro para prevenir gingivitis y mantener tu sonrisa fresca.",
    icon: MdCleaningServices,
    includes: ["Profilaxis con ultrasonido", "Pulido dental", "Aplicación de flúor", "Plan de higiene en casa"],
  },
  {
    id: "ortodoncia",
    title: "Ortodoncia",
    short: "Alineamos dientes y mandíbula con brackets o alineadores invisibles.",
    icon: FaTeethOpen,
    includes: ["Brackets metálicos y estéticos", "Alineadores invisibles", "Retenedores", "Controles mensuales"],
  },
  {
    id: "diseno",
    title: "Diseño de sonrisa",
    short: "Carillas, blanqueamiento y diseño digital para una sonrisa armónica y natural.",
    icon: MdAutoAwesome,
    includes: ["Diseño digital (DSD)", "Carillas de resina o porcelana", "Blanqueamiento", "Contorneado estético"],
  },
  {
    id: "prevencion",
    title: "Prevención y control",
    short: "Chequeos periódicos para detectar a tiempo cualquier problema.",
    icon: MdHealthAndSafety,
    includes: ["Revisión semestral", "Radiografías digitales", "Sellantes", "Asesoría nutricional"],
  },
  {
    id: "emergencias",
    title: "Emergencias dentales",
    short: "Atención rápida ante dolor, fracturas o infecciones.",
    icon: MdLocalHospital,
    includes: ["Dolor agudo", "Dientes fracturados", "Infecciones", "Prótesis dañadas"],
  },
];
