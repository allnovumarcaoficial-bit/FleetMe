'use client';

import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Mantenimiento, Piece } from "@/types/fleet"; // Import Piece interface
import { format } from 'date-fns';

interface MantenimientoDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

const MantenimientoDetailsPage = ({ params }: MantenimientoDetailsPageProps) => {
  const router = useRouter();
  const [mantenimiento, setMantenimiento] = useState<Mantenimiento | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { id: paramId } = React.use(params);

  useEffect(() => {
    const fetchMantenimiento = async () => {
      try {
        const response = await fetch(`/api/mantenimientos/${paramId}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        // Parse lista_de_piezas from JSON string to array of Piece objects
        if (data.lista_de_piezas && typeof data.lista_de_piezas === 'string') {
          data.lista_de_piezas = JSON.parse(data.lista_de_piezas);
        }
        setMantenimiento(data);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchMantenimiento();
  }, [paramId]);

  const handleEdit = () => {
    if (mantenimiento) {
      router.push(`/fleet/mantenimientos/${mantenimiento.id}/edit`);
    }
  };

  const handleDelete = async () => {
    if (!mantenimiento) return;

    if (window.confirm('¿Estás seguro de que quieres eliminar este mantenimiento?')) {
      try {
        const response = await fetch(`/api/mantenimientos/${mantenimiento.id}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        alert('Mantenimiento eliminado exitosamente.');
        router.push('/fleet/mantenimientos');
      } catch (e: any) {
        alert(`Error al eliminar mantenimiento: ${e.message}`);
      }
    }
  };

  if (loading) {
    return (
      <>
        <Breadcrumb pageName="Detalles del Mantenimiento" />
        <div className="rounded-[10px] border border-stroke bg-white p-4 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card sm:p-7.5">
          <p>Cargando detalles del mantenimiento...</p>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Breadcrumb pageName="Detalles del Mantenimiento" />
        <div className="rounded-[10px] border border-stroke bg-white p-4 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card sm:p-7.5">
          <p className="text-red-500">Error: {error}</p>
        </div>
      </>
    );
  }

  if (!mantenimiento) {
    return (
      <>
        <Breadcrumb pageName="Detalles del Mantenimiento" />
        <div className="rounded-[10px] border border-stroke bg-white p-4 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card sm:p-7.5">
          <p>No se encontró el mantenimiento.</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Breadcrumb pageName="Detalles del Mantenimiento" />

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
          <p><strong>Tipo:</strong> {mantenimiento.tipo}</p>
          <p><strong>Fecha:</strong> {mantenimiento.fecha ? format(new Date(mantenimiento.fecha), 'dd/MM/yyyy') : 'N/A'}</p>
          <p><strong>Costo:</strong> ${mantenimiento.costo.toFixed(2)}</p>
          <p className="md:col-span-2"><strong>Descripción:</strong> {mantenimiento.descripcion}</p>
          <div className="md:col-span-2">
            <strong>Lista de Piezas:</strong>
            {mantenimiento.lista_de_piezas && mantenimiento.lista_de_piezas.length > 0 ? (
              <ul className="list-disc list-inside ml-4">
                {mantenimiento.lista_de_piezas.map((piece: Piece, index: number) => (
                  <li key={index} className="mb-2">
                    {piece.name}
                    {piece.cambio_de_pieza && (
                      <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                        (Serie Anterior: {piece.numero_serie_anterior || 'N/A'}, Serie Nueva: {piece.numero_serie_nueva || 'N/A'})
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p>N/A</p>
            )}
          </div>
          <p><strong>Vehículo Asociado:</strong> {mantenimiento.vehicle ? `${mantenimiento.vehicle.marca} ${mantenimiento.vehicle.modelo} (${mantenimiento.vehicle.matricula})` : 'N/A'}</p>
        </div>
      </div>
    </>
  );
};

export default MantenimientoDetailsPage;
