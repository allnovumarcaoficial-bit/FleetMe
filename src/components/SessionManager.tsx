"use client";

import useIdleTimeout from "@/hooks/useIdleTimeout";

const SessionManager = () => {
  useIdleTimeout(5 * 60 * 1000); // 5 minutos en milisegundos
  return null; // Este componente no renderiza nada
};

export default SessionManager;
