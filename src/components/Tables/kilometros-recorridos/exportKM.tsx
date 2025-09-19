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
import { PeriodPicker } from '@/components/period-picker';
import { cn } from '@/lib/utils';
import { KilometrosRecorridosData } from '.';

export function ExportKM({ data }: { data: KilometrosRecorridosData[] }) {
  const exportToExcel = () => {
    // Crear un nuevo libro de trabajo
    const wb = XLSX.utils.book_new();

    // Preparar los datos en el formato correcto
    const datosFormateados = data.map((item) => ({
      Matrícula: item.matricula,
      Odómetro: item.odometro,
      'Kilómetros Recorridos': item.KilometrosRecorridosData,
      'Costo de Mantenimiento': item.gasto_mantenimientos,
      'Litros Echados': item.liters,
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
    XLSX.utils.book_append_sheet(wb, ws, 'Kilómetros Recorridos');

    // Escribir el archivo y forzar la descarga
    XLSX.writeFile(wb, 'kilometros_recorridos.xlsx');
  };
  return (
    <>
      <div className="mx-auto flex justify-end">
        <MenuDropDowndTable exportToExcel={() => exportToExcel()} />
      </div>
    </>
  );
}
