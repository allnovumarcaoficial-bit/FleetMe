import * as Icons from '../icons';

export const NAV_DATA = [
  {
    label: 'MENÚ PRINCIPAL',
    items: [
      {
        title: 'Inicio',
        icon: Icons.HomeIcon,
        url: '/',
      },
      {
        title: 'Calendario',
        url: '/calendar',
        icon: Icons.Calendar,
        items: [],
      },
      // New Fleet Management Section
      {
        title: 'Gestión de Flota',
        icon: Icons.Table, // Using Table icon as a placeholder for now
        items: [
          {
            title: 'Vehículos',
            url: '/fleet/vehicles',
          },
          {
            title: 'Conductores',
            url: '/fleet/drivers',
          },
          {
            title: 'Mantenimientos',
            url: '/fleet/mantenimientos',
          },
          {
            title: 'Servicios',
            url: '/fleet/services',
          },
          {
            title: 'Tipo de Combustible',
            url: '/fleet/desielType',
          },
          {
            title: 'Tarjetas de Combustible',
            url: '/fleet/fuel-cards',
          },
          {
            title: 'Reservorio',
            url: '/fleet/reservorio',
          },
          {
            title: 'Operaciones de Combustible',
            url: '/fleet/fuel-operations',
          },
          {
            title: 'Ajustes',
            url: '/ajustes',
          },
        ],
      },
    ],
  },
];
