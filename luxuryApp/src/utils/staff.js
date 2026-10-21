// Estado de la cuenta según los datos reales: dada de baja, sin verificar el correo o activa
export const ACCOUNT_STATUS = {
  active: { label: "Activo", color: "green" },
  pending: { label: "Invitación pendiente", color: "orange" },
  inactive: { label: "Desactivado", color: "gray" },
};

export const accountStatus = (person) => (person.deactivatedAt ? "inactive" : person.verified ? "active" : "pending");

export const ROLE_LABELS = { doctor: "Doctor", admin: "Administrador" };

export const staffName = (person) => `${person.role === "doctor" ? "Dr. " : ""}${person.name} ${person.lastName}`;

// Igual que el backend: los correos se comparan en minúsculas y sin espacios
export const normalizeEmail = (email) => String(email ?? "").trim().toLowerCase();

// Filtros vacíos de la vista Personal
export const EMPTY_STAFF_FILTERS = { search: "", role: "", specialty: "", status: "" };
