import { Button, Flex, Input, SimpleGrid } from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useAuth } from "../../context/AuthContext";
import { useNotify } from "../../hooks/useNotify";
import { updateMyProfile } from "../../services/profile.service";
import { contactSchema } from "../../validations/profileSchema";
import FormField from "./FormField";

// Teléfono y dirección: lo único que cada uno cambia de su ficha sin pasar por la administración
const ContactInfoForm = () => {
  const { user, updateUser } = useAuth();
  const notify = useNotify();
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isDirty, isSubmitting },
  } = useForm({
    resolver: zodResolver(contactSchema),
    mode: "onTouched",
    defaultValues: { numberPhone: user.numberPhone ?? "", address: user.address ?? "" },
  });

  const onSubmit = async (values) => {
    try {
      const updated = await updateMyProfile(values);
      updateUser(updated);
      reset({ numberPhone: updated.numberPhone, address: updated.address });
      notify.success("Datos actualizados");
    } catch (err) {
      const field = err?.response?.data?.field;
      if (field in values) setError(field, { message: err.response.data.message });
      else notify.error("No se pudieron guardar los cambios", err);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4}>
        <FormField label="Teléfono" error={errors.numberPhone}>
          <Input type="tel" autoComplete="tel" placeholder="+584241234567" {...register("numberPhone")} />
        </FormField>
        <FormField label="Dirección" error={errors.address}>
          <Input autoComplete="street-address" {...register("address")} />
        </FormField>
      </SimpleGrid>
      <Flex justify="flex-end" gap={3} mt={5}>
        <Button variant="ghost" onClick={() => reset()} isDisabled={!isDirty || isSubmitting}>
          Descartar
        </Button>
        <Button type="submit" isLoading={isSubmitting} loadingText="Guardando" isDisabled={!isDirty}>
          Guardar cambios
        </Button>
      </Flex>
    </form>
  );
};

export default ContactInfoForm;
