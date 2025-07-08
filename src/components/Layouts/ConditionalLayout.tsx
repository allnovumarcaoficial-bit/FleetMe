"use client";

import { usePathname } from "next/navigation";
import type { PropsWithChildren } from "react";
import DashboardLayout from "./DashboardLayout";

export default function ConditionalLayout({ children }: PropsWithChildren) {
  const pathname = usePathname();
  const isAuthPage = pathname.startsWith("/auth");

  return isAuthPage ? (
    <>{children}</>
  ) : (
    <DashboardLayout>{children}</DashboardLayout>
  );
}
