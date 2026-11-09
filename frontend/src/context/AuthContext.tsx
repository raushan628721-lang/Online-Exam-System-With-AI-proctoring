import React, { createContext, useContext, useState, useEffect } from "react";
import { User, Role } from "../types";
import { authApi } from "../services/api";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (data: { email: string; password: string; name: string; role?: Role; classGroup?: string }) => Promise<User>;
  logout: () => void;
  quickLogin: (role: Role) => Promise<void>;
  updateCurrentUser: (updatedUser: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        try {
          const profile = await authApi.getMe();
          setUser(profile);
        } catch (error) {
          console.error("Session expired or invalid");
          localStorage.removeItem("token");
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await authApi.login({ email, password });
    localStorage.setItem("token", res.token);
    setToken(res.token);
    setUser(res.user);
    return res.user;
  };

  const register = async (data: { email: string; password: string; name: string; role?: Role; classGroup?: string }) => {
    const res = await authApi.register(data);
    localStorage.setItem("token", res.token);
    setToken(res.token);
    setUser(res.user);
    return res.user;
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  const quickLogin = async (role: Role) => {
    if (role === "ADMIN") {
      await login("admin@exam.com", "admin123");
    } else if (role === "FACULTY") {
      await login("faculty@exam.com", "faculty123");
    } else {
      await login("student@exam.com", "student123");
    }
  };

  const updateCurrentUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout, quickLogin, updateCurrentUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};