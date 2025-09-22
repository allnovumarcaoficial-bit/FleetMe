'use client';

import Breadcrumb from '@/components/Breadcrumbs/Breadcrumb';
import AjusteForm from '@/components/Fleet/Forms/AjusteForm';
import { useRouter } from 'next/navigation';

const NewAjustePage = () => {
  const router = useRouter();

  const handleSuccess = () => {
    console.log('Ajuste creado satisfactoriamente!');
  };

  const handleCancel = () => {
    router.push('/ajustes');
  };

  return (
    <>
      <Breadcrumb
        pageName="Crear Nuevo Ajuste"
        links={[{ href: '/ajustes', label: 'Ajustes' }]}
      />
      <AjusteForm onSuccess={handleSuccess} onCancel={handleCancel} />
    </>
  );
};

export default NewAjustePage;
