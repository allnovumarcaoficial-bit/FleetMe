"use client";

import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import DriverForm from "@/components/Fleet/Forms/DriverForm";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Driver } from "@/types/fleet";

interface EditDriverPageProps {
  params: Promise<{
    id: string;
  }>;
}

const EditDriverPage = ({ params }: EditDriverPageProps) => {
  const router = useRouter();
  const [driver, setDriver] = useState<Driver | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { id: paramId } = React.use(params);

  useEffect(() => {
    const fetchDriver = async () => {
      try {
        const response = await fetch(`/api/drivers/${paramId}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setDriver(data);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDriver();
  }, [paramId]);

  const handleSuccess = () => {
    console.log("Driver updated successfully!");
    // Redirection is handled within DriverForm
  };

  const handleCancel = () => {
    router.push("/fleet/drivers");
  };

  if (loading) return <p>Cargando conductor para editar...</p>;
  if (error)
    return <p className="text-red-500">Error al cargar conductor: {error}</p>;
  if (!driver) return <p>Conductor no encontrado.</p>;

  return (
    <>
      <Breadcrumb
        pageName="Editar Conductor"
        links={[
          { href: "/fleet/drivers", label: "Flota" },
          { href: "/fleet/drivers", label: "Conductores" },
        ]}
      />
      <DriverForm
        initialData={driver}
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </>
  );
};

export default EditDriverPage;
