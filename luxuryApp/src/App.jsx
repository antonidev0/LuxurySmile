import AppRouter from "./router/AppRouter";
import { ChakraProvider } from "@chakra-ui/react";
import theme from './components/theme';

// AuthProvider ya envuelve la app en main.jsx; no se repite aquí
const App = () => (
  <ChakraProvider theme={theme}>
    <AppRouter />
  </ChakraProvider>
);


export default App;
