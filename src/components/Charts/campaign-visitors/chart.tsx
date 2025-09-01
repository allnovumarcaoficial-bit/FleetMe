'use client';

import type { ApexOptions } from 'apexcharts';
import saveAs from 'file-saver';
import { toJpeg, toPng } from 'html-to-image';
import dynamic from 'next/dynamic';
import { useRef } from 'react';
import { MenuDropDownd } from '../chartDownload';

type PropsType = {
  data: {
    x: string;
    y: number;
  }[];
};

const Chart = dynamic(() => import('react-apexcharts'), {
  ssr: false,
});

export function CampaignVisitorsChart({ data }: PropsType) {
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
      saveAs(dataUrl, 'Vehiculos.png');
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
      saveAs(dataUrl, 'Vehiculos-chart.jpg');
    } catch (error) {
      console.error('Error al exportar JPG:', error);
    }
  };

  // Función para exportar a CSV
  const exportToCsv = () => {
    const csvContent = [
      ['Fecha', 'Vehículos'], // Headers
      ...data.map((item) => [item.x, item.y]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'vehiculos-data.csv');
  };
  const options: ApexOptions = {
    colors: ['#5750F1'],
    chart: {
      fontFamily: 'Satoshi, sans-serif',
      type: 'bar',
      height: 200,
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '40%',
        borderRadius: 3,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 4,
      colors: ['transparent'],
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
      show: true,
      position: 'top',
      horizontalAlign: 'left',
      fontFamily: 'Satoshi',
    },
    grid: {
      strokeDashArray: 7,
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    fill: {
      opacity: 1,
    },
    tooltip: {
      x: {
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
      <div className="-ml-3.5 px-6 pb-1 pt-7.5">
        <Chart
          options={options}
          series={[
            {
              name: 'Visitors',
              data,
            },
          ]}
          type="bar"
          height={230}
        />
      </div>
    </div>
  );
}
