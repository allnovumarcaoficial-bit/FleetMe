'use client';

import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import FuelCardTable from "@/components/Fleet/FuelCardTable";

const FuelCardsPage = () => {
  return (
    <>
      <Breadcrumb pageName="Tarjetas de Combustible" />
      <div className="flex flex-col gap-10">
        <FuelCardTable />
      </div>
    </>
  );
};

export default FuelCardsPage;
