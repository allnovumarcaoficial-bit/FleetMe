// Prisma model OperationReservorio
export interface OperationReservorio {
  id: string;
  fuelOperationId: number;
  id_operation: FuelOperation;
  reservorio_id: string;
  reservorio: Reservorio;
  operationType?: string;
}

export interface Driver {
  id: number;
  nombre: string;
  licencia: string;
  fecha_vencimiento_licencia: Date | null;
  carnet_peritage: boolean;
  estado: DriverStatus; // Add this field
  vehicle?: Vehicle | null; // 1-to-1 relation with Vehicle
  photo?: string | null;
  address?: string | null;
  carnet?: string | null;
  phone?: string | null;
  createdAt: Date;
  updatedAt: Date;
  vehicleId?: number | null; // Foreign key to Vehicle
}

export type DriverStatus = 'Activo' | 'Inactivo' | 'Vacaciones'; // New type for driver status
export type VehicleStatus = 'Activo' | 'Inactivo' | 'En Mantenimiento' | 'Baja';

export interface Vehicle {
  id: number;
  marca: string;
  modelo: string;
  vin: string;
  odometro: number;
  odometro_inicial?: number;
  matricula: string;
  fecha_compra: Date | null;
  fecha_vencimiento_licencia_operativa: Date | null;
  fecha_vencimiento_circulacion: Date | null;
  fecha_vencimiento_somaton: Date | null;
  estado: VehicleStatus;
  gps: boolean;
  listado_municipios: string; // Cambiado a string
  tipo_vehiculo?: string | null;
  cantidad_neumaticos?: number | null;
  tipo_neumaticos?: string | null;
  capacidad_carga?: string | null;
  cantidad_conductores?: number | null;
  ciclo_mantenimiento_km?: number | null;
  es_electrico?: boolean | null;
  cantidad_baterias?: number | null;
  tipo_bateria?: string | null;
  amperage?: number | null;
  voltage?: number | null;
  tipo_combustible?: string | null;
  capacidad_tanque?: number | null;
  indice_consumo?: number | null;
  driver?: Driver[] | null;
  mantenimientos?: Mantenimiento[];
  servicios?: Servicio[];
  fuelDistributions?: FuelDistribution[];
  destino: DestinoVehiculo;
  km_recorrido?: number | null;
}

export type DestinoVehiculo = 'Administrativo' | 'Logistico' | 'Reparto';

export enum MantenimientoTipo {
  Correctivo = 'Correctivo',
  Preventivo = 'Preventivo',
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
  estado: MantenimientoEstado; // New field for maintenance status
  vehicleId: number;
  vehicle?: Vehicle;
}

export type MantenimientoEstado = 'Pendiente' | 'Ejecutado' | 'Cancelado';

export type TipoCombustibleEnum =
  | 'Gasolina_Regular'
  | 'Diesel'
  | 'Gasolina_Especial';
export interface Reservorio {
  id: string;
  nombre: string;
  capacidad_actual: number;
  capacidad_total: number;
  operationReservorio: OperationReservorio[];
  tipoCombustibleId: number | null;
  tipoCombustible: TipoCombustible | null;
}

export interface OperationTipo {
  fuelOperationId?: number | undefined;
  tipoCombustible_id: number;
}

export enum TipoCombustibleEnum2 {
  Gasolina_Regular = 'Gasolina Regular',
  Diesel = 'Diesel',
  Gasolina_Especial = 'Gasolina Especial',
}

export type MonedaEnum = 'USD' | 'CUP' | 'MLC';

export interface TipoCombustible {
  id: number;
  nombre: string;
  precio: number;
  createdAt: Date;
  updatedAt: Date;
  fechaUpdate: Date;
  reservorios?: Reservorio[];
  moneda: MonedaEnum; // Optional relation to Reservorio
}
export interface FuelCard {
  id: number;
  numeroDeTarjeta: string;
  tipoDeTarjeta: string;
  saldo: number;
  moneda: MonedaEnum;
  fechaVencimiento: Date | null;
  createdAt: Date;
  updatedAt: Date;
  fuelOperations?: FuelOperation[];
}

export enum ServicioTipo {
  EntregaDePedidos = 'Entrega de Pedidos',
  Logistico = 'Logistico',
  Administrativo = 'Administrativo',
}

export enum ServicioEstado {
  Pendiente = 'Pendiente',
  Completado = 'Completado',
  Cancelado = 'Cancelado',
}

export interface Servicio {
  id: number;
  tipoServicio: ServicioTipo;
  fecha: Date | null;
  odometroInicial: number;
  odometroFinal?: number | null;
  cantidadPedidos?: number | null;
  origen?: string | null;
  destino?: string | null;
  descripcion?: string | null;
  kilometrosRecorridos: number;
  estado: ServicioEstado;
  vehicleId: number;
  vehicle?: Vehicle;
  driver_id: number;
  driver?: Driver;
}
export enum FuelOperationType {
  Carga = 'Carga',
  Consumo = 'Consumo',
}
export interface FuelOperation {
  id: number;
  tipoOperacion: FuelOperationType;
  fecha: Date;
  saldoInicio: number;
  valorOperacionDinero: number;
  valorOperacionLitros: number;
  saldoFinal: number;
  saldoFinalLitros: number;
  fuelCardId: number;
  reservorioId?: string | null;
  descripcion?: string;
  ubicacion_cupet?: string;
  fuelCard: FuelCard;
  createdAt: Date;
  updatedAt: Date;
  operationReservorio: OperationReservorio[];
  fuelDistributions: FuelDistribution[];
  operationTipos: OperationTipo[];
  reservorio?: Reservorio | null;
}

export interface FuelOperationForm2 {
  id: number;
  tipoOperacion: FuelOperationType;
  fecha: Date;
  saldoInicio: number;
  valorOperacionDinero: number;
  valorOperacionLitros: number;
  saldoFinal: number;
  saldoFinalLitros: number;
  fuelCardId: number;
  descripcion?: string;
  ubicacion_cupet?: string;
  fuelCard: FuelCard;
  createdAt: Date;
  updatedAt: Date;
  reservorioId: string | null;
  operationReservorio: OperationReservorio[];
  fuelDistributions: FuelDistribution[];
  tipoCombustible_id?: number | null;
  tipoCombustible: TipoCombustible | null;
}

export interface FuelDistribution {
  id: number;
  fuelOperationId: number;
  fuelOperation?: FuelOperation;
  vehicleId: number;
  vehicle?: Vehicle;
  liters: number;
}
