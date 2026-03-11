import React from "react";
import { axiosClient } from "../../api";
import {
  clearAuthSession,
  getAuthToken,
  onAuthExpired,
  persistAuthSession,
} from "../../lib/auth-storage";

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
}
const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = React.useState<User | null>(() => {
    try {
      const storedUser = localStorage.getItem("auth_user");
      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = React.useState<string | null>(() => {
    return getAuthToken();
  });

  const isAuthenticated = !!token && !!user;

  // Set initial token in api headers if it exists
  React.useEffect(() => {
    if (token) {
      axiosClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete axiosClient.defaults.headers.common["Authorization"];
    }
  }, [token]);

  React.useEffect(() => {
    return onAuthExpired(() => {
      setUser(null);
      setToken(null);
    });
  }, []);

  const login = (user: User, accessToken: string) => {
    setUser(user);
    setToken(accessToken);
    try {
      persistAuthSession(user, accessToken);
    } catch (error) {
      console.error("Failed to save auth data to localStorage:", error);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    try {
      clearAuthSession();
    } catch (error) {
      console.error("Failed to remove auth data from localStorage:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, token, isAuthenticated, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
