import AppRouter from "./router/AppRouter";
import AuthProvider from "./context/AuthContext";
import { ChakraProvider } from "@chakra-ui/react";
import theme from './components/theme';

const App = () => (
  <ChakraProvider theme={theme}>
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  </ChakraProvider>
);


export default App;
