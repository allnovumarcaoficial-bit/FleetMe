'use client';

import Breadcrumb from '@/components/Breadcrumbs/Breadcrumb';
import DieselTypeForm from '@/components/Fleet/Forms/DieselTypeForm';
import { useRouter } from 'next/navigation';

const DieselPage = () => {
  const router = useRouter();

  const handleSuccess = () => {
    console.log('Tipo de combustible creado satisfactoriamente!');
  };

  const handleCancel = () => {
    router.push('/fleet/desielType');
  };

  return (
    <>
      <Breadcrumb
        pageName="Añadir Nuevo tipo de combustible"
        links={[
          { href: '/fleet', label: 'Flota' },
          { href: '/fleet/desielType', label: 'Combustible' },
        ]}
      />
      <DieselTypeForm onSuccess={handleSuccess} onCancel={handleCancel} />
    </>
  );
};

export default DieselPage;
