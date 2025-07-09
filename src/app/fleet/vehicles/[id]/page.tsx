"use client";

import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import DetailsButtons from "@/components/Fleet/PageElements/DetailsButtons";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Vehicle } from "@/types/fleet";
import { format } from "date-fns";
import { ShowcaseSection } from "@/components/Layouts/showcase-section";
interface VehicleDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

const VehicleDetailsPage = ({ params }: VehicleDetailsPageProps) => {
  const router = useRouter();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { id: paramId } = React.use(params);

  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        const response = await fetch(`/api/vehicles/${paramId}`);
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

  const handleEdit = () => {
    if (vehicle) {
      router.push(`/fleet/vehicles/${vehicle.id}/edit`);
    }
  };

  const handleDelete = async () => {
    if (!vehicle) return;

    if (
      window.confirm("¿Estás seguro de que quieres eliminar este vehículo?")
    ) {
      try {
        const response = await fetch(`/api/vehicles/${vehicle.id}`, {
          method: "DELETE",
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        alert("Vehículo eliminado exitosamente.");
        router.push("/fleet/vehicles");
      } catch (e: any) {
        alert(`Error al eliminar vehículo: ${e.message}`);
      }
    }
  };

  if (loading) {
    return (
      <>
        <Breadcrumb
          pageName="Detalles del Vehículo"
          links={[
            { href: "/fleet", label: "Flota" },
            { href: "/fleet/vehicles", label: "Vehículos" },
          ]}
        />
        <div className="rounded-[10px] border border-stroke bg-white p-4 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card sm:p-7.5">
          <p>Cargando detalles del vehículo...</p>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Breadcrumb
          pageName="Detalles del Vehículo"
          links={[
            { href: "/fleet", label: "Flota" },
            { href: "/fleet/vehicles", label: "Vehículos" },
            {
              href: `/fleet/vehicles/${vehicle ? vehicle.id : ""}`,
              label: "Detalles del Vehículo",
            },
          ]}
        />
        <div className="rounded-[10px] border border-stroke bg-white p-4 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card sm:p-7.5">
          <p className="text-red-500">Error: {error}</p>
        </div>
      </>
    );
  }

  if (!vehicle) {
    return (
      <>
        <Breadcrumb
          pageName="Detalles del Vehículo"
          links={[{ href: "/fleet/vehicles", label: "Vehículos" }]}
        />
        <div className="rounded-[10px] border border-stroke bg-white p-4 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card sm:p-7.5">
          <p> No se encontró el vehículo.</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Breadcrumb
        pageName="Detalles del Vehículo"
        links={[
          { href: "/fleet/vehicles", label: "Vehículos" },
          {
            href: `/fleet/vehicles/${vehicle ? vehicle.id : ""}`,
            label: "Detalles",
          },
        ]}
      />

      <ShowcaseSection title="Detalles:" className="!p-7">
        <div className="">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <p>
              <strong>Marca:</strong> {vehicle.marca}
            </p>
            <p>
              <strong>Modelo:</strong> {vehicle.modelo}
            </p>
            <p>
              <strong>VIN:</strong> {vehicle.vin}
            </p>
            <p>
              <strong>Matrícula:</strong> {vehicle.matricula}
            </p>
            <p>
              <strong>Fecha de Compra:</strong>{" "}
              {vehicle.fecha_compra
                ? format(new Date(vehicle.fecha_compra), "dd/MM/yyyy")
                : "N/A"}
            </p>
            <p>
              <strong>Vencimiento Licencia Operativa:</strong>{" "}
              {vehicle.fecha_vencimiento_licencia_operativa
                ? format(
                    new Date(vehicle.fecha_vencimiento_licencia_operativa),
                    "dd/MM/yyyy",
                  )
                : "N/A"}
            </p>
            <p>
              <strong>Vencimiento Circulación:</strong>{" "}
              {vehicle.fecha_vencimiento_circulacion
                ? format(
                    new Date(vehicle.fecha_vencimiento_circulacion),
                    "dd/MM/yyyy",
                  )
                : "N/A"}
            </p>
            <p>
              <strong>Vencimiento Somatón:</strong>{" "}
              {vehicle.fecha_vencimiento_somaton
                ? format(
                    new Date(vehicle.fecha_vencimiento_somaton),
                    "dd/MM/yyyy",
                  )
                : "N/A"}
            </p>
            <p>
              <strong>Estado:</strong> {vehicle.estado}
            </p>
            <p>
              <strong>GPS:</strong> {vehicle.gps ? "Sí" : "No"}
            </p>
            <p>
              <strong>Municipios:</strong>{" "}
              {typeof vehicle.listado_municipios === "string"
                ? JSON.parse(vehicle.listado_municipios || "[]").join(", ")
                : "N/A"}
            </p>
            <p>
              <strong>Tipo de Vehículo:</strong> {vehicle.tipoNombre || "N/A"}
            </p>
          </div>

          <DetailsButtons
            handleDelete={handleDelete}
            handleEdit={handleEdit}
            handleBack={() => router.push("/fleet/vehicles")}
          />
        </div>
      </ShowcaseSection>
    </>
  );
};

export default VehicleDetailsPage;
