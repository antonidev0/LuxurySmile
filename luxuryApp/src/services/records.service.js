import api from "./api";

// Historiales médicos en PDF (protegidos: se descargan con el token)
export const generateRecordPDF = (appointmentId) =>
  api.post(`/api/pdf/generate-pdf/${appointmentId}`).then((res) => res.data);

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
