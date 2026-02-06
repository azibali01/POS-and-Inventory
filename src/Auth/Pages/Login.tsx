import { useForm } from "@mantine/form";
import {
  TextInput,
  Button,
  Card,
  Title,
  Stack,
  Text,
  PasswordInput,
  LoadingOverlay,
  Box,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useDisclosure } from "@mantine/hooks";
import { useState } from "react";
import { useAuth } from "../Context/AuthContext";
import { useNavigate } from "react-router";
import { api } from "../../lib/api";

const Login = () => {
  const { login } = useAuth();
  const [visible, { toggle }] = useDisclosure(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email || !password) {
      notifications.show({
        message: "Please enter email and password",
        color: "red",
      });
      return;
    }

    setLoading(true);
    setLoading(true);
    try {
      // Use new Auth endpoint
      const res = await api.post("/auth/login", { email, password });

      // Check for success and token (new response structure)
      if (res.data.success && res.data.user && res.data.access_token) {
        login(
          {
            id: res.data.user._id,
            email: res.data.user.email,
            name: res.data.user.name,
          },
          res.data.access_token
        );

        notifications.show({
          message: `Welcome back, ${res.data.user.name}!`,
          color: "green",
        });
        navigate("/dashboard");
      } else {
        notifications.show({
          message: res.data.message || "Login failed",
          color: "red",
        });
      }
    } catch (error: any) {
      notifications.show({
        message:
          error.response?.data?.message || "Login failed. Please try again.",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  const form = useForm({
    mode: "uncontrolled",
    initialValues: { email: "" },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : "Invalid email"),
    },
  });

  const handleError = (errors: typeof form.errors) => {
    if (errors.email) {
      notifications.show({
        message: "Please provide a valid email",
        color: "red",
      });
    }
  };

  return (
    <Stack>
      <Box pos="relative">
        <LoadingOverlay visible={loading} overlayProps={{ blur: 2 }} />
        <Card
          withBorder
          shadow="xl"
          w={450}
          p="xl"
          style={{
            backgroundColor: "#ffffff",
            borderColor: "#e5e7eb",
            borderWidth: "1px",
          }}
        >
          <Stack align="center" justify="center" gap="lg">
            <Title order={2} c="#1e3a8a" fw={700}>
              7 Star Traders
            </Title>
            <Text c="#6b7280" size="sm">
              Sign in to your account
            </Text>

            <form
              onSubmit={form.onSubmit(() => handleLogin(), handleError)}
              style={{ width: "100%" }}
            >
              <Stack gap="md">
                <TextInput
                  value={email}
                  onChange={(event) => { setEmail(event.currentTarget.value); }}
                  label="Email Address"
                  placeholder="your.email@example.com"
                  size="md"
                  disabled={loading}
                  styles={{
                    label: {
                      color: "#374151",
                      fontWeight: 500,
                      marginBottom: "8px",
                    },
                    input: {
                      backgroundColor: "#ffffff",
                      color: "#111827",
                      borderColor: "#d1d5db",
                      "&:focus": {
                        borderColor: "#1e3a8a",
                        boxShadow: "0 0 0 3px rgba(30, 58, 138, 0.1)",
                      },
                      "&:disabled": {
                        backgroundColor: "#f9fafb",
                        opacity: 0.6,
                      },
                    },
                  }}
                />

                <PasswordInput
                  value={password}
                  onChange={(event) => { setPassword(event.currentTarget.value); }}
                  label="Password"
                  placeholder="Enter your password"
                  size="md"
                  visible={visible}
                  onVisibilityChange={toggle}
                  disabled={loading}
                  styles={{
                    label: {
                      color: "#374151",
                      fontWeight: 500,
                      marginBottom: "8px",
                    },
                    input: {
                      backgroundColor: "#ffffff",
                      color: "#111827",
                      borderColor: "#d1d5db",
                      "&:focus": {
                        borderColor: "#1e3a8a",
                        boxShadow: "0 0 0 3px rgba(30, 58, 138, 0.1)",
                      },
                      "&:disabled": {
                        backgroundColor: "#f9fafb",
                        opacity: 0.6,
                      },
                    },
                  }}
                />

                <Button
                  fullWidth
                  mt="md"
                  size="md"
                  disabled={loading}
                  loading={loading}
                  styles={{
                    root: {
                      backgroundColor: "#1e3a8a",
                      color: "#ffffff",
                      fontWeight: 600,
                      "&:hover": {
                        backgroundColor: "#1e40af",
                      },
                      "&:disabled": {
                        backgroundColor: "#9ca3af",
                        opacity: 0.6,
                      },
                    },
                  }}
                  onClick={handleLogin}
                >
                  Sign In
                </Button>
              </Stack>
            </form>
          </Stack>
        </Card>
      </Box>
    </Stack>
  );
};

export default Login;
