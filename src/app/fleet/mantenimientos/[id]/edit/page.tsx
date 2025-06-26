'use client';

import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import MantenimientoForm from "@/components/Fleet/MantenimientoForm";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Mantenimiento } from "@/types/fleet";

interface EditMantenimientoPageProps {
  params: Promise<{
    id: string;
  }>;
}

const EditMantenimientoPage = ({ params }: EditMantenimientoPageProps) => {
  const router = useRouter();
  const [mantenimiento, setMantenimiento] = useState<Mantenimiento | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { id: paramId } = React.use(params);

  useEffect(() => {
    const fetchMantenimiento = async () => {
      try {
        const response = await fetch(`/api/mantenimientos/${paramId}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setMantenimiento(data);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchMantenimiento();
  }, [paramId]);

  const handleSuccess = () => {
    console.log('Mantenimiento updated successfully!');
    // Redirection is handled within MantenimientoForm
  };

  const handleCancel = () => {
    router.push('/fleet/mantenimientos');
  };

  if (loading) return <p>Cargando mantenimiento para editar...</p>;
  if (error) return <p className="text-red-500">Error al cargar mantenimiento: {error}</p>;
  if (!mantenimiento) return <p>Mantenimiento no encontrado.</p>;

  return (
    <>
      <Breadcrumb
        pageName="Editar Mantenimiento"
        links={[
          { href: "/fleet", label: "Flota" },
          { href: "/fleet/mantenimientos", label: "Mantenimientos" },
        ]}
      />
      <MantenimientoForm initialData={mantenimiento} onSuccess={handleSuccess} onCancel={handleCancel} />
    </>
  );
};

export default EditMantenimientoPage;
