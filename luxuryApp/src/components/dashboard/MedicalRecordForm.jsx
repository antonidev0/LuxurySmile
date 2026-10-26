import {
  Alert,
  AlertDescription,
  AlertIcon,
  Box,
  Button,
  ButtonGroup,
  Center,
  FormControl,
  FormHelperText,
  FormLabel,
  Grid,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Radio,
  RadioGroup,
  SimpleGrid,
  Spinner,
  Stack,
  Text,
  Textarea,
  Wrap,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useNotify } from "../../hooks/useNotify";
import { getErrorMessage } from "../../services/api";
import { fetchRecordForm, saveRecord } from "../../services/records.service";
import { formatDay } from "../../utils/dates";
import { ageFrom, BIOTIPOS, FOTOTIPOS, QUESTION_COLUMNS, toFicha } from "../../utils/ficha";

const Section = ({ title, children }) => (
  <Box>
    <Text fontSize="xs" color="text.muted" textTransform="uppercase" letterSpacing="0.06em" fontWeight="600" mb={3}>
      {title}
    </Text>
    {children}
  </Box>
);

const Field = ({ label, children, span, helper }) => (
  <FormControl gridColumn={span ? { md: `span ${span}` } : undefined}>
    {label && (
      <FormLabel fontSize="sm" mb={1}>
        {label}
      </FormLabel>
    )}
    {children}
    {helper && <FormHelperText>{helper}</FormHelperText>}
  </FormControl>
);

// Sí / No de una pregunta; al pulsar de nuevo la opción marcada, se deja sin responder
const YesNo = ({ value, onChange }) => (
  <ButtonGroup size="xs" isAttached variant="outline" flexShrink={0}>
    {[
      ["si", "Sí"],
      ["no", "No"],
    ].map(([option, label]) => (
      <Button
        key={option}
        minW="38px"
        variant={value === option ? "solid" : "outline"}
        colorScheme={value === option ? "brand" : "gray"}
        onClick={() => onChange(value === option ? undefined : option)}
      >
        {label}
      </Button>
    ))}
  </ButtonGroup>
);

/**
 * Formulario de la ficha clínica oficial de la clínica para una cita.
 * Si el paciente ya tiene ficha, el doctor elige entre editarla (la de esta cita o la última
 * del paciente) o crear una ficha nueva aparte, que parte de los datos de la anterior.
 * Al guardar se genera el PDF con el formato de la clínica y la cita queda enlazada a él.
 * onSaved recibe { id, historialPDF, medicalRecordId }.
 */
