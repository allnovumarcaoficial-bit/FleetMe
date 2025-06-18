'use client';

import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { useEffect, useState, useCallback } from "react";
import { Vehicle } from "@/types/fleet";
import { Alert } from "@/components/ui-elements/alert";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ServiceTable from "@/components/Fleet/ServiceTable"; // Import the new ServiceTable

const ServicesPage = () => {
  const router = useRouter();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | undefined>(undefined);
  const [loadingVehicles, setLoadingVehicles] = useState(true);
  const [errorVehicles, setErrorVehicles] = useState<string | null>(null);
  const [actionStatus, setActionStatus] = useState<{ type: 'success' | 'error' | ''; message: string }>({ type: '', message: '' });

  const fetchVehicles = useCallback(async () => {
    setLoadingVehicles(true);
    setErrorVehicles(null);
    try {
      const response = await fetch('/api/vehicles?limit=1000'); // Fetch all vehicles for the dropdown
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      setVehicles(result.data);
    } catch (e: any) {
      setErrorVehicles(e.message);
    } finally {
      setLoadingVehicles(false);
    }
  }, []);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  const handleVehicleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = parseInt(e.target.value);
    setSelectedVehicleId(isNaN(id) ? undefined : id);
  };

  return (
    <>
      <Breadcrumb
        pageName="Servicios"
        links={[
          { href: "/fleet", label: "Flota" },
          { href: "/fleet/services", label: "Servicios" }
        ]}
      />

      {actionStatus.type && (
        <div className="mb-4">
          <Alert
            variant={actionStatus.type === 'success' ? 'success' : 'error'}
            title={actionStatus.type === 'success' ? 'Éxito' : 'Error'}
            description={actionStatus.message}
          />
        </div>
      )}

      <ServiceTable
        vehicleId={selectedVehicleId}
        vehicles={vehicles}
        loadingVehicles={loadingVehicles}
        errorVehicles={errorVehicles}
        handleVehicleChange={handleVehicleChange}
      />
     
    </>
  );
};

export default ServicesPage;
