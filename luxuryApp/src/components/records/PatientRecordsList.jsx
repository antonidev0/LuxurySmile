import { Badge, Box, Button, Flex, Stack, Text, useDisclosure } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { FiEye, FiFileText } from "react-icons/fi";
import { useNotify } from "../../hooks/useNotify";
import { usePatientRecords } from "../../hooks/usePatientRecords";
import { fetchMedicalRecordPDFUrl } from "../../services/records.service";
import { formatDateTime, formatDay } from "../../utils/dates";
import EmptyState from "../ui/EmptyState";
import ErrorState from "../ui/ErrorState";
import LoadingState from "../ui/LoadingState";
import PdfViewerModal from "./PdfViewerModal";

const RecordItem = ({ record, onView, loading }) => (
  <Box p={4} borderRadius="xl" borderWidth="1px" borderColor="border.subtle">
    <Flex justify="space-between" align="flex-start" gap={3} wrap="wrap">
      <Box minW={0}>
        <Text fontWeight="600" fontSize="sm">
          Consulta del {formatDay(record.appointment.date)}
        </Text>
        <Text fontSize="xs" color="text.muted">
          Creada por {record.createdByName} · {formatDateTime(record.createdAt)}
        </Text>
        {record.updatedByName && (
          <Text fontSize="xs" color="text.muted">
            Editada por {record.updatedByName} · {formatDateTime(record.updatedAt)}
          </Text>
        )}
      </Box>
      <Badge colorScheme={record.canEdit ? "green" : "gray"} variant="subtle" borderRadius="full" textTransform="none">
        {record.canEdit ? "Puedes editarla" : "Solo lectura"}
      </Badge>
    </Flex>
    <Button size="xs" variant="outline" leftIcon={<FiEye />} mt={3} onClick={() => onView(record)} isLoading={loading}>
      Ver PDF
    </Button>
  </Box>
);

/**
 * Historia clínica completa del paciente de una cita, de la ficha más reciente a la más antigua.
 * Se ven también las fichas de otros doctores; solo se editan (desde la cita) las propias.
 */
const PatientRecordsList = ({ appointmentId, patientLabel }) => {
  const { records, loading, error, reload } = usePatientRecords(appointmentId);
  const notify = useNotify();
  const viewer = useDisclosure();
  const [opening, setOpening] = useState(null);
  const [pdfUrl, setPdfUrl] = useState("");

  useEffect(
    () => () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    },
    [pdfUrl]
  );

  const view = async (record) => {
    setOpening(record.id);
    try {
      setPdfUrl(await fetchMedicalRecordPDFUrl(record.id));
      viewer.onOpen();
    } catch (err) {
      notify.error("No se pudo abrir la ficha", err);
    } finally {
      setOpening(null);
    }
  };

  if (loading) return <LoadingState minH="160px" />;
  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (!records.length) {
    return <EmptyState icon={FiFileText} title="Sin fichas clínicas" description="Todavía nadie ha llenado una ficha para este paciente." py={8} />;
  }

  return (
    <>
      <Stack spacing={3}>
        {records.map((record) => (
          <RecordItem key={record.id} record={record} onView={view} loading={opening === record.id} />
        ))}
      </Stack>
      <PdfViewerModal isOpen={viewer.isOpen} onClose={viewer.onClose} url={pdfUrl} subtitle={patientLabel} />
    </>
  );
};

export default PatientRecordsList;
