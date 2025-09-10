'use client';

import Breadcrumb from '@/components/Breadcrumbs/Breadcrumb';
import ReservorioForm from '@/components/Fleet/Forms/ReservorioForm';
import { useRouter } from 'next/navigation';

const ReservorioPage = () => {
  const router = useRouter();

  const handleSuccess = () => {
    console.log('Reservorio creado satisfactoriamente!');
  };

  const handleCancel = () => {
    router.push('/fleet/reservorio');
  };

  return (
    <>
      <Breadcrumb
        pageName="Añadir Nuevo Reservorio"
        links={[
          { href: '/fleet', label: 'Flota' },
          { href: '/fleet/reservorio', label: 'Reservorio' },
        ]}
      />
      <ReservorioForm onSuccess={handleSuccess} onCancel={handleCancel} />
    </>
  );
};

export default ReservorioPage;
