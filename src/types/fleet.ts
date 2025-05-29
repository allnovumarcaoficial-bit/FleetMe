export interface Vehicle {
  id: number;
  marca: string;
  modelo: string;
  vin: string;
  matricula: string;
  fecha_compra: Date;
  fecha_vencimiento_licencia_operativa: Date;
  fecha_vencimiento_circulacion: Date;
  fecha_vencimiento_somaton: Date;
  estado: string;
  gps: boolean;
  listado_municipios: string; // JSON string
  idtipo: number;
  tipoVehiculo?: VehicleType; // Optional, can be included via relation
  listado_idconductores?: number[]; // Array of driver IDs, handled in application logic
}

export interface VehicleType {
  id: number;
  nombre: string;
}

export interface Driver {
  id: number;
  nombre: string;
  licencia: string;
}
