import { Box, Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, Stack, Text } from "@chakra-ui/react";

// Visor de un PDF privado ya descargado como URL local (blob)
const PdfViewerModal = ({ isOpen, onClose, url, title = "Historia clínica", subtitle }) => (
  <Modal isOpen={isOpen} onClose={onClose} size={{ base: "full", md: "5xl" }}>
    <ModalOverlay />
    <ModalContent>
      <ModalHeader>
        <Stack spacing={0}>
          <Text>{title}</Text>
          {subtitle && (
            <Text fontSize="sm" fontWeight="400" color="text.muted">
              {subtitle}
            </Text>
          )}
        </Stack>
      </ModalHeader>
      <ModalCloseButton />
      <ModalBody pb={6}>
        <Box h={{ base: "calc(100vh - 120px)", md: "75vh" }} borderRadius="lg" overflow="hidden" borderWidth="1px">
          <iframe title={title} src={url} width="100%" height="100%" style={{ border: 0 }} />
        </Box>
      </ModalBody>
    </ModalContent>
  </Modal>
);

export default PdfViewerModal;
