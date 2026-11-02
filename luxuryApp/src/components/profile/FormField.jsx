import { FormControl, FormErrorMessage, FormHelperText, FormLabel } from "@chakra-ui/react";

// Campo de formulario con su etiqueta y el error de react-hook-form
const FormField = ({ label, error, helper, children, ...props }) => (
  <FormControl isInvalid={Boolean(error)} {...props}>
    <FormLabel fontSize="sm">{label}</FormLabel>
    {children}
    {error ? <FormErrorMessage>{error.message}</FormErrorMessage> : helper && <FormHelperText>{helper}</FormHelperText>}
  </FormControl>
);

export default FormField;
