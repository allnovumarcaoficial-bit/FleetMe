'use client';

import { useState, useEffect } from 'react';
import { Vehicle, VehicleType, Driver } from '@/types/fleet';
import InputGroup from '@/components/FormElements/InputGroup'; // Corrected import
import { Alert } from '@/components/ui-elements/alert'; // Corrected import
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils'; // For styling native select/multiselect

interface VehicleFormProps {
  initialData?: Vehicle;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const VehicleForm = ({ initialData, onSuccess, onCancel }: VehicleFormProps) => {
  const router = useRouter();
  const [formData, setFormData] = useState<Partial<Vehicle>>(initialData ? {
    ...initialData,
    fecha_compra: initialData.fecha_compra ? new Date(initialData.fecha_compra) : null,
    fecha_vencimiento_licencia_operativa: initialData.fecha_vencimiento_licencia_operativa ? new Date(initialData.fecha_vencimiento_licencia_operativa) : null,
    fecha_vencimiento_circulacion: initialData.fecha_vencimiento_circulacion ? new Date(initialData.fecha_vencimiento_circulacion) : null,
    fecha_vencimiento_somaton: initialData.fecha_vencimiento_somaton ? new Date(initialData.fecha_vencimiento_somaton) : null,
    listado_municipios: initialData.listado_municipios || '[]',
  } : {
    marca: '',
    modelo: '',
    vin: '',
    matricula: '',
    fecha_compra: null,
    fecha_vencimiento_licencia_operativa: null,
    fecha_vencimiento_circulacion: null,
    fecha_vencimiento_somaton: null,
    estado: '',
    gps: false,
    listado_municipios: '[]',
    tipoNombre: null, // Changed from tipoVehiculoId: null
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formStatus, setFormStatus] = useState<{ type: 'success' | 'error' | ''; message: string }>({ type: '', message: '' });
  const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDependencies = async () => {
      try {
        // Fetch Vehicle Types
        const typesRes = await fetch('/api/vehicle-types');
        const typesData = await typesRes.json();
        setVehicleTypes(typesData.data || []);

        // Fetch Drivers
        const driversRes = await fetch('/api/drivers');
        const driversData = await driversRes.json();
        setDrivers(driversData.data || []);

        setLoading(false);
      } catch (err) {
        console.error('Error fetching form dependencies:', err);
        setFormStatus({ type: 'error', message: 'Error al cargar datos necesarios para el formulario.' });
        setLoading(false);
      }
    };
    fetchDependencies();
  }, []);

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        fecha_compra: initialData.fecha_compra ? new Date(initialData.fecha_compra) : null,
        fecha_vencimiento_licencia_operativa: initialData.fecha_vencimiento_licencia_operativa ? new Date(initialData.fecha_vencimiento_licencia_operativa) : null,
        fecha_vencimiento_circulacion: initialData.fecha_vencimiento_circulacion ? new Date(initialData.fecha_vencimiento_circulacion) : null,
        fecha_vencimiento_somaton: initialData.fecha_vencimiento_somaton ? new Date(initialData.fecha_vencimiento_somaton) : null,
        listado_municipios: initialData.listado_municipios || '[]',
      });
    }
  }, [initialData]);

  const validateField = (name: string, value: any): string => {
    let error = '';
    switch (name) {
      case 'marca':
      case 'modelo':
      case 'estado':
        if (!value) error = 'Este campo es requerido.';
        break;
      case 'vin':
        if (!value) error = 'Este campo es requerido.';
        if (value && value.length !== 17) error = 'VIN debe tener 17 caracteres.';
        break;
      case 'matricula':
        if (!value) error = 'Este campo es requerido.';
        if (value && value.length < 6) error = 'Matrícula debe tener al menos 6 caracteres.';
        break;
      case 'tipoNombre': // Changed from tipoVehiculoId
        if (!value) error = 'Debe seleccionar un tipo de vehículo.'; // No value === 0 check for string
        break;
      case 'fecha_compra':
      case 'fecha_vencimiento_licencia_operativa':
      case 'fecha_vencimiento_circulacion':
      case 'fecha_vencimiento_somaton':
        if (!value || isNaN(new Date(value).getTime())) error = 'Fecha inválida.';
        break;
      case 'listado_municipios':
        try {
          if (value && value !== '[]') JSON.parse(value);
        } catch {
          error = 'Formato JSON inválido para municipios.';
        }
        break;
    }
    return error;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    let newValue: any = value;

    if (type === 'checkbox') {
      newValue = (e.target as HTMLInputElement).checked;
    } else if (type === 'date') {
      newValue = new Date(value);
    } else if (name === 'tipoNombre') { // Changed from tipoVehiculoId
      newValue = value; // No parseInt needed for string
    }

    setFormData(prev => ({ ...prev, [name]: newValue }));
    const fieldError = validateField(name, newValue);
    setErrors(prev => ({ ...prev, [name]: fieldError }));
    console.log(`handleChange: ${name} = ${newValue}, error = ${fieldError}`);
  };

  const handleMultiSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, options } = e.target;
    const selectedValues = Array.from(options)
      .filter(option => option.selected)
      .map(option => option.value);

    if (name === 'listado_municipios') {
      setFormData(prev => ({ ...prev, [name]: JSON.stringify(selectedValues) }));
    }
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    let newErrors: Record<string, string> = {};
    let isValid = true;
    for (const key in formData) {
      const value = (formData as any)[key]; // Get value from formData
      const error = validateField(key, value); // Pass value to validateField
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

    console.log('handleSubmit: formData before validation', formData);
    if (!validateForm()) {
      console.log('handleSubmit: Validation failed, errors:', errors);
      setFormStatus({ type: 'error', message: 'Por favor, corrige los errores del formulario.' });
      return;
    }
    console.log('handleSubmit: Validation passed');

    setLoading(true);
    try {
      const method = initialData ? 'PUT' : 'POST';
      const url = initialData ? `/api/vehicles/${initialData.id}` : '/api/vehicles';
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          fecha_compra: formData.fecha_compra?.toISOString(),
          fecha_vencimiento_licencia_operativa: formData.fecha_vencimiento_licencia_operativa?.toISOString(),
          fecha_vencimiento_circulacion: formData.fecha_vencimiento_circulacion?.toISOString(),
          fecha_vencimiento_somaton: formData.fecha_vencimiento_somaton?.toISOString(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al guardar el vehículo.');
      }

      setFormStatus({ type: 'success', message: `Vehículo ${initialData ? 'actualizado' : 'creado'} exitosamente.` });
      if (onSuccess) onSuccess();
      router.push('/fleet/vehicles');
    } catch (err: any) {
      setFormStatus({ type: 'error', message: err.message || 'Ocurrió un error inesperado.' });
    } finally {
      setLoading(false);
    }
  };

  if (loading && vehicleTypes.length === 0 && drivers.length === 0 && !initialData) return <p>Cargando formulario...</p>;

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
    { value: 'San Luis (Santiago de Cuba)', label: 'San Luis (Santiago de Cuba)' },
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
            />
            {errors.marca && <p className="text-red-500 text-sm mt-1">{errors.marca}</p>}
          </div>
          <div>
            <InputGroup
              label="Modelo"
              name="modelo"
              type="text"
              placeholder="Introduce el modelo"
              value={formData.modelo || ''}
              handleChange={handleChange}
            />
            {errors.modelo && <p className="text-red-500 text-sm mt-1">{errors.modelo}</p>}
          </div>
          <div>
            <InputGroup
              label="VIN"
              name="vin"
              type="text"
              placeholder="Introduce el VIN"
              value={formData.vin || ''}
              handleChange={handleChange}
            />
            {errors.vin && <p className="text-red-500 text-sm mt-1">{errors.vin}</p>}
          </div>
          <div>
            <InputGroup
              label="Matrícula"
              name="matricula"
              type="text"
              placeholder="Introduce la matrícula"
              value={formData.matricula || ''}
              handleChange={handleChange}
            />
            {errors.matricula && <p className="text-red-500 text-sm mt-1">{errors.matricula}</p>}
          </div>
          <div>
            <InputGroup
              label="Fecha de Compra"
              name="fecha_compra"
              type="date"
              placeholder="Selecciona la fecha"
              value={formData.fecha_compra ? formData.fecha_compra.toISOString().split('T')[0] : ''}
              handleChange={handleChange}
            />
            {errors.fecha_compra && <p className="text-red-500 text-sm mt-1">{errors.fecha_compra}</p>}
          </div>
          <div>
            <InputGroup
              label="Vencimiento Licencia Operativa"
              name="fecha_vencimiento_licencia_operativa"
              type="date"
              placeholder="Selecciona la fecha"
              value={formData.fecha_vencimiento_licencia_operativa ? formData.fecha_vencimiento_licencia_operativa.toISOString().split('T')[0] : ''}
              handleChange={handleChange}
            />
            {errors.fecha_vencimiento_licencia_operativa && <p className="text-red-500 text-sm mt-1">{errors.fecha_vencimiento_licencia_operativa}</p>}
          </div>
          <div>
            <InputGroup
              label="Vencimiento Circulación"
              name="fecha_vencimiento_circulacion"
              type="date"
              placeholder="Selecciona la fecha"
              value={formData.fecha_vencimiento_circulacion ? formData.fecha_vencimiento_circulacion.toISOString().split('T')[0] : ''}
              handleChange={handleChange}
            />
            {errors.fecha_vencimiento_circulacion && <p className="text-red-500 text-sm mt-1">{errors.fecha_vencimiento_circulacion}</p>}
          </div>
          <div>
            <InputGroup
              label="Vencimiento Somatón"
              name="fecha_vencimiento_somaton"
              type="date"
              placeholder="Selecciona la fecha"
              value={formData.fecha_vencimiento_somaton ? formData.fecha_vencimiento_somaton.toISOString().split('T')[0] : ''}
              handleChange={handleChange}
            />
            {errors.fecha_vencimiento_somaton && <p className="text-red-500 text-sm mt-1">{errors.fecha_vencimiento_somaton}</p>}
          </div>
          <div>
            <InputGroup
              label="Estado"
              name="estado"
              type="text"
              placeholder="Introduce el estado"
              value={formData.estado || ''}
              handleChange={handleChange}
            />
            {errors.estado && <p className="text-red-500 text-sm mt-1">{errors.estado}</p>}
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="gps"
              checked={formData.gps || false}
              onChange={handleChange}
              className="h-5 w-5 text-primary rounded border-gray-300 focus:ring-primary"
            />
            <label htmlFor="gps" className="text-dark dark:text-white">GPS</label>
          </div>
          <div>
            <label htmlFor="municipios" className="mb-3 block text-body-sm font-medium text-dark dark:text-white">
              Municipios
            </label>
            <select
              id="municipios"
              name="listado_municipios"
              multiple
              size={8} // Add this attribute to force multiple visible rows
              value={formData.listado_municipios ? JSON.parse(formData.listado_municipios) : []}
              onChange={handleMultiSelectChange}
              className={cn(
                "w-full rounded-lg border border-stroke bg-transparent px-5.5 py-3 outline-none transition focus:border-primary active:border-primary dark:border-dark-3 dark:bg-dark-2 dark:focus:border-primary [&>option]:text-dark-5 dark:[&>option]:text-dark-6",
                "h-32" // Keep height, but size attribute is more direct for visual rows
              )}
            >
              {municipalityOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.listado_municipios && <p className="text-red-500 text-sm mt-1">{errors.listado_municipios}</p>}
          </div>
          <div>
            <label htmlFor="tipoNombre" className="mb-3 block text-body-sm font-medium text-dark dark:text-white">
              Tipo de Vehículo
            </label>
            <select
              id="tipoNombre"
              name="tipoNombre"
              value={formData.tipoNombre || ''}
              onChange={handleChange}
              className="w-full rounded-lg border border-stroke bg-transparent px-5.5 py-3 outline-none transition focus:border-primary active:border-primary dark:border-dark-3 dark:bg-dark-2 dark:focus:border-primary [&>option]:text-dark-5 dark:[&>option]:text-dark-6"
            >
              <option value="" disabled>Selecciona un tipo</option>
              {vehicleTypes.map(type => (
                <option key={type.id} value={type.nombre}>
                  {type.nombre}
                </option>
              ))}
            </select>
            {errors.tipoNombre && <p className="text-red-500 text-sm mt-1">{errors.tipoNombre}</p>}
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-4">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center justify-center rounded-md border border-stroke bg-gray-2 py-2 px-4 text-center font-medium text-dark hover:bg-opacity-90 dark:border-dark-3 dark:bg-dark-2 dark:text-white lg:px-8 xl:px-10"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center rounded-md bg-primary py-2 px-4 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10 disabled:opacity-50"
          >
            {loading ? 'Guardando...' : (initialData ? 'Actualizar Vehículo' : 'Crear Vehículo')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default VehicleForm;
