'use client';

import { useState, useEffect } from 'react';
import { VehicleType } from '@/types/fleet';
import InputGroup from '@/components/FormElements/InputGroup';
import { Alert } from '@/components/ui-elements/alert';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface VehicleTypeFormProps {
  initialData?: VehicleType;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const VehicleTypeForm = ({ initialData, onSuccess, onCancel }: VehicleTypeFormProps) => {
  const router = useRouter();
  const [formData, setFormData] = useState<Partial<VehicleType>>(initialData || {
    nombre: '',
    cantidad_neumaticos: 0,
    tipo_neumaticos: '',
    capacidad_carga: '',
    cantidad_conductores: 0,
    ciclo_mantenimiento_km: 0,
    es_electrico: false,
    // Electric fields
    cantidad_baterias: undefined,
    tipo_bateria: '',
    amperage: undefined,
    voltage: undefined,
    // Non-electric fields
    tipo_combustible: '',
    capacidad_tanque: undefined,
    indice_consumo: undefined,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formStatus, setFormStatus] = useState<{ type: 'success' | 'error' | ''; message: string }>({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const validateField = (name: string, value: any): string => {
    let error = '';
    switch (name) {
      case 'nombre':
      case 'tipo_neumaticos':
      case 'capacidad_carga':
        if (!value) error = 'Este campo es requerido.';
        break;
      case 'cantidad_neumaticos':
      case 'cantidad_conductores':
      case 'ciclo_mantenimiento_km':
        if (value === null || value === undefined || value === '') error = 'Este campo es requerido.';
        else if (isNaN(Number(value)) || Number(value) < 0) error = 'Debe ser un número positivo.';
        break;
      case 'cantidad_baterias':
      case 'amperage':
      case 'voltage':
      case 'capacidad_tanque':
      case 'indice_consumo':
        if (formData.es_electrico && (name === 'cantidad_baterias' || name === 'amperage' || name === 'voltage')) {
          if (value === null || value === undefined || value === '') error = 'Este campo es requerido para vehículos eléctricos.';
          else if (isNaN(Number(value)) || Number(value) < 0) error = 'Debe ser un número positivo.';
        } else if (!formData.es_electrico && (name === 'capacidad_tanque' || name === 'indice_consumo')) {
          if (value === null || value === undefined || value === '') error = 'Este campo es requerido para vehículos no eléctricos.';
          else if (isNaN(Number(value)) || Number(value) < 0) error = 'Debe ser un número positivo.';
        }
        break;
      case 'tipo_bateria':
        if (formData.es_electrico && !value) error = 'Este campo es requerido para vehículos eléctricos.';
        break;
      case 'tipo_combustible':
        if (!formData.es_electrico && !value) error = 'Este campo es requerido para vehículos no eléctricos.';
        break;
    }
    return error;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    let newValue: any = value;

    if (type === 'checkbox') {
      newValue = (e.target as HTMLInputElement).checked;
    } else if (type === 'number') {
      newValue = value === '' ? undefined : Number(value);
    }

    setFormData(prev => ({ ...prev, [name]: newValue }));
    setErrors(prev => ({ ...prev, [name]: validateField(name, newValue) }));
  };

  const validateForm = () => {
    let newErrors: Record<string, string> = {};
    let isValid = true;

    const fieldsToValidate: (keyof VehicleType)[] = [
      'nombre', 'cantidad_neumaticos', 'tipo_neumaticos', 'capacidad_carga',
      'cantidad_conductores', 'ciclo_mantenimiento_km', 'es_electrico'
    ];

    if (formData.es_electrico) {
      fieldsToValidate.push('cantidad_baterias', 'tipo_bateria', 'amperage', 'voltage');
    } else {
      fieldsToValidate.push('tipo_combustible', 'capacidad_tanque', 'indice_consumo');
    }

    for (const field of fieldsToValidate) {
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus({ type: '', message: '' });

    if (!validateForm()) {
      setFormStatus({ type: 'error', message: 'Por favor, corrige los errores del formulario.' });
      return;
    }

    setLoading(true);
    try {
      const method = initialData ? 'PUT' : 'POST';
      const url = initialData ? `/api/vehicle-types/${initialData.id}` : '/api/vehicle-types';
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al guardar el tipo de vehículo.');
      }

      setFormStatus({ type: 'success', message: `Tipo de vehículo ${initialData ? 'actualizado' : 'creado'} exitosamente.` });
      if (onSuccess) onSuccess();
      router.push('/fleet/vehicle-types');
    } catch (err: any) {
      setFormStatus({ type: 'error', message: err.message || 'Ocurrió un error inesperado.' });
    } finally {
      setLoading(false);
    }
  };

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
              label="Nombre del Tipo"
              name="nombre"
              type="text"
              placeholder="Ej: Camión, Auto, Moto"
              value={formData.nombre || ''}
              handleChange={handleChange}
            />
            {errors.nombre && <p className="text-red-500 text-sm mt-1">{errors.nombre}</p>}
          </div>
          <div>
            <InputGroup
              label="Cantidad de Neumáticos"
              name="cantidad_neumaticos"
              type="number"
              placeholder="Ej: 4, 6, 18"
              value={formData.cantidad_neumaticos?.toString() || ''}
              handleChange={handleChange}
            />
            {errors.cantidad_neumaticos && <p className="text-red-500 text-sm mt-1">{errors.cantidad_neumaticos}</p>}
          </div>
          <div>
            <InputGroup
              label="Tipo de Neumáticos"
              name="tipo_neumaticos"
              type="text"
              placeholder="Ej: Radial, Diagonal"
              value={formData.tipo_neumaticos || ''}
              handleChange={handleChange}
            />
            {errors.tipo_neumaticos && <p className="text-red-500 text-sm mt-1">{errors.tipo_neumaticos}</p>}
          </div>
          <div>
            <InputGroup
              label="Capacidad de Carga"
              name="capacidad_carga"
              type="text"
              placeholder="Ej: 1000 kg, 5 personas"
              value={formData.capacidad_carga || ''}
              handleChange={handleChange}
            />
            {errors.capacidad_carga && <p className="text-red-500 text-sm mt-1">{errors.capacidad_carga}</p>}
          </div>
          <div>
            <InputGroup
              label="Cantidad de Conductores"
              name="cantidad_conductores"
              type="number"
              placeholder="Ej: 1, 2"
              value={formData.cantidad_conductores?.toString() || ''}
              handleChange={handleChange}
            />
            {errors.cantidad_conductores && <p className="text-red-500 text-sm mt-1">{errors.cantidad_conductores}</p>}
          </div>
          <div>
            <InputGroup
              label="Ciclo de Mantenimiento (km)"
              name="ciclo_mantenimiento_km"
              type="number"
              placeholder="Ej: 10000, 50000"
              value={formData.ciclo_mantenimiento_km?.toString() || ''}
              handleChange={handleChange}
            />
            {errors.ciclo_mantenimiento_km && <p className="text-red-500 text-sm mt-1">{errors.ciclo_mantenimiento_km}</p>}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="es_electrico"
              checked={formData.es_electrico || false}
              onChange={handleChange}
              className="h-5 w-5 text-primary rounded border-gray-300 focus:ring-primary"
            />
            <label htmlFor="es_electrico" className="text-dark dark:text-white">Es Eléctrico</label>
          </div>

          {formData.es_electrico ? (
            <>
              <div>
                <InputGroup
                  label="Cantidad de Baterías"
                  name="cantidad_baterias"
                  type="number"
                  placeholder="Ej: 1, 2"
                  value={formData.cantidad_baterias?.toString() || ''}
                  handleChange={handleChange}
                />
                {errors.cantidad_baterias && <p className="text-red-500 text-sm mt-1">{errors.cantidad_baterias}</p>}
              </div>
              <div>
                <InputGroup
                  label="Tipo de Batería"
                  name="tipo_bateria"
                  type="text"
                  placeholder="Ej: Litio, Níquel"
                  value={formData.tipo_bateria || ''}
                  handleChange={handleChange}
                />
                {errors.tipo_bateria && <p className="text-red-500 text-sm mt-1">{errors.tipo_bateria}</p>}
              </div>
              <div>
                <InputGroup
                  label="Amperaje"
                  name="amperage"
                  type="number"
                  placeholder="Ej: 100, 200"
                  value={formData.amperage?.toString() || ''}
                  handleChange={handleChange}
                />
                {errors.amperage && <p className="text-red-500 text-sm mt-1">{errors.amperage}</p>}
              </div>
              <div>
                <InputGroup
                  label="Voltaje"
                  name="voltage"
                  type="number"
                  placeholder="Ej: 12, 24, 48"
                  value={formData.voltage?.toString() || ''}
                  handleChange={handleChange}
                />
                {errors.voltage && <p className="text-red-500 text-sm mt-1">{errors.voltage}</p>}
              </div>
            </>
          ) : (
            <>
              <div>
                <InputGroup
                  label="Tipo de Combustible"
                  name="tipo_combustible"
                  type="text"
                  placeholder="Ej: Gasolina, Diésel"
                  value={formData.tipo_combustible || ''}
                  handleChange={handleChange}
                />
                {errors.tipo_combustible && <p className="text-red-500 text-sm mt-1">{errors.tipo_combustible}</p>}
              </div>
              <div>
                <InputGroup
                  label="Capacidad del Tanque"
                  name="capacidad_tanque"
                  type="number"
                  placeholder="Ej: 50, 70"
                  value={formData.capacidad_tanque?.toString() || ''}
                  handleChange={handleChange}
                />
                {errors.capacidad_tanque && <p className="text-red-500 text-sm mt-1">{errors.capacidad_tanque}</p>}
              </div>
              <div>
                <InputGroup
                  label="Índice de Consumo"
                  name="indice_consumo"
                  type="number"
                  placeholder="Ej: 8.5 (L/100km)"
                  value={formData.indice_consumo?.toString() || ''}
                  handleChange={handleChange}
                />
                {errors.indice_consumo && <p className="text-red-500 text-sm mt-1">{errors.indice_consumo}</p>}
              </div>
            </>
          )}
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
            {loading ? 'Guardando...' : (initialData ? 'Actualizar Tipo' : 'Crear Tipo')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default VehicleTypeForm;
