import fs from "fs";
import multer from "multer";
import { AppError } from "../lib/AppError.js";
import { asyncHandler } from "../lib/asyncHandler.js";
import { ensurePdfDir, hasPdfSignature, newPdfName, PDF_DIR } from "../lib/pdfStorage.js";

const MAX_PDF_BYTES = 10 * 1024 * 1024;

const storage = multer.diskStorage({
  destination: (request, file, cb) => {
    ensurePdfDir();
    cb(null, PDF_DIR);
  },
  filename: (request, file, cb) => cb(null, newPdfName("pdf")),
});

const acceptPdf = multer({
  storage,
  limits: { fileSize: MAX_PDF_BYTES, files: 1 },
  fileFilter: (request, file, cb) => {
    if (file.mimetype !== "application/pdf") return cb(new AppError("Solo se permiten archivos PDF", 400));
    cb(null, true);
  },
}).single("pdf");

// El mimetype lo declara el navegador y se puede falsear: se comprueba también la firma del archivo
const rejectFakePdf = asyncHandler(async (request, response, next) => {
  if (request.file && !(await hasPdfSignature(request.file.path))) {
    await fs.promises.rm(request.file.path, { force: true });
    throw new AppError("El archivo no es un PDF válido", 400);
  }
  next();
});

export const uploadPDF = [acceptPdf, rejectFakePdf];
