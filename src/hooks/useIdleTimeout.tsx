"use client";

import { useEffect, useRef } from "react";
import { signOut, useSession } from "next-auth/react";

const useIdleTimeout = (timeout: number) => {
  const { data: session } = useSession();
  const timeoutId = useRef<NodeJS.Timeout | null>(null);

  const resetTimer = () => {
    if (timeoutId.current) {
      clearTimeout(timeoutId.current);
    }
    if (session) {
      timeoutId.current = setTimeout(() => {
        signOut({
          callbackUrl: `/auth/signin?callbackUrl=${encodeURIComponent(
            window.location.pathname,
          )}&error=SessionExpired`,
        });
      }, timeout);
    }
  };

  const handleActivity = () => {
    resetTimer();
  };

  useEffect(() => {
    const events = ["mousemove", "keydown", "mousedown", "touchstart"];

    const addEventListeners = () => {
      events.forEach((event) => {
        window.addEventListener(event, handleActivity);
      });
    };

    const removeEventListeners = () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
    };

    if (session) {
      addEventListeners();
      resetTimer();
    } else {
      removeEventListeners();
      if (timeoutId.current) {
        clearTimeout(timeoutId.current);
      }
    }

    return () => {
      removeEventListeners();
      if (timeoutId.current) {
        clearTimeout(timeoutId.current);
      }
    };
  }, [session, timeout]);

  return null;
};

export default useIdleTimeout;
