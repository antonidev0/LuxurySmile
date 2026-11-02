import {
  FiCalendar,
  FiClipboard,
  FiClock,
  FiFileText,
  FiGrid,
  FiUser,
  FiUserCheck,
  FiUserPlus,
  FiUsers,
} from "react-icons/fi";

// Menú lateral de cada rol. Las rutas compartidas usan las mismas páginas.
export const DASHBOARD_NAV = {
  admin: [
    { label: "Resumen", icon: FiGrid, to: "/admin/dashboard", end: true },
    { label: "Citas", icon: FiClipboard, to: "/admin/dashboard/citas" },
    { label: "Calendario", icon: FiCalendar, to: "/admin/dashboard/calendario" },
    { label: "Pacientes", icon: FiUsers, to: "/admin/dashboard/pacientes" },
    { label: "Historias", icon: FiFileText, to: "/admin/dashboard/historias" },
    { label: "Personal", icon: FiUserCheck, to: "/admin/dashboard/personal" },
    { label: "Registrar personal", icon: FiUserPlus, to: "/admin/dashboard/registro" },
    { label: "Mi perfil", icon: FiUser, to: "/admin/dashboard/perfil" },
  ],
  // El doctor solo ve sus propias citas y pacientes; no crea, cancela ni reprograma citas
  doctor: [
    { label: "Dashboard", icon: FiGrid, to: "/doctor/dashboard", end: true },
    { label: "Mis citas", icon: FiClipboard, to: "/doctor/dashboard/citas" },
    { label: "Calendario", icon: FiCalendar, to: "/doctor/dashboard/calendario" },
    { label: "Pacientes", icon: FiUsers, to: "/doctor/dashboard/pacientes" },
    { label: "Historia clínica", icon: FiFileText, to: "/doctor/dashboard/historias" },
    { label: "Disponibilidad", icon: FiClock, to: "/doctor/dashboard/disponibilidad" },
    { label: "Mi perfil", icon: FiUser, to: "/doctor/dashboard/perfil" },
  ],
};

export const dashboardHome = (role) => (role === "admin" ? "/admin/dashboard" : "/doctor/dashboard");
