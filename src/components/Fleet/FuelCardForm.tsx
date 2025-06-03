'use client';

import { useState, useEffect, useCallback } from 'react';
import { FuelCard } from '@/types/fleet';
import InputGroup from '@/components/FormElements/InputGroup';
import { Select } from '@/components/FormElements/select';
import { Alert } from '@/components/ui-elements/alert';
import { useRouter } from 'next/navigation';

interface FuelCardFormProps {
  initialData?: Partial<FuelCard>;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const FuelCardForm = ({ initialData, onSuccess, onCancel }: FuelCardFormProps) => {
  const router = useRouter();
  const [formData, setFormData] = useState<Partial<FuelCard>>(() => {
    if (initialData) {
      return {
        ...initialData,
        fechaVencimiento: initialData.fechaVencimiento ? new Date(initialData.fechaVencimiento) : null,
      };
    }
    return {
      numeroDeTarjeta: '',
      tipoDeTarjeta: '',
      tipoDeCombustible: '',
      precioCombustible: 0,
      moneda: '',
      fechaVencimiento: null,
      esReservorio: false,
    };
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formStatus, setFormStatus] = useState<{ type: 'success' | 'error' | ''; message: string }>({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        ...initialData,
        fechaVencimiento: initialData.fechaVencimiento ? new Date(initialData.fechaVencimiento) : null,
      }));
    }
  }, [initialData]);

  const validateField = useCallback((name: string, value: any): string => {
    let error = '';
    switch (name) {
      case 'numeroDeTarjeta':
        if (!value) error = 'El número de tarjeta es requerido.';
        break;
      case 'tipoDeTarjeta':
        if (!value) error = 'El tipo de tarjeta es requerido.';
        break;
      case 'tipoDeCombustible':
        if (!value) error = 'El tipo de combustible es requerido.';
        break;
      case 'precioCombustible':
        if (value === null || value === undefined || value <= 0) error = 'El precio del combustible es requerido y debe ser mayor que cero.';
        break;
      case 'moneda':
        if (!value) error = 'La moneda es requerida.';
        break;
      case 'fechaVencimiento':
        if (!value) error = 'La fecha de vencimiento es requerida.';
        break;
    }
    return error;
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    let newValue: any = value;

    if (type === 'number') {
      newValue = value === '' ? null : parseFloat(value);
    } else if (type === 'date') {
      newValue = value ? new Date(value) : null;
    } else if (type === 'checkbox') {
      newValue = checked;
    }

    setFormData(prev => ({ ...prev, [name]: newValue }));
    setErrors(prev => ({ ...prev, [name]: validateField(name, newValue) }));
  };

  const validateForm = useCallback(() => {
    let newErrors: Record<string, string> = {};
    let isValid = true;
    const fieldsToValidate: (keyof FuelCard)[] = [
      'numeroDeTarjeta', 'tipoDeTarjeta', 'tipoDeCombustible', 'precioCombustible', 'moneda', 'fechaVencimiento'
    ];

    fieldsToValidate.forEach(field => {
      const value = formData[field];
      const error = validateField(field as string, value);
      if (error) {
        newErrors[field as string] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [formData, validateField]);

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
      const url = initialData ? `/api/fuel-cards/${initialData.id}` : '/api/fuel-cards';
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          fechaVencimiento: formData.fechaVencimiento?.toISOString(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al guardar la tarjeta de combustible.');
      }

      setFormStatus({ type: 'success', message: `Tarjeta de combustible ${initialData ? 'actualizada' : 'creada'} exitosamente.` });
      if (onSuccess) onSuccess();
      router.push('/fleet/fuel-cards');
    } catch (err: any) {
      setFormStatus({ type: 'error', message: err.message || 'Ocurrió un error inesperado.' });
    } finally {
      setLoading(false);
    }
  };

  const fuelCardTypes = [
    { value: 'Fincimex', label: 'Fincimex' },
    { value: 'Clasica', label: 'Clasica' },
    { value: 'Metropolitano', label: 'Metropolitano' },
  ];

  const fuelTypes = [
    { value: 'Gasolina Regular', label: 'Gasolina Regular' },
    { value: 'Gasolina Especial', label: 'Gasolina Especial' },
    { value: 'Diésel', label: 'Diésel' },
    { value: 'Eléctrico', label: 'Eléctrico' },
  ];

  const currencies = [
    { value: 'CUP', label: 'CUP' },
    { value: 'MLC', label: 'MLC' },
    { value: 'USD', label: 'USD' },
    { value: 'EUR', label: 'EUR' },
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
              label="Número de Tarjeta"
              name="numeroDeTarjeta"
              type="text"
              placeholder="Introduce el número de tarjeta"
              value={formData.numeroDeTarjeta || ''}
              handleChange={handleChange}
            />
            {errors.numeroDeTarjeta && <p className="text-red-500 text-sm mt-1">{errors.numeroDeTarjeta}</p>}
          </div>
          <div>
            <Select
              label="Tipo de Tarjeta"
              items={fuelCardTypes}
              value={formData.tipoDeTarjeta || ''}
              placeholder="Selecciona el tipo de tarjeta"
              onChange={(e) => handleChange(e as React.ChangeEvent<HTMLSelectElement>)}
              name="tipoDeTarjeta"
            />
            {errors.tipoDeTarjeta && <p className="text-red-500 text-sm mt-1">{errors.tipoDeTarjeta}</p>}
          </div>
          <div>
            <Select
              label="Tipo de Combustible"
              items={fuelTypes}
              value={formData.tipoDeCombustible || ''}
              placeholder="Selecciona el tipo de combustible"
              onChange={(e) => handleChange(e as React.ChangeEvent<HTMLSelectElement>)}
              name="tipoDeCombustible"
            />
            {errors.tipoDeCombustible && <p className="text-red-500 text-sm mt-1">{errors.tipoDeCombustible}</p>}
          </div>
          <div>
            <InputGroup
              label="Precio del Combustible"
              name="precioCombustible"
              type="number"
              placeholder="Introduce el precio del combustible"
              value={formData.precioCombustible?.toString() || ''}
              handleChange={handleChange}
            />
            {errors.precioCombustible && <p className="text-red-500 text-sm mt-1">{errors.precioCombustible}</p>}
          </div>
          <div>
            <Select
              label="Moneda"
              items={currencies}
              value={formData.moneda || ''}
              placeholder="Selecciona la moneda"
              onChange={(e) => handleChange(e as React.ChangeEvent<HTMLSelectElement>)}
              name="moneda"
            />
            {errors.moneda && <p className="text-red-500 text-sm mt-1">{errors.moneda}</p>}
          </div>
          <div>
            <InputGroup
              label="Fecha de Vencimiento"
              name="fechaVencimiento"
              type="date"
              placeholder="Selecciona la fecha de vencimiento"
              value={formData.fechaVencimiento ? formData.fechaVencimiento.toISOString().split('T')[0] : ''}
              handleChange={handleChange}
            />
            {errors.fechaVencimiento && <p className="text-red-500 text-sm mt-1">{errors.fechaVencimiento}</p>}
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="esReservorio"
              name="esReservorio"
              checked={formData.esReservorio || false}
              onChange={handleChange}
              className="h-5 w-5 text-primary focus:ring-primary border-gray-300 rounded"
            />
            <label htmlFor="esReservorio" className="text-body-sm font-medium text-dark dark:text-white">
              Es Reservorio
            </label>
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
            {loading ? 'Guardando...' : (initialData ? 'Actualizar Tarjeta' : 'Crear Tarjeta')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FuelCardForm;
