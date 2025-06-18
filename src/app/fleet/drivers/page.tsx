'use client';

import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import DriverTable from "@/components/Fleet/DriverTable";

const DriversPage = () => {
  return (
    <>
      <Breadcrumb
        pageName="Conductores"
        links={[
          { href: "/fleet", label: "Flota" },
          { href: "/fleet/drivers", label: "Conductores" }
        ]}
      />
      <DriverTable />
    </>
  );
};

export default DriversPage;
