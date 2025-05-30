'use client';

import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import DriverTable from "@/components/Fleet/DriverTable";

const DriversPage = () => {
  return (
    <>
      <Breadcrumb pageName="Conductores" />
      <DriverTable />
    </>
  );
};

export default DriversPage;
