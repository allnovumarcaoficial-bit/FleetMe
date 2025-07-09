"use client";

import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import React, { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { Servicio } from "@/types/fleet";
import { format } from "date-fns";
import { ShowcaseSection } from "@/components/Layouts/showcase-section";
import DetailsButtons from "@/components/Fleet/PageElements/DetailsButtons";

interface ServiceDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

const ServiceDetailsPage = ({ params }: ServiceDetailsPageProps) => {
  const router = useRouter();
  const [service, setService] = useState<Servicio | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { id: paramId } = use(params);

  useEffect(() => {
    const fetchService = async () => {
      try {
        const response = await fetch(`/api/services/${paramId}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setService(data);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchService();
  }, [paramId]);

  const handleEdit = () => {
    if (service) {
      router.push(`/fleet/services/${service.id}/edit`);
    }
  };

  const handleDelete = async () => {
    if (!service) return;

    if (
      window.confirm("¿Estás seguro de que quieres eliminar este servicio?")
    ) {
      try {
        const response = await fetch(`/api/services/${service.id}`, {
          method: "DELETE",
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        alert("Servicio eliminado exitosamente.");
        router.push("/fleet/services");
      } catch (e: any) {
        alert(`Error al eliminar servicio: ${e.message}`);
      }
    }
  };

  if (loading) {
    return (
      <>
        <Breadcrumb
          pageName="Detalles del Servicio"
          links={[
            { href: "/fleet", label: "Flota" },
            { href: "/fleet/services", label: "Servicios" },
          ]}
        />
        <div className="rounded-[10px] border border-stroke bg-white p-4 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card sm:p-7.5">
          <p>Cargando detalles del servicio...</p>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Breadcrumb
          pageName="Detalles del Servicio"
          links={[
            { href: "/fleet", label: "Flota" },
            { href: "/fleet/services", label: "Servicios" },
          ]}
        />
        <div className="rounded-[10px] border border-stroke bg-white p-4 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card sm:p-7.5">
          <p className="text-red-500">Error: {error}</p>
        </div>
      </>
    );
  }

  if (!service) {
    return (
      <>
        <Breadcrumb
          pageName="Detalles del Servicio"
          links={[
            { href: "/fleet", label: "Flota" },
            { href: "/fleet/services", label: "Servicios" },
          ]}
        />
        <div className="rounded-[10px] border border-stroke bg-white p-4 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card sm:p-7.5">
          <p>No se encontró el servicio.</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Breadcrumb
        pageName="Detalles del Servicio"
        links={[
          { href: "/fleet", label: "Flota" },
          { href: "/fleet/services", label: "Servicios" },
        ]}
      />

      <ShowcaseSection title="Detalles:" className="!p-7">
        <div className="">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <p>
              <strong>Tipo de Servicio:</strong> {service.tipoServicio}
            </p>
            <p>
              <strong>Fecha:</strong>{" "}
              {service.fecha
                ? format(new Date(service.fecha), "dd/MM/yyyy")
                : "N/A"}
            </p>
            <p>
              <strong>Odómetro Inicial:</strong> {service.odometroInicial}
            </p>
            <p>
              <strong>Odómetro Final:</strong> {service.odometroFinal || "N/A"}
            </p>
            <p>
              <strong>Kilómetros Recorridos:</strong>{" "}
              {service.kilometrosRecorridos}
            </p>
            <p>
              <strong>Estado:</strong> {service.estado}
            </p>
            <p>
              <strong>Vehículo:</strong>{" "}
              {service.vehicle
                ? `${service.vehicle.marca} (${service.vehicle.matricula})`
                : "N/A"}
            </p>

            {service.tipoServicio === "Entrega de Pedidos" && (
              <p>
                <strong>Cantidad de Pedidos:</strong>{" "}
                {service.cantidadPedidos || "N/A"}
              </p>
            )}
            {service.tipoServicio === "Logistico" && (
              <>
                <p>
                  <strong>Origen:</strong> {service.origen || "N/A"}
                </p>
                <p>
                  <strong>Destino:</strong> {service.destino || "N/A"}
                </p>
              </>
            )}
            {service.tipoServicio === "Administrativo" && (
              <p>
                <strong>Descripción:</strong> {service.descripcion || "N/A"}
              </p>
            )}
          </div>

          <DetailsButtons
            handleDelete={handleDelete}
            handleEdit={handleEdit}
            handleBack={() => router.push("/fleet/services")}
          />
        </div>
      </ShowcaseSection>
    </>
  );
};

export default ServiceDetailsPage;
