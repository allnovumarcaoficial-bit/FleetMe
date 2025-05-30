'use client';

import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import MantenimientoForm from "@/components/Fleet/MantenimientoForm";
import { useRouter } from "next/navigation";

const NewMantenimientoPage = () => {
  const router = useRouter();

  const handleSuccess = () => {
    console.log('Mantenimiento created successfully!');
  };

  const handleCancel = () => {
    router.push('/fleet/mantenimientos');
  };

  return (
    <>
      <Breadcrumb pageName="Añadir Nuevo Mantenimiento" />
      <MantenimientoForm onSuccess={handleSuccess} onCancel={handleCancel} />
    </>
  );
};

export default NewMantenimientoPage;
