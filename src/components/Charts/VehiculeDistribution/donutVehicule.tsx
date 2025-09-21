'use client';
import React, { useRef, useState } from 'react';
import { ApexOptions } from 'apexcharts';
import dynamic from 'next/dynamic';
import { compactFormat } from '@/lib/format-number';
import { MenuDropDownd } from '../chartDownload';
import saveAs from 'file-saver';
import { toPng, toJpeg } from 'html-to-image';

const Chart = dynamic(() => import('react-apexcharts'), {
  ssr: false,
});

type ViewType = 'marca' | 'modelo' | 'tipo_vehiculo';
export interface CarData {
  name?: string;
  data: number;
}
interface PropsType {
  data: CarData[];
}

export function VehiculeDistribution({ data }: PropsType) {
  const chartOptions: ApexOptions = {
    chart: {
      type: 'donut',
      fontFamily: 'inherit',
      height: 600, // Gráfico más grande
      width: '100%',
    },
    // Generar colores dinámicamente según la cantidad de datos
    colors: data.map((_, i) => {
      const palette = [
        '#5750F1',
        '#5475E5',
        '#8099EC',
        '#ADBCF2',
        '#F1C40F',
        '#E67E22',
        '#E74C3C',
        '#1ABC9C',
        '#2ECC71',
        '#9B59B6',
        '#34495E',
        '#F39C12',
        '#D35400',
        '#C0392B',
        '#16A085',
        '#27AE60',
        '#2980B9',
        '#8E44AD',
        '#2C3E50',
        '#BDC3C7',
      ];
      return palette[i % palette.length];
    }),
    labels: data.map((item) => item.name || ''),
    legend: {
      show: true,
      position: 'bottom',
      height: 100, // Altura fija más pequeña para la leyenda
      floating: false,
      itemMargin: {
        horizontal: 6,
        vertical: 2,
      },
      fontSize: '11px', // Fuente pequeña para acomodar más labels
      markers: {
        size: 6,
      },
      formatter: (legendName, opts) => {
        const { seriesPercent } = opts.w.globals;
        const percentage = parseFloat(seriesPercent[opts.seriesIndex]).toFixed(
          1
        );
        // Truncar nombres si son muy largos
        const truncatedName =
          legendName.length > 12
            ? legendName.substring(0, 12) + '...'
            : legendName;
        return `${truncatedName}: ${percentage}%`;
      },
    },
    plotOptions: {
      pie: {
        donut: {
          size: '85%', // Donut grande
          background: 'transparent',
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: '18px',
              fontWeight: 400,
              offsetY: -10,
              formatter: (val) => {
                return val;
              },
            },
            value: {
              show: true,
              fontSize: '24px', // Texto central más grande
              fontWeight: 'bold',
              offsetY: 10,
              formatter: (val) => compactFormat(+val),
            },
            total: {
              show: true,
              showAlways: true,
              label: 'Vehículos',
              fontSize: '18px',
              fontWeight: '400',
            },
          },
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    responsive: [
      {
        breakpoint: 1200,
        options: {
          chart: {
            height: 600, // Mantener tamaño grande
          },
          legend: {
            height: 100,
          },
        },
      },
      {
        breakpoint: 900,
        options: {
          chart: {
            height: 500, // Reducir solo ligeramente en tablets
          },
          legend: {
            height: 90,
            fontSize: '10px',
          },
        },
      },
      {
        breakpoint: 600,
        options: {
          chart: {
            height: 400, // Más pequeño en móviles pero aún decente
          },
          legend: {
            height: 80,
            fontSize: '9px',
            itemMargin: {
              horizontal: 4,
              vertical: 1,
            },
          },
        },
      },
    ],
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
    const csvContent = [
      ['Vehículo', 'Cantidad'], // Headers
      ...data.map((item) => [item.name, item.data]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'indice-consumo-data.csv');
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
      <Chart
        options={chartOptions}
        series={data.map((item) => item.data)}
        type="donut"
      />
    </div>
  );
}
