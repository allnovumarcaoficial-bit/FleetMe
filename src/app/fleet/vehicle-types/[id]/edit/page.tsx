'use client';

import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import VehicleTypeForm from "@/components/Fleet/VehicleTypeForm";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { VehicleType } from "@/types/fleet";

interface EditVehicleTypePageProps {
  params: {
    id: string;
  };
}

const EditVehicleTypePage = ({ params }: EditVehicleTypePageProps) => {
  const router = useRouter();
  const [vehicleType, setVehicleType] = useState<VehicleType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { id: paramId } = params;

  useEffect(() => {
    const fetchVehicleType = async () => {
      try {
        const response = await fetch(`/api/vehicle-types/${paramId}`); // Use paramId here
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setVehicleType(data);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchVehicleType();
  }, [paramId]);

  const handleSuccess = () => {
    console.log('Vehicle type updated successfully!');
    // Redirection is handled within VehicleTypeForm
  };

  const handleCancel = () => {
    router.push('/fleet/vehicle-types');
  };

  if (loading) return <p>Cargando tipo de vehículo para editar...</p>;
  if (error) return <p className="text-red-500">Error al cargar tipo de vehículo: {error}</p>;
  if (!vehicleType) return <p>Tipo de vehículo no encontrado.</p>;

  return (
    <>
      <Breadcrumb pageName="Editar Tipo de Vehículo" />
      <VehicleTypeForm initialData={vehicleType} onSuccess={handleSuccess} onCancel={handleCancel} />
    </>
  );
};

export default EditVehicleTypePage;
