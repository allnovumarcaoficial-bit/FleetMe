"use client";

import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import MantenimientoTable from "@/components/Fleet/Tables/MantenimientoTable";
import Link from "next/link";

const MantenimientosPage = () => {
  return (
    <>
      <Breadcrumb
        pageName="Mantenimientos"
        links={[{ href: "/fleet/mantenimientos", label: "Flota" }]}
      />

      <MantenimientoTable />
    </>
  );
};

export default MantenimientosPage;
