import { useState } from "react";
import { Button, Input, useToast } from "@chakra-ui/react";
import { useAdmin } from "../../context/AdminContext";

const UploadPDF = ({ appointmentId, onSuccess }) => {
  const [file, setFile] = useState(null);
  const toast = useToast();
  const { uploadPDFToAppointment } = useAdmin();

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
      onSuccess(); // notifica al padre que refresque datos
    } catch (error) {
      toast({
        title: "Error al subir PDF",
        description: error?.message || "Ocurrió un error",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    }
  };

  return (
    <>
      <Input
        type="file"
        accept="application/pdf"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />
      <Button
        onClick={handleUpload}
        colorScheme="blue"
        mt={2}
        isDisabled={!file}
      >
        Subir PDF
      </Button>
    </>
  );
};

export default UploadPDF;
