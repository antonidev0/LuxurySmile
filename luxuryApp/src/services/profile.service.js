import api from "./api";

// Lo que cada miembro del personal gestiona de su propia cuenta.
// El resto de sus datos (nombre, cédula, correo, especialidad, rol) los cambia la administración.
export const updateMyProfile = ({ numberPhone, address }) =>
  api.patch("/api/auth/me", { numberPhone, address }).then((res) => res.data.user);

export const changeMyPassword = ({ currentPassword, newPassword }) =>
  api.patch("/api/auth/me/password", { currentPassword, newPassword }).then((res) => res.data);
