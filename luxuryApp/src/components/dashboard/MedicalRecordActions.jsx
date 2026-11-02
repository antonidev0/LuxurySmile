import { Box, Button, ButtonGroup, Input, useDisclosure } from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import { FiDownload, FiEdit3, FiEye, FiFilePlus, FiUpload } from "react-icons/fi";
import { useNotify } from "../../hooks/useNotify";
import { fetchRecordPDFUrl, uploadRecordPDF } from "../../services/records.service";
import PdfViewerModal from "../records/PdfViewerModal";
import MedicalRecordForm from "./MedicalRecordForm";

/**
 * Acciones sobre la historia clínica (PDF) de una cita:
 * ver, descargar, llenar o editar la ficha oficial de la clínica (genera el PDF) o subir un archivo.
 * onUpdated recibe { id, historialPDF, medicalRecordId } para refrescar la cita en la lista.
 */
const MedicalRecordActions = ({ appointment, onUpdated, size = "sm" }) => {
  const notify = useNotify();
  const viewer = useDisclosure();
  const form = useDisclosure();
  const fileInput = useRef(null);
  const [pdfUrl, setPdfUrl] = useState("");
  const [busy, setBusy] = useState(null);
  const hasPDF = Boolean(appointment.historialPDF);

  // Si cambia el PDF, la copia local anterior deja de valer
  useEffect(() => {
    setPdfUrl("");
  }, [appointment.historialPDF]);

  useEffect(
    () => () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    },
    [pdfUrl]
  );

  const run = async (action, fn) => {
    setBusy(action);
    try {
      return await fn();
    } finally {
      setBusy(null);
    }
  };

  const loadPDF = async () => {
    if (pdfUrl) return pdfUrl;
    const url = await fetchRecordPDFUrl(appointment.id);
    setPdfUrl(url);
    return url;
  };

  const handleView = () =>
    run("view", async () => {
      try {
        await loadPDF();
        viewer.onOpen();
      } catch (err) {
        notify.error("No se pudo abrir el PDF", err);
      }
    });

  const handleDownload = () =>
    run("download", async () => {
      try {
        const link = document.createElement("a");
        link.href = await loadPDF();
        link.download = `historia-${appointment.ci}-${appointment.date.slice(0, 10)}.pdf`;
        link.click();
      } catch (err) {
        notify.error("No se pudo descargar el PDF", err);
      }
    });

  const handleUpload = (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    run("upload", async () => {
      try {
        const { historialPDF, medicalRecordId } = await uploadRecordPDF(appointment.id, file);
        notify.success("PDF subido correctamente");
        onUpdated?.({ id: appointment.id, historialPDF, medicalRecordId });
      } catch (err) {
        notify.error("No se pudo subir el PDF", err);
      }
    });
  };

  return (
    <Box>
      <Input ref={fileInput} type="file" accept="application/pdf" display="none" onChange={handleUpload} />
      <ButtonGroup size={size} variant="outline" flexWrap="wrap" gap={2} spacing={0}>
        {hasPDF ? (
          <>
            <Button leftIcon={<FiEye />} onClick={handleView} isLoading={busy === "view"}>
              Ver
            </Button>
            <Button leftIcon={<FiDownload />} onClick={handleDownload} isLoading={busy === "download"}>
              Descargar
            </Button>
            <Button leftIcon={<FiEdit3 />} onClick={form.onOpen}>
              Editar ficha
            </Button>
            <Button leftIcon={<FiUpload />} variant="ghost" onClick={() => fileInput.current?.click()} isLoading={busy === "upload"}>
              Reemplazar
            </Button>
          </>
        ) : (
          <>
            <Button leftIcon={<FiFilePlus />} variant="solid" onClick={form.onOpen}>
              Llenar ficha
            </Button>
            <Button leftIcon={<FiUpload />} onClick={() => fileInput.current?.click()} isLoading={busy === "upload"}>
              Subir PDF
            </Button>
          </>
        )}
      </ButtonGroup>

      {form.isOpen && <MedicalRecordForm appointment={appointment} isOpen onClose={form.onClose} onSaved={onUpdated} />}

      <PdfViewerModal
        isOpen={viewer.isOpen}
        onClose={viewer.onClose}
        url={pdfUrl}
        subtitle={`${appointment.firstName} ${appointment.lastName} · ${appointment.ci}`}
      />
    </Box>
  );
};

export default MedicalRecordActions;
