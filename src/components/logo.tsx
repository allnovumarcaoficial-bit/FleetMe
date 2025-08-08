import darkLogo from "@/assets/logos/fleetLog.png";
import logo from "@/assets/logos/fleetLog.png";
import Image from "next/image";

export function Logo() {
  return (
    <div className="flex h-20 w-[150px] items-center justify-center">
      {" "}
      {/* Contenedor con tamaño fijo */}
      <Image
        src={logo}
        width={120} // Ajusta según el tamaño deseado (ancho)
        height={40} // Ajusta según el tamaño deseado (alto)
        className="mb-10 object-contain dark:hidden" // Mantiene la proporción
        alt="NextAdmin logo"
        quality={100}
      />
      <Image
        src={darkLogo}
        width={120} // Mismo tamaño que la imagen clara
        height={40}
        className="mb-10 hidden object-contain dark:block"
        alt="NextAdmin logo"
        quality={100}
      />
    </div>
  );
}
