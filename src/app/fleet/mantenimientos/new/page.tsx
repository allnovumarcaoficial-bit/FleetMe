"use client";

import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import MantenimientoForm from "@/components/Fleet/Forms/MantenimientoForm";
import { useRouter } from "next/navigation";

const NewMantenimientoPage = () => {
  const router = useRouter();

  const handleSuccess = () => {
    console.log("Mantenimiento created successfully!");
  };

  const handleCancel = () => {
    router.push("/fleet/mantenimientos");
  };

  return (
    <>
      <Breadcrumb
        pageName="Añadir Nuevo Mantenimiento"
        links={[
          { href: "/fleet", label: "Flota" },
          { href: "/fleet/mantenimientos", label: "Mantenimientos" },
        ]}
      />
      <MantenimientoForm onSuccess={handleSuccess} onCancel={handleCancel} />
    </>
  );
};

export default NewMantenimientoPage;
