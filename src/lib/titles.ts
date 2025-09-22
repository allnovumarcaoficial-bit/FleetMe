// lib/titles.ts
export const getTitle = (path: string): string => {
  // Mapa de rutas estáticas
  const staticPathMap: Record<string, string> = {
    '/': 'Inicio',
    '/calendar': 'Calendario',
    '/gestionarusuarios': 'Gestionar Usuarios',
    '/fleet/vehicles': 'Vehículos',
    '/fleet/vehicles/new': 'Crear Vehículo',
    '/fleet/drivers': 'Conductores',
    '/fleet/drivers/new': 'Crear Conductor',
    '/fleet/mantenimientos': 'Mantenimiento',
    '/fleet/mantenimientos/new': 'Crear Mantenimiento',
    '/fleet/services': 'Servicios',
    '/fleet/services/new': 'Crear Servicio',
    '/fleet/desielType': 'Tipo de Combustible',
    '/fleet/desielType/new': 'Crear Tipo de Combustible',
    '/fleet/fuel-cards': 'Tarjetas de Combustible',
    '/fleet/fuel-cards/new': 'Crear Tarjeta de Combustible',
    '/fleet/reservorio': 'Reservorio',
    '/fleet/reservorio/new': 'Crear Reservorio',
    '/fleet/fuel-operations': 'Operaciones de Combustible',
    '/fleet/fuel-operations/new': 'Crear Operación de Combustible',
    '/ajustes': 'Ajustes de Saldo',
    '/ajustes/new': 'Crear Ajuste de Saldo',
  };

  // Coincidencia para rutas estáticas
  if (staticPathMap[path]) {
    return staticPathMap[path];
  }

  // Manejo de rutas dinámicas usando expresiones regulares
  const dynamicPathMap: [RegExp, string][] = [
    [/^\/fleet\/vehicles\/[^/]+$/, 'Detalles de Vehículo'],
    [/^\/fleet\/vehicles\/[^/]+\/edit$/, 'Editar Vehículo'],
    [/\/fleet\/drive^rs\/[^/]+$/, 'Detalles de Conductor'],
    [/^\/fleet\/drivers\/[^/]+\/edit$/, 'Editar Conductor'],
    [/\/fleet\/mantenimientos\/[^/]+$/, 'Detalles del Mantenimiento'],
    [/^\/fleet\/mantenimientos\/[^/]+\/edit$/, 'Editar Mantenimiento'],
    [/^\/fleet\/services\/[^/]+$/, 'Detalles de Servicio'],
    [/^\/fleet\/services\/[^/]+\/edit$/, 'Editar Servicio'],
    [/^\/fleet\/desielType\/[^/]+$/, 'Detalles del Tipo de Combustible'],
    [/^\/fleet\/desielType\/[^/]+\/edit$/, 'Editar Tipo de Combustible'],
    [/^\/fleet\/fuel-cards\/[^/]+$/, 'Detalles de la Tarjeta de Combustible'],
    [/^\/fleet\/fuel-cards\/[^/]+\/edit$/, 'Editar Tarjeta de Combustible'],
    [/^\/fleet\/reservorio\/[^/]+$/, 'Detalles del Reservorio'],
    [/^\/fleet\/reservorio\/[^/]+\/edit$/, 'Editar Reservorio'],
    [
      /^\/fleet\/fuel-operations\/[^/]+$/,
      'Detalles de la Operación de Combustible',
    ],
    [
      /^\/fleet\/fuel-operations\/[^/]+\/edit$/,
      'Editar Operación de Combustible',
    ],
    // Agrega más patrones según necesites
  ];

  // Buscar coincidencia con rutas dinámicas
  for (const [regex, title] of dynamicPathMap) {
    if (regex.test(path)) {
      return title;
    }
  }

  // Títulos para rutas específicas por segmento
  const lastSegment = path.split('/').pop() || '';

  const segmentTitles: Record<string, string> = {
    create: 'Crear Nuevo',
    edit: 'Editar',
    new: 'Nuevo',
    details: 'Detalles',
    report: 'Reporte',
  };

  // Título basado en el último segmento
  if (segmentTitles[lastSegment]) {
    const parentPath = path.split('/').slice(0, -1).join('/');
    return `${segmentTitles[lastSegment]} ${staticPathMap[parentPath] || ''}`.trim();
  }

  // Título por defecto basado en el último segmento
  const defaultTitles: Record<string, string> = {
    vehicles: 'Vehículos',
    drivers: 'Conductores',
    services: 'Servicios',
    'fuel-cards': 'Tarjetas de Combustible',
    'fuel-operations': 'Operaciones de Combustible',
  };

  return defaultTitles[lastSegment] || 'Inicio';
};
