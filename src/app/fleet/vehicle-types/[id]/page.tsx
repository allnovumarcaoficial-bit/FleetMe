"use client";

import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { VehicleType } from "@/types/fleet";

interface VehicleTypeDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

const VehicleTypeDetailsPage = ({ params }: VehicleTypeDetailsPageProps) => {
  const router = useRouter();
  const [vehicleType, setVehicleType] = useState<VehicleType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { id: paramId } = React.use(params);

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
  }, [paramId]); // Depend on paramId

  if (loading) return <p>Cargando detalles del tipo de vehículo...</p>;
  if (error)
    return (
      <p className="text-red-500">
        Error al cargar detalles del tipo de vehículo: {error}
      </p>
    );
  if (!vehicleType) return <p>Tipo de vehículo no encontrado.</p>;

  const handleEdit = () => {
    router.push(`/fleet/vehicle-types/${vehicleType.id}/edit`);
  };

  const handleDelete = async () => {
    if (
      window.confirm(
        "¿Estás seguro de que quieres eliminar este tipo de vehículo?",
      )
    ) {
      try {
        const response = await fetch(`/api/vehicle-types/${vehicleType.id}`, {
          method: "DELETE",
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        alert("Tipo de vehículo eliminado exitosamente.");
        router.push("/fleet/vehicle-types"); // Redirect to list after deletion
      } catch (e: any) {
        alert(`Error al eliminar tipo de vehículo: ${e.message}`);
      }
    }
  };

  return (
    <>
      <Breadcrumb
        pageName="Detalles del Tipo de Vehículo"
        links={[
          { href: "/fleet/vehicle-types", label: "Tipos de Vehículo" },
          {
            href: `/fleet/vehicle-types/${vehicleType?.id ?? ""}`,
            label: "Detalles",
          },
        ]}
      />

      <div className="rounded-[10px] border border-stroke bg-white p-4 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card sm:p-7.5">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <p>
            <strong>Nombre:</strong> {vehicleType.nombre}
          </p>
          <p>
            <strong>Cantidad de Neumáticos:</strong>{" "}
            {vehicleType.cantidad_neumaticos}
          </p>
          <p>
            <strong>Tipo de Neumáticos:</strong> {vehicleType.tipo_neumaticos}
          </p>
          <p>
            <strong>Capacidad de Carga:</strong> {vehicleType.capacidad_carga}
          </p>
          <p>
            <strong>Cantidad de Conductores:</strong>{" "}
            {vehicleType.cantidad_conductores}
          </p>
          <p>
            <strong>Ciclo de Mantenimiento (km):</strong>{" "}
            {vehicleType.ciclo_mantenimiento_km}
          </p>
          <p>
            <strong>Es Eléctrico:</strong>{" "}
            {vehicleType.es_electrico ? "Sí" : "No"}
          </p>

          {vehicleType.es_electrico ? (
            <>
              <p>
                <strong>Cantidad de Baterías:</strong>{" "}
                {vehicleType.cantidad_baterias ?? "N/A"}
              </p>
              <p>
                <strong>Tipo de Batería:</strong>{" "}
                {vehicleType.tipo_bateria ?? "N/A"}
              </p>
              <p>
                <strong>Amperaje:</strong> {vehicleType.amperage ?? "N/A"}
              </p>
              <p>
                <strong>Voltaje:</strong> {vehicleType.voltage ?? "N/A"}
              </p>
            </>
          ) : (
            <>
              <p>
                <strong>Tipo de Combustible:</strong>{" "}
                {vehicleType.tipo_combustible ?? "N/A"}
              </p>
              <p>
                <strong>Capacidad del Tanque:</strong>{" "}
                {vehicleType.capacidad_tanque ?? "N/A"}
              </p>
              <p>
                <strong>Índice de Consumo:</strong>{" "}
                {vehicleType.indice_consumo ?? "N/A"}
              </p>
            </>
          )}
        </div>
        <div className="mb-4 mt-8 flex justify-end gap-4">
          <button
            onClick={handleEdit}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10"
          >
            Editar
          </button>
          <button
            onClick={handleDelete}
            className="inline-flex items-center justify-center rounded-md bg-red-500 px-4 py-2 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10"
          >
            Eliminar
          </button>
          <button
            type="button"
            onClick={() => router.push("/fleet/vehicle-types")}
            className="inline-flex items-center justify-center rounded-md border border-stroke bg-gray-2 px-4 py-2 text-center font-medium text-dark hover:bg-opacity-90 dark:border-dark-3 dark:bg-dark-2 dark:text-white lg:px-8 xl:px-10"
          >
            Volver
          </button>
        </div>
      </div>
    </>
  );
};

export default VehicleTypeDetailsPage;
