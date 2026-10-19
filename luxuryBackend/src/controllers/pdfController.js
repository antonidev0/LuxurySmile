import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { prisma } from "../config/db.js";

export const generateMedicalPDF = async (request, response) => {
  try {
    const { appointmentId } = request.params;

    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { assignedDoctors: true },
    });

    if (!appointment) {
      return response.status(404).json({ message: "Cita no encontrada" });
    }

    // Un doctor solo puede generar historias de sus citas asignadas
    if (request.user.role === "doctor" && !appointment.assignedDoctors.some((doc) => doc.id === request.user.id)) {
      return response.status(403).json({ message: "No tienes asignada esta cita" });
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
    writeStream.on("error", (error) => {
      console.error("Error al escribir el PDF:", error);
      if (!response.headersSent) {
        response.status(500).json({ message: "Error al generar PDF" });
      }
    });
    doc.pipe(writeStream);

    // HEADER
    doc.fontSize(20).text("Historial Médico", { align: "center" });
    doc.moveDown();

    // Paciente
    doc.fontSize(12).text(`Nombre: ${appointment.firstName} ${appointment.lastName}`);
    doc.text(`CI: ${appointment.ci}`);
    doc.text(`Correo: ${appointment.email}`);
    doc.text(`Fecha de la cita: ${appointment.date.toLocaleDateString("es-VE", { timeZone: "UTC" })}`);
    doc.text(`Hora: ${appointment.time}`);
    doc.moveDown();

    // Doctores asignados
    doc.text("Doctores asignados:");
    appointment.assignedDoctors.forEach((docItem, index) => {
      doc.text(`${index + 1}. ${docItem.name} ${docItem.lastName} (${docItem.specialty || "Especialidad no especificada"})`);
    });

    // Doctores que completaron
    if (Array.isArray(appointment.completedBy) && appointment.completedBy.length) {
      doc.moveDown();
      doc.text("Completado por:");
      appointment.completedBy.forEach((d, index) => {
        doc.text(`${index + 1}. ${d.name} (${d.specialty}) - CI: ${d.ci}, Email: ${d.email}`);
      });
    }

    doc.end();

    // Esperar que termine de escribirse
    writeStream.on("finish", async () => {
      try {
        // Guardar la ruta del PDF en la cita
        const updated = await prisma.appointment.update({
          where: { id: appointmentId },
          data: { historialPDF: `/uploads/pdf/${fileName}` },
        });

        response.status(200).json({
          message: "PDF generado y guardado exitosamente",
          pdfUrl: updated.historialPDF,
        });
      } catch (error) {
        console.error("Error al guardar el PDF en la cita:", error);
        response.status(500).json({ message: "Error al generar PDF" });
      }
    });
  } catch (error) {
    console.error("Error al generar PDF:", error);
    response.status(500).json({ message: "Error al generar PDF" });
  }
};
