"use client";

import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { useRouter } from "next/navigation";
import ServiceTable from "@/components/Fleet/Tables/ServiceTable"; // Import the new ServiceTable

const ServicesPage = () => {
  const router = useRouter();

  return (
    <>
      <Breadcrumb
        pageName="Servicios"
        links={[{ href: "/fleet/services", label: "Flota" }]}
      />

      <ServiceTable />
    </>
  );
};

export default ServicesPage;
