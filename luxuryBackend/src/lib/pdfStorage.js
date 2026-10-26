import { randomUUID } from "crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Carpeta privada de los historiales: nunca se sirve como estática, solo por la ruta de descarga autenticada.
// Se resuelve desde el código y no desde el directorio de trabajo, para que no dependa de dónde se arranque.
export const PDF_DIR = fileURLToPath(new URL("../../uploads/pdf", import.meta.url));

// Prefijo con el que se guardan en la base de datos ("/uploads/pdf/<archivo>.pdf")
const STORED_PREFIX = "/uploads/pdf/";

// Nombres no adivinables: aunque la carpeta quedara expuesta por error, no se podrían enumerar
export const newPdfName = (prefix) => `${prefix}-${randomUUID()}.pdf`;

export const ensurePdfDir = () => fs.mkdirSync(PDF_DIR, { recursive: true });

export const storedPathOf = (fileName) => `${STORED_PREFIX}${fileName}`;

// Ruta absoluta en disco de un PDF guardado. Solo se usa el nombre del archivo para impedir path traversal.
export const resolvePdf = (storedPath) => path.join(PDF_DIR, path.basename(storedPath));

export const savePdf = async (bytes, prefix) => {
  ensurePdfDir();
  const fileName = newPdfName(prefix);
  await fs.promises.writeFile(path.join(PDF_DIR, fileName), bytes);
  return storedPathOf(fileName);
};

// El archivo puede no existir ya (borrado a mano o subida fallida): no es un error
export const removePdf = async (storedPath) => {
  if (!storedPath) return;
  await fs.promises.rm(resolvePdf(storedPath), { force: true });
};

export const pdfExists = (storedPath) => fs.existsSync(resolvePdf(storedPath));

const PDF_SIGNATURE = "%PDF-";

// El mimetype lo declara el cliente; la firma del archivo es lo que de verdad indica que es un PDF
export const hasPdfSignature = async (filePath) => {
  const handle = await fs.promises.open(filePath, "r");
  try {
    const { buffer, bytesRead } = await handle.read(Buffer.alloc(PDF_SIGNATURE.length), 0, PDF_SIGNATURE.length, 0);
    return buffer.toString("latin1", 0, bytesRead) === PDF_SIGNATURE;
  } finally {
    await handle.close();
  }
};
