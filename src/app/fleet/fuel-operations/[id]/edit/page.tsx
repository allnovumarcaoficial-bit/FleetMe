'use client';

import Breadcrumbs from '@/components/Breadcrumbs/Breadcrumb';
import FuelOperationForm from '@/components/Fleet/FuelOperationForm';
import React from 'react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FuelOperation, FuelCard, Vehicle } from '@/types/fleet';

const EditFuelOperationPage = ({ params }: { params: Promise<{ id: string }> }) => {
  const router = useRouter();
  const { id } = React.use(params);
  const [initialData, setInitialData] = useState<(FuelOperation & { fuelCard: FuelCard; vehicle: Vehicle | null }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFuelOperation = async () => {
      try {
        const response = await fetch(`/api/fuel-operations/${id}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setInitialData(data);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchFuelOperation();
    }
  }, [id]);

  const handleCancel = () => {
    router.push('/fleet/fuel-operations');
  };

  const handleSuccess = () => {
    router.push('/fleet/fuel-operations');
  };

  if (loading) return <p>Cargando operación de combustible...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;
  if (!initialData) return <p>No se encontró la operación de combustible.</p>;

  return (
    <>
      <Breadcrumbs
        pageName="Editar Operación de Combustible"
        links={[
          { href: '/fleet', label: 'Flota' },
          { href: '/fleet/fuel-operations', label: 'Operaciones de Combustible' },
        ]}
      />

      <div className="flex flex-col gap-10">
        <FuelOperationForm initialData={initialData} onSuccess={handleSuccess} onCancel={handleCancel} />
      </div>
    </>
  );
};

export default EditFuelOperationPage;
