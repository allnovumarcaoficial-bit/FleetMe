'use client';

import { useState, useEffect, useCallback } from 'react';
import { FuelCard, TipoAjuste } from '@prisma/client';
import InputGroup from '@/components/FormElements/InputGroup';
import { Select } from '@/components/FormElements/select';
import { Alert } from '@/components/ui-elements/alert';
import { useRouter } from 'next/navigation';

interface AjusteFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const AjusteForm = ({ onSuccess, onCancel }: AjusteFormProps) => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    tarjetaId: '',
    tipoOperacion: TipoAjuste.CREDITO,
    valorOperacion: 0,
    descripcion: '',
  });
  const [fuelCards, setFuelCards] = useState<FuelCard[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formStatus, setFormStatus] = useState<{
    type: 'success' | 'error' | '';
    message: string;
  }>({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchFuelCards = async () => {
      try {
        const response = await fetch('/api/fuel-cards');
        const result = await response.json();
        setFuelCards(result.data);
      } catch (error) {
        console.error('Error fetching fuel cards:', error);
      }
    };
    fetchFuelCards();
  }, []);

  const validateField = useCallback((name: string, value: any): string => {
    let error = '';
    switch (name) {
      case 'tarjetaId':
        if (!value) error = 'Debe seleccionar una tarjeta.';
        break;
      case 'tipoOperacion':
        if (!value) error = 'El tipo de operación es requerido.';
        break;
      case 'valorOperacion':
        if (!value || parseFloat(value) <= 0)
          error = 'El valor debe ser un número positivo.';
        break;
      case 'descripcion':
        if (!value) error = 'La descripción es requerida.';
        break;
    }
    return error;
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    let newValue: any = value;

    if (name === 'valorOperacion') {
      newValue = value === '' ? '' : parseFloat(value);
    }

    setFormData((prev) => ({ ...prev, [name]: newValue }));
    setErrors((prev) => ({ ...prev, [name]: validateField(name, newValue) }));
  };

  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};
    let isValid = true;
    const fieldsToValidate = [
      'tarjetaId',
      'tipoOperacion',
      'valorOperacion',
      'descripcion',
    ];

    fieldsToValidate.forEach((field) => {
      const value = formData[field as keyof typeof formData];
      const error = validateField(field, value);
      if (error) {
        newErrors[field] = error;
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

    setLoading(true);
    try {
      const response = await fetch('/api/ajustes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          tarjetaId: parseInt(formData.tarjetaId),
          valorOperacion: parseFloat(formData.valorOperacion.toString()),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al crear el ajuste.');
      }

      setFormStatus({
        type: 'success',
        message: 'Ajuste creado exitosamente.',
      });
      if (onSuccess) onSuccess();
      router.push('/ajustes');
    } catch (err: any) {
      setFormStatus({
        type: 'error',
        message: err.message || 'Ocurrió un error inesperado.',
      });
    } finally {
      setLoading(false);
    }
  };

  const tipoAjusteOptions = [
    { value: TipoAjuste.CREDITO, label: 'Crédito (Suma)' },
    { value: TipoAjuste.DEBITO, label: 'Débito (Resta)' },
  ];

  const fuelCardOptions = Array.isArray(fuelCards)
    ? fuelCards.map((card) => ({
        value: card.id.toString(),
        label: card.numeroDeTarjeta,
      }))
    : [];

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
            <Select
              label="Tarjeta"
              items={fuelCardOptions}
              value={formData.tarjetaId}
              placeholder="Selecciona una tarjeta"
              onChange={(e) =>
                handleChange(e as React.ChangeEvent<HTMLSelectElement>)
              }
              name="tarjetaId"
              required
            />
            {errors.tarjetaId && (
              <p className="mt-1 text-sm text-red-500">{errors.tarjetaId}</p>
            )}
          </div>
          <div>
            <Select
              label="Tipo de Operación"
              items={tipoAjusteOptions}
              value={formData.tipoOperacion}
              placeholder="Selecciona el tipo de operación"
              onChange={(e) =>
                handleChange(e as React.ChangeEvent<HTMLSelectElement>)
              }
              name="tipoOperacion"
              required
            />
            {errors.tipoOperacion && (
              <p className="mt-1 text-sm text-red-500">
                {errors.tipoOperacion}
              </p>
            )}
          </div>
          <div>
            <InputGroup
              label="Valor del Ajuste"
              name="valorOperacion"
              type="number"
              placeholder="Introduce el valor del ajuste"
              value={formData.valorOperacion.toString()}
              handleChange={handleChange}
              required
            />
            {errors.valorOperacion && (
              <p className="mt-1 text-sm text-red-500">
                {errors.valorOperacion}
              </p>
            )}
          </div>
          <div className="md:col-span-2">
            <InputGroup
              label="Descripción"
              name="descripcion"
              type="text"
              placeholder="Justificación del ajuste"
              value={formData.descripcion}
              handleChange={handleChange}
              required
            />
            {errors.descripcion && (
              <p className="mt-1 text-sm text-red-500">{errors.descripcion}</p>
            )}
          </div>
        </div>

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
            {loading ? 'Guardando...' : 'Crear Ajuste'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AjusteForm;
