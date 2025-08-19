'use client';

import Breadcrumb from '@/components/Breadcrumbs/Breadcrumb';
import DieselTypeTable from '@/components/Fleet/Tables/desielTypeTable';

const DriversPage = () => {
  return (
    <>
      <Breadcrumb
        pageName="Tipo de Combustible"
        links={[{ href: '/fleet/desielType', label: 'Flota' }]}
      />
      <DieselTypeTable />
    </>
  );
};

export default DriversPage;
