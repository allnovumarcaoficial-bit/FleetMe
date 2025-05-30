export interface Driver {
  id: number;
  nombre: string;
  licencia: string;
  fecha_vencimiento_licencia: Date | null;
  carnet_peritage: boolean;
  vehicle?: Vehicle | null; // 1-to-1 relation with Vehicle
  vehicleId?: number | null; // Add this for form handling
}

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
  driverId?: number | null; // 1-to-1 relation with Driver
  driver?: Driver | null;
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
