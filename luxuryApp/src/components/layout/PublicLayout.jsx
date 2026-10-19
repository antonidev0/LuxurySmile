import { Box } from "@chakra-ui/react";
import { Outlet } from "react-router-dom";
import Footer from "./Footer";
import Navbar from "./Navbar";
import ScrollToTop from "./ScrollToTop";

const PublicLayout = () => (
  <Box minH="100vh" display="flex" flexDirection="column">
    <ScrollToTop />
    <Navbar />
    <Box as="main" flex="1">
      <Outlet />
    </Box>
    <Footer />
  </Box>
);

export default PublicLayout;
