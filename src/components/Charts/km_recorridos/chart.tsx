'use client';

import type { ApexOptions } from 'apexcharts';
import saveAs from 'file-saver';
import { toPng, toJpeg } from 'html-to-image';
import dynamic from 'next/dynamic';
import { useRef } from 'react';
import { MenuDropDownd } from '../chartDownload';
export interface KilometrosData {
  mantenimientos: {
    x: string;
    y: number;
  }[];
  gastosCombustible: {
    x: string;
    y: number;
  }[];
}

type PropsType = {
  data: KilometrosData;
};

const Chart = dynamic(() => import('react-apexcharts'), {
  ssr: false,
});

export function KilometrosRecorridosChart({ data }: PropsType) {
  const options: ApexOptions = {
    colors: ['#5750F1', '#0ABEF9'],
    chart: {
      type: 'bar',
      stacked: true,
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: false,
      },
    },

    responsive: [
      {
        breakpoint: 1536,
        options: {
          plotOptions: {
            bar: {
              borderRadius: 3,
              columnWidth: '25%',
            },
          },
        },
      },
    ],
    plotOptions: {
      bar: {
        horizontal: false,
        borderRadius: 3,
        columnWidth: '25%',
        borderRadiusApplication: 'end',
        borderRadiusWhenStacked: 'last',
      },
    },
    dataLabels: {
      enabled: false,
    },

    grid: {
      strokeDashArray: 5,
      xaxis: {
        lines: {
          show: false,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
    },

    xaxis: {
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    legend: {
      position: 'top',
      horizontalAlign: 'left',
      fontFamily: 'inherit',
      fontWeight: 500,
      fontSize: '14px',
      markers: {
        size: 9,
        shape: 'circle',
      },
    },
    fill: {
      opacity: 1,
    },
  };

  const chartRef = useRef<HTMLDivElement>(null);
  const exportToPng = async () => {
    if (chartRef.current === null) {
      return;
    }

    try {
      const dataUrl = await toPng(chartRef.current, {
        quality: 1.0,
        pixelRatio: 2, // Para mejor resolución
      });
      saveAs(dataUrl, 'Gastos-combustible-mantenimientos.png');
    } catch (error) {
      console.error(
        'Error al exportar Gastos-combustible-mantenimiento PNG:',
        error
      );
    }
  };

  // Función para exportar a JPG
  const exportToJpg = async () => {
    if (chartRef.current === null) {
      return;
    }

    try {
      const dataUrl = await toJpeg(chartRef.current, {
        quality: 0.95,
        pixelRatio: 2, // Para mejor resolución
      });
      saveAs(dataUrl, 'Gastos-combustible-mantenimientos.jpg');
    } catch (error) {
      console.error('Error al exportar JPG:', error);
    }
  };

  // Función para exportar a CSV
  const exportToCsv = () => {
    // Obtener todas las fechas únicas
    const allDates = [
      ...new Set([
        ...data.mantenimientos.map((item) => item.x),
        ...data.gastosCombustible.map((item) => item.x),
      ]),
    ].sort();

    // Crear el contenido CSV
    const csvContent = [
      ['Fecha', 'Mantenimiento', 'Combustible'], // Headers
      ...allDates.map((date) => {
        const mantenimientoValue =
          data.mantenimientos.find((item) => item.x === date)?.y || '';
        const combustibleValue =
          data.gastosCombustible.find((item) => item.x === date)?.y || '';
        return [date, mantenimientoValue, combustibleValue];
      }),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'mantenimiento-combustible-data.csv');
  };
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <MenuDropDownd
          exportToPng={exportToPng}
          exportToJpg={exportToJpg}
          exportToCsv={exportToCsv}
        />
      </div>
      <div className="-ml-3.5 mt-3">
        <Chart
          options={options}
          series={[
            {
              name: 'Mantenimientos',
              data: data.mantenimientos,
            },
            {
              name: 'Gastos de Combustible',
              data: data.gastosCombustible,
            },
          ]}
          type="bar"
          height={370}
        />
      </div>
    </div>
  );
}
