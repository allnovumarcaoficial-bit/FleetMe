'use client';

import Breadcrumbs from '@/components/Breadcrumbs/Breadcrumb';
import FuelOperationsTable from '@/components/Fleet/Tables/FuelOperationsTable';

const FuelOperationsPage = () => {
  return (
    <>
      <Breadcrumbs
        pageName="Operaciones de Combustible"
        links={[{ href: '/fleet/fuel-operations', label: 'Flota' }]}
      />
      <FuelOperationsTable />
    </>
  );
};
export default FuelOperationsPage;
