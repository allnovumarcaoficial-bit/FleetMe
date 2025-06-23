'use client';

import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import VehiclesTable from "@/components/Fleet/VehiclesTable";

const VehiclesPage = () => {
  return (
    <>
      <Breadcrumb
        pageName="Vehículos"
        links={[
          { href: "/fleet", label: "Flota" },
          { href: "/fleet/vehicles", label: "Vehículos" }
        ]}
      />
      <VehiclesTable />
    </>
  );
};

export default VehiclesPage;
