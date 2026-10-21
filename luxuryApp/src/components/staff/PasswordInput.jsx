import { forwardRef, useState } from "react";
import { IconButton, Input, InputGroup, InputRightElement } from "@chakra-ui/react";
import { FiEye, FiEyeOff } from "react-icons/fi";

// Campo de contraseña con botón para mostrarla
const PasswordInput = forwardRef((props, ref) => {
  const [show, setShow] = useState(false);
  return (
    <InputGroup>
      <Input ref={ref} type={show ? "text" : "password"} autoComplete="new-password" pr={12} {...props} />
      <InputRightElement>
        <IconButton
          size="sm"
          variant="ghost"
          aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}
          icon={show ? <FiEyeOff /> : <FiEye />}
          onClick={() => setShow((v) => !v)}
        />
      </InputRightElement>
    </InputGroup>
  );
});

PasswordInput.displayName = "PasswordInput";

export default PasswordInput;
