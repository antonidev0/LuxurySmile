import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  fonts: {
    heading: `'Bodoni Moda', serif`, // Para títulos
    body: `'Bodoni Moda', serif`,   // Para textos principales
  },
});

export default theme;
