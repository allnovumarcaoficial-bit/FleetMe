import Signin from "@/components/Auth/Signin";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import Image from "next/image";

export default async function SignIn() {
  const session = await getServerSession(authOptions);

  // Si el usuario ya está autenticado, redirigir al dashboard
  if (session) {
    redirect("/");
  }

  return (
    <div className="rounded-[10px] bg-white shadow-1 dark:bg-gray-dark dark:shadow-card">
      <div className="flex flex-wrap items-center">
        <div className="w-full xl:w-1/2">
          <div className="w-full p-4 sm:p-12.5 xl:p-15">
            <Signin />
          </div>
        </div>

        <div className="hidden w-full p-7.5 xl:block xl:w-1/2">
          <div className="custom-gradient-1 overflow-hidden rounded-2xl px-12.5 pt-12.5 dark:!bg-dark-2 dark:bg-none">
            <Image
              className="hidden dark:block"
              src={"/images/logo/fleetLog.png"}
              alt="Logo"
              width={176}
              height={32}
            />
            <Image
              className="dark:hidden"
              src={"/images/logo/fleetLog.png"}
              alt="Logo"
              width={176}
              height={32}
            />
            <p className="mb-3 text-xl font-medium text-dark dark:text-white">
              Inicia sesión en tu cuenta
            </p>

            <h1 className="mb-4 text-2xl font-bold text-dark dark:text-white sm:text-heading-3">
              ¡Bienvenido de nuevo!
            </h1>

            <p className="w-full max-w-[375px] font-medium text-dark-4 dark:text-dark-6">
              Por favor, inicia sesión en tu cuenta completando los campos
              necesarios a continuación
            </p>

            <div className="mt-31">
              <Image
                src={"/images/grids/grid-02.svg"}
                alt="Logo"
                width={405}
                height={325}
                className="mx-auto dark:opacity-30"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
