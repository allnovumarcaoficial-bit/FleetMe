'use client';

import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Driver } from "@/types/fleet";
import { format } from 'date-fns';

interface DriverDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

const DriverDetailsPage = ({ params }: DriverDetailsPageProps) => {
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

  const handleEdit = () => {
    if (driver) {
      router.push(`/fleet/drivers/${driver.id}/edit`);
    }
  };

  const handleDelete = async () => {
    if (!driver) return;

    if (window.confirm('¿Estás seguro de que quieres eliminar este conductor?')) {
      try {
        const response = await fetch(`/api/drivers/${driver.id}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Error al eliminar el conductor.');
        }
        alert('Conductor eliminado exitosamente.');
        router.push('/fleet/drivers');
      } catch (e: any) {
        alert(`Error al eliminar conductor: ${e.message}`);
      }
    }
  };

  if (loading) {
    return (
      <>
        <Breadcrumb
          pageName="Detalles del Conductor"
          links={[
            { href: "/fleet", label: "Flota" },
            { href: "/fleet/drivers", label: "Conductores" },
          ]}
        />
        <div className="rounded-[10px] border border-stroke bg-white p-4 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card sm:p-7.5">
          <p>Cargando detalles del conductor...</p>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Breadcrumb
          pageName="Detalles del Conductor"
          links={[
            { href: "/fleet", label: "Flota" },
            { href: "/fleet/drivers", label: "Conductores" },
          ]}
        />
        <div className="rounded-[10px] border border-stroke bg-white p-4 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card sm:p-7.5">
          <p className="text-red-500">Error: {error}</p>
        </div>
      </>
    );
  }

  if (!driver) {
    return (
      <>
        <Breadcrumb
          pageName="Detalles del Conductor"
          links={[
            { href: "/fleet", label: "Flota" },
            { href: "/fleet/drivers", label: "Conductores" },
          ]}
        />
        <div className="rounded-[10px] border border-stroke bg-white p-4 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card sm:p-7.5">
          <p>No se encontró el conductor.</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Breadcrumb
        pageName="Detalles del Conductor"
        links={[
          { href: "/fleet", label: "Flota" },
          { href: "/fleet/drivers", label: "Conductores" },
        ]}
      />

      <div className="rounded-[10px] border border-stroke bg-white p-4 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card sm:p-7.5">
        
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <p><strong>Nombre:</strong> {driver.nombre}</p>
          <p><strong>Licencia:</strong> {driver.licencia}</p>
          <p><strong>Fecha de Vencimiento de Licencia:</strong> {driver.fecha_vencimiento_licencia ? format(new Date(driver.fecha_vencimiento_licencia), 'dd/MM/yyyy') : 'N/A'}</p>
          <p><strong>Carnet de Peritaje:</strong> {driver.carnet_peritage ? 'Sí' : 'No'}</p>
          <p><strong>Vehículo Asignado:</strong> {driver.vehicle ? `${driver.vehicle.marca} ${driver.vehicle.modelo} (${driver.vehicle.matricula})` : 'Ninguno'}</p>
        </div>

        <div className="mb-4 mt-8 flex justify-end gap-4">
          <button
            onClick={handleEdit}
            className="inline-flex items-center justify-center rounded-md bg-primary py-2 px-4 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10"
          >
            Editar
          </button>
          <button
            onClick={handleDelete}
            className="inline-flex items-center justify-center rounded-md bg-red-500 py-2 px-4 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10"
          >
            Eliminar
          </button>
          <button
            type="button"
            onClick={() => router.push('/fleet/drivers')}
            className="inline-flex items-center justify-center rounded-md border border-stroke bg-gray-2 py-2 px-4 text-center font-medium text-dark hover:bg-opacity-90 dark:border-dark-3 dark:bg-dark-2 dark:text-white lg:px-8 xl:px-10"
          >
            Volver
          </button>
        </div>
      </div>
    </>
  );
};

export default DriverDetailsPage;
