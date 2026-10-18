import { Box, Text } from "@chakra-ui/react";

const PDFViewer = ({ pdfUrl }) => {
  if (!pdfUrl) {
    return <Text color="gray.500">No hay historial clínico aún.</Text>;
  }

  return (
    <Box border="1px solid #ccc" borderRadius="md" overflow="hidden" height="600px">
      <iframe
        title="Historial Médico"
        src={pdfUrl}
        width="100%"
        height="100%"
        style={{ border: "none" }}
      />
    </Box>
  );
};

export default PDFViewer;
