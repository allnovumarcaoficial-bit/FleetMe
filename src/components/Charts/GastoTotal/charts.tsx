'use client';

import { useIsMobile } from '@/hooks/use-mobile';
import type { ApexOptions } from 'apexcharts';
import saveAs from 'file-saver';
import { toJpeg, toPng } from 'html-to-image';
import dynamic from 'next/dynamic';
import { useRef } from 'react';
import { MenuDropDownd } from '../chartDownload';

type PropsType = {
  data: {
    mantenimiento: { x: string; y: number }[];
    combustible: { x: string; y: number }[];
  };
};

const Chart = dynamic(() => import('react-apexcharts'), {
  ssr: false,
});

export function GastoTotalChart({ data }: PropsType) {
  const isMobile = useIsMobile();
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
      saveAs(dataUrl, 'Gastos.png');
    } catch (error) {
      console.error('Error al exportar PNG:', error);
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
      saveAs(dataUrl, 'Gastos-chart.jpg');
    } catch (error) {
      console.error('Error al exportar JPG:', error);
    }
  };

  // Función para exportar a CSV
  const exportToCsv = () => {
    // Obtener todas las fechas únicas
    const allDates = [
      ...new Set([
        ...data.mantenimiento.map((item) => item.x || 0),
        ...data.combustible.map((item) => item.x || 0),
      ]),
    ].sort();

    // Crear el contenido CSV
    const csvContent = [
      ['Fecha', 'Carga', 'Consumo'], // Headers
      ...allDates.map((date) => {
        const mantenimientoValue =
          data.mantenimiento.find((item) => item.x === date)?.y || 0;
        const combustibleValue =
          data.combustible.find((item) => item.x === date)?.y || 0;
        return [date, mantenimientoValue, combustibleValue];
      }),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `mantenimiento-combustible-data_${1}.csv`);
  };

  const options: ApexOptions = {
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
    colors: ['#5750F1', '#0ABEF9'],
    chart: {
      height: 310,
      type: 'area',
      toolbar: {
        show: false,
      },
      fontFamily: 'inherit',
    },

    fill: {
      gradient: {
        opacityFrom: 0.55,
        opacityTo: 0,
      },
    },
    responsive: [
      {
        breakpoint: 1024,
        options: {
          chart: {
            height: 300,
          },
        },
      },
      {
        breakpoint: 1366,
        options: {
          chart: {
            height: 320,
          },
        },
      },
    ],
    stroke: {
      curve: 'smooth',
      width: isMobile ? 2 : 3,
    },
    grid: {
      strokeDashArray: 5,
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    tooltip: {
      marker: {
        show: true,
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
      <div className="-ml-4 -mr-5 h-[310px]">
        <Chart
          options={options}
          series={[
            {
              name: 'Consumo',
              data: data.combustible,
            },
            {
              name: 'Carga',
              data: data.mantenimiento,
            },
          ]}
          type="area"
          height={310}
        />
      </div>
    </div>
  );
}
