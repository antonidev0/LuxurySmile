import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import Appointment from "../models/appointment.js";

export const generateMedicalPDF = async (request, response) => {
  try {
    const { appointmentId } = request.params;

    const appointment = await Appointment.findById(appointmentId).populate("assignedDoctors");

    if (!appointment) {
      return response.status(404).json({ message: "Cita no encontrada" });
    }

    // Crea carpeta si no existe
    const uploadDir = path.join("uploads", "pdf");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Nombre de archivo
    const fileName = `pdf-${Date.now()}-${Math.floor(Math.random() * 1000000)}.pdf`;
    const filePath = path.join(uploadDir, fileName);

    // Generar PDF
    const doc = new PDFDocument();
    const writeStream = fs.createWriteStream(filePath);
    doc.pipe(writeStream);

    // HEADER
    doc.fontSize(20).text("Historial Médico", { align: "center" });
    doc.moveDown();

    // Paciente
    doc.fontSize(12).text(`Nombre: ${appointment.firstName} ${appointment.lastName}`);
    doc.text(`CI: ${appointment.ci}`);
    doc.text(`Correo: ${appointment.email}`);
    doc.text(`Fecha de la cita: ${new Date(appointment.date).toLocaleDateString()}`);
    doc.text(`Hora: ${appointment.time}`);
    doc.moveDown();

    // Doctores asignados
    doc.text("Doctores asignados:");
    appointment.assignedDoctors.forEach((docItem, index) => {
      doc.text(`${index + 1}. ${docItem.name} (${docItem.specialty || "Especialidad no especificada"})`);
    });

    // Doctores que completaron
    if (appointment.completedBy?.length) {
      doc.moveDown();
      doc.text("Completado por:");
      appointment.completedBy.forEach((d, index) => {
        doc.text(`${index + 1}. ${d.name} (${d.specialty}) - CI: ${d.ci}, Email: ${d.email}`);
      });
    }

    doc.end();

    // Esperar que termine de escribirse
    writeStream.on("finish", async () => {
      // Guardar path en MongoDB
      appointment.historialPDF = `/uploads/pdf/${fileName}`;
      await appointment.save();

      response.status(200).json({
        message: "PDF generado y guardado exitosamente",
        pdfUrl: appointment.historialPDF,
      });
    });
  } catch (error) {
    console.error("Error al generar PDF:", error);
    response.status(500).json({ message: "Error al generar PDF" });
  }
};
