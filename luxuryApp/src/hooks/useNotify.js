import { useToast } from "@chakra-ui/react";
import { useMemo } from "react";
import { getErrorMessage } from "../services/api";

// Atajos para los avisos de la interfaz
export const useNotify = () => {
  const toast = useToast({ position: "top-right", duration: 3500, isClosable: true });

  return useMemo(
    () => ({
      success: (title, description) => toast({ title, description, status: "success" }),
      info: (title, description) => toast({ title, description, status: "info" }),
      error: (title, error) =>
        toast({ title, description: error ? getErrorMessage(error) : undefined, status: "error", duration: 5000 }),
    }),
    [toast]
  );
};
