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
      <Breadcrumb pageName="Servicios" />

      {actionStatus.type && (
        <div className="mb-4">
          <Alert
            variant={actionStatus.type === 'success' ? 'success' : 'error'}
            title={actionStatus.type === 'success' ? 'Éxito' : 'Error'}
            description={actionStatus.message}
          />
        </div>
      )}

      <div className="rounded-[10px] border border-stroke bg-white p-4 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card sm:p-7.5">
        <div className="mb-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="w-full md:w-1/3">
            <label htmlFor="selectVehicle" className="mb-2 block text-body-sm font-medium text-dark dark:text-white">
              Filtrar por Vehículo:
            </label>
            <select
              id="selectVehicle"
              name="selectVehicle"
              value={selectedVehicleId || ''}
              onChange={handleVehicleChange}
              className="w-full rounded-lg border border-stroke bg-transparent px-5.5 py-3 outline-none transition focus:border-primary active:border-primary dark:border-dark-3 dark:bg-dark-2 dark:focus:border-primary [&>option]:text-dark-5 dark:[&>option]:text-dark-6"
            >
              <option value="">Todos los Vehículos</option>
              {loadingVehicles ? (
                <option disabled>Cargando vehículos...</option>
              ) : errorVehicles ? (
                <option disabled>Error al cargar vehículos</option>
              ) : (
                vehicles.map(vehicle => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.marca} {vehicle.modelo} ({vehicle.matricula})
                  </option>
                ))
              )}
            </select>
          </div>
          <Link href={selectedVehicleId ? `/fleet/services/new?vehicleId=${selectedVehicleId}` : "/fleet/services/new"}>
            <button className="inline-flex items-center justify-center rounded-md bg-primary py-2 px-4 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10">
              Añadir Servicio
            </button>
          </Link>
        </div>

        <ServiceTable vehicleId={selectedVehicleId} />
      </div>
    </>
  );
};

export default ServicesPage;
