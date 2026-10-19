import { extendTheme } from "@chakra-ui/react";

// Paleta de marca: tinta profunda (confianza) + champán (lujo) sobre marfil
const colors = {
  brand: {
    50: "#e8f1f3",
    100: "#c7dce1",
    200: "#9fc2ca",
    300: "#73a5b0",
    400: "#4b8a97",
    500: "#2c6f7e",
    600: "#1f5866",
    700: "#17434e",
    800: "#0f2f37",
    900: "#081c21",
  },
  gold: {
    50: "#faf5ec",
    100: "#f1e5cc",
    200: "#e6d2a8",
    300: "#d9bc82",
    400: "#cda863",
    500: "#b8914a",
    600: "#97753a",
    700: "#73582c",
    800: "#4f3c1e",
    900: "#2d2211",
  },
  ivory: "#fbf9f5",
};

const theme = extendTheme({
  config: { initialColorMode: "light", useSystemColorMode: false },
  colors,
  fonts: {
    heading: `'Bodoni Moda', Georgia, serif`,
    body: `'Inter Variable', system-ui, -apple-system, 'Segoe UI', sans-serif`,
  },
  semanticTokens: {
    colors: {
      "bg.canvas": "ivory",
      "bg.surface": "white",
      "bg.muted": "gray.50",
      "text.muted": "gray.600",
      "border.subtle": "blackAlpha.100",
    },
  },
  shadows: {
    soft: "0 1px 2px rgba(8, 28, 33, 0.04), 0 8px 24px rgba(8, 28, 33, 0.06)",
    lift: "0 12px 40px rgba(8, 28, 33, 0.12)",
  },
  styles: {
    global: {
      "html, body": { bg: "bg.canvas", color: "gray.800", scrollBehavior: "smooth" },
      "::selection": { bg: "gold.200" },
    },
  },
  components: {
    Button: {
      baseStyle: { fontWeight: 600, borderRadius: "full" },
      defaultProps: { colorScheme: "brand" },
    },
    Heading: {
      baseStyle: { fontWeight: 600, letterSpacing: "-0.01em", color: "brand.900" },
    },
    Input: { defaultProps: { focusBorderColor: "brand.500" } },
    Select: { defaultProps: { focusBorderColor: "brand.500" } },
    Textarea: { defaultProps: { focusBorderColor: "brand.500" } },
    Card: {
      baseStyle: {
        container: { borderRadius: "2xl", boxShadow: "soft", borderWidth: "1px", borderColor: "border.subtle" },
      },
    },
  },
});

export default theme;
