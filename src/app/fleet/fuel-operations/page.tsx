'use client';

import Breadcrumbs from '@/components/Breadcrumbs/Breadcrumb';
import FuelOperationsTable from '@/components/Fleet/FuelOperationsTable';

const FuelOperationsPage = () => {
  return (
    <>
      <Breadcrumbs
        pageName="Operaciones de Combustible"
        links={[
          { href: '/fleet', label: 'Flota' },
          { href: '/fleet/fuel-operations', label: 'Operaciones de Combustible' },
        ]}
      />
      <FuelOperationsTable />
    </>
  );
};

export default FuelOperationsPage;