const MedicalRecordForm = ({ appointment, isOpen, onClose, onSaved }) => {
  const notify = useNotify();
  const [info, setInfo] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [mode, setMode] = useState("new");
  const [ficha, setFicha] = useState(toFicha());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Ficha que se puede editar: la que ya usa esta cita o, si no, la última del paciente
  const target = info ? info.current ?? info.latest : null;

  // Una ficha nueva parte de la anterior (los antecedentes del paciente no cambian de una consulta a otra)
  // con la fecha de esta cita y sin la firma, o de los datos de la cita si no hay ficha previa
  const newFicha = (data = info) => {
    const base = data.current ?? data.latest;
    return toFicha(base ? { ...base.data, fecha: data.defaults.fecha, firma: "" } : data.defaults);
  };

  useEffect(() => {
    if (!isOpen) return;
    let alive = true;
    setInfo(null);
    setLoadError("");
    setError("");
    fetchRecordForm(appointment.id)
      .then((data) => {
        if (!alive) return;
        const base = data.current ?? data.latest;
        setInfo(data);
        setMode(base ? "edit" : "new");
        setFicha(base ? toFicha(base.data) : newFicha(data));
      })
      .catch((err) => alive && setLoadError(getErrorMessage(err)));
    return () => {
      alive = false;
    };
    // newFicha solo depende de los datos que recibe
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, appointment.id]);

  const changeMode = (next) => {
    setMode(next);
    setFicha(next === "edit" ? toFicha(target.data) : newFicha());
  };

  const set = (key) => (e) => setFicha((f) => ({ ...f, [key]: e.target.value }));
  const setBirth = (e) => {
    const fechaNacimiento = e.target.value;
    setFicha((f) => ({ ...f, fechaNacimiento, edad: ageFrom(fechaNacimiento) || f.edad }));
  };
  const setAnswer = (key) => (value) =>
    setFicha((f) => {
      const respuestas = { ...f.respuestas };
      if (value) respuestas[key] = value;
      else delete respuestas[key];
      return { ...f, respuestas };
    });

  const save = async () => {
    if (!ficha.nombre.trim()) return setError("Escribe el nombre del paciente.");
    setSaving(true);
    setError("");
    try {
      const { historialPDF, medicalRecordId } = await saveRecord(appointment.id, {
        recordId: mode === "edit" ? target.id : undefined,
        data: ficha,
      });
      notify.success(mode === "edit" ? "Ficha actualizada" : "Ficha creada", "El PDF se generó con el formato de la clínica.");
      onSaved?.({ id: appointment.id, historialPDF, medicalRecordId });
      onClose();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const recordLabel = (record) => {
    const day = formatDay(record.appointment.date);
    const edited = record.updatedByName ? ` · editada por ${record.updatedByName}` : "";
    return `${day} · ${record.createdByName}${edited}`;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} scrollBehavior="inside" size={{ base: "full", md: "4xl" }}>
      <ModalOverlay />
      <ModalContent borderRadius={{ md: "2xl" }}>
        <ModalHeader>
          <Stack spacing={0}>
            <Text>Ficha clínica</Text>
            <Text fontSize="sm" fontWeight="400" color="text.muted">
              {appointment.firstName} {appointment.lastName} · {appointment.ci}
            </Text>
          </Stack>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {loadError ? (
            <Alert status="error" borderRadius="lg">
              <AlertIcon />
              <AlertDescription>{loadError}</AlertDescription>
            </Alert>
          ) : !info ? (
            <Center py={16}>
              <Spinner color="brand.500" />
            </Center>
          ) : (
            <Stack spacing={7}>
              {target && (
                <Box p={4} borderRadius="xl" borderWidth="1px" borderColor="border.subtle">
                  <RadioGroup value={mode} onChange={changeMode}>
                    <Stack spacing={3}>
                      <Radio value="edit" alignItems="flex-start">
                        <Text fontWeight="600" lineHeight="short">
                          {info.current ? "Editar la ficha de esta consulta" : "Editar la última ficha del paciente"}
                        </Text>
                        <Text fontSize="sm" color="text.muted">
                          {recordLabel(target)}. Se vuelve a generar su PDF.
                        </Text>
                      </Radio>
                      <Radio value="new" alignItems="flex-start">
                        <Text fontWeight="600" lineHeight="short">
                          Crear una ficha nueva aparte
                        </Text>
                        <Text fontSize="sm" color="text.muted">
                          La ficha anterior se conserva. La nueva parte de sus datos y genera otro PDF.
                        </Text>
                      </Radio>
                    </Stack>
                  </RadioGroup>
                  {mode === "new" && (
                    <Button size="xs" variant="link" mt={3} onClick={() => setFicha(toFicha(info.defaults))}>
                      Empezar en blanco
                    </Button>
                  )}
                </Box>
              )}

              <Section title="Datos del paciente">
                <Grid templateColumns={{ base: "1fr", md: "repeat(4, 1fr)" }} gap={4}>
                  <Field label="Fecha">
                    <Input type="date" value={ficha.fecha} onChange={set("fecha")} />
                  </Field>
                  <Field label="Nombre y apellido" span={3}>
                    <Input value={ficha.nombre} onChange={set("nombre")} />
                  </Field>
                  <Field label="C.I.">
                    <Input value={ficha.ci} onChange={set("ci")} />
                  </Field>
                  <Field label="Fecha de nacimiento">
                    <Input type="date" value={ficha.fechaNacimiento} onChange={setBirth} />
                  </Field>
                  <Field label="Edad">
                    <Input value={ficha.edad} onChange={set("edad")} inputMode="numeric" maxLength={3} />
                  </Field>
                  <Field label="Sexo">
                    <RadioGroup value={ficha.sexo} onChange={(sexo) => setFicha((f) => ({ ...f, sexo }))}>
                      <Stack direction="row" spacing={4} h="40px" align="center">
                        <Radio value="M">Masculino</Radio>
                        <Radio value="F">Femenino</Radio>
                      </Stack>
                    </RadioGroup>
                  </Field>
                  <Field label="Lugar de nacimiento" span={2}>
                    <Input value={ficha.lugarNacimiento} onChange={set("lugarNacimiento")} />
                  </Field>
                  <Field label="Celular" span={2}>
                    <Input type="tel" value={ficha.celular} onChange={set("celular")} />
                  </Field>
                  <Field label="Dirección" span={4}>
                    <Input value={ficha.direccion} onChange={set("direccion")} />
                  </Field>
                  <Field label="Antecedentes familiares" span={4}>
                    <Input value={ficha.antecedentes} onChange={set("antecedentes")} />
                  </Field>
                </Grid>
              </Section>

              <Section title="Consulta">
                <Grid templateColumns={{ base: "1fr", md: "repeat(4, 1fr)" }} gap={4}>
                  <Field label="Motivo de consulta" span={2}>
                    <Input value={ficha.motivo} onChange={set("motivo")} />
                  </Field>
                  <Field label="Dolor">
                    <Input value={ficha.dolor} onChange={set("dolor")} />
                  </Field>
                  <Field label="Control">
                    <Input value={ficha.control} onChange={set("control")} />
                  </Field>
                  <Field label="Enfermedad actual" span={4}>
                    <Input value={ficha.enfermedadActual} onChange={set("enfermedadActual")} />
                  </Field>
                </Grid>
              </Section>

              <Section title="Antecedentes médicos">
                <SimpleGrid columns={{ base: 1, md: 2 }} spacingX={8} spacingY={0}>
                  {QUESTION_COLUMNS.map((column, i) => (
                    <Stack key={i} spacing={0}>
                      {column.map(([key, label, sub]) => (
                        <Stack
                          key={key}
                          direction="row"
                          justify="space-between"
                          align="center"
                          py={1.5}
                          pl={sub ? 4 : 0}
                          borderBottomWidth="1px"
                          borderColor="border.subtle"
                        >
                          <Text fontSize="sm" color={sub ? "text.muted" : undefined}>
                            {label}
                          </Text>
                          <YesNo value={ficha.respuestas[key]} onChange={setAnswer(key)} />
                        </Stack>
                      ))}
                    </Stack>
                  ))}
                </SimpleGrid>
                <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={4} mt={4}>
                  <Field label="Otras alergias">
                    <Input value={ficha.alergiaOtros} onChange={set("alergiaOtros")} />
                  </Field>
                  <Field label="Fechas de ciclo menstrual">
                    <Input value={ficha.fechaCiclo} onChange={set("fechaCiclo")} />
                  </Field>
                  <Field label="Cigarrillos diarios">
                    <Input value={ficha.cigarrillosDiarios} onChange={set("cigarrillosDiarios")} inputMode="numeric" />
                  </Field>
                </Grid>
              </Section>

              <Section title="Piel">
                <Stack spacing={4}>
                  <Field label="Biotipo de piel">
                    <Wrap spacing={2}>
                      {BIOTIPOS.map((label, index) => (
                        <Button
                          key={label}
                          size="sm"
                          variant={ficha.biotipo === index ? "solid" : "outline"}
                          colorScheme={ficha.biotipo === index ? "brand" : "gray"}
                          onClick={() => setFicha((f) => ({ ...f, biotipo: f.biotipo === index ? null : index }))}
                        >
                          {label}
                        </Button>
                      ))}
                    </Wrap>
                  </Field>
                  <Field label="Fototipo de piel">
                    <Wrap spacing={2}>
                      {FOTOTIPOS.map((label, index) => (
                        <Button
                          key={label}
                          size="sm"
                          minW="44px"
                          variant={ficha.fototipo === index ? "solid" : "outline"}
                          colorScheme={ficha.fototipo === index ? "brand" : "gray"}
                          onClick={() => setFicha((f) => ({ ...f, fototipo: f.fototipo === index ? null : index }))}
                        >
                          {label}
                        </Button>
                      ))}
                    </Wrap>
                  </Field>
                </Stack>
              </Section>

              <Section title="Diagnóstico y plan de tratamiento">
                <Stack spacing={4}>
                  <Field helper="En el PDF caben unas cuatro líneas; si el texto es largo, la letra se reduce.">
                    <Textarea rows={4} value={ficha.diagnostico} onChange={set("diagnostico")} maxLength={600} />
                  </Field>
                  <Field label="Firma del paciente" helper="Nombre de quien firma la ficha.">
                    <Input value={ficha.firma} onChange={set("firma")} maxW={{ md: "50%" }} />
                  </Field>
                </Stack>
              </Section>

              {error && (
                <Alert status="error" borderRadius="lg">
                  <AlertIcon />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </Stack>
          )}
        </ModalBody>
        <ModalFooter gap={3}>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={save} isLoading={saving} isDisabled={!info}>
            {mode === "edit" ? "Guardar y actualizar PDF" : "Guardar y generar PDF"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default MedicalRecordForm;
