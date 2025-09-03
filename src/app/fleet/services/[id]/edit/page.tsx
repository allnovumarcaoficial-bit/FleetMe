'use client';

import Breadcrumb from '@/components/Breadcrumbs/Breadcrumb';
import ServiceForm from '@/components/Fleet/Forms/ServiceForm';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { Servicio } from '@/types/fleet';

interface EditServicePageProps {
  params: Promise<{
    id: string;
  }>;
}

const EditServicePage = ({ params }: EditServicePageProps) => {
  const router = useRouter();
  const [service, setService] = useState<Servicio | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { id: paramId } = React.use(params);

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

  const handleSuccess = () => {
    console.log('Servicio actualizado correctamente!');
    router.push('/fleet/services');
  };

  const handleCancel = () => {
    router.push('/fleet/services');
  };

  if (loading) return <p>Cargando servicio para editar...</p>;
  if (error)
    return <p className="text-red-500">Error al cargar servicio: {error}</p>;
  if (!service) return <p>Servicio no encontrado.</p>;

  return (
    <>
      <Breadcrumb
        pageName="Editar Servicio"
        links={[
          { href: '/fleet', label: 'Flota' },
          { href: '/fleet/services', label: 'Servicios' },
        ]}
      />
      <ServiceForm
        initialData={service}
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </>
  );
};

export default EditServicePage;
