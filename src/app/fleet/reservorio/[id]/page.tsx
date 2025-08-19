'use client';

import Breadcrumb from '@/components/Breadcrumbs/Breadcrumb';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShowcaseSection } from '@/components/Layouts/showcase-section';
import DetailsButtons from '@/components/Fleet/PageElements/DetailsButtons';
import { Reservorio } from '@/types/fleet';

// Tipos basados en el modelo Prisma
interface ReservoirDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

const ReservoirDetailsPage = ({ params }: ReservoirDetailsPageProps) => {
  const router = useRouter();
  const [reservoir, setReservoir] = useState<Reservorio | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { id: paramId } = React.use(params);

  useEffect(() => {
    const fetchReservoir = async () => {
      try {
        const response = await fetch(`/api/reservorio/${paramId}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setReservoir(data);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchReservoir();
  }, [paramId]);

  const handleEdit = () => {
    if (reservoir) {
      router.push(`/fleet/reservorio/${reservoir.id}/edit`);
    }
  };

  const handleDelete = async () => {
    if (!reservoir) return;

    if (
      window.confirm('¿Estás seguro de que quieres eliminar este reservorio?')
    ) {
      try {
        const response = await fetch(`/api/reservorio/${reservoir.id}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || 'Error al eliminar el reservorio.'
          );
        }
        alert('Reservorio eliminado exitosamente.');
        router.push('/fleet/reservorio');
      } catch (e: any) {
        alert(`Error al eliminar reservorio: ${e.message}`);
      }
    }
  };

  const calculatePercentage = (actual: number, total: number): number => {
    if (total === 0) return 0;
    return Math.round((actual / total) * 100);
  };

  const getCapacityColor = (percentage: number): string => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 50) return 'text-yellow-600';
    if (percentage >= 20) return 'text-orange-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <>
        <Breadcrumb
          pageName="Detalles del Reservorio"
          links={[{ href: '/fleet/reservorio', label: 'Flota' }]}
        />
        <div className="rounded-[10px] border border-stroke bg-white p-4 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card sm:p-7.5">
          <p>Cargando detalles del reservorio...</p>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Breadcrumb
          pageName="Detalles del Reservorio"
          links={[{ href: '/fleet/reservorio', label: 'Flota' }]}
        />
        <div className="rounded-[10px] border border-stroke bg-white p-4 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card sm:p-7.5">
          <p className="text-red-500">Error: {error}</p>
        </div>
      </>
    );
  }

  if (!reservoir) {
    return (
      <>
        <Breadcrumb
          pageName="Detalles del Reservorio"
          links={[{ href: '/fleet/reservorio', label: 'Flota' }]}
        />
        <div className="rounded-[10px] border border-stroke bg-white p-4 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card sm:p-7.5">
          <p>No se encontró el reservorio.</p>
        </div>
      </>
    );
  }

  const capacityPercentage = calculatePercentage(
    reservoir.capacidad_actual,
    reservoir.capacidad_total
  );

  return (
    <>
      <Breadcrumb
        pageName="Detalles del Reservorio"
        links={[{ href: '/fleet/reservorio', label: 'Flota' }]}
      />

      <ShowcaseSection title="Detalles:" className="!p-7">
        <div className="">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <p>
              <strong>Nombre:</strong> {reservoir.nombre}
            </p>
            <p>
              <strong>Tipo de Combustible:</strong>{' '}
              {reservoir.tipoCombustible?.nombre || 'No asignado'}
            </p>
            <p>
              <strong>Capacidad Total:</strong>{' '}
              {reservoir.capacidad_total.toLocaleString()} L
            </p>
            <p>
              <strong>Capacidad Actual:</strong>{' '}
              <span className={getCapacityColor(capacityPercentage)}>
                {reservoir.capacidad_actual.toLocaleString()} L
              </span>
            </p>
            <p>
              <strong>Porcentaje de Llenado:</strong>{' '}
              <span className={getCapacityColor(capacityPercentage)}>
                {capacityPercentage}%
              </span>
            </p>
            <p>
              <strong>Capacidad Disponible:</strong>{' '}
              {(
                reservoir.capacidad_total - reservoir.capacidad_actual
              ).toLocaleString()}{' '}
              L
            </p>
          </div>

          {/* Barra visual de capacidad */}
          <div className="mt-6">
            <div className="mb-2 flex justify-between text-sm">
              <span>Nivel de Combustible</span>
              <span className={getCapacityColor(capacityPercentage)}>
                {capacityPercentage}%
              </span>
            </div>
            <div className="h-4 w-full rounded-full bg-gray-200 dark:bg-gray-700">
              <div
                className={`h-4 rounded-full transition-all duration-300 ${
                  capacityPercentage >= 80
                    ? 'bg-green-500'
                    : capacityPercentage >= 50
                      ? 'bg-yellow-500'
                      : capacityPercentage >= 20
                        ? 'bg-orange-500'
                        : 'bg-red-500'
                }`}
                style={{ width: `${capacityPercentage}%` }}
              ></div>
            </div>
          </div>

          <DetailsButtons
            handleDelete={handleDelete}
            handleEdit={handleEdit}
            handleBack={() => router.push('/fleet/reservorio')}
          />
        </div>
      </ShowcaseSection>
    </>
  );
};

export default ReservoirDetailsPage;
