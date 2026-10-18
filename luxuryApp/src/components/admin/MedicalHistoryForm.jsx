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
import UploadPDF from "./UploadPDF";
import PDFViewer from "./PDFviewer";

const MedicalHistoryForm = ({ appointmentId }) => {
  const { getAppointments, uploadPDFToAppointment, generatePDF, } = useAdmin();
  const [hasPDF, setHasPDF] = useState(false);
  const [pdfUrl, setPdfUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState(null);
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const fetchPDFStatus = async () => {
    try {
      const data = await getAppointments();
      const appointment = data.find((appt) => appt._id === appointmentId);
      if (appointment?.historialPDF) {
        const fullUrl = `${import.meta.env.VITE_BACKEND_URL}${appointment.historialPDF}`;
        setHasPDF(true);
        setPdfUrl(fullUrl);
      } else {
        setHasPDF(false);
        setPdfUrl("");
      }
    } catch (err) {
      console.error("Error al verificar historial PDF:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePDF = async () => {
    try {
      const { pdfUrl } = await generatePDF(appointmentId);
      toast({
        title: "PDF generado correctamente",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      fetchPDFStatus(); // refresca estado local
    } catch (err) {
      toast({
        title: "Error al generar el PDF",
        description: err.message,
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    }
  };


  useEffect(() => {
    fetchPDFStatus();
  }, []);

  const handleUpload = async () => {
    if (!file) return;
    try {
      await uploadPDFToAppointment(appointmentId, file);
      toast({
        title: "PDF subido correctamente",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      setFile(null);
      fetchPDFStatus(); // actualiza estado
      onSuccess?.(); // notifica al padre
    } catch (err) {
      toast({
        title: "Error al subir el PDF",
        description: err.message,
        status: "error",
        duration: 4000,
        isClosable: true,
      });
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
            onClick={onOpen}
          />
          <a href={pdfUrl} target="_blank" rel="noopener noreferrer" download>
            <IconButton
              icon={<FiDownload />}
              aria-label="Descargar PDF"
              colorScheme="green"
            />
          </a>
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
