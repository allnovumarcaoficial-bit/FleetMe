'use client';

import { useState, useEffect } from 'react';
import { Vehicle, Driver } from '@/types/fleet';
import InputGroup from '@/components/FormElements/InputGroup';
import MultiSelect from '@/components/FormElements/MultiSelect';
import { Select } from '@/components/FormElements/select';
import { Alert } from '@/components/ui-elements/alert';
import { useRouter } from 'next/navigation';
import { TipoCombustibleEnum2 } from '@/types/fleet'; // Importar el enum

interface VehicleFormData extends Omit<Vehicle, 'listado_municipios'> {
  listado_municipios: string[];
}

interface VehicleFormProps {
  initialData?: Vehicle;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const VehicleForm = ({
  initialData,
  onSuccess,
  onCancel,
}: VehicleFormProps) => {
  const router = useRouter();
  const [isEstado, setEstado] = useState('Activo');
  const [formData, setFormData] = useState<Partial<VehicleFormData>>(() => {
    const defaults: Partial<VehicleFormData> = {
      marca: '',
      modelo: '',
      vin: '',
      matricula: '',
      fecha_compra: null,
      fecha_vencimiento_licencia_operativa: null,
      fecha_vencimiento_circulacion: null,
      fecha_vencimiento_somaton: null,
      estado: 'Activo',
      gps: false,
      listado_municipios: [],
      tipo_vehiculo: '',
      cantidad_neumaticos: 0,
      tipo_neumaticos: '',
      capacidad_carga: '',
      cantidad_conductores: 1,
      ciclo_mantenimiento_km: 10000,
      es_electrico: false,
      cantidad_baterias: 0,
      tipo_bateria: '',
      amperage: 0,
      voltage: 0,
      tipo_combustible: 'Gasolina',
      capacidad_tanque: 0,
      indice_consumo: 0,
      destino: 'Administrativo', // Nuevo campo
      driver: [],
      odometro: 0,
      odometro_inicial: 0,
    };

    if (initialData) {
      return {
        ...defaults,
        ...initialData,
        fecha_compra: initialData.fecha_compra
          ? new Date(initialData.fecha_compra)
          : null,
        fecha_vencimiento_licencia_operativa:
          initialData.fecha_vencimiento_licencia_operativa
            ? new Date(initialData.fecha_vencimiento_licencia_operativa)
            : null,
        fecha_vencimiento_circulacion: initialData.fecha_vencimiento_circulacion
          ? new Date(initialData.fecha_vencimiento_circulacion)
          : null,
        fecha_vencimiento_somaton: initialData.fecha_vencimiento_somaton
          ? new Date(initialData.fecha_vencimiento_somaton)
          : null,
        listado_municipios: initialData.listado_municipios
          ? JSON.parse(initialData.listado_municipios as unknown as string)
          : [],
        driver: initialData.driver,
      };
    }
    return defaults;
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formStatus, setFormStatus] = useState<{
    type: 'success' | 'error' | '';
    message: string;
  }>({ type: '', message: '' });
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [docsVencidos, setDocsVencidos] = useState(false);
  const showMunicipios = formData.destino === 'Reparto';
  useEffect(() => {
    const fetchDependencies = async () => {
      try {
        const driversRes = await fetch(
          '/api/drivers?estado=Activo&unassigned=true'
        );
        const driversData = await driversRes.json();
        let availableDrivers = driversData.data || [];

        // If editing a vehicle that has a driver, ensure that driver is in the list
        if (initialData?.driver) {
          const isCurrentDriverInList = availableDrivers.some(
            (d: Driver) => d.id === initialData.driver!.map((d) => d.id)[0]
          );
          if (!isCurrentDriverInList) {
            availableDrivers = [initialData.driver, ...availableDrivers];
          }
        }

        setDrivers(availableDrivers);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching form dependencies:', err);
        setFormStatus({
          type: 'error',
          message: 'Error al cargar datos necesarios para el formulario.',
        });
        setLoading(false);
      }
    };
    fetchDependencies();
  }, [initialData]);
  useEffect(() => {
    if (
      !formData.fecha_compra ||
      !formData.fecha_vencimiento_circulacion ||
      !formData.fecha_vencimiento_licencia_operativa ||
      !formData.fecha_vencimiento_somaton
    ) {
      setFormData((prev) => ({
        ...prev,
        estado: 'Inactivo',
      }));
    }
    // Se elimina la lógica que forzaba el estado a "Activo" si la fecha no estaba vencida y el estado era "Inactivo".
  }, [
    formData.fecha_compra,
    formData.fecha_vencimiento_circulacion,
    formData.fecha_vencimiento_somaton,
  ]);

  useEffect(() => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const licenciaVencida =
      formData.fecha_vencimiento_licencia_operativa &&
      new Date(formData.fecha_vencimiento_licencia_operativa) < hoy;
    const circulacionVencida =
      formData.fecha_vencimiento_circulacion &&
      new Date(formData.fecha_vencimiento_circulacion) < hoy;
    const somatonVencido =
      formData.fecha_vencimiento_somaton &&
      new Date(formData.fecha_vencimiento_somaton) < hoy;

    if (licenciaVencida || circulacionVencida || somatonVencido) {
      setDocsVencidos(true);
      setFormData((prev) => ({
        ...prev,
        estado: 'Inactivo',
      }));
    } else {
      setDocsVencidos(false);
    }
  }, [
    formData.fecha_vencimiento_licencia_operativa,
    formData.fecha_vencimiento_circulacion,
    formData.fecha_vencimiento_somaton,
  ]);

  useEffect(() => {
    if (initialData) {
      setFormData((prev) => ({
        ...prev,
        ...initialData,
        fecha_compra: initialData.fecha_compra
          ? new Date(initialData.fecha_compra)
          : null,
        fecha_vencimiento_licencia_operativa:
          initialData.fecha_vencimiento_licencia_operativa
            ? new Date(initialData.fecha_vencimiento_licencia_operativa)
            : null,
        fecha_vencimiento_circulacion: initialData.fecha_vencimiento_circulacion
          ? new Date(initialData.fecha_vencimiento_circulacion)
          : null,
        fecha_vencimiento_somaton: initialData.fecha_vencimiento_somaton
          ? new Date(initialData.fecha_vencimiento_somaton)
          : null,
        listado_municipios: initialData.listado_municipios
          ? JSON.parse(initialData.listado_municipios as unknown as string)
          : [],
        driver: initialData.driver,
      }));
    }
  }, [initialData]);
  const validateField = (name: string, value: any): string => {
    let error = '';
    switch (name) {
      case 'marca':
      case 'modelo':
      case 'estado':
      case 'tipo_vehiculo':
        if (!value) error = 'Este campo es requerido.';
        break;
      case 'vin':
        if (!value) error = 'Este campo es requerido.';
        if (value && value.length !== 17)
          error = 'VIN debe tener 17 caracteres.';
        break;
      case 'matricula':
        if (!value) error = 'Este campo es requerido.';
        if (value && value.length < 6)
          error = 'Matrícula debe tener al menos 6 caracteres.';
        break;
      case 'fecha_compra':
      case 'fecha_vencimiento_licencia_operativa':
      case 'fecha_vencimiento_circulacion':
      case 'fecha_vencimiento_somaton':
        if (value && isNaN(new Date(value).getTime()))
          error = 'Fecha inválida.';
        break;
      case 'listado_municipios':
        if (!Array.isArray(value) || value.length === 0) {
          error = 'Debe seleccionar al menos un municipio.';
        }
        break;
      case 'odometro':
        if (isNaN(value)) {
          error = 'El odómetro debe ser un número.';
        } else if (value < 0) {
          error = 'El odómetro no puede ser negativo.';
        } else if (
          formData.odometro_inicial &&
          value < formData.odometro_inicial
        ) {
          error = 'El odómetro actual no puede ser menor que el inicial.';
        }
        break;
      case 'odometro_inicial':
        if (isNaN(value)) {
          error = 'El odómetro debe ser un número.';
        } else if (value < 0) {
          error = 'El odómetro no puede ser negativo.';
        }
        break;
      case 'cantidad_neumaticos':
      case 'cantidad_conductores':
      case 'ciclo_mantenimiento_km':
        if (value < 0) error = 'El valor no puede ser negativo.';
        break;
      case 'driver':
        // Permitir que el campo de conductor esté vacío si se desvincula
        if (
          Array.isArray(value) &&
          value.length > (formData.cantidad_conductores || 0)
        ) {
          error = `No puede seleccionar más de ${formData.cantidad_conductores} conductores.`;
        }
        break;
      case 'destino':
        if (!value) error = 'Este campo es requerido.';
        break;
    }
    return error;
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;
    let newValue: any = value;

    if (type === 'checkbox') {
      newValue = (e.target as HTMLInputElement).checked;
    } else if (type === 'date') {
      newValue = value ? new Date(value) : null;
    } else if (
      [
        'cantidad_neumaticos',
        'cantidad_conductores',
        'ciclo_mantenimiento_km',
        'cantidad_baterias',
        'amperage',
        'voltage',
        'capacidad_tanque',
      ].includes(name)
    ) {
      newValue = value === '' ? null : parseInt(value, 10);
    } else if (name === 'odometro' || name === 'odometro_inicial') {
      newValue = value === '' ? 0 : parseInt(value, 10);
    } else if (name === 'indice_consumo') {
      newValue = value === '' ? null : parseFloat(value);
    }

    setFormData((prev) => ({ ...prev, [name]: newValue }));
    const fieldError = validateField(name, newValue);
    setErrors((prev) => ({ ...prev, [name]: fieldError }));
  };

  const handleMunicipiosChange = (selectedMunicipios: string[]) => {
    setFormData((prev) => ({
      ...prev,
      listado_municipios: selectedMunicipios,
    }));
    const fieldError = validateField('listado_municipios', selectedMunicipios);
    setErrors((prev) => ({ ...prev, listado_municipios: fieldError }));
  };

  const handleDriversChange = (
    selectedDriverIds: string[],
    sizeConductores: number
  ) => {
    let selectedDrivers: Driver[] = [];
    if (selectedDriverIds.length > 0) {
      const flatDrivers = drivers.flat();
      // Filtrar drivers usando los IDs seleccionados
      selectedDrivers = flatDrivers
        .filter((driver) => selectedDriverIds.includes(driver.id.toString()))
        .slice(0, sizeConductores); // Limitar al número de conductores permitidos
    }

    setFormData((prev) => ({
      ...prev,
      driver: selectedDrivers,
    }));

    const fieldError = validateField('driver', selectedDrivers);
    setErrors((prev) => ({ ...prev, driver: fieldError }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    // Custom validation for activating a vehicle
    if (
      formData.estado === 'Activo' &&
      (!formData.fecha_compra ||
        !formData.fecha_vencimiento_licencia_operativa ||
        !formData.fecha_vencimiento_circulacion ||
        !formData.fecha_vencimiento_somaton)
    ) {
      newErrors.estado =
        'No se puede activar un vehículo si faltan fechas importantes.';
      isValid = false;
    }

    for (const key in formData) {
      const value = (formData as any)[key];
      const destiny = (formData as any)['destino'];
      if (key === 'listado_municipios' && destiny !== 'Reparto') {
        continue; // Use continue to ensure all fields are validated
      }
      const error = validateField(key, value);
      if (error) {
        newErrors[key] = error;
        isValid = false;
      }
    }

    setErrors(newErrors);
    console.log('validateForm: newErrors', newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus({ type: '', message: '' });

    if (!validateForm()) {
      console.log('handleSubmit: Validation failed, errors:', errors);
      setFormStatus({
        type: 'error',
        message: 'Por favor, corrige los errores del formulario.',
      });
      return;
    }

    setLoading(true);
    try {
      const method = initialData ? 'PUT' : 'POST';
      const url = initialData
        ? `/api/vehicles/${initialData.id}`
        : '/api/vehicles';
      const driverIds = formData.driver?.map((d) => ({ id: d.id })) || [];
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          fecha_compra: formData.fecha_compra?.toISOString(),
          fecha_vencimiento_licencia_operativa:
            formData.fecha_vencimiento_licencia_operativa?.toISOString(),
          fecha_vencimiento_circulacion:
            formData.fecha_vencimiento_circulacion?.toISOString(),
          fecha_vencimiento_somaton:
            formData.fecha_vencimiento_somaton?.toISOString(),
          listado_municipios: JSON.stringify(formData.listado_municipios),
          driverIds,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al guardar el vehículo.');
      }

      setFormStatus({
        type: 'success',
        message: `Vehículo ${initialData ? 'actualizado' : 'creado'} exitosamente.`,
      });
      if (onSuccess) onSuccess();
      router.push('/fleet/vehicles');
    } catch (err: any) {
      setFormStatus({
        type: 'error',
        message: err.message || 'Ocurrió un error inesperado.',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading && drivers.length === 0 && !initialData)
    return <p>Cargando formulario...</p>;

  const municipalityOptions = [
    { value: 'Habana Vieja', label: 'Habana Vieja' },
    { value: 'Centro Habana', label: 'Centro Habana' },
    { value: 'Cerro', label: 'Cerro' },
    { value: 'Diez de Octubre', label: 'Diez de Octubre' },
    { value: 'Playa', label: 'Playa' },
    { value: 'Marianao', label: 'Marianao' },
    { value: 'La Lisa', label: 'La Lisa' },
    { value: 'Boyeros', label: 'Boyeros' },
    { value: 'Arroyo Naranjo', label: 'Arroyo Naranjo' },
    { value: 'Cotorro', label: 'Cotorro' },
    { value: 'San Miguel del Padrón', label: 'San Miguel del Padrón' },
    { value: 'Guanabacoa', label: 'Guanabacoa' },
    { value: 'Regla', label: 'Regla' },
    { value: 'Este', label: 'Este' },
    { value: 'Caimito', label: 'Caimito' },
    { value: 'Bauta', label: 'Bauta' },
    { value: 'San Antonio de los Baños', label: 'San Antonio de los Baños' },
    { value: 'Alquízar', label: 'Alquízar' },
    { value: 'Artemisa', label: 'Artemisa' },
    { value: 'Güira de Melena', label: 'Güira de Melena' },
    { value: 'San Cristóbal', label: 'San Cristóbal' },
    { value: 'Bahía Honda', label: 'Bahía Honda' },
    { value: 'Candelaria', label: 'Candelaria' },
    { value: 'Mariel', label: 'Mariel' },
    { value: 'Quivicán', label: 'Quivicán' },
    { value: 'Bejucal', label: 'Bejucal' },
    { value: 'San José de las Lajas', label: 'San José de las Lajas' },
    { value: 'Madruga', label: 'Madruga' },
    { value: 'Nueva Paz', label: 'Nueva Paz' },
    { value: 'San Nicolás', label: 'San Nicolás' },
    { value: 'Santa Cruz del Norte', label: 'Santa Cruz del Norte' },
    { value: 'Jaruco', label: 'Jaruco' },
    { value: 'Melena del Sur', label: 'Melena del Sur' },
    { value: 'Batabanó', label: 'Batabanó' },
    { value: 'Güines', label: 'Güines' },
    { value: 'San Antonio del Sur', label: 'San Antonio del Sur' },
    { value: 'Baracoa', label: 'Baracoa' },
    { value: 'Maisí', label: 'Maisí' },
    { value: 'Imías', label: 'Imías' },
    { value: 'San Luis', label: 'San Luis' },
    { value: 'Guantánamo', label: 'Guantánamo' },
    { value: 'El Salvador', label: 'El Salvador' },
    { value: 'Manuel Tames', label: 'Manuel Tames' },
    { value: 'Yateras', label: 'Yateras' },
    { value: 'Niceto Pérez', label: 'Niceto Pérez' },
    { value: 'Caimanera', label: 'Caimanera' },
    { value: 'Jamaica', label: 'Jamaica' },
    { value: 'Palma Soriano', label: 'Palma Soriano' },
    { value: 'Contramaestre', label: 'Contramaestre' },
    { value: 'Mella', label: 'Mella' },
    { value: 'San Luis (Pinar del Río)', label: 'San Luis (Pinar del Río)' },
    { value: 'Santiago de Cuba', label: 'Santiago de Cuba' },
    { value: 'Songo-La Maya', label: 'Songo-La Maya' },
    { value: 'Segundo Frente', label: 'Segundo Frente' },
    { value: 'Tercer Frente', label: 'Tercer Frente' },
    { value: 'Guamá', label: 'Guamá' },
    { value: 'Mayarí', label: 'Mayarí' },
    { value: 'Moa', label: 'Moa' },
    { value: 'Sagua de Tánamo', label: 'Sagua de Tánamo' },
    { value: 'Frank País', label: 'Frank País' },
    { value: 'Cacocum', label: 'Cacocum' },
    { value: 'Banes', label: 'Banes' },
    { value: 'Antilla', label: 'Antilla' },
    { value: 'Gibara', label: 'Gibara' },
    { value: 'Rafael Freyre', label: 'Rafael Freyre' },
    { value: 'Holguín', label: 'Holguín' },
    { value: 'Calixto García', label: 'Calixto García' },
    { value: 'Urbano Noris', label: 'Urbano Noris' },
    { value: 'Cueto', label: 'Cueto' },
    { value: 'Báguanos', label: 'Báguanos' },
    { value: 'Jiguaní', label: 'Jiguaní' },
    { value: 'Bayamo', label: 'Bayamo' },
    { value: 'Cauto Cristo', label: 'Cauto Cristo' },
    { value: 'Río Cauto', label: 'Río Cauto' },
    { value: 'Yara', label: 'Yara' },
    { value: 'Manzanillo', label: 'Manzanillo' },
    { value: 'Niquero', label: 'Niquero' },
    { value: 'Media Luna', label: 'Media Luna' },
    { value: 'Campechuela', label: 'Campechuela' },
    { value: 'Pilón', label: 'Pilón' },
    { value: 'Bartolomé Masó', label: 'Bartolomé Masó' },
    { value: 'Guisa', label: 'Guisa' },
    { value: 'Las Tunas', label: 'Las Tunas' },
    { value: 'Manatí', label: 'Manatí' },
    { value: 'Puerto Padre', label: 'Puerto Padre' },
    { value: 'Jesús Menéndez', label: 'Jesús Menéndez' },
    { value: 'Majibacoa', label: 'Majibacoa' },
    { value: 'Amancio', label: 'Amancio' },
    { value: 'Colombia', label: 'Colombia' },
    { value: 'Jobabo', label: 'Jobabo' },
    { value: 'Florida', label: 'Florida' },
    { value: 'Esmeralda', label: 'Esmeralda' },
    { value: 'Sierra de Cubitas', label: 'Sierra de Cubitas' },
    { value: 'Minas', label: 'Minas' },
    { value: 'Nuevitas', label: 'Nuevitas' },
    { value: 'Guáimaro', label: 'Guáimaro' },
    { value: 'Sibanicú', label: 'Sibanicú' },
    { value: 'Camagüey', label: 'Camagüey' },
    { value: 'Vertientes', label: 'Vertientes' },
    { value: 'Santa Cruz del Sur', label: 'Santa Cruz del Sur' },
    { value: 'Najasa', label: 'Najasa' },
    { value: 'Jimaguayú', label: 'Jimaguayú' },
    { value: 'Ciego de Ávila', label: 'Ciego de Ávila' },
    { value: 'Morón', label: 'Morón' },
    { value: 'Chambas', label: 'Chambas' },
    { value: 'Ciro Redondo', label: 'Ciro Redondo' },
    { value: 'Florencia', label: 'Florencia' },
    { value: 'Majagua', label: 'Majagua' },
    { value: 'Bolivia', label: 'Bolivia' },
    { value: 'Primero de Enero', label: 'Primero de Enero' },
    { value: 'Venezuela', label: 'Venezuela' },
    { value: 'Baraguá', label: 'Baraguá' },
    { value: 'Sancti Spíritus', label: 'Sancti Spíritus' },
    { value: 'Cabaiguán', label: 'Cabaiguán' },
    { value: 'Fomento', label: 'Fomento' },
    { value: 'Jatibonico', label: 'Jatibonico' },
    { value: 'La Sierpe', label: 'La Sierpe' },
    { value: 'Taguasco', label: 'Taguasco' },
    { value: 'Trinidad', label: 'Trinidad' },
    { value: 'Yaguajay', label: 'Yaguajay' },
    { value: 'Santa Clara', label: 'Santa Clara' },
    { value: 'Caibarién', label: 'Caibarién' },
    { value: 'Camajuaní', label: 'Camajuaní' },
    { value: 'Cifuentes', label: 'Cifuentes' },
    { value: 'Encrucijada', label: 'Encrucijada' },
    { value: 'Manicaragua', label: 'Manicaragua' },
    { value: 'Placetas', label: 'Placetas' },
    { value: 'Quemado de Güines', label: 'Quemado de Güines' },
    { value: 'Sagua la Grande', label: 'Sagua la Grande' },
    { value: 'Santo Domingo', label: 'Santo Domingo' },
    { value: 'Corralillo', label: 'Corralillo' },
    { value: 'Ranchuelo', label: 'Ranchuelo' },
    { value: 'Cienfuegos', label: 'Cienfuegos' },
    { value: 'Abreus', label: 'Abreus' },
    { value: 'Aguada de Pasajeros', label: 'Aguada de Pasajeros' },
    { value: 'Cruces', label: 'Cruces' },
    { value: 'Cumanayagua', label: 'Cumanayagua' },
    { value: 'Palmira', label: 'Palmira' },
    { value: 'Rodas', label: 'Rodas' },
    { value: 'Santa Isabel de las Lajas', label: 'Santa Isabel de las Lajas' },
    { value: 'Calimete', label: 'Calimete' },
    { value: 'Cárdenas', label: 'Cárdenas' },
    { value: 'Ciénaga de Zapata', label: 'Ciénaga de Zapata' },
    { value: 'Colón', label: 'Colón' },
    { value: 'Jagüey Grande', label: 'Jagüey Grande' },
    { value: 'Jovellanos', label: 'Jovellanos' },
    { value: 'Limonar', label: 'Limonar' },
    { value: 'Los Arabos', label: 'Los Arabos' },
    { value: 'Martí', label: 'Martí' },
    { value: 'Matanzas', label: 'Matanzas' },
    { value: 'Pedro Betancourt', label: 'Pedro Betancourt' },
    { value: 'Perico', label: 'Perico' },
    { value: 'Unión de Reyes', label: 'Unión de Reyes' },
    { value: 'Pinar del Río', label: 'Pinar del Río' },
    { value: 'Consolación del Sur', label: 'Consolación del Sur' },
    { value: 'Guane', label: 'Guane' },
    { value: 'La Palma', label: 'La Palma' },
    { value: 'Los Palacios', label: 'Los Palacios' },
    { value: 'Mantua', label: 'Mantua' },
    { value: 'Minas de Matahambre', label: 'Minas de Matahambre' },
    { value: 'San Juan y Martínez', label: 'San Juan y Martínez' },
    {
      value: 'San Luis (Santiago de Cuba)',
      label: 'San Luis (Santiago de Cuba)',
    },
    { value: 'Sandino', label: 'Sandino' },
    { value: 'Viñales', label: 'Viñales' },
    { value: 'Isla de la Juventud', label: 'Isla de la Juventud' },
  ];

  return (
    <div className="rounded-[10px] border border-stroke bg-white p-4 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card sm:p-7.5">
      {formStatus.type && (
        <Alert
          variant={formStatus.type === 'success' ? 'success' : 'error'}
          title={formStatus.type === 'success' ? 'Éxito' : 'Error'}
          description={formStatus.message}
        />
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <InputGroup
              label="Marca"
              name="marca"
              type="text"
              placeholder="Introduce la marca"
              value={formData.marca || ''}
              handleChange={handleChange}
              required
            />
            {errors.marca && (
              <p className="mt-1 text-sm text-red-500">{errors.marca}</p>
            )}
          </div>
          <div>
            <InputGroup
              label="Modelo"
              name="modelo"
              type="text"
              placeholder="Introduce el modelo"
              value={formData.modelo || ''}
              handleChange={handleChange}
              required
            />
            {errors.modelo && (
              <p className="mt-1 text-sm text-red-500">{errors.modelo}</p>
            )}
          </div>
          <div>
            <InputGroup
              label="VIN"
              name="vin"
              type="text"
              placeholder="Introduce el VIN"
              value={formData.vin || ''}
              handleChange={handleChange}
              required
            />
            {errors.vin && (
              <p className="mt-1 text-sm text-red-500">{errors.vin}</p>
            )}
          </div>
          <div>
            <InputGroup
              label="Matrícula"
              name="matricula"
              type="text"
              placeholder="Introduce la matrícula"
              value={formData.matricula || ''}
              handleChange={handleChange}
              required
            />
            {errors.matricula && (
              <p className="mt-1 text-sm text-red-500">{errors.matricula}</p>
            )}
          </div>
          <div>
            <InputGroup
              label="Fecha de Compra"
              name="fecha_compra"
              type="date"
              placeholder="Selecciona la fecha"
              value={
                formData.fecha_compra
                  ? formData.fecha_compra.toISOString().split('T')[0]
                  : ''
              }
              handleChange={handleChange}
              required={formData.estado === 'Activo'}
            />
            {errors.fecha_compra && (
              <p className="mt-1 text-sm text-red-500">{errors.fecha_compra}</p>
            )}
          </div>
          <div>
            <InputGroup
              label="Vencimiento Licencia Operativa"
              name="fecha_vencimiento_licencia_operativa"
              type="date"
              placeholder="Selecciona la fecha"
              value={
                formData.fecha_vencimiento_licencia_operativa
                  ? formData.fecha_vencimiento_licencia_operativa
                      .toISOString()
                      .split('T')[0]
                  : ''
              }
              handleChange={handleChange}
              required={formData.estado === 'Activo'}
            />
            {errors.fecha_vencimiento_licencia_operativa && (
              <p className="mt-1 text-sm text-red-500">
                {errors.fecha_vencimiento_licencia_operativa}
              </p>
            )}
          </div>
          <div>
            <InputGroup
              label="Vencimiento Circulación"
              name="fecha_vencimiento_circulacion"
              type="date"
              placeholder="Selecciona la fecha"
              value={
                formData.fecha_vencimiento_circulacion
                  ? formData.fecha_vencimiento_circulacion
                      .toISOString()
                      .split('T')[0]
                  : ''
              }
              handleChange={handleChange}
              required={formData.estado === 'Activo'}
            />
            {errors.fecha_vencimiento_circulacion && (
              <p className="mt-1 text-sm text-red-500">
                {errors.fecha_vencimiento_circulacion}
              </p>
            )}
          </div>
          <div>
            <InputGroup
              label="Vencimiento Somatón"
              name="fecha_vencimiento_somaton"
              type="date"
              placeholder="Selecciona la fecha"
              value={
                formData.fecha_vencimiento_somaton
                  ? formData.fecha_vencimiento_somaton
                      .toISOString()
                      .split('T')[0]
                  : ''
              }
              handleChange={handleChange}
              required={formData.estado === 'Activo'}
            />
            {errors.fecha_vencimiento_somaton && (
              <p className="mt-1 text-sm text-red-500">
                {errors.fecha_vencimiento_somaton}
              </p>
            )}
          </div>
          <div>
            <Select
              label="Estado"
              items={
                !formData.fecha_compra ||
                !formData.fecha_vencimiento_circulacion ||
                !formData.fecha_vencimiento_licencia_operativa ||
                !formData.fecha_vencimiento_somaton ||
                docsVencidos
                  ? [{ value: 'Inactivo', label: 'Inactivo' }]
                  : [
                      { value: 'Activo', label: 'Activo' },
                      { value: 'Inactivo', label: 'Inactivo' },
                    ]
              }
              value={
                !formData.fecha_compra ||
                !formData.fecha_vencimiento_circulacion ||
                !formData.fecha_vencimiento_licencia_operativa ||
                !formData.fecha_vencimiento_somaton ||
                docsVencidos
                  ? 'Inactivo'
                  : formData.estado || 'Activo'
              }
              placeholder="Selecciona un estado"
              onChange={(e) =>
                handleChange(e as React.ChangeEvent<HTMLSelectElement>)
              }
              name="estado"
              required
            />
            {errors.estado && (
              <p className="mt-1 text-sm text-red-500">{errors.estado}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="gps"
              checked={formData.gps || false}
              onChange={handleChange}
              className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <label htmlFor="gps" className="text-dark dark:text-white">
              GPS
            </label>
          </div>
          <div>
            <Select
              label="Destino"
              name="destino"
              items={[
                { value: 'Administrativo', label: 'Administrativo' },
                { value: 'Logistico', label: 'Logístico' },
                { value: 'Reparto', label: 'Reparto' },
              ]}
              value={formData.destino || ''}
              placeholder="Selecciona un destino"
              onChange={(e) =>
                handleChange(e as React.ChangeEvent<HTMLSelectElement>)
              }
              required
            />
            {errors.destino && (
              <p className="mt-1 text-sm text-red-500">{errors.destino}</p>
            )}
          </div>
          {showMunicipios && (
            <div>
              <MultiSelect
                label="Municipios"
                options={municipalityOptions}
                selectedValues={formData.listado_municipios || []}
                onChange={handleMunicipiosChange}
                required={showMunicipios}
              />
              {errors.listado_municipios && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.listado_municipios}
                </p>
              )}
            </div>
          )}
          <div>
            <InputGroup
              label="Tipo de Vehículo"
              name="tipo_vehiculo"
              type="text"
              placeholder="Ej: Camión, Auto, Moto"
              value={formData.tipo_vehiculo || ''}
              handleChange={handleChange}
              required
            />
            {errors.tipo_vehiculo && (
              <p className="mt-1 text-sm text-red-500">
                {errors.tipo_vehiculo}
              </p>
            )}
          </div>
          <div>
            <InputGroup
              label="Cantidad de Neumáticos"
              name="cantidad_neumaticos"
              type="number"
              placeholder="Introduce la cantidad"
              value={String(formData.cantidad_neumaticos || '')}
              handleChange={handleChange}
            />
            {errors.cantidad_neumaticos && (
              <p className="mt-1 text-sm text-red-500">
                {errors.cantidad_neumaticos}
              </p>
            )}
          </div>
          <div>
            <InputGroup
              label="Tipo de Neumáticos"
              name="tipo_neumaticos"
              type="text"
              placeholder="Ej: P225/65R17"
              value={formData.tipo_neumaticos || ''}
              handleChange={handleChange}
            />
          </div>
          <div>
            <InputGroup
              label="Capacidad de Carga"
              name="capacidad_carga"
              type="text"
              placeholder="Ej: 1000 kg o 5 personas"
              value={formData.capacidad_carga || ''}
              handleChange={handleChange}
            />
          </div>
          <div>
            <InputGroup
              label="Cantidad de Conductores"
              name="cantidad_conductores"
              type="number"
              placeholder="Introduce la cantidad"
              value={String(formData.cantidad_conductores || '')}
              handleChange={handleChange}
            />
            {errors.cantidad_conductores && (
              <p className="mt-1 text-sm text-red-500">
                {errors.cantidad_conductores}
              </p>
            )}
          </div>
          <div>
            <InputGroup
              label="Odómetro Actual"
              name="odometro"
              type="number"
              placeholder="Introduce el odómetro"
              value={String(formData.odometro || 0)}
              handleChange={handleChange}
              disabled={!!initialData}
              required
            />
            {errors.odometro && (
              <p className="mt-1 text-sm text-red-500">{errors.odometro}</p>
            )}
          </div>
          <div>
            <InputGroup
              label="Odómetro Inicial"
              name="odometro_inicial"
              type="number"
              placeholder="Introduce el odómetro inicial"
              value={String(formData.odometro_inicial || 0)}
              handleChange={handleChange}
              disabled={!!initialData}
              required
            />
            {errors.odometro_inicial && (
              <p className="mt-1 text-sm text-red-500">
                {errors.odometro_inicial}
              </p>
            )}
          </div>
          <div>
            <InputGroup
              label="Ciclo de Mantenimiento (km)"
              name="ciclo_mantenimiento_km"
              type="number"
              placeholder="Introduce los kilómetros"
              value={String(formData.ciclo_mantenimiento_km || '')}
              handleChange={handleChange}
            />
            {errors.ciclo_mantenimiento_km && (
              <p className="mt-1 text-sm text-red-500">
                {errors.ciclo_mantenimiento_km}
              </p>
            )}
          </div>

          <div>
            {formData.cantidad_conductores &&
              formData.cantidad_conductores > 0 && (
                <>
                  <MultiSelect
                    label="Responsable"
                    options={[
                      ...drivers
                        .filter(
                          (driver) =>
                            driver.estado !== 'Inactivo' &&
                            (driver.vehicleId === null ||
                              driver.vehicleId === initialData?.id)
                        )
                        .map((driver) => ({
                          value: driver.id.toString(),
                          label: driver.nombre,
                        })),
                      ...(initialData?.driver || [])
                        .filter(
                          (driver) => !drivers.some((d) => d.id === driver.id)
                        )
                        .map((driver) => ({
                          value: driver.id.toString(),
                          label: driver.nombre,
                        })),
                    ]}
                    selectedValues={
                      (formData.driver || [])
                        .filter((driver) => driver && driver.id) // Filtra elementos inválidos
                        .map((driver) => String(driver.id)) || []
                    }
                    onChange={(e) =>
                      handleDriversChange(
                        e as unknown as string[],
                        formData.cantidad_conductores || 0
                      )
                    }
                    required={(formData.cantidad_conductores || 0) > 0}
                  />
                  {errors.driverId && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.driverId}
                    </p>
                  )}
                </>
              )}
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="es_electrico"
              name="es_electrico"
              checked={formData.es_electrico || false}
              onChange={handleChange}
              className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <label htmlFor="es_electrico" className="text-dark dark:text-white">
              Es Eléctrico
            </label>
          </div>
        </div>

        {formData.es_electrico ? (
          <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
            <h3 className="col-span-1 text-lg font-semibold text-dark dark:text-white md:col-span-2">
              Detalles del Vehículo Eléctrico
            </h3>
            <div>
              <InputGroup
                label="Cantidad de Baterías"
                name="cantidad_baterias"
                type="number"
                placeholder="Introduce la cantidad"
                value={String(formData.cantidad_baterias || '')}
                handleChange={handleChange}
              />
            </div>
            <div>
              <InputGroup
                label="Tipo de Batería"
                name="tipo_bateria"
                type="text"
                placeholder="Ej: Li-ion"
                value={formData.tipo_bateria || ''}
                handleChange={handleChange}
              />
            </div>
            <div>
              <InputGroup
                label="Amperaje (Ah)"
                name="amperage"
                type="number"
                placeholder="Introduce el amperaje"
                value={String(formData.amperage || '')}
                handleChange={handleChange}
              />
            </div>
            <div>
              <InputGroup
                label="Voltaje (V)"
                name="voltage"
                type="number"
                placeholder="Introduce el voltaje"
                value={String(formData.voltage || '')}
                handleChange={handleChange}
              />
            </div>
          </div>
        ) : (
          <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
            <h3 className="col-span-1 text-lg font-semibold text-dark dark:text-white md:col-span-2">
              Detalles del Vehículo de Combustión
            </h3>
            <div>
              <Select
                label="Tipo de Combustible"
                name="tipo_combustible"
                placeholder="Selecciona un tipo"
                items={Object.values(TipoCombustibleEnum2).map((type) => ({
                  value: type,
                  label: type,
                }))}
                value={formData.tipo_combustible || ''}
                onChange={(e) =>
                  handleChange(e as React.ChangeEvent<HTMLSelectElement>)
                }
                required={!formData.es_electrico}
              />
            </div>
            <div>
              <InputGroup
                label="Capacidad del Tanque (L)"
                name="capacidad_tanque"
                type="number"
                placeholder="Introduce la capacidad"
                value={String(formData.capacidad_tanque || '')}
                handleChange={handleChange}
                required={!formData.es_electrico}
              />
            </div>
            <div>
              <InputGroup
                label="Índice de Consumo (km/L)"
                name="indice_consumo"
                type="number"
                placeholder="Introduce el índice"
                value={String(formData.indice_consumo || '')}
                handleChange={handleChange}
                required={!formData.es_electrico}
              />
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-end gap-4">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center justify-center rounded-md border border-stroke bg-gray-2 px-4 py-2 text-center font-medium text-dark hover:bg-opacity-90 dark:border-dark-3 dark:bg-dark-2 dark:text-white lg:px-8 xl:px-10"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-center font-medium text-white hover:bg-opacity-90 disabled:opacity-50 lg:px-8 xl:px-10"
          >
            {loading
              ? 'Guardando...'
              : initialData
                ? 'Actualizar Vehículo'
                : 'Crear Vehículo'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default VehicleForm;
