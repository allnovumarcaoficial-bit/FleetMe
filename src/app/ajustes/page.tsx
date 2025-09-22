'use client';
import Breadcrumb from '@/components/Breadcrumbs/Breadcrumb';
import { AjustesTable } from '@/components/Fleet/Tables/AjustesTable';

const AjustesPage = () => {
  return (
    <>
      <Breadcrumb
        pageName="Ajustes"
        links={[{ label: 'Dashboard', href: '/' }]}
      />
      <div className="flex flex-col gap-10">
        <AjustesTable />
      </div>
    </>
  );
};

export default AjustesPage;
