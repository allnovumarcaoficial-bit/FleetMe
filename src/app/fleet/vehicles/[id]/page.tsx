'use client';

import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Vehicle } from "@/types/fleet";
import { format } from 'date-fns'; // For date formatting

interface VehicleDetailsPageProps {
  params: {
    id: string;
  };
}

const VehicleDetailsPage = ({ params }: VehicleDetailsPageProps) => {
  const router = useRouter();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        const response = await fetch(`/api/vehicles/${params.id}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setVehicle(data);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchVehicle();
  }, [params.id]);

  if (loading) return <p>Cargando detalles del vehículo...</p>;
  if (error) return <p className="text-red-500">Error al cargar detalles del vehículo: {error}</p>;
  if (!vehicle) return <p>Vehículo no encontrado.</p>;

  const handleEdit = () => {
    router.push(`/fleet/vehicles/${vehicle.id}/edit`);
  };

  const handleDelete = async () => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este vehículo?')) {
      try {
        const response = await fetch(`/api/vehicles/${vehicle.id}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        alert('Vehículo eliminado exitosamente.');
        router.push('/fleet/vehicles'); // Redirect to list after deletion
      } catch (e: any) {
        alert(`Error al eliminar vehículo: ${e.message}`);
      }
    }
  };

  return (
    <>
      <Breadcrumb pageName="Detalles del Vehículo" />

      <div className="rounded-[10px] border border-stroke bg-white p-4 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card sm:p-7.5">
        <div className="mb-4 flex justify-end gap-4">
          <button
            onClick={handleEdit}
            className="inline-flex items-center justify-center rounded-md bg-primary py-2 px-4 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10"
          >
            Editar
          </button>
          <button
            onClick={handleDelete}
            className="inline-flex items-center justify-center rounded-md bg-red-500 py-2 px-4 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10"
          >
            Eliminar
          </button>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <p><strong>Marca:</strong> {vehicle.marca}</p>
          <p><strong>Modelo:</strong> {vehicle.modelo}</p>
          <p><strong>VIN:</strong> {vehicle.vin}</p>
          <p><strong>Matrícula:</strong> {vehicle.matricula}</p>
          <p><strong>Fecha de Compra:</strong> {format(new Date(vehicle.fecha_compra), 'dd/MM/yyyy')}</p>
          <p><strong>Vencimiento Licencia Operativa:</strong> {format(new Date(vehicle.fecha_vencimiento_licencia_operativa), 'dd/MM/yyyy')}</p>
          <p><strong>Vencimiento Circulación:</strong> {format(new Date(vehicle.fecha_vencimiento_circulacion), 'dd/MM/yyyy')}</p>
          <p><strong>Vencimiento Somatón:</strong> {format(new Date(vehicle.fecha_vencimiento_somaton), 'dd/MM/yyyy')}</p>
          <p><strong>Estado:</strong> {vehicle.estado}</p>
          <p><strong>GPS:</strong> {vehicle.gps ? 'Sí' : 'No'}</p>
          <p><strong>Municipios:</strong> {JSON.parse(vehicle.listado_municipios || '[]').join(', ')}</p>
          <p><strong>Tipo de Vehículo:</strong> {vehicle.tipoVehiculo?.nombre || 'N/A'}</p>
          <p><strong>Conductores Asignados (IDs):</strong> {vehicle.listado_idconductores?.join(', ') || 'Ninguno'}</p>
        </div>
      </div>
    </>
  );
};

export default VehicleDetailsPage;
