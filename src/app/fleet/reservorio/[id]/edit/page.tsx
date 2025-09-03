'use client';

import Breadcrumb from '@/components/Breadcrumbs/Breadcrumb';
import ReservorioForm from '@/components/Fleet/Forms/ReservorioForm';
import { Reservorio } from '@/types/fleet';

import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

// Tipos basados en el modelo Prisma
interface EditReservoirPageProps {
  params: Promise<{
    id: string;
  }>;
}

const EditReservoirPage = ({ params }: EditReservoirPageProps) => {
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

  const handleSuccess = () => {
    console.log('Reservorio actualizado correctamente!');
    // Redirection is handled within ReservoirForm
  };

  const handleCancel = () => {
    router.push('/fleet/reservorio');
  };

  if (loading) return <p>Cargando reservorio para editar...</p>;
  if (error)
    return <p className="text-red-500">Error al cargar reservorio: {error}</p>;
  if (!reservoir) return <p>Reservorio no encontrado.</p>;

  return (
    <>
      <Breadcrumb
        pageName="Editar Reservorio"
        links={[{ href: '/fleet/reservorio', label: 'Reservorios' }]}
      />
      <ReservorioForm
        initialData={reservoir}
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </>
  );
};

export default EditReservoirPage;
