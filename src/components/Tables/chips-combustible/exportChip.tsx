'use client';
import React from 'react';
import { MenuDropDowndTable } from '@/components/Charts/chartDownload';
import {
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { Table } from 'antd';
import { formatDate } from 'date-fns';
import * as XLSX from 'xlsx';
import { ChipCombustibleData } from '.';
import { PeriodPicker } from '@/components/period-picker';
import { cn } from '@/lib/utils';

export function ExportChipCombustible({
  data,
}: {
  data: ChipCombustibleData[];
}) {
  const exportToExcel = () => {
    // Crear un nuevo libro de trabajo
    const wb = XLSX.utils.book_new();

    // Preparar los datos en el formato correcto
    const datosFormateados = data.map((item) => ({
      Fecha: formatDate(item.fecha, 'dd/MM/yyyy'),
      Hora: item.fecha.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }),
      Operación: item.tipoOperacion,
      Servicio: item.tipoCombustible?.nombre || '',
      Litros: item.valorOperacionLitros?.toFixed(2) || '0.00',
      Saldo: item.saldoInicio?.toFixed(2) || '0.00',
      'Saldo Final': item.saldoFinal?.toFixed(2) || '0.00',
    }));

    // Crear una hoja de trabajo a partir de los datos
    const ws = XLSX.utils.json_to_sheet(datosFormateados);

    // Ajustar el ancho de las columnas para mejor visualización
    const columnWidths = [
      { wch: 25 }, // Nombre de Tipo de combustible
      { wch: 10 }, // Precio
      { wch: 20 }, // Última Actualización
      { wch: 10 }, // Moneda
    ];
    ws['!cols'] = columnWidths;

    // Añadir la hoja al libro
    XLSX.utils.book_append_sheet(wb, ws, 'Chip de combustible');

    // Escribir el archivo y forzar la descarga
    XLSX.writeFile(wb, 'chips_combustible.xlsx');
  };
  return (
    <>
      <div className="mx-auto flex justify-end">
        <MenuDropDowndTable exportToExcel={() => exportToExcel()} />
      </div>
    </>
  );
}
