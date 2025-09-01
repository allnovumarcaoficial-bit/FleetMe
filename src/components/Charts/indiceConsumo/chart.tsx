'use client';

import { useIsMobile } from '@/hooks/use-mobile';
import type { ApexOptions } from 'apexcharts';
import dynamic from 'next/dynamic';
import { useRef, useState } from 'react';
import { toJpeg, toPng } from 'html-to-image';
import { saveAs } from 'file-saver';
import { MenuDropDownd } from '../chartDownload';

type PropsType = {
  data: {
    indiceConsumo: { x: string; y: number }[];
  };
};

const Chart = dynamic(() => import('react-apexcharts'), {
  ssr: false,
});

export function IndiceConsumoChart({ data }: PropsType) {
  const isMobile = useIsMobile();
  const chartRef = useRef<HTMLDivElement>(null);

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
    colors: ['#5750F1'],
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

  // Función para exportar a PNG
  const exportToPng = async () => {
    if (chartRef.current === null) {
      return;
    }

    try {
      const dataUrl = await toPng(chartRef.current, {
        quality: 1.0,
        pixelRatio: 2, // Para mejor resolución
      });
      saveAs(dataUrl, 'indice-consumo-chart.png');
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
      saveAs(dataUrl, 'indice-consumo-chart.jpg');
    } catch (error) {
      console.error('Error al exportar JPG:', error);
    }
  };

  // Función para exportar a CSV
  const exportToCsv = () => {
    const csvContent = [
      ['Fecha', 'Indice de Consumo'], // Headers
      ...data.indiceConsumo.map((item) => [item.x, item.y]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'indice-consumo-data.csv');
  };

  return (
    <div className="space-y-4">
      {/* Menú de exportación con elipsis */}
      <div className="flex justify-end">
        <MenuDropDownd
          exportToPng={exportToPng}
          exportToJpg={exportToJpg}
          exportToCsv={exportToCsv}
        />
      </div>

      {/* Chart container con ref */}
      <div ref={chartRef} className="-ml-4 -mr-5 h-[310px]">
        <Chart
          options={options}
          series={[
            {
              name: 'Indice de Consumo',
              data: data.indiceConsumo,
            },
          ]}
          type="area"
          height={310}
        />
      </div>
    </div>
  );
}
