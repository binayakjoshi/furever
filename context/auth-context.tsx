"use client";

import { PetOwner, Vet } from "@/lib/types";
import { useRouter } from "next/navigation";
import { createContext, useContext, useState, useEffect } from "react";

type User = PetOwner | Vet;

type AuthContextValue = {
  user: User | null;
  setUser: (u: User | null) => void;
  logout: () => Promise<void>;
  loading: boolean;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({
  initialUser,
  children,
}: {
  initialUser: User | null;
  children: React.ReactNode;
}) => {
  const [user, setUser] = useState<User | null>(initialUser);
  const [loading, setLoading] = useState<boolean>(initialUser === null);
  const router = useRouter();

  // Always fetch current user on mount if initialUser is null
  useEffect(() => {
    if (initialUser !== null) {
      setLoading(false);
      return;
    }
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me", {
          signal: AbortSignal.timeout(5000), // 5 second timeout
        });
        if (res.ok) {
          const json = await res.json();
          setUser(json.data);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Auth fetch error:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [initialUser]);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, setUser, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
