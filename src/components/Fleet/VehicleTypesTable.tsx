"use client";

import { useEffect, useState, useCallback } from "react";
import { VehicleType } from "@/types/fleet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { TrashIcon, PencilSquareIcon } from "@/assets/icons";
import { PreviewIcon } from "@/components/Tables/icons";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Pagination from "@/components/Tables/Pagination";
import AdvancedTableFilter, { ColumnFilter, ActiveFilters } from './AdvancedTableFilter';
import { Alert } from '@/components/ui-elements/alert';
import type { Dayjs } from 'dayjs';

const VehicleTypesTable = () => {
  const router = useRouter();
  const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalVehicleTypes, setTotalVehicleTypes] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState("id");
  const [sortOrder, setSortOrder] = useState("asc");
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>({});
  const [actionStatus, setActionStatus] = useState<{
    type: "success" | "error" | "";
    message: string;
  }>({ type: "", message: "" });

  const vehicleTypeColumns: ColumnFilter[] = [
    { key: 'nombre', title: 'Nombre', type: 'text' },
    { key: 'cantidad_neumaticos', title: 'Neumáticos', type: 'text' },
    { key: 'tipo_neumaticos', title: 'Tipo Neumáticos', type: 'text' },
    { key: 'capacidad_carga', title: 'Capacidad de Carga', type: 'text' },
    { key: 'cantidad_conductores', title: 'Cantidad de Conductores', type: 'text' },
    { key: 'ciclo_mantenimiento_km', title: 'Ciclo Mantenimiento (Km)', type: 'text' },
    { key: 'es_electrico', title: 'Es Eléctrico', type: 'boolean' },
    { key: 'cantidad_baterias', title: 'Cantidad de Baterías', type: 'text' },
    { key: 'tipo_bateria', title: 'Tipo de Batería', type: 'text' },
    { key: 'amperage', title: 'Amperaje', type: 'text' },
    { key: 'voltage', title: 'Voltaje', type: 'text' },
    { key: 'tipo_combustible', title: 'Tipo de Combustible', type: 'text' },
    { key: 'capacidad_tanque', title: 'Capacidad de Tanque', type: 'text' },
    { key: 'indice_consumo', title: 'Índice de Consumo', type: 'text' },
  ];

  const fetchVehicleTypes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sortBy,
        sortOrder,
      });

      if (activeFilters.globalSearch) {
        params.append('search', activeFilters.globalSearch);
      }

      if (activeFilters.columnFilters) {
        for (const key in activeFilters.columnFilters) {
          const value = activeFilters.columnFilters[key];
          if (value !== undefined && value !== null && value !== '') {
            if (Array.isArray(value)) {
              if (value.length > 0) {
                params.append(key, value.join(','));
              }
            } else if (typeof value === 'boolean') {
              params.append(key, value.toString());
            } else {
              params.append(key, value.toString());
            }
          }
        }
      }

      const response = await fetch(
        `/api/vehicle-types?${params.toString()}`,
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      setVehicleTypes(result.data);
      setTotalVehicleTypes(result.total);
      setTotalPages(result.totalPages);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [page, limit, sortBy, sortOrder, activeFilters]);

  useEffect(() => {
    fetchVehicleTypes();
  }, [fetchVehicleTypes]);

  const handleFilterChange = useCallback((filters: ActiveFilters) => {
    setActiveFilters(filters);
    setPage(1); // Reset to first page on filter change
  }, []);

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  const handleDelete = async (id: number) => {
    if (
      window.confirm(
        "¿Estás seguro de que quieres eliminar este tipo de vehículo?",
      )
    ) {
      setActionStatus({ type: "", message: "" });
      try {
        const response = await fetch(`/api/vehicle-types/${id}`, {
          method: "DELETE",
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || "Error al eliminar el tipo de vehículo.",
          );
        }
        setActionStatus({
          type: "success",
          message: "Tipo de vehículo eliminado exitosamente.",
        });
        fetchVehicleTypes(); // Re-fetch vehicle types after deletion
      } catch (e: any) {
        setActionStatus({
          type: "error",
          message:
            e.message || "Ocurrió un error al eliminar el tipo de vehículo.",
        });
      }
    }
  };

  return (
    <div className="rounded-[10px] border border-stroke bg-white p-4 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card sm:p-7.5">
      {actionStatus.type && (
        <Alert
          variant={actionStatus.type === "success" ? "success" : "error"}
          title={actionStatus.type === "success" ? "Éxito" : "Error"}
          description={actionStatus.message}
        />
      )}

      <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <AdvancedTableFilter
          columns={vehicleTypeColumns}
          onFilterChange={handleFilterChange}
          loading={loading}
          applyFiltersAutomatically={true}
        />
        <Link href="/fleet/vehicle-types/new">
          <button className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10">
            Crear Tipo de Vehículo
          </button>
        </Link>
      </div>

      {loading ? (
        <p>Cargando tipos de vehículos...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow className="border-none bg-[#F7F9FC] dark:bg-dark-2 [&>th]:py-4 [&>th]:text-base [&>th]:text-dark [&>th]:dark:text-white">
                <TableHead
                  className="min-w-[155px] cursor-pointer xl:pl-7.5"
                  onClick={() => handleSort("nombre")}
                >
                  Nombre{" "}
                  {sortBy === "nombre" && (sortOrder === "asc" ? "▲" : "▼")}
                </TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort("cantidad_neumaticos")}
                >
                  Neumáticos{" "}
                  {sortBy === "cantidad_neumaticos" &&
                    (sortOrder === "asc" ? "▲" : "▼")}
                </TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort("tipo_neumaticos")}
                >
                  Tipo Neumáticos{" "}
                  {sortBy === "tipo_neumaticos" &&
                    (sortOrder === "asc" ? "▲" : "▼")}
                </TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort("es_electrico")}
                >
                  Eléctrico{" "}
                  {sortBy === "es_electrico" && (sortOrder === "asc" ? "▲" : "▼")}
                </TableHead>
                <TableHead className="text-right xl:pr-7.5">Acciones</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {vehicleTypes.map((type) => (
                <TableRow
                  key={type.id}
                  className="border-[#eee] dark:border-dark-3"
                >
                  <TableCell className="min-w-[155px] xl:pl-7.5">
                    <h5 className="text-dark dark:text-white">{type.nombre}</h5>
                  </TableCell>
                  <TableCell>
                    <p className="text-dark dark:text-white">
                      {type.cantidad_neumaticos}
                    </p>
                  </TableCell>
                  <TableCell>
                    <p className="text-dark dark:text-white">
                      {type.tipo_neumaticos}
                    </p>
                  </TableCell>
                  <TableCell>
                    <p className="text-dark dark:text-white">
                      {type.es_electrico ? "Sí" : "No"}
                    </p>
                  </TableCell>
                  <TableCell className="xl:pr-7.5">
                    <div className="flex items-center justify-end gap-x-3.5">
                      <Link
                        href={`/fleet/vehicle-types/${type.id}`}
                        className="hover:text-primary"
                      >
                        <span className="sr-only">Ver Tipo</span>
                        <PreviewIcon />
                      </Link>
                      <Link
                        href={`/fleet/vehicle-types/${type.id}/edit`}
                        className="hover:text-primary"
                      >
                        <span className="sr-only">Editar Tipo</span>
                        <PencilSquareIcon />
                      </Link>
                      <button
                        onClick={() => handleDelete(type.id)}
                        className="hover:text-primary"
                      >
                        <span className="sr-only">Eliminar Tipo</span>
                        <TrashIcon />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Pagination
            current={page}
            total={totalVehicleTypes}
            pageSize={limit}
            onChange={(p, ps) => {
              setPage(p);
              setLimit(ps);
            }}
            onShowSizeChange={(current, size) => {
              setPage(current);
              setLimit(size);
            }}
          />
        </>
      )}
    </div>
  );
};

export default VehicleTypesTable;
