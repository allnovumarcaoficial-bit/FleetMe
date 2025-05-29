export interface Vehicle {
  id: number;
  marca: string;
  modelo: string;
  vin: string;
  matricula: string;
  fecha_compra: Date | null;
  fecha_vencimiento_licencia_operativa: Date | null;
  fecha_vencimiento_circulacion: Date | null;
  fecha_vencimiento_somaton: Date | null;
  estado: string;
  gps: boolean;
  listado_municipios: string; // JSON string
  tipoNombre?: string | null; // Store vehicle type as a string
}

export interface VehicleType {
  id: number;
  nombre: string;
  cantidad_neumaticos: number;
  tipo_neumaticos: string;
  capacidad_carga: string;
  cantidad_conductores: number;
  ciclo_mantenimiento_km: number;
  es_electrico: boolean;
  cantidad_baterias?: number;
  tipo_bateria?: string;
  amperage?: number;
  voltage?: number;
  tipo_combustible?: string;
  capacidad_tanque?: number;
  indice_consumo?: number;
}

export interface Driver {
  id: number;
  nombre: string;
  licencia: string;
}
