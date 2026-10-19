import { Alert, AlertDescription, AlertIcon, Button } from "@chakra-ui/react";

const ErrorState = ({ message, onRetry }) => (
  <Alert status="error" borderRadius="xl" flexWrap="wrap" gap={2}>
    <AlertIcon />
    <AlertDescription flex="1">{message}</AlertDescription>
    {onRetry && (
      <Button size="sm" variant="outline" colorScheme="red" onClick={onRetry}>
        Reintentar
      </Button>
    )}
  </Alert>
);

export default ErrorState;
