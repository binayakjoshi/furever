// app/auth/success/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import LoadingSpinner from "@/components/ui/loading-spinner";

export default function OAuthSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const raw = searchParams.get("user");
  const { setUser } = useAuth();

  useEffect(() => {
    if (!raw) {
      router.replace("/auth/error");
      return;
    }

    try {
      const user = JSON.parse(decodeURIComponent(raw));
      setUser(user);
      router.replace("/");
    } catch (err) {
      console.error("Failed to parse OAuth user:", err);
      router.replace("/auth/error");
    }
  }, [raw, router, setUser]);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        width: "100vw",
      }}
    >
      <LoadingSpinner
        text="Signing with Google...."
        variant="pulse"
        size="large"
      />
    </div>
  );
}
