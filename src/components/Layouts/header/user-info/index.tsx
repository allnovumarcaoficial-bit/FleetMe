"use client";

import { ChevronUpIcon } from "@/assets/icons";
import {
  Dropdown,
  DropdownContent,
  DropdownTrigger,
} from "@/components/ui/dropdown";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { LogOutIcon, SettingsIcon, UserIcon } from "./icons";
import { Skeleton } from "@/components/ui/skeleton";

export function UserInfo() {
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);

  if (status === "loading") {
    return (
      <div className="flex items-center gap-3">
        <Skeleton className="size-12 rounded-full" />
        <div className="space-y-2 max-[1024px]:sr-only">
          <Skeleton className="h-4 w-[80px]" />
        </div>
      </div>
    );
  }

  if (status === "unauthenticated" || !session?.user) {
    return (
      <Link href="/auth/sign-in" className="text-primary">
        Iniciar Sesión
      </Link>
    );
  }

  const { user } = session;

  return (
    <Dropdown isOpen={isOpen} setIsOpen={setIsOpen}>
      <DropdownTrigger className="rounded align-middle outline-none ring-primary ring-offset-2 focus-visible:ring-1 dark:ring-offset-gray-dark">
        <span className="sr-only">Mi cuenta</span>

        <figure className="flex items-center gap-3">
          <Image
            src={user.image || "/images/user/user-03.png"} // Fallback image
            className="size-12 rounded-full"
            alt={`Avatar of ${user.name}`}
            role="presentation"
            width={48}
            height={48}
          />
          <figcaption className="flex items-center gap-1 font-medium text-dark dark:text-dark-6 max-[1024px]:sr-only">
            <span>{user.name}</span>

            <ChevronUpIcon
              aria-hidden
              className={cn(
                "rotate-180 transition-transform",
                isOpen && "rotate-0",
              )}
              strokeWidth={1.5}
            />
          </figcaption>
        </figure>
      </DropdownTrigger>

      <DropdownContent
        className="border border-stroke bg-white shadow-md dark:border-dark-3 dark:bg-gray-dark min-[230px]:min-w-[17.5rem]"
        align="end"
      >
        <h2 className="sr-only">Información del usuario</h2>

        <figure className="flex items-center gap-2.5 px-5 py-3.5">
          <Image
            src={user.image || "/images/user/user-03.png"}
            className="size-12 rounded-full"
            alt={`Avatar for ${user.name}`}
            role="presentation"
            width={48}
            height={48}
          />

          <figcaption className="space-y-1 text-base font-medium">
            <div className="mb-2 leading-none text-dark dark:text-white">
              {user.name}
            </div>

            <div className="leading-none text-gray-6">{user.email}</div>
          </figcaption>
        </figure>

        <hr className="border-[#E8E8E8] dark:border-dark-3" />

        <div className="p-2 text-base text-[#4B5563] dark:text-dark-6 [&>*]:cursor-pointer">
          <Link
            href={"/profile"}
            onClick={() => setIsOpen(false)}
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-[9px] hover:bg-gray-2 hover:text-dark dark:hover:bg-dark-3 dark:hover:text-white"
          >
            <UserIcon />

            <span className="mr-auto text-base font-medium">
              Gestión de Usuarios
            </span>
          </Link>

          <Link
            href={"/settings"}
            onClick={() => setIsOpen(false)}
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-[9px] hover:bg-gray-2 hover:text-dark dark:hover:bg-dark-3 dark:hover:text-white"
          >
            <SettingsIcon />

            <span className="mr-auto text-base font-medium">
              Configuración de la cuenta
            </span>
          </Link>
        </div>

        <hr className="border-[#E8E8E8] dark:border-dark-3" />

        <div className="p-2 text-base text-[#4B5563] dark:text-dark-6">
          <button
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-[9px] hover:bg-gray-2 hover:text-dark dark:hover:bg-dark-3 dark:hover:text-white"
            onClick={() => signOut({ callbackUrl: "/auth/signin" })}
          >
            <LogOutIcon />

            <span className="text-base font-medium">Cerrar sesión</span>
          </button>
        </div>
      </DropdownContent>
    </Dropdown>
  );
}
