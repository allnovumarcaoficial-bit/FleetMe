"use client";

import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import VehicleTypesTable from "@/components/Fleet/VehicleTypesTable";

const VehicleTypesPage = () => {
  return (
    <>
      <Breadcrumb
        pageName="Tipos de Vehículos"
        links={[
          { href: "/fleet", label: "Flota" },
        ]}
      />
      <VehicleTypesTable />
    </>
  );
};

export default VehicleTypesPage;
