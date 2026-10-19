import { Center, Spinner } from "@chakra-ui/react";

const LoadingState = ({ minH = "40vh" }) => (
  <Center minH={minH}>
    <Spinner size="lg" color="brand.500" thickness="3px" />
  </Center>
);

export default LoadingState;
