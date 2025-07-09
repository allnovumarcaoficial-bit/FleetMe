"use client";

import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import FuelCardForm from "@/components/Fleet/Forms/FuelCardForm";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { FuelCard } from "@/types/fleet";

interface EditFuelCardPageProps {
  params: Promise<{
    id: string;
  }>;
}

const EditFuelCardPage = ({ params }: EditFuelCardPageProps) => {
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

  const handleSuccess = () => {
    console.log("Fuel card updated successfully!");
    // Redirection is handled within FuelCardForm
  };

  const handleCancel = () => {
    router.push("/fleet/fuel-cards");
  };

  if (loading) return <p>Cargando tarjeta de combustible para editar...</p>;
  if (error)
    return (
      <p className="text-red-500">
        Error al cargar tarjeta de combustible: {error}
      </p>
    );
  if (!fuelCard) return <p>Tarjeta de combustible no encontrada.</p>;

  return (
    <>
      <Breadcrumb
        pageName="Editar Tarjeta de Combustible"
        links={[
          { href: "/fleet", label: "Flota" },
          { href: "/fleet/fuel-cards", label: "Tarjetas de Combustible" },
        ]}
      />
      <FuelCardForm
        initialData={fuelCard}
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </>
  );
};

export default EditFuelCardPage;
