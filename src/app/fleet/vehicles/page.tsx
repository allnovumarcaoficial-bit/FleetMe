"use client";

import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import VehiclesTable from "@/components/Fleet/Tables/VehiclesTable";

const VehiclesPage = () => {
  return (
    <>
      <Breadcrumb
        pageName="Vehículos"
        links={[{ href: "/fleet/vehicles", label: "Flota" }]}
      />
      <VehiclesTable />
    </>
  );
};

export default VehiclesPage;
