'use client';

import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import MantenimientoTable from "@/components/Fleet/MantenimientoTable";
import Link from "next/link";

const MantenimientosPage = () => {
  return (
    <>
      <Breadcrumb
        pageName="Mantenimientos"
        links={[
          { href: "/fleet", label: "Flota" },
          { href: "/fleet/mantenimientos", label: "Mantenimientos" }
        ]}
      />



      <MantenimientoTable />
    </>
  );
};

export default MantenimientosPage;
