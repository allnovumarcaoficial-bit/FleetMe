"use client";

import "@ant-design/v5-patch-for-react-19";
import { SidebarProvider } from "@/components/Layouts/sidebar/sidebar-context";
import { ThemeProvider, useTheme } from "next-themes";
import { SessionProvider } from "next-auth/react";
import { ConfigProvider, theme } from "antd";
import es_ES from "antd/locale/es_ES";
import { Session } from "next-auth";
import { useEffect, useState } from "react";

type ProvidersProps = {
  children: React.ReactNode;
  session?: Session | null;
};

function AntdProvider({ children }: { children: React.ReactNode }) {
  const { theme: currentTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <ConfigProvider
      locale={es_ES}
      theme={{
        algorithm:
          currentTheme === "dark"
            ? theme.darkAlgorithm
            : theme.defaultAlgorithm,
      }}
    >
      {children}
    </ConfigProvider>
  );
}

export function Providers({ children, session }: ProvidersProps) {
  return (
    <SessionProvider session={session}>
      <ThemeProvider defaultTheme="light" attribute="class">
        <AntdProvider>
          <SidebarProvider>{children}</SidebarProvider>
        </AntdProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
