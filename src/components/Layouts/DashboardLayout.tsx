'use client';

import { Sidebar } from '@/components/Layouts/sidebar';
import { Header } from '@/components/Layouts/header';
import { usePathname } from 'next/navigation';
import type { PropsWithChildren } from 'react';
import { getTitle } from '@/lib/titles';

export default function DashboardLayout({ children }: PropsWithChildren) {
  const pathname = usePathname();
  const isSignInPage = pathname === '/auth/signin';
  const title = getTitle(pathname);

  if (isSignInPage) {
    return (
      <main className="isolate mx-auto w-full max-w-screen-2xl overflow-hidden p-4 md:p-6 2xl:p-10">
        {children}
      </main>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <div className="w-full bg-gray-2 dark:bg-[#020d1a]">
        <Header pageName={title} />

        <main className="isolate mx-auto w-full max-w-screen-2xl overflow-y-auto p-4 md:p-6 2xl:p-10">
          {children}
        </main>
      </div>
    </div>
  );
}
