"use client";

import type { PropsWithChildren } from "react";

export default function SignInLayout({ children }: PropsWithChildren) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-2 dark:bg-[#020d1a]">
      {children}
    </main>
  );
}
