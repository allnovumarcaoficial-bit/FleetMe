'use client';

import { useState, useEffect, useCallback, use } from 'react';
import {
  FuelCard,
  ServicioEstado,
  TipoCombustible,
  TipoCombustibleEnum2,
} from '@/types/fleet';
import InputGroup from '@/components/FormElements/InputGroup';
import { Select } from '@/components/FormElements/select';
import { Alert } from '@/components/ui-elements/alert';
import { useRouter } from 'next/navigation';

// Define MonedaEnum if not already defined elsewhere
export enum MonedaEnum {
  USD = 'USD',
  MLC = 'MLC',
  CUP = 'CUP',
}

interface DieselTypeFormProps {
  initialData?: Partial<TipoCombustible>;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const DieselTypeForm = ({
  initialData,
  onSuccess,
  onCancel,
}: DieselTypeFormProps) => {
  const router = useRouter();
  const [combustible, setCombustible] = useState<TipoCombustible[]>([]);
  const [formData, setFormData] = useState<Partial<TipoCombustible>>(() => {
    if (initialData) {
      return {
        ...initialData,
        fechaUpdate: initialData.fechaUpdate
          ? new Date(initialData.fechaUpdate)
          : undefined,
      };
    }
    return {
      nombre: '',
      precio: 0,
      fechaUpdate: undefined,
      moneda: MonedaEnum.USD,
    };
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formStatus, setFormStatus] = useState<{
    type: 'success' | 'error' | '';
    message: string;
  }>({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData((prev) => ({
        ...prev,
        ...initialData,
      }));
    }
  }, [initialData]);

  const validateField = useCallback(
    (name: string, value: any): string => {
      let error = '';
      switch (name) {
        case 'nombre':
          if (!value) error = 'El nombre de la tarjeta es requerido.';
          break;
        case 'precio':
          if (!value) error = 'El precio es requerido.';
          break;
        case 'fechaUpdate':
          if (!value || isNaN(new Date(value).getTime()))
            error = 'Fecha inválida.';
          break;
        case 'moneda':
          if (!value) error = 'La moneda es requerida.';
          break;
      }
      return error;
    },
    [formData]
  );
  console.log(formData.moneda);
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    let newValue: any = value;

    if (type === 'number') {
      newValue = value === '' ? null : parseFloat(value);
    } else if (type === 'date') {
      newValue = value ? new Date(value) : null;
    } else if (type === 'checkbox') {
      newValue = checked;
    }

    setFormData((prev) => ({ ...prev, [name]: newValue }));
    setErrors((prev) => ({ ...prev, [name]: validateField(name, newValue) }));
  };

  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};
    let isValid = true;
    const fieldsToValidate: (keyof TipoCombustible)[] = [
      'nombre',
      'precio',
      'fechaUpdate',
    ];

    fieldsToValidate.forEach((field) => {
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
      setFormStatus({
        type: 'error',
        message: 'Por favor, corrige los errores del formulario.',
      });
      return;
    }
    console.log(formData);

    setLoading(true);
    try {
      const method = initialData ? 'PUT' : 'POST';
      const url = initialData
        ? `/api/dieselType/${initialData.id}`
        : '/api/dieselType';
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || 'Error al guardar el tipo de combustible.'
        );
      }

      setFormStatus({
        type: 'success',
        message: `TipoCombustible ${initialData ? 'actualizado' : 'creado'} exitosamente.`,
      });
      if (onSuccess) onSuccess();
      router.push('/fleet/desielType');
    } catch (err: any) {
      setFormStatus({
        type: 'error',
        message: err.message || 'Ocurrió un error inesperado.',
      });
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
              label="Nombre del tipo de combustible"
              name="nombre"
              type="text"
              placeholder="Introduce el nombre del tipo de combustible"
              value={formData.nombre || ''}
              handleChange={handleChange}
            />
            {errors.nombre && (
              <p className="mt-1 text-sm text-red-500">{errors.nombre}</p>
            )}
          </div>
          <div>
            <InputGroup
              label="Precio del combustible"
              name="precio"
              type="number"
              placeholder="Introduzca el precio del combustible"
              value={formData.precio?.toString() || ''}
              handleChange={handleChange}
            />
            {errors.precio && (
              <p className="mt-1 text-sm text-red-500">{errors.precio}</p>
            )}
          </div>
          <InputGroup
            label="Última Actualización"
            name="fechaUpdate"
            type="date"
            placeholder="Selecciona la fecha"
            value={
              formData.fechaUpdate
                ? new Date(formData.fechaUpdate).toISOString().split('T')[0]
                : ''
            }
            handleChange={handleChange}
          />
          {errors.fechaUpdate && (
            <p className="mt-1 text-sm text-red-500">{errors.fechaUpdate}</p>
          )}
          <div>
            <div>
              <Select
                label="Moneda"
                items={Object.values(MonedaEnum) // Solo llaves strings
                  .map((moneda) => ({
                    value: moneda,
                    label: moneda,
                  }))}
                value={formData.moneda || ''}
                placeholder="Selecciona la moneda"
                onChange={(e) =>
                  handleChange(e as React.ChangeEvent<HTMLSelectElement>)
                }
                name="moneda"
              />
              {errors.moneda && (
                <p className="mt-1 text-sm text-red-500">{errors.moneda}</p>
              )}
            </div>
          </div>
        </div>
        <div className="mx-auto mt-6 flex items-end justify-end gap-4 text-right">
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
                ? 'Actualizar Tipo Combustible'
                : 'Crear Tipo Combustible'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DieselTypeForm;
