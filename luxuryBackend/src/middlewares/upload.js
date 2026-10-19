import multer from "multer";
import path from "path";
import fs from "fs";
import { AppError } from "../utils/AppError.js";

// Carpeta donde se guardan los historiales (se crea si no existe)
export const PDF_DIR = path.join("uploads", "pdf");
fs.mkdirSync(PDF_DIR, { recursive: true });

// Configuración de multer para manejar la carga de archivos PDF
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, PDF_DIR);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `pdf-${uniqueSuffix}.pdf`);
  },
});

export const uploadPDF = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new AppError("Solo se permiten archivos PDF", 400));
    }
  }
});
