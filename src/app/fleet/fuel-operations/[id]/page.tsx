'use client';

import Breadcrumbs from '@/components/Breadcrumbs/Breadcrumb';
import React, { use } from 'react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  FuelOperation,
  FuelCard,
  Vehicle,
  FuelDistribution,
  OperationReservorio,
  Reservorio,
  TipoCombustible, // Import TipoCombustible
} from '@/types/fleet';
import dayjs from 'dayjs';
import { ShowcaseSection } from '@/components/Layouts/showcase-section';
import DetailsButtons from '@/components/Fleet/PageElements/DetailsButtons';

const ViewFuelOperationPage = ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const router = useRouter();
  const { id } = use(params);
  const [fuelOperation, setFuelOperation] = useState<
    | (FuelOperation & {
        fuelCard: FuelCard;
        fuelDistributions: (FuelDistribution & { vehicle: Vehicle })[];
        operationReservorio: (OperationReservorio & {
          reservorio: Reservorio;
        })[];
        tipoCombustible: TipoCombustible; // Add tipoCombustible here
      })
    | null
  >(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleEdit = () => {
    router.push(`/fleet/fuel-operations/${id}/edit`);
  };

  const handleDelete = async () => {
    if (
      window.confirm(
        '¿Estás seguro de que quieres eliminar esta operación de combustible?'
      )
    ) {
      try {
        const response = await fetch(`/api/fuel-operations/${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        router.push('/fleet/fuel-operations');
      } catch (e: any) {
        setError(e.message);
      }
    }
  };

  useEffect(() => {
    const fetchFuelOperation = async () => {
      try {
        const response = await fetch(`/api/fuel-operations/${id}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setFuelOperation(data);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchFuelOperation();
    }
  }, [id]);

  if (loading)
    return <p>Cargando detalles de la operación de combustible...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;
  if (!fuelOperation) return <p>No se encontró la operación de combustible.</p>;

  return (
    <>
      <Breadcrumbs
        pageName="Detalles de Operación de Combustible"
        links={[
          { href: '/fleet', label: 'Flota' },
          {
            href: '/fleet/fuel-operations',
            label: 'Operaciones de Combustible',
          },
          { href: `/fleet/fuel-operations/${id}`, label: 'Detalles' },
        ]}
      />

      <ShowcaseSection title="Detalles:" className="!p-7">
        <div className="">
          <div className="mb-4">
            <h3 className="mb-4 text-xl font-semibold text-dark dark:text-white">
              Información de la Operación
            </h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <p>
                <strong>Tipo de Operación:</strong>{' '}
                {fuelOperation.tipoOperacion}
              </p>
              <p>
                <strong>Fecha:</strong>{' '}
                {dayjs(fuelOperation.fecha).format('DD/MM/YYYY HH:mm')}
              </p>
              <p>
                <strong>Tarjeta:</strong>{' '}
                {fuelOperation.fuelCard?.numeroDeTarjeta || 'N/A'}
              </p>
              <p>
                <strong>Saldo Inicio:</strong>{' '}
                {fuelOperation.saldoInicio?.toFixed(2) || 'N/A'}
              </p>
              <p>
                <strong>Valor Operación (Dinero):</strong>{' '}
                {fuelOperation.valorOperacionDinero?.toFixed(2) || 'N/A'}
              </p>
              <p>
                <strong>Valor Operación (Litros):</strong>{' '}
                {fuelOperation.valorOperacionLitros?.toFixed(2) || 'N/A'}
              </p>
              <p>
                <strong>Saldo Final:</strong>{' '}
                {fuelOperation.saldoFinal?.toFixed(2) || 'N/A'}
              </p>
              <p>
                <strong>Saldo Final (Litros):</strong>{' '}
                {fuelOperation.saldoFinalLitros?.toFixed(2) || 'N/A'}
              </p>
              <p>
                <strong>Tipo de Combustible:</strong>{' '}
                {fuelOperation.tipoCombustible?.nombre || 'N/A'}
              </p>
              <p>
                <strong>Ubicación Cupet:</strong>{' '}
                {fuelOperation.ubicacion_cupet || 'N/A'}
              </p>
              <p>
                <strong>Descripción:</strong>{' '}
                {fuelOperation.descripcion || 'N/A'}
              </p>
            </div>
            {(fuelOperation.tipoOperacion === 'Consumo' ||
              fuelOperation.tipoOperacion === 'Carga') &&
              ((fuelOperation.fuelDistributions &&
                fuelOperation.fuelDistributions.length > 0) ||
                (fuelOperation.operationReservorio &&
                  fuelOperation.operationReservorio.length > 0)) && (
                <div className="mt-4">
                  <h4 className="mb-2 text-lg font-semibold text-dark dark:text-white">
                    Destino:
                  </h4>
                  <ul className="list-disc pl-5">
                    {fuelOperation.fuelDistributions.map((dist, index) => (
                      <li key={index} className="text-dark dark:text-white">
                        {dist.vehicle
                          ? `${dist.vehicle.marca} ${dist.vehicle.modelo} (${dist.vehicle.matricula})`
                          : 'Vehículo Desconocido'}{' '}
                        - {dist.liters?.toFixed(2) || 'N/A'} Litros
                      </li>
                    ))}
                    {fuelOperation.operationReservorio.map((op, index) => (
                      <li key={index} className="text-dark dark:text-white">
                        {op.reservorio?.nombre || 'Reservorio Desconocido'} -{' '}
                        {(op as any).litros?.toFixed(2) || 'N/A'} Litros
                      </li>
                    ))}
                  </ul>
                </div>
              )}
          </div>

          <DetailsButtons
            handleDelete={handleDelete}
            handleEdit={handleEdit}
            handleBack={() => router.push('/fleet/fuel-operations')}
          />
        </div>
      </ShowcaseSection>
    </>
  );
};

export default ViewFuelOperationPage;
