"use client";

import { SidebarProvider } from "@/components/Layouts/sidebar/sidebar-context";
import { ThemeProvider } from "next-themes";
import { ConfigProvider } from 'antd';
import es_ES from 'antd/locale/es_ES';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ConfigProvider locale={es_ES}>
      <ThemeProvider defaultTheme="light" attribute="class">
        <SidebarProvider>{children}</SidebarProvider>
      </ThemeProvider>
    </ConfigProvider>
  );
}
