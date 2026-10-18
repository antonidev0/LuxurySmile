import multer from "multer";
import path from "path";
 
// Configuración de multer para manejar la carga de archivos PDF
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/pdf/"); 
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `pdf-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

export const uploadPDF = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Solo se permiten archivos PDF"));
    }
  }
});
