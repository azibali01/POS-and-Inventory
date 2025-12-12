import {
  Container,
  Title,
  Text,
  Button,
  Stack,
  Paper,
  Group,
} from "@mantine/core";
import { AlertCircle, Home, RefreshCw } from "lucide-react";
import { env } from "../lib/env";

interface ErrorFallbackProps {
  error: Error | null;
  resetError?: () => void;
}

/**
 * Error Fallback UI Component
 *
 * Displays a user-friendly error message when an error boundary
 * catches an error. Provides options to reload or go home.
 */
export default function ErrorFallback({
  error,
  resetError,
}: ErrorFallbackProps) {
  const handleReload = () => {
    if (resetError) {
      resetError();
    } else {
      window.location.reload();
    }
  };

  const handleGoHome = () => {
    window.location.href = "/";
  };

  return (
    <Container size="sm" style={{ marginTop: "5rem" }}>
      <Paper shadow="sm" p="xl" radius="md">
        <Stack gap="md" align="center">
          <AlertCircle size={64} color="#fa5252" />

          <Title order={2} ta="center">
            Oops! Something went wrong
          </Title>

          <Text c="dimmed" ta="center" size="sm">
            We're sorry for the inconvenience. An unexpected error has occurred.
            Please try reloading the page or return to the home page.
          </Text>

          {/* Show error details in development */}
          {env.IS_DEV && error && (
            <Paper bg="gray.0" p="md" style={{ width: "100%" }}>
              <Text size="xs" c="red" fw={700} mb="xs">
                Error Details (Development Only):
              </Text>
              <Text
                size="xs"
                c="red"
                style={{ fontFamily: "monospace", wordBreak: "break-word" }}
              >
                {error.message}
              </Text>
              {error.stack && (
                <Text
                  size="xs"
                  c="dimmed"
                  mt="xs"
                  style={{ fontFamily: "monospace", whiteSpace: "pre-wrap" }}
                >
                  {error.stack}
                </Text>
              )}
            </Paper>
          )}

          <Group mt="md">
            <Button
              leftSection={<RefreshCw size={16} />}
              onClick={handleReload}
              variant="filled"
            >
              Reload Page
            </Button>
            <Button
              leftSection={<Home size={16} />}
              onClick={handleGoHome}
              variant="light"
            >
              Go to Home
            </Button>
          </Group>
        </Stack>
      </Paper>
    </Container>
  );
}
