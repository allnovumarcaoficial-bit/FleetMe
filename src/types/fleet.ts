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
  listado_municipios: string[]; // Array of strings
  tipoNombre?: string | null; // Store vehicle type as a string
  driverId?: number | null; // 1-to-1 relation with Driver
  driver?: Driver | null;
  mantenimientos?: Mantenimiento[];
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

export enum MantenimientoTipo {
  Correctivo = "Correctivo",
  Preventivo = "Preventivo",
}

export interface Piece {
  id: number; // Added for React list rendering
  name: string;
  cambio_de_pieza: boolean;
  numero_serie_anterior?: string | null;
  numero_serie_nueva?: string | null;
}

export interface Mantenimiento {
  id: number;
  tipo: MantenimientoTipo;
  fecha: Date | null;
  costo: number;
  descripcion: string;
  lista_de_piezas: Piece[]; // Changed to array of Piece objects
  cambio_de_pieza: boolean; // Added top-level field
  vehicleId: number;
  vehicle?: Vehicle;
}
