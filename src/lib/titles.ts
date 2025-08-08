export const getTitle = (path: string): string => {
  const pathTitleMap: { [key: string]: string } = {
    "/": "Dashboard",
    "/calendar": "Calendario",
    "/fleet/vehicles": "Vehículos",
    "/fleet/drivers": "Conductores",
    "/fleet/mantenimientos": "Mantenimiento ",
    "/fleet/services": "Servicios",
    "/fleet/fuel-cards": "Tarjetas de Combustible",
    "/fleet/fuel-operations": "Operaciones de Combustible",
  };

  return pathTitleMap[path] || "Dashboard";
};
