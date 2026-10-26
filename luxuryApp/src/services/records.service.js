import api from "./api";

// Historiales médicos en PDF (protegidos: se descargan con el token)

// Ficha clínica de una cita: { current, latest, defaults } para rellenar el formulario
export const fetchRecordForm = (appointmentId) =>
  api.get(`/api/pdf/appointments/${appointmentId}/ficha`).then((res) => res.data);

// Guarda la ficha y genera su PDF con el formato de la clínica.
// Con recordId se edita esa ficha; sin él se crea una ficha nueva aparte.
export const saveRecord = (appointmentId, { recordId, data }) =>
  api.post(`/api/pdf/appointments/${appointmentId}/ficha`, { recordId, data }).then((res) => res.data);

export const uploadRecordPDF = (appointmentId, file) => {
  const formData = new FormData();
  formData.append("pdf", file);
  return api.patch(`/api/admin/${appointmentId}/upload-pdf`, formData).then((res) => res.data);
};

// Devuelve una URL local (blob) para ver o descargar el PDF
export const fetchRecordPDFUrl = (appointmentId) =>
  api
    .get(`/api/admin/${appointmentId}/pdf`, { responseType: "blob" })
    .then((res) => URL.createObjectURL(res.data));
