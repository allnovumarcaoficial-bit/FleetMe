"use client";

import Breadcrumbs from "@/components/Breadcrumbs/Breadcrumb";
import FuelOperationForm from "@/components/Fleet/Forms/FuelOperationForm";
import { useRouter } from "next/navigation";

const NewFuelOperationPage = () => {
  const router = useRouter();

  const handleCancel = () => {
    router.push("/fleet/fuel-operations");
  };

  const handleSuccess = () => {
    router.push("/fleet/fuel-operations");
  };

  return (
    <>
      <Breadcrumbs
        pageName="Crear Operación de Combustible"
        links={[
          { href: "/fleet", label: "Flota" },
          {
            href: "/fleet/fuel-operations",
            label: "Operaciones de Combustible",
          },
        ]}
      />

      <div className="flex flex-col gap-10">
        <FuelOperationForm onSuccess={handleSuccess} onCancel={handleCancel} />
      </div>
    </>
  );
};

export default NewFuelOperationPage;
