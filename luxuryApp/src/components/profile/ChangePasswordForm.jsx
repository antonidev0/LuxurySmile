import { Button, Flex, SimpleGrid, Stack } from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNotify } from "../../hooks/useNotify";
import { changeMyPassword } from "../../services/profile.service";
import { passwordChangeSchema } from "../../validations/profileSchema";
import PasswordInput from "../staff/PasswordInput";
import PasswordStrengthMeter from "../staff/PasswordStrengthMeter";
import FormField from "./FormField";

const EMPTY = { currentPassword: "", newPassword: "", confirmPassword: "" };

const ChangePasswordForm = () => {
  const notify = useNotify();
  const {
    register,
    handleSubmit,
    reset,
    setError,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(passwordChangeSchema), mode: "onTouched", defaultValues: EMPTY });

  const onSubmit = async ({ currentPassword, newPassword }) => {
    try {
      await changeMyPassword({ currentPassword, newPassword });
      reset(EMPTY);
      notify.success("Contraseña actualizada", "Úsala la próxima vez que inicies sesión.");
    } catch (err) {
      const field = err?.response?.data?.field;
      if (field === "currentPassword" || field === "newPassword") setError(field, { message: err.response.data.message });
      else notify.error("No se pudo cambiar la contraseña", err);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <Stack spacing={4}>
        <FormField label="Contraseña actual" error={errors.currentPassword}>
          <PasswordInput autoComplete="current-password" {...register("currentPassword")} />
        </FormField>
        <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4}>
          <FormField label="Nueva contraseña" error={errors.newPassword}>
            <PasswordInput {...register("newPassword")} />
          </FormField>
          <FormField label="Confirmar nueva contraseña" error={errors.confirmPassword}>
            <PasswordInput {...register("confirmPassword")} />
          </FormField>
        </SimpleGrid>
        <PasswordStrengthMeter password={watch("newPassword")} />
      </Stack>
      <Flex justify="flex-end" mt={5}>
        <Button type="submit" isLoading={isSubmitting} loadingText="Guardando">
          Cambiar contraseña
        </Button>
      </Flex>
    </form>
  );
};

export default ChangePasswordForm;
