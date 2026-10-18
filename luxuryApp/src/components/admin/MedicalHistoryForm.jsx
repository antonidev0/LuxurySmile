import {
  Box,
  Button,
  Input,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  useDisclosure,
  useToast,
  Spinner,
  Text,
  Link,
  HStack,
  IconButton,
} from "@chakra-ui/react";
import { FiEye, FiDownload, FiUpload } from "react-icons/fi";
import { useEffect, useState } from "react";
import { useAdmin } from "../../context/AdminContext";

// historialPDF viene de la cita que ya cargó el padre: así no se piden
// todas las citas otra vez por cada tarjeta.
const MedicalHistoryForm = ({ appointmentId, historialPDF, onSuccess }) => {
  const { uploadPDFToAppointment, generatePDF, getAppointmentPDFUrl } = useAdmin();
  const hasPDF = Boolean(historialPDF);
  const [pdfUrl, setPdfUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Si cambia el PDF de la cita, descartamos la copia local anterior
  useEffect(() => {
    setPdfUrl("");
  }, [historialPDF]);

  // Libera la URL local del PDF al desmontar o al reemplazarla
  useEffect(() => {
    return () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    };
  }, [pdfUrl]);

  const showError = (title, err) =>
    toast({
      title,
      description: err.message,
      status: "error",
      duration: 4000,
      isClosable: true,
    });

  // Los PDF están protegidos: se descargan con el token y se muestran desde una URL local
  const loadPDF = async () => {
    if (pdfUrl) return pdfUrl;
    setLoading(true);
    try {
      const url = await getAppointmentPDFUrl(appointmentId);
      setPdfUrl(url);
      return url;
    } finally {
      setLoading(false);
    }
  };

  const handleView = async () => {
    try {
      await loadPDF();
      onOpen();
    } catch (err) {
      showError("Error al abrir el PDF", err);
    }
  };

  const handleDownload = async () => {
    try {
      const url = await loadPDF();
      const link = document.createElement("a");
      link.href = url;
      link.download = `historial-${appointmentId}.pdf`;
      link.click();
    } catch (err) {
      showError("Error al descargar el PDF", err);
    }
  };

  const handleGeneratePDF = async () => {
    setLoading(true);
    try {
      await generatePDF(appointmentId);
      toast({
        title: "PDF generado correctamente",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      onSuccess?.(); // el padre recarga las citas
    } catch (err) {
      showError("Error al generar el PDF", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    try {
      await uploadPDFToAppointment(appointmentId, file);
      toast({
        title: "PDF subido correctamente",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      setFile(null);
      onSuccess?.(); // el padre recarga las citas
    } catch (err) {
      showError("Error al subir el PDF", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box bg="white" borderRadius="md" p={3} boxShadow="md">
      <Text fontWeight="bold" fontSize="md" mb={2} textAlign="center">
        Historial Médico PDF
      </Text>

      {loading ? (
        <Spinner />
      ) : hasPDF ? (
        <HStack justify="center" spacing={4}>
          <IconButton
            icon={<FiEye />}
            aria-label="Ver PDF"
            colorScheme="blue"
            onClick={handleView}
          />
          <IconButton
            icon={<FiDownload />}
            aria-label="Descargar PDF"
            colorScheme="green"
            onClick={handleDownload}
          />
          <Input
            type="file"
            accept="application/pdf"
            size="sm"
            onChange={(e) => setFile(e.target.files?.[0])}
          />
          <Button
            onClick={handleUpload}
            colorScheme="purple"
            size="sm"
            leftIcon={<FiUpload />}
            isDisabled={!file}
          >
            Reemplazar
          </Button>
        </HStack>
      ) : (
        <Box textAlign="center">
          <Text fontSize="sm" mb={2}>Aún no se ha generado o subido el historial médico.</Text>

          <Button
            onClick={handleGeneratePDF}
            colorScheme="blue"
            size="sm"
            mb={2}
            width="100%"
          >
            Generar automáticamente con datos del paciente
          </Button>

          <Text fontSize="xs" color="gray.500" mt={2}>O bien puedes subir un PDF manualmente:</Text>

          <Input
            type="file"
            accept="application/pdf"
            size="sm"
            mt={2}
            onChange={(e) => setFile(e.target.files?.[0])}
          />
          <Button
            mt={2}
            onClick={handleUpload}
            colorScheme="purple"
            size="sm"
            leftIcon={<FiUpload />}
            isDisabled={!file}
            width="100%"
          >
            Subir PDF
          </Button>
        </Box>
      )}

      {/* Modal de visualización del PDF */}
      <Modal isOpen={isOpen} onClose={onClose} size="6xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Visualizar Historial Médico</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Box w="100%" h="80vh">
              <embed
                src={pdfUrl}
                type="application/pdf"
                width="100%"
                height="100%"
              />
            </Box>
          </ModalBody>
          <ModalFooter>
            <Button onClick={onClose} colorScheme="blue">
              Cerrar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default MedicalHistoryForm;
