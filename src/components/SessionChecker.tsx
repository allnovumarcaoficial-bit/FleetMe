// components/SessionChecker.tsx
"use client";

import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function SessionChecker() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [sessionValidated, setSessionValidated] = useState(false);

  useEffect(() => {
    const validateSession = async () => {
      const isSessionActiveInStorage = sessionStorage.getItem(
        "next-auth-session-active",
      );

      if (status === "authenticated") {
        if (!isSessionActiveInStorage) {
          await signOut({ redirect: false });
          router.push("/auth/signin");
          return;
        }
      }
      setSessionValidated(true);
    };

    validateSession();
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      sessionStorage.setItem("next-auth-session-active", "true");
    }

    const handleBeforeUnload = () => {
      sessionStorage.removeItem("next-auth-session-active");
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [status]);

  return null;
}
