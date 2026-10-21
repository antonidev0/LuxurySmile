// Lo que un doctor puede ver del resto del personal en sus citas: solo nombre y especialidad.
// Correos, cédulas y teléfonos del staff quedan para los administradores.
export const DOCTOR_PUBLIC_FIELDS = { id: true, name: true, lastName: true, specialty: true };

export const forDoctor = (appointment) => ({
  ...appointment,
  completedBy: Array.isArray(appointment.completedBy)
    ? appointment.completedBy.map(({ name, specialty }) => ({ name, specialty }))
    : appointment.completedBy,
});
