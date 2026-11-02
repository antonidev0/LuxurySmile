// Lo que un doctor puede ver del resto del personal: solo nombre y apellido.
// Especialidad, correos, cédulas y teléfonos del staff quedan para los administradores.
export const DOCTOR_PUBLIC_FIELDS = { id: true, name: true, lastName: true };

export const forDoctor = (appointment) => ({
  ...appointment,
  completedBy: Array.isArray(appointment.completedBy)
    ? appointment.completedBy.map(({ name }) => ({ name }))
    : appointment.completedBy,
});
