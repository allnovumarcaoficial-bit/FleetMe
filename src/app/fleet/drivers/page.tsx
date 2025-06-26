'use client';

import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import DriverTable from "@/components/Fleet/DriverTable";

const DriversPage = () => {
  return (
    <>
      <Breadcrumb
        pageName="Conductores"
        links={[
          { href: "/fleet/drivers", label: "Flota" },
        ]}
      />
      <DriverTable />
    </>
  );
};

export default DriversPage;
