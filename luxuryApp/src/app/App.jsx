import { ChakraProvider } from "@chakra-ui/react";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "../context/AuthContext";
import theme from "../theme";
import AppRouter from "./AppRouter";

const App = () => (
  <ChakraProvider theme={theme}>
    <AuthProvider>
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
    </AuthProvider>
  </ChakraProvider>
);

export default App;
