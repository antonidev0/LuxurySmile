import {
  Alert,
  AlertDescription,
  AlertIcon,
  Badge,
  Button,
  Flex,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useState } from "react";
import { FiCheck, FiMail, FiRotateCcw, FiUserX } from "react-icons/fi";
import { useNotify } from "../../hooks/useNotify";
import { deactivateStaff, reactivateStaff, resendInvitation, verifyStaff } from "../../services/staff.service";
import { ACCOUNT_STATUS, accountStatus } from "../../utils/staff";

const STATUS_TEXT = {
  active: "Puede iniciar sesión y gestionar la clínica.",
  pending: "Aún no ha verificado su correo, así que no puede iniciar sesión.",
  inactive: "La cuenta está desactivada y no puede iniciar sesión. Sus datos se conservan.",
};

// Acceso de un administrador: invitación, activación y desactivación de la cuenta
const AccessModal = ({ person, currentUserId, activeAdmins, onClose, onSaved }) => {
  const notify = useNotify();
  const [busy, setBusy] = useState("");
  const status = person && accountStatus(person);
  const isSelf = person?.id === currentUserId;
  const lastAdmin = status !== "inactive" && activeAdmins <= 1;

  const run = async (key, fn, okTitle) => {
    setBusy(key);
    try {
      const updated = await fn();
      if (updated?.id) onSaved(updated);
      notify.success(okTitle);
      if (updated?.id) onClose();
    } catch (err) {
      notify.error("No se pudo completar la acción", err);
    } finally {
      setBusy("");
    }
  };

  return (
    <Modal isOpen={Boolean(person)} onClose={onClose} isCentered size="md">
      <ModalOverlay />
      <ModalContent mx={4} borderRadius="2xl">
        <ModalHeader>
          Gestionar acceso
          {person && (
            <Text fontSize="sm" fontWeight="400" color="text.muted">
              {person.name} {person.lastName}
            </Text>
          )}
        </ModalHeader>
        <ModalCloseButton />
        {person && (
          <ModalBody>
            <Stack spacing={4}>
              <Flex align="center" gap={2}>
                <Text fontSize="sm">Estado de la cuenta:</Text>
                <Badge colorScheme={ACCOUNT_STATUS[status].color} variant="outline" borderRadius="full" textTransform="none">
                  {ACCOUNT_STATUS[status].label}
                </Badge>
              </Flex>
              <Text fontSize="sm" color="text.muted">
                {STATUS_TEXT[status]}
              </Text>

              {status === "pending" && (
                <Stack direction={{ base: "column", sm: "row" }} spacing={3}>
                  <Button size="sm" variant="outline" leftIcon={<FiMail />} isLoading={busy === "resend"} onClick={() => run("resend", () => resendInvitation(person.email), "Invitación reenviada")}>
                    Reenviar invitación
                  </Button>
                  <Button size="sm" colorScheme="green" leftIcon={<FiCheck />} isLoading={busy === "verify"} onClick={() => run("verify", () => verifyStaff(person.id), "Cuenta activada")}>
                    Activar ahora
                  </Button>
                </Stack>
              )}

              {status === "inactive" ? (
                <Button size="sm" leftIcon={<FiRotateCcw />} alignSelf="flex-start" isLoading={busy === "reactivate"} onClick={() => run("reactivate", () => reactivateStaff(person.id), "Acceso reactivado")}>
                  Reactivar acceso
                </Button>
              ) : (
                <>
                  {(isSelf || lastAdmin) && (
                    <Alert status="info" borderRadius="xl">
                      <AlertIcon />
                      <AlertDescription fontSize="sm">
                        {isSelf ? "No puedes desactivar tu propia cuenta." : "Es el único administrador activo; no se puede desactivar."}
                      </AlertDescription>
                    </Alert>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    colorScheme="red"
                    leftIcon={<FiUserX />}
                    alignSelf="flex-start"
                    isDisabled={isSelf || lastAdmin}
                    isLoading={busy === "deactivate"}
                    onClick={() => run("deactivate", () => deactivateStaff(person.id), "Acceso desactivado")}
                  >
                    Desactivar acceso
                  </Button>
                </>
              )}
            </Stack>
          </ModalBody>
        )}
        <ModalFooter>
          <Button variant="ghost" onClick={onClose}>
            Cerrar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AccessModal;
