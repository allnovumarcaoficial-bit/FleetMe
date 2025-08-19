"use client";

import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import ReservorioTable from "@/components/Fleet/Tables/reservorio";

const ReservorioPage = () => {
  return (
    <>
      <Breadcrumb
        pageName="Reservorio"
        links={[{ href: "/fleet/reservorio", label: "Flota" }]}
      />
      <div className="flex flex-col gap-10">
        <ReservorioTable />
      </div>
    </>
  );
};

export default ReservorioPage;
