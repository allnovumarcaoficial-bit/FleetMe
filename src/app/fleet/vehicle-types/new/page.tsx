'use client';

import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import VehicleTypeForm from "@/components/Fleet/VehicleTypeForm";
import { useRouter } from "next/navigation";

const NewVehicleTypePage = () => {
  const router = useRouter();

  const handleSuccess = () => {
    console.log('Vehicle type created successfully!');
    // Redirection is handled within VehicleTypeForm
  };

  const handleCancel = () => {
    router.push('/fleet/vehicle-types');
  };

  return (
    <>
      <Breadcrumb
        pageName="Añadir Nuevo Tipo de Vehículo"
        links={[
          { href: "/fleet", label: "Flota" },
          { href: "/fleet/vehicle-types", label: "Tipos de Vehículo" },
        ]}
      />
      <VehicleTypeForm onSuccess={handleSuccess} onCancel={handleCancel} />
    </>
  );
};

export default NewVehicleTypePage;
