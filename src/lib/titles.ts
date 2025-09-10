// lib/titles.ts
export const getTitle = (path: string): string => {
  // Mapa de rutas estáticas
  const staticPathMap: Record<string, string> = {
    '/': 'Inicio',
    '/calendar': 'Calendario',
    '/fleet/vehicles': 'Vehículos',
    '/fleet/vehicles/new': 'Crear Vehículo',
    '/fleet/drivers': 'Conductores',
    '/fleet/drivers/new': 'Crear Conductor',
    '/fleet/mantenimientos': 'Mantenimiento',
    '/fleet/mantenimientos/new': 'Crear Mantenimiento',
    '/fleet/services': 'Servicios',
    '/fleet/services/new': 'Crear Servicio',
    '/fleet/fuel-cards': 'Tarjetas de Combustible',
    '/fleet/fuel-cards/new': 'Crear Tarjeta de Combustible',
    '/fleet/fuel-operations': 'Operaciones de Combustible',
    '/fleet/fuel-operations/new': 'Crear Operación de Combustible',
  };

  // Coincidencia para rutas estáticas
  if (staticPathMap[path]) {
    return staticPathMap[path];
  }

  // Manejo de rutas dinámicas usando expresiones regulares
  const dynamicPathMap: [RegExp, string][] = [
    [/^\/fleet\/vehicles\/[^/]+$/, 'Detalles de Vehículo'],
    [/^\/fleet\/vehicles\/[^/]+\/edit$/, 'Editar Vehículo'],
    [/^\/fleet\/drivers\/[^/]+$/, 'Detalles de Conductor'],
    [/^\/fleet\/drivers\/[^/]+\/edit$/, 'Editar Conductor'],
    [/^\/fleet\/services\/[^/]+$/, 'Detalles de Servicio'],
    [/^\/fleet\/services\/[^/]+\/edit$/, 'Editar Servicio'],
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
