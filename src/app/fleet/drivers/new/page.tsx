'use client';

import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import DriverForm from "@/components/Fleet/DriverForm";
import { useRouter } from "next/navigation";

const NewDriverPage = () => {
  const router = useRouter();

  const handleSuccess = () => {
    console.log('Driver created successfully!');
    // Redirection is handled within DriverForm
  };

  const handleCancel = () => {
    router.push('/fleet/drivers');
  };

  return (
    <>
      <Breadcrumb
        pageName="Añadir Nuevo Conductor"
        links={[
          { href: "/fleet", label: "Flota" },
          { href: "/fleet/drivers", label: "Conductores" },
        ]}
      />
      <DriverForm onSuccess={handleSuccess} onCancel={handleCancel} />
    </>
  );
};

export default NewDriverPage;
