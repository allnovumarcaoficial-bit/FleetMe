'use client';

import { useState, useEffect, useCallback } from 'react';
import { FuelOperation, FuelCard, Vehicle, FuelDistribution } from '@/types/fleet';
import InputGroup from '@/components/FormElements/InputGroup';
import { Select } from '@/components/FormElements/select';
import { Alert } from '@/components/ui-elements/alert';
import { useRouter } from 'next/navigation';
import dayjs from 'dayjs';
import { PlusIcon, TrashIcon } from '@/assets/icons'; // Assuming these icons exist

interface FuelOperationFormProps {
  initialData?: FuelOperation;
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface DestinationVehicle {
  id: number; // Unique ID for React list rendering
  vehicleId: number | null;
  litros: number; // Changed from number | '' to number
}

const FuelOperationForm = ({ initialData, onSuccess, onCancel }: FuelOperationFormProps) => {
  const router = useRouter();
  const [formData, setFormData] = useState<Partial<FuelOperation>>(() => {
    if (initialData) {
      return {
        ...initialData,
        fecha: initialData.fecha ? new Date(initialData.fecha) : new Date(),
      };
    }
    return {
      tipoOperacion: '',
      fecha: new Date(),
      valorOperacionDinero: 0,
      fuelCardId: undefined,
    };
  });

  const [destinationVehicles, setDestinationVehicles] = useState<DestinationVehicle[]>(() => {
    if (initialData && initialData.tipoOperacion === 'Consumo' && initialData.fuelDistributions && initialData.fuelDistributions.length > 0) {
      return initialData.fuelDistributions.map((dist, index) => ({
        id: index + 1,
        vehicleId: dist.vehicleId,
        litros: dist.liters,
      }));
    }
    return [{ id: 1, vehicleId: null, litros: 0 }];
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formStatus, setFormStatus] = useState<{ type: 'success' | 'error' | ''; message: string }>({ type: '', message: '' });
  const [fuelCards, setFuelCards] = useState<FuelCard[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFuelCard, setSelectedFuelCard] = useState<FuelCard | null>(null);
  const [lastOperationBalance, setLastOperationBalance] = useState<number>(0);

  const fetchDependencies = useCallback(async () => {
    setLoading(true);
    try {
      const [fuelCardsRes, vehiclesRes] = await Promise.all([
        fetch('/api/fuel-cards'),
        fetch('/api/vehicles'),
      ]);

      const fuelCardsData = await fuelCardsRes.json();
      const vehiclesData = await vehiclesRes.json();

      setFuelCards(fuelCardsData.data || []);
      setVehicles(vehiclesData.data || []);

      if (initialData?.fuelCardId) {
        const card = fuelCardsData.data.find((fc: FuelCard) => fc.id === initialData.fuelCardId);
        setSelectedFuelCard(card || null);
      }

      setLoading(false);
    } catch (err) {
      console.error('Error fetching form dependencies:', err);
      setFormStatus({ type: 'error', message: 'Error al cargar datos necesarios para el formulario.' });
      setLoading(false);
    }
  }, [initialData]);

  useEffect(() => {
    fetchDependencies();
  }, [fetchDependencies]);

  useEffect(() => {
    const calculateDerivedFields = async () => {
      if (formData.fuelCardId && selectedFuelCard) {
        // Fetch last operation balance
        const lastOpRes = await fetch(`/api/fuel-operations?fuelCardId=${formData.fuelCardId}&orderBy=fecha&orderDirection=desc&limit=1`);
        const lastOpData = await lastOpRes.json();
        const lastOp = lastOpData.data[0];
        const calculatedSaldoInicio = lastOp ? lastOp.saldoFinal : 0;
        setLastOperationBalance(calculatedSaldoInicio);

        const valorOperacionLitros = formData.valorOperacionDinero
          ? formData.valorOperacionDinero / selectedFuelCard.precioCombustible
          : 0;

        let calculatedSaldoFinal = 0;
        if (formData.tipoOperacion === 'Carga') {
          calculatedSaldoFinal = calculatedSaldoInicio + (formData.valorOperacionDinero || 0);
        } else if (formData.tipoOperacion === 'Consumo') {
          calculatedSaldoFinal = calculatedSaldoInicio - (formData.valorOperacionDinero || 0);
        }

        const calculatedSaldoFinalLitros = calculatedSaldoFinal / selectedFuelCard.precioCombustible;

        setFormData(prev => ({
          ...prev,
          saldoInicio: calculatedSaldoInicio,
          valorOperacionLitros: valorOperacionLitros,
          saldoFinal: calculatedSaldoFinal,
          saldoFinalLitros: calculatedSaldoFinalLitros,
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          saldoInicio: 0,
          valorOperacionLitros: 0,
          saldoFinal: 0,
          saldoFinalLitros: 0,
        }));
        setLastOperationBalance(0);
      }
    };

    calculateDerivedFields();
  }, [formData.fuelCardId, formData.valorOperacionDinero, formData.tipoOperacion, selectedFuelCard]);

  const validateField = (name: string, value: any): string => {
    let error = '';
    switch (name) {
      case 'tipoOperacion':
      case 'fecha':
      case 'valorOperacionDinero':
      case 'fuelCardId':
        if (!value) error = 'Este campo es requerido.';
        break;
      case 'valorOperacionDinero':
        if (value <= 0) error = 'El valor debe ser mayor que cero.';
        break;
      case 'destinationVehicles':
        if (formData.tipoOperacion === 'Consumo') {
          if (destinationVehicles.length === 0) {
            error = 'Debe seleccionar al menos un vehículo destino.';
          } else {
            const totalLitros = destinationVehicles.reduce((sum, dv) => sum + (dv.litros || 0), 0);
            if (Math.abs(totalLitros - (formData.valorOperacionLitros || 0)) > 0.01) { // Allow for floating point inaccuracies
              error = `La suma de litros (${totalLitros.toFixed(2)}) debe ser igual al valor de la operación en litros (${(formData.valorOperacionLitros || 0).toFixed(2)}).`;
            }
            if (destinationVehicles.some(dv => !dv.vehicleId)) {
              error = 'Todos los vehículos destino deben ser seleccionados.';
            }
            if (destinationVehicles.some(dv => (parseFloat(dv.litros as string) || 0) <= 0)) {
              error = 'La cantidad de litros para cada vehículo debe ser mayor que cero.';
            }
            if (selectedFuelCard?.esReservorio && destinationVehicles.length > 1) {
              error = 'Las tarjetas de reservorio solo pueden tener un vehículo destino.';
            }
          }
        }
        break;
    }
    return error;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    let newValue: any = value;

    if (type === 'number') {
      newValue = parseFloat(value);
    } else if (type === 'date') {
      newValue = new Date(value);
    } else if (name === 'fuelCardId') {
      newValue = parseInt(value);
      const card = fuelCards.find(fc => fc.id === newValue);
      setSelectedFuelCard(card || null);
      // Reset destination vehicles if card changes or operation type changes
      setDestinationVehicles([{ id: 1, vehicleId: null, litros: 0 }]); // Changed to 0
    } else if (name === 'tipoOperacion') {
      // Reset destination vehicles if operation type changes
      setDestinationVehicles([{ id: 1, vehicleId: null, litros: 0 }]); // Changed to 0
    }

    setFormData(prev => ({ ...prev, [name]: newValue }));
    setErrors(prev => ({ ...prev, [name]: validateField(name, newValue) }));
  };

  const handleDestinationVehicleChange = (index: number, field: 'vehicleId' | 'litros', value: any) => {
    const updatedVehicles = [...destinationVehicles];
    if (field === 'vehicleId') {
      updatedVehicles[index].vehicleId = parseInt(value);
    } else {
      updatedVehicles[index].litros = parseFloat(value) || 0; // Changed from '' to 0
    }
    setDestinationVehicles(updatedVehicles);
    setErrors(prev => ({ ...prev, destinationVehicles: validateField('destinationVehicles', updatedVehicles) }));
  };

  const addDestinationVehicle = () => {
    setDestinationVehicles(prev => [...prev, { id: prev.length + 1, vehicleId: null, litros: 0 }]); // Changed from '' to 0
  };

  const removeDestinationVehicle = (id: number) => {
    setDestinationVehicles(prev => prev.filter(dv => dv.id !== id));
    setErrors(prev => ({ ...prev, destinationVehicles: validateField('destinationVehicles', destinationVehicles.filter(dv => dv.id !== id)) }));
  };

  const validateForm = () => {
    let newErrors: Record<string, string> = {};
    let isValid = true;

    const fieldsToValidate = ['tipoOperacion', 'fecha', 'valorOperacionDinero', 'fuelCardId'];
    if (formData.tipoOperacion === 'Consumo') {
      fieldsToValidate.push('destinationVehicles');
    }

    for (const fieldName of fieldsToValidate) {
      const value = (formData as any)[fieldName];
      const error = validateField(fieldName, value);
      if (error) {
        newErrors[fieldName] = error;
        isValid = false;
      }
    }

    // Specific validation for destinationVehicles if it's a consumption operation
    if (formData.tipoOperacion === 'Consumo') {
      const destVehiclesError = validateField('destinationVehicles', destinationVehicles);
      if (destVehiclesError) {
        newErrors.destinationVehicles = destVehiclesError;
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
      const url = initialData ? `/api/fuel-operations/${initialData.id}` : '/api/fuel-operations';

      const payload: any = {
        ...formData,
        fecha: formData.fecha?.toISOString(),
      };

      if (formData.tipoOperacion === 'Consumo') {
        payload.fuelDistributions = destinationVehicles.map(dv => ({
          vehicleId: dv.vehicleId,
          liters: dv.litros,
        }));
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al guardar la operación de combustible.');
      }

      setFormStatus({ type: 'success', message: `Operación de combustible ${initialData ? 'actualizada' : 'creada'} exitosamente.` });
      if (onSuccess) onSuccess();
      router.push('/fleet/fuel-operations');
    } catch (err: any) {
      setFormStatus({ type: 'error', message: err.message || 'Ocurrió un error inesperado.' });
    } finally {
      setLoading(false);
    }
  };

  if (loading && fuelCards.length === 0 && vehicles.length === 0 && !initialData) return <p>Cargando formulario...</p>;

  const isConsumption = formData.tipoOperacion === 'Consumo';
  const isReservorioCard = selectedFuelCard?.esReservorio;

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
              label="Tarjeta de Combustible"
              items={fuelCards.map(card => ({ value: card.id.toString(), label: card.numeroDeTarjeta }))}
              value={formData.fuelCardId?.toString() || ''}
              placeholder="Selecciona una tarjeta"
              onChange={handleChange}
              name="fuelCardId"
            />
            {errors.fuelCardId && <p className="text-red-500 text-sm mt-1">{errors.fuelCardId}</p>}
          </div>
          <div>
            <Select
              label="Tipo de Operación"
              items={[
                { value: 'Carga', label: 'Carga' },
                { value: 'Consumo', label: 'Consumo' },
              ]}
              value={formData.tipoOperacion || ''}
              placeholder="Selecciona el tipo de operación"
              onChange={handleChange}
              name="tipoOperacion"
            />
            {errors.tipoOperacion && <p className="text-red-500 text-sm mt-1">{errors.tipoOperacion}</p>}
          </div>
          <div>
            <InputGroup
              label="Fecha"
              name="fecha"
              type="datetime-local"
              placeholder="Selecciona la fecha y hora"
              value={formData.fecha ? dayjs(formData.fecha).format('YYYY-MM-DDTHH:mm') : ''}
              handleChange={handleChange}
            />
            {errors.fecha && <p className="text-red-500 text-sm mt-1">{errors.fecha}</p>}
          </div>
          <div>
            <InputGroup
              label="Saldo Inicio"
              name="saldoInicio"
              type="number"
              placeholder="Saldo inicial"
              value={formData.saldoInicio?.toFixed(2) || '0.00'}
              handleChange={() => {}} // Disabled, so no change handler
              disabled={true}
            />
          </div>
          <div>
            <InputGroup
              label="Valor de la Operación (Dinero)"
              name="valorOperacionDinero"
              type="number"
              placeholder="Introduce el valor en dinero"
              value={formData.valorOperacionDinero || ''}
              handleChange={handleChange}
            />
            {errors.valorOperacionDinero && <p className="text-red-500 text-sm mt-1">{errors.valorOperacionDinero}</p>}
          </div>
          <div>
            <InputGroup
              label="Valor de la Operación (Litros)"
              name="valorOperacionLitros"
              type="number"
              placeholder="Valor en litros"
              value={formData.valorOperacionLitros?.toFixed(2) || '0.00'}
              handleChange={() => {}} // Disabled
              disabled={true}
            />
          </div>
          <div>
            <InputGroup
              label="Saldo Final"
              name="saldoFinal"
              type="number"
              placeholder="Saldo final"
              value={formData.saldoFinal?.toFixed(2) || '0.00'}
              handleChange={() => {}} // Disabled
              disabled={true}
            />
          </div>
          <div>
            <InputGroup
              label="Saldo Final (Litros)"
              name="saldoFinalLitros"
              type="number"
              placeholder="Saldo final en litros"
              value={formData.saldoFinalLitros?.toFixed(2) || '0.00'}
              handleChange={() => {}} // Disabled
              disabled={true}
            />
          </div>

          {isConsumption && (
            <div className="md:col-span-2">
              <label className="mb-3 block text-body-sm font-medium text-dark dark:text-white">
                Vehículos Destino
              </label>
              {destinationVehicles.map((dv, index) => (
                <div key={dv.id} className="flex items-center gap-4 mb-4">
                  <div className="flex-1">
                    <Select
                      label={`Vehículo ${index + 1}`}
                      items={vehicles.map(v => ({ value: v.id.toString(), label: v.matricula }))}
                      value={dv.vehicleId?.toString() || ''}
                      placeholder="Selecciona un vehículo"
                      onChange={(e) => handleDestinationVehicleChange(index, 'vehicleId', e.target.value)}
                      name={`destinationVehicle-${index}-id`}
                    />
                  </div>
                  <div className="flex-1">
                    <InputGroup
                      label="Litros"
                      name={`destinationVehicle-${index}-litros`}
                      type="number"
                      placeholder="Cantidad de litros"
                      value={String(dv.litros)}
                      handleChange={(e) => handleDestinationVehicleChange(index, 'litros', e.target.value)}
                    />
                  </div>
                  {!isReservorioCard && destinationVehicles.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeDestinationVehicle(dv.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <TrashIcon />
                    </button>
                  )}
                </div>
              ))}
              {!isReservorioCard && (
                <button
                  type="button"
                  onClick={addDestinationVehicle}
                  className="inline-flex items-center justify-center rounded-md bg-blue-500 py-2 px-4 text-center font-medium text-white hover:bg-blue-600"
                >
                  <PlusIcon className="mr-2" /> Añadir Vehículo
                </button>
              )}
              {errors.destinationVehicles && <p className="text-red-500 text-sm mt-1">{errors.destinationVehicles}</p>}
            </div>
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
            {loading ? 'Guardando...' : (initialData ? 'Actualizar Operación' : 'Crear Operación')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FuelOperationForm;
