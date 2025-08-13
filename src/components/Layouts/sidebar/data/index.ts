import * as Icons from "../icons";

export const NAV_DATA = [
  {
    label: "MENÚ PRINCIPAL",
    items: [
      {
        title: "Dashboard",
        icon: Icons.HomeIcon,
        items: [
          {
            title: "Reportes",
            url: "/",
          },
        ],
      },
      {
        title: "Calendario",
        url: "/calendar",
        icon: Icons.Calendar,
        items: [],
      },
      // New Fleet Management Section
      {
        title: "Gestión de Flota",
        icon: Icons.Table, // Using Table icon as a placeholder for now
        items: [
          {
            title: "Vehículos",
            url: "/fleet/vehicles",
          },
          {
            title: "Conductores",
            url: "/fleet/drivers",
          },
          {
            title: "Mantenimientos",
            url: "/fleet/mantenimientos",
          },
          {
            title: "Servicios",
            url: "/fleet/services",
          },
          {
            title: "Tarjetas de Combustible",
            url: "/fleet/fuel-cards",
          },
          {
            title: "Operaciones de Combustible",
            url: "/fleet/fuel-operations",
          },
        ],
      },
    ],
  },
  {
    label: "OTROS",
    items: [
      {
        title: "Autenticación",
        icon: Icons.Authentication,
        items: [
          {
            title: "Gestionar Usuarios",
            url: "/gestionarusuarios",
          },
          {
            title: "Editar Usuario",
            url: "/editarusuario",
          },
          {
            title: "Cerrar Sesión",
            url: "/auth/signin",
          },
        ],
      },
    ],
  },
];
