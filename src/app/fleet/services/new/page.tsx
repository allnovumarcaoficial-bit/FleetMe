'use client';

import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import ServiceForm from "@/components/Fleet/ServiceForm";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Servicio, Vehicle } from "@/types/fleet";

const NewServicePage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [initialServiceData, setInitialServiceData] = useState<Partial<Servicio> | undefined>(undefined);
  const [loadingInitialData, setLoadingInitialData] = useState(true);

  useEffect(() => {
    const vehicleIdParam = searchParams.get('vehicleId');
    if (vehicleIdParam) {
      const id = parseInt(vehicleIdParam);
      if (!isNaN(id)) {
        // Optionally fetch vehicle details to pre-fill if needed,
        // but for now, just pass the vehicleId
        setInitialServiceData(prev => ({ ...prev, vehicleId: id }));
      }
    }
    setLoadingInitialData(false);
  }, [searchParams]);

  const handleSuccess = () => {
    console.log('Service created successfully!');
    router.push('/fleet/services');
  };

  const handleCancel = () => {
    router.push('/fleet/services');
  };

  if (loadingInitialData) {
    return <p>Cargando...</p>; // Or a loading spinner
  }

  return (
    <>
      <Breadcrumb
        pageName="Añadir Nuevo Servicio"
        links={[
          { href: "/fleet", label: "Flota" },
          { href: "/fleet/services", label: "Servicios" },
        ]}
      />
      <ServiceForm initialData={initialServiceData} onSuccess={handleSuccess} onCancel={handleCancel} />
    </>
  );
};

export default NewServicePage;
