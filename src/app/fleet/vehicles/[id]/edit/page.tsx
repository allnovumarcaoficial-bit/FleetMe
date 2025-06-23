'use client';

import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import VehicleForm from "@/components/Fleet/VehicleForm";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Vehicle } from "@/types/fleet";
interface EditVehiclePageProps {
  params: Promise<{
    id: string;
  }>;
}

const EditVehiclePage = ({ params }: EditVehiclePageProps) => {
  const router = useRouter();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { id: paramId } = React.use(params);

  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        const response = await fetch(`/api/vehicles/${paramId}`); // Use paramId here
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setVehicle(data);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchVehicle();
  }, [paramId]);

  const handleSuccess = () => {
    console.log('Vehicle updated successfully!');
    // Redirection is handled within VehicleForm
  };

  const handleCancel = () => {
    router.push('/fleet/vehicles');
  };

  if (loading) return <p>Cargando vehículo para editar...</p>;
  if (error) return <p className="text-red-500">Error al cargar vehículo: {error}</p>;
  if (!vehicle) return <p>Vehículo no encontrado.</p>;

  return (
    <>
      <Breadcrumb
        pageName="Editar Vehículo"
        links={[
          { href: "/fleet", label: "Flota" },
          { href: "/fleet/vehicles", label: "Vehículos" },
          { href: `/fleet/vehicles/${paramId}`, label: "Detalles del Vehículo" },
        ]}
      />
      <VehicleForm initialData={vehicle} onSuccess={handleSuccess} onCancel={handleCancel} />
    </>
  );
};

export default EditVehiclePage;
