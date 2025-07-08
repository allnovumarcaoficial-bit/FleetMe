"use client";

import "@ant-design/v5-patch-for-react-19";
import { SidebarProvider } from "@/components/Layouts/sidebar/sidebar-context";
import { ThemeProvider } from "next-themes";
import { SessionProvider } from "next-auth/react";
import { ConfigProvider } from "antd";
import es_ES from "antd/locale/es_ES";
import { Session } from "next-auth";

type ProvidersProps = {
  children: React.ReactNode;
  session?: Session | null;
};

export function Providers({ children, session }: ProvidersProps) {
  return (
    <SessionProvider session={session}>
      <ConfigProvider locale={es_ES}>
        <ThemeProvider defaultTheme="light" attribute="class">
          <SidebarProvider>{children}</SidebarProvider>
        </ThemeProvider>
      </ConfigProvider>
    </SessionProvider>
  );
}
