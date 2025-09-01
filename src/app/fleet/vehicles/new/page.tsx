'use client';

import Breadcrumb from '@/components/Breadcrumbs/Breadcrumb';
import VehicleForm from '@/components/Fleet/Forms/VehicleForm';
import { useRouter } from 'next/navigation';

const NewVehiclePage = () => {
  const router = useRouter();

  const handleSuccess = () => {
    // Optionally, show a success message before redirecting
    console.log('Vehículo creado satisfactoriamente!');
    // Redirection is handled within VehicleForm, but can be done here too if needed
  };

  const handleCancel = () => {
    router.push('/fleet/vehicles');
  };

  return (
    <>
      <Breadcrumb
        pageName="Añadir Nuevo Vehículo"
        links={[
          { href: '/fleet', label: 'Flota' },
          { href: '/fleet/vehicles', label: 'Vehículos' },
        ]}
      />
      <VehicleForm onSuccess={handleSuccess} onCancel={handleCancel} />
    </>
  );
};

export default NewVehiclePage;
