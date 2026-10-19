import { Button, Center, Heading, Stack, Text } from "@chakra-ui/react";
import { Link } from "react-router-dom";

const NotFoundPage = () => (
  <Center minH="80vh" px={4} pt={24}>
    <Stack spacing={4} textAlign="center" align="center">
      <Text fontFamily="heading" fontSize={{ base: "7xl", md: "9xl" }} color="gold.400" lineHeight={1}>
        404
      </Text>
      <Heading fontSize="2xl">Esta página no existe</Heading>
      <Text color="text.muted">Puede que el enlace esté mal escrito o que la página se haya movido.</Text>
      <Button as={Link} to="/">
        Ir al inicio
      </Button>
    </Stack>
  </Center>
);

export default NotFoundPage;
