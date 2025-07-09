"use client";

import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import FuelCardForm from "@/components/Fleet/Forms/FuelCardForm";
import { useRouter } from "next/navigation";

const NewFuelCardPage = () => {
  const router = useRouter();

  const handleSuccess = () => {
    console.log("Fuel card created successfully!");
  };

  const handleCancel = () => {
    router.push("/fleet/fuel-cards");
  };

  return (
    <>
      <Breadcrumb
        pageName="Añadir Nueva Tarjeta de Combustible"
        links={[
          { href: "/fleet", label: "Flota" },
          { href: "/fleet/fuel-cards", label: "Tarjetas de Combustible" },
        ]}
      />
      <FuelCardForm onSuccess={handleSuccess} onCancel={handleCancel} />
    </>
  );
};

export default NewFuelCardPage;
