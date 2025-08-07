"use client";

import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FuelCard } from "@/types/fleet";
import { format } from "date-fns";
import { ShowcaseSection } from "@/components/Layouts/showcase-section";
import DetailsButtons from "@/components/Fleet/PageElements/DetailsButtons";

export interface FuelCardDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

const FuelCardDetailsPage = ({ params }: FuelCardDetailsPageProps) => {
  const router = useRouter();
  const [fuelCard, setFuelCard] = useState<FuelCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { id: paramId } = React.use(params);

  useEffect(() => {
    const fetchFuelCard = async () => {
      try {
        const response = await fetch(`/api/fuel-cards/${paramId}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setFuelCard(data);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchFuelCard();
  }, [paramId]);

  const handleEdit = () => {
    if (fuelCard) {
      router.push(`/fleet/fuel-cards/${fuelCard.id}/edit`);
    }
  };

  const handleDelete = async () => {
    if (!fuelCard) return;

    if (
      window.confirm(
        "¿Estás seguro de que quieres eliminar esta tarjeta de combustible?",
      )
    ) {
      try {
        const response = await fetch(`/api/fuel-cards/${fuelCard.id}`, {
          method: "DELETE",
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        alert("Tarjeta de combustible eliminada exitosamente.");
        router.push("/fleet/fuel-cards");
      } catch (e: any) {
        alert(`Error al eliminar tarjeta de combustible: ${e.message}`);
      }
    }
  };

  if (loading) {
    return (
      <>
        <Breadcrumb
          pageName="Detalles de la Tarjeta de Combustible"
          links={[
            { href: "/fleet", label: "Flota" },
            { href: "/fleet/fuel-cards", label: "Tarjetas de Combustible" },
          ]}
        />
        <div className="rounded-[10px] border border-stroke bg-white p-4 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card sm:p-7.5">
          <p>Cargando detalles de la tarjeta de combustible...</p>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Breadcrumb
          pageName="Detalles de la Tarjeta de Combustible"
          links={[
            { href: "/fleet", label: "Flota" },
            { href: "/fleet/fuel-cards", label: "Tarjetas de Combustible" },
          ]}
        />
        <div className="rounded-[10px] border border-stroke bg-white p-4 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card sm:p-7.5">
          <p className="text-red-500">Error: {error}</p>
        </div>
      </>
    );
  }

  if (!fuelCard) {
    return (
      <>
        <Breadcrumb
          pageName="Detalles de la Tarjeta de Combustible"
          links={[
            { href: "/fleet", label: "Flota" },
            { href: "/fleet/fuel-cards", label: "Tarjetas de Combustible" },
          ]}
        />
        <div className="rounded-[10px] border border-stroke bg-white p-4 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card sm:p-7.5">
          <p>No se encontró la tarjeta de combustible.</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Breadcrumb
        pageName="Detalles de la Tarjeta de Combustible"
        links={[
          { href: "/fleet", label: "Flota" },
          { href: "/fleet/fuel-cards", label: "Tarjetas de Combustible" },
        ]}
      />

      <ShowcaseSection title="Detalles:" className="!p-7">
        <div className="">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <p>
              <strong>Número de Tarjeta:</strong> {fuelCard.numeroDeTarjeta}
            </p>
            <p>
              <strong>Tipo de Tarjeta:</strong> {fuelCard.tipoDeTarjeta}
            </p>
            <p>
              <strong>Tipo de Combustible:</strong> {fuelCard.tipoDeCombustible}
            </p>
            <p>
              <strong>Precio del Combustible:</strong>{" "}
              {fuelCard.precioCombustible}
            </p>
            <p>
              <strong>Moneda:</strong> {fuelCard.moneda}
            </p>
            <p>
              <strong>Fecha de Vencimiento:</strong>{" "}
              {fuelCard.fechaVencimiento
                ? format(new Date(fuelCard.fechaVencimiento), "dd/MM/yyyy")
                : "N/A"}
            </p>
            <p>
              <strong>Es Reservorio:</strong>{" "}
              {fuelCard.esReservorio ? "Sí" : "No"}
            </p>
            <p>
              <strong>Fecha de Creación:</strong>{" "}
              {fuelCard.createdAt
                ? format(new Date(fuelCard.createdAt), "dd/MM/yyyy HH:mm")
                : "N/A"}
            </p>
            <p>
              <strong>Última Actualización:</strong>{" "}
              {fuelCard.updatedAt
                ? format(new Date(fuelCard.updatedAt), "dd/MM/yyyy HH:mm")
                : "N/A"}
            </p>
          </div>

          <DetailsButtons
            handleDelete={handleDelete}
            handleEdit={handleEdit}
            handleBack={() => router.push("/fleet/fuel-cards")}
          />
        </div>
      </ShowcaseSection>
    </>
  );
};

export default FuelCardDetailsPage;
