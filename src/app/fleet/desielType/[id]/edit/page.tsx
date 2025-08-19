'use client';

import Breadcrumb from '@/components/Breadcrumbs/Breadcrumb';
import DieselTypeForm from '@/components/Fleet/Forms/DieselTypeForm';
import ReservorioForm from '@/components/Fleet/Forms/ReservorioForm';
import { Reservorio, TipoCombustible } from '@/types/fleet';

import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

// Tipos basados en el modelo Prisma
interface DieselTypeProps {
  params: Promise<{
    id: string;
  }>;
}

const DieselType = ({ params }: DieselTypeProps) => {
  const router = useRouter();
  const [dieselType, setDieselType] = useState<TipoCombustible | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { id: paramId } = React.use(params);

  useEffect(() => {
    const fetchDieselType = async () => {
      try {
        const response = await fetch(`/api/dieselType/${paramId}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setDieselType(data);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDieselType();
  }, [paramId]);

  const handleSuccess = () => {
    console.log('Reservoir updated successfully!');
    // Redirection is handled within ReservoirForm
  };

  const handleCancel = () => {
    router.push('/fleet/desielType');
  };

  if (loading) return <p>Cargando tipo de combustible para editar...</p>;
  if (error)
    return (
      <p className="text-red-500">
        Error al cargar tipo de combustible: {error}
      </p>
    );
  if (!dieselType) return <p>Tipo de combustible no encontrado.</p>;

  return (
    <>
      <Breadcrumb
        pageName="Editar Tipo de Combustible"
        links={[{ href: '/fleet/desielType', label: 'Tipos de Combustible' }]}
      />
      <DieselTypeForm
        initialData={dieselType}
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </>
  );
};

export default DieselType;
