'use client';

import Breadcrumb from '@/components/Breadcrumbs/Breadcrumb';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShowcaseSection } from '@/components/Layouts/showcase-section';
import DetailsButtons from '@/components/Fleet/PageElements/DetailsButtons';
import { TipoCombustible, TipoCombustibleEnum2 } from '@/types/fleet';

// Enums y tipos basados en el modelo Prisma
interface FuelTypeDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

const FuelTypeDetailsPage = ({ params }: FuelTypeDetailsPageProps) => {
  const router = useRouter();
  const [fuelType, setFuelType] = useState<TipoCombustible | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { id: paramId } = React.use(params);

  useEffect(() => {
    const fetchFuelType = async () => {
      try {
        const response = await fetch(`/api/dieselType/${paramId}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setFuelType(data);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchFuelType();
  }, [paramId]);

  const handleEdit = () => {
    if (fuelType) {
      router.push(`/fleet/desielType/${fuelType.id}/edit`);
    }
  };

  const handleDelete = async () => {
    if (!fuelType) return;

    if (
      window.confirm(
        '¿Estás seguro de que quieres eliminar este tipo de combustible?'
      )
    ) {
      try {
        const response = await fetch(`/api/dieselType/${fuelType.id}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || 'Error al eliminar el tipo de combustible.'
          );
        }
        alert('Tipo de combustible eliminado exitosamente.');
        router.push('/fleet/desielType');
      } catch (e: any) {
        alert(`Error al eliminar tipo de combustible: ${e.message}`);
      }
    }
  };

  // Función para formatear fechas en formato latinoamericano
  const formatDate = (dateString: string): string => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // Función para formatear fecha con hora
  const formatDateTime = (dateString: string): string => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${day}-${month}-${year} ${hours}:${minutes}`;
  };

  // Función para formatear precio

  // Función para obtener el color del tipo de combustible
  const getFuelTypeColor = (type: TipoCombustibleEnum2): string => {
    switch (type) {
      case TipoCombustibleEnum2.Gasolina_Especial:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case TipoCombustibleEnum2.Diesel:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case TipoCombustibleEnum2.Gasolina_Regular:
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  if (loading) {
    return (
      <>
        <Breadcrumb
          pageName="Detalles del Tipo de Combustible"
          links={[{ href: '/fleet/desielType', label: 'Tipos de Combustible' }]}
        />
        <div className="rounded-[10px] border border-stroke bg-white p-4 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card sm:p-7.5">
          <p>Cargando detalles del tipo de combustible...</p>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Breadcrumb
          pageName="Detalles del Tipo de Combustible"
          links={[{ href: '/fleet/desielType', label: 'Tipos de Combustible' }]}
        />
        <div className="rounded-[10px] border border-stroke bg-white p-4 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card sm:p-7.5">
          <p className="text-red-500">Error: {error}</p>
        </div>
      </>
    );
  }

  if (!fuelType) {
    return (
      <>
        <Breadcrumb
          pageName="Detalles del Tipo de Combustible"
          links={[{ href: '/fleet/desielType', label: 'Tipos de Combustible' }]}
        />
        <div className="rounded-[10px] border border-stroke bg-white p-4 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card sm:p-7.5">
          <p>No se encontró el tipo de combustible.</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Breadcrumb
        pageName="Detalles del Tipo de Combustible"
        links={[{ href: '/fleet/desielType', label: 'Tipos de Combustible' }]}
      />

      <ShowcaseSection title="Detalles:" className="!p-7">
        <div className="">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <p>
              <strong>ID:</strong> {fuelType.id}
            </p>
            <p>
              <strong>Nombre:</strong> {fuelType.nombre}
            </p>
            <p>
              <strong>Precio:</strong>{' '}
              <span className="font-semibold text-green-600">
                {fuelType.precio.toFixed(2)}
              </span>
            </p>
            <div>
              <strong>Tipo:</strong>{' '}
              <span
                className={`ml-2 inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getFuelTypeColor(
                  fuelType.tipoCombustibleEnum as TipoCombustibleEnum2
                )}`}
              >
                {fuelType.tipoCombustibleEnum}
              </span>
            </div>
            <p>
              <strong>Última Actualización de Precio:</strong>{' '}
              <span className="text-blue-600">
                {formatDate(new Date(fuelType.fechaUpdate).toISOString())}
              </span>
            </p>
          </div>

          {/* Información adicional */}
          <div className="mt-6 rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
            <h3 className="mb-2 text-lg font-semibold">
              Información Adicional
            </h3>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <p className="text-sm">
                <strong>Estado:</strong>{' '}
                <span className="text-green-600">Activo</span>
              </p>
              <p className="text-sm">
                <strong>Precio por Litro:</strong> {fuelType.precio.toFixed(2)}
                /L
              </p>
            </div>
          </div>

          <DetailsButtons
            handleDelete={handleDelete}
            handleEdit={handleEdit}
            handleBack={() => router.push('/fleet/desielType')}
          />
        </div>
      </ShowcaseSection>
    </>
  );
};

export default FuelTypeDetailsPage;
