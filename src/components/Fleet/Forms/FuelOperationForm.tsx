'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  FuelOperation,
  FuelCard,
  Vehicle,
  Reservorio,
  FuelOperationForm2,
  TipoCombustible,
} from '@/types/fleet';

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
interface DestinationReservorio {
  id: number; // Unique ID for React list rendering
  reservorio_id: string | null;
  litros: number;
}

const FuelOperationForm = ({
  initialData,
  onSuccess,
  onCancel,
}: FuelOperationFormProps) => {
  const router = useRouter();
  const [formData, setFormData] = useState<Partial<FuelOperationForm2>>(() => {
    // Nuevo: Estado para alternar entre tarjeta y reservorio
    return {
      tipoOperacion: undefined,
      fecha: new Date(),
      valorOperacionDinero: 0,
      fuelCardId: undefined,
      saldoInicio: 0,
      valorOperacionLitros: 0,
      saldoFinal: 0,
      saldoFinalLitros: 0,
      descripcion: '',
      ubicacion_cupet: '',
      operationReservorio: [],
      tipoCombustible_id: null,
      tipoCombustible: null,
      fuelDistributions: [],
      reservorioId: '',
      fuelCard: undefined,
    };
  });

  const [esReservorio, setEsReservorio] = useState(false);
  const [reservorios, setReservorios] = useState<Reservorio[]>([]);
  const [vehiculeError, setVehiculeError] = useState(false);
  const [reservorioError, setReservorioError] = useState(false);
  // Cargar reservorios si esReservorio está activo
  useEffect(() => {
    if (esReservorio) {
      (async () => {
        try {
          const res = await fetch('/api/reservorio');
          const data = await res.json();
          setReservorios(data.data || []);
        } catch (err) {
          setFormStatus({
            type: 'error',
            message: 'Error al cargar reservorios.',
          });
        }
      })();
    }
  }, [esReservorio]);

  const [destinationVehicles, setDestinationVehicles] = useState<
    DestinationVehicle[]
  >(() => {
    if (
      initialData &&
      initialData.tipoOperacion === 'Consumo' &&
      initialData.fuelDistributions &&
      initialData.fuelDistributions.length > 0
    ) {
      return initialData.fuelDistributions.map((dist, index) => ({
        id: index + 1,
        vehicleId: dist.vehicleId,
        litros: dist.liters,
      }));
    }
    return [];
  });
  const [reservorioDestination, setReservorioDestination] = useState<
    DestinationReservorio[]
  >(() => {
    if (
      initialData &&
      initialData.tipoOperacion === 'Consumo' &&
      initialData.operationReservorio &&
      initialData.operationReservorio.length > 0
    ) {
      return initialData.operationReservorio.map((dist, index) => ({
        id: index + 1,
        reservorio_id: dist.reservorio_id,
        litros: dist.reservorio.capacidad_actual,
      }));
    }
    return [];
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [fuelTypes, setFuelTypes] = useState<TipoCombustible[]>([]);
  const [formStatus, setFormStatus] = useState<{
    type: 'success' | 'error' | '';
    message: string;
  }>({ type: '', message: '' });
  const [fuelCards, setFuelCards] = useState<FuelCard[]>([]);

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFuelCard, setSelectedFuelCard] = useState<FuelCard | null>(
    null
  );
  const [lastOperationBalance, setLastOperationBalance] = useState<number>(0);

  const fetchDependencies = useCallback(async () => {
    setLoading(true);
    try {
      const [fuelCardsRes, vehiclesRes] = await Promise.all([
        fetch('/api/fuel-cards'),
        fetch('/api/vehicles'),
      ]);
      const fuelTypesRes = await fetch('/api/dieselType');
      if (!esReservorio) {
        const reservorios = await fetch('/api/reservorio');
        const reservoriosData = await reservorios.json();
        setReservorios(reservoriosData.data || []);
      }

      const fuelCardsData = await fuelCardsRes.json();
      const vehiclesData = await vehiclesRes.json();
      const fuelTypesData = await fuelTypesRes.json();

      setFuelCards(fuelCardsData.data || []);
      setVehicles(vehiclesData.data || []);
      setFuelTypes(fuelTypesData.data || []);

      if (initialData?.fuelCardId) {
        const card = fuelCardsData.data.find(
          (fc: FuelCard) => fc.id === initialData.fuelCardId
        );
        setSelectedFuelCard(card || null);
      }

      setLoading(false);
    } catch (err) {
      console.error('Error fetching form dependencies:', err);
      setFormStatus({
        type: 'error',
        message: 'Error al cargar datos necesarios para el formulario.',
      });
      setLoading(false);
    }
  }, [initialData]);

  useEffect(() => {
    fetchDependencies();
  }, [fetchDependencies]);

  useEffect(() => {
    const calculateDerivedFields = async () => {
      // Si es operación con reservorio
      if (esReservorio && formData.reservorioId) {
        // Buscar el reservorio seleccionado
        const reservorio = reservorios.find(
          (r) => r.id === formData.reservorioId
        );
        if (!reservorio) return;
        // SaldoInicio = CapacidadActual del reservorio
        const saldoInicio = reservorio.capacidad_actual || 0;
        let saldoFinal = saldoInicio;
        const valorOperacionLitros = formData.valorOperacionDinero || 0;
        if (formData.tipoOperacion === 'Consumo') {
          saldoFinal = saldoInicio - valorOperacionLitros;
        } else if (formData.tipoOperacion === 'Carga') {
          saldoFinal = saldoInicio + valorOperacionLitros;
        }
        setFormData((prev) => ({
          ...prev,
          saldoInicio,
          saldoFinal,
          valorOperacionLitros,
          saldoFinalLitros: saldoFinal, // Para reservorio, saldo en litros
        }));
      }
      // Si es operación con tarjeta
      else if (!esReservorio && formData.fuelCardId && formData.fuelCard) {
        // Fetch last operation balance
        let valorOperacionLitros = 0;
        if (formData.tipoOperacion === 'Carga') {
          valorOperacionLitros = 0; // No mostrar ni calcular
        } else if (formData.tipoOperacion === 'Consumo') {
          // Debe seleccionar tipo de combustible
          const saldo = formData.fuelCard.saldo || 1;
          valorOperacionLitros = formData.valorOperacionDinero
            ? formData.valorOperacionDinero / saldo
            : 0;
        }

        let calculatedSaldoFinal = 0;
        if (formData.tipoOperacion === 'Carga') {
          calculatedSaldoFinal =
            (formData.saldoInicio || 0) + (formData.valorOperacionDinero || 0);
        } else if (formData.tipoOperacion === 'Consumo') {
          calculatedSaldoFinal =
            (formData.saldoInicio || 0) - (formData.valorOperacionDinero || 0);
        }

        const calculatedSaldoFinalLitros =
          formData.tipoOperacion === 'Consumo'
            ? calculatedSaldoFinal / (formData.fuelCard.saldo || 1)
            : 0;
        console.log(calculatedSaldoFinal);
        setFormData((prev) => ({
          ...prev,
          valorOperacionLitros: valorOperacionLitros,
          saldoFinal: calculatedSaldoFinal,
          saldoFinalLitros: calculatedSaldoFinalLitros,
        }));
      } else {
        setFormData((prev) => ({
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
  }, [
    esReservorio,
    formData.reservorioId,
    reservorios,
    formData.fuelCardId,
    formData.valorOperacionDinero,
    formData.tipoOperacion,
    selectedFuelCard,
  ]);

  const validateField = useCallback(
    (name: string, value: any): string => {
      let error = '';
      switch (name) {
        case 'tipoOperacion':
        case 'fecha':
        case 'fuelCardId':
          if (!value) error = 'Este campo es requerido.';
          break;
        case 'valorOperacionDinero':
          if (!value) {
            error = 'Este campo es requerido.';
          } else if (value <= 0) {
            error = 'El valor debe ser mayor que cero.';
          }
          break;
        case 'reservorioDestination':
          if (formData.tipoOperacion === 'Consumo') {
            if (
              reservorioDestination.length === 0 &&
              destinationVehicles.length === 0
            ) {
              error = 'Debe seleccionar al menos un reservorio destino.';
            }
          }
        case 'tipoCombustible_id':
          if (!value) error = 'Este campo es requerido.';
          break;
        case 'destinationVehicles':
          if (formData.tipoOperacion === 'Consumo') {
            if (
              destinationVehicles.length === 0 &&
              reservorioDestination.length === 0
            ) {
              error = 'Debe seleccionar al menos un vehículo destino.';
            } else {
              const totalLitros = destinationVehicles.reduce(
                (sum, dv) => sum + dv.litros,
                0
              );
              if (
                Math.abs(totalLitros - (formData.valorOperacionLitros || 0)) >
                0.01
              ) {
                // Allow for floating point inaccuracies
                error = `La suma de litros (${totalLitros.toFixed(2)}) debe ser igual al valor de la operación en litros (${(formData.valorOperacionLitros || 0).toFixed(2)}).`;
              }
              if (destinationVehicles.some((dv) => !dv.vehicleId)) {
                error = 'Todos los vehículos destino deben ser seleccionados.';
              }
            }
            break;
          }
      }
      return error;
    },
    [destinationVehicles, formData]
  );

  // (Removed stray block that referenced undefined variable 'e')

  const handleDestinationVehicleChange = (
    index: number,
    field: 'vehicleId' | 'litros',
    value: any
  ) => {
    const updatedVehicles = [...destinationVehicles];
    if (field === 'vehicleId') {
      updatedVehicles[index].vehicleId = parseInt(value);
    } else {
      updatedVehicles[index].litros = parseFloat(value) || 0; // Changed from '' to 0
    }
    setDestinationVehicles(updatedVehicles);
    setErrors((prev) => ({
      ...prev,
      destinationVehicles: validateField(
        'destinationVehicles',
        updatedVehicles
      ),
    }));
  };

  const handleDestinationReservorioChange = (
    index: number,
    field: 'reservorio_id' | 'litros',
    value: any
  ) => {
    const updatedReservorios = [...reservorioDestination];
    if (field === 'reservorio_id') {
      updatedReservorios[index].reservorio_id = value;
    } else {
      updatedReservorios[index].litros = parseFloat(value) || 0; // Changed from '' to 0
    }
    setReservorioDestination(updatedReservorios);
    setErrors((prev) => ({
      ...prev,
      reservorioDestination: validateField(
        'reservorioDestination',
        updatedReservorios
      ),
    }));
  };

  const addDestinationVehicle = () => {
    if (destinationVehicles && destinationVehicles.length < 0) {
      setVehiculeError(true);
      return;
    }
    setDestinationVehicles((prev) => [
      ...prev,
      { id: prev.length + 1, vehicleId: null, litros: 0 },
    ]); // Changed from '' to 0
  };

  const removeDestinationVehicle = (id: number) => {
    setDestinationVehicles((prev) => prev.filter((dv) => dv.id !== id));
    setErrors((prev) => ({
      ...prev,
      destinationVehicles: validateField(
        'destinationVehicles',
        destinationVehicles.filter((dv) => dv.id !== id)
      ),
    }));
  };
  const addDestinationReservorio = () => {
    if (reservorioDestination && reservorioDestination.length < 0) {
      setReservorioError(true);
      return;
    }
    setReservorioDestination((prev) => [
      ...prev,
      { id: prev.length + 1, reservorio_id: null, litros: 0 },
    ]); // Changed from '' to 0
  };

  const removeDestinationReservorio = (id: number) => {
    setReservorioDestination((prev) => prev.filter((dv) => dv.id !== id));
    setErrors((prev) => ({
      ...prev,
      reservorioDestination: validateField(
        'reservorioDestination',
        reservorioDestination.filter((dv) => dv.id !== id)
      ),
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    const fieldsToValidate = [
      'tipoOperacion',
      'fecha',
      'valorOperacionDinero',
      'fuelCardId',
    ];
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
      const destVehiclesError = validateField(
        'destinationVehicles',
        destinationVehicles
      );
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
        ? `/api/fuel-operations/${initialData.id}`
        : '/api/fuel-operations';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(''),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || 'Error al guardar la operación de combustible.'
        );
      }

      setFormStatus({
        type: 'success',
        message: `Operación de combustible ${initialData ? 'actualizada' : 'creada'} exitosamente.`,
      });
      if (onSuccess) onSuccess();
      router.push('/fleet/fuel-operations');
    } catch (err: any) {
      setFormStatus({
        type: 'error',
        message: err.message || 'Ocurrió un error inesperado.',
      });
    } finally {
      setLoading(false);
    }
  };

  if (
    loading &&
    fuelCards.length === 0 &&
    vehicles.length === 0 &&
    !initialData
  )
    return <p>Cargando formulario...</p>;

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    let newValue: any = value;
    if (name === 'fuelCardId') {
      const selectedFuelCard = fuelCards.find((v) => v.id === Number(value));
      if (selectedFuelCard) {
        setFormData((prev) => ({
          ...prev,
          fuelCardId: Number(value),
          fuelCard: selectedFuelCard,
          saldoInicio: selectedFuelCard.saldo || 1, // Actualiza odómetro automáticamente
        }));
      }
      return;
    }
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
  const handleOperationsTipoChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const selectedId = parseInt(e.target.value);

    // Si viene "", lo interpretamos como "sin selección"
    const isSelected = !isNaN(selectedId);
    setFormData((prev) => ({
      ...prev,
      tipoCombustible_id: isSelected ? selectedId : null,
    }));
    const fieldError = validateField(
      'tipoCombustible_id',
      isSelected ? selectedId : null
    );
    setErrors((prev) => ({ ...prev, tipoCombustible_id: fieldError }));
  };
  return (
    <div className="rounded-[10px] border border-stroke bg-white p-4 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card sm:p-7.5">
      {vehiculeError && (
        <>
          <Alert
            title="Error"
            description="Si solo tiene un vehículo no puede realizar esta acción."
            variant="error"
          />
        </>
      )}
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
            {!esReservorio ? (
              <Select
                label="Tarjeta de Combustible"
                items={fuelCards.map((card) => ({
                  value: card.id.toString(),
                  label: card.numeroDeTarjeta,
                }))}
                value={formData.fuelCardId?.toString() || ''}
                placeholder="Selecciona una tarjeta"
                onChange={handleChange}
                name="fuelCardId"
              />
            ) : (
              <Select
                label="Reservorio"
                items={reservorios.map((res) => ({
                  value: res.id.toString(),
                  label: res.nombre || `Reservorio #${res.id}`,
                }))}
                value={formData.reservorioId?.toString() || ''}
                placeholder="Selecciona un reservorio"
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    reservorioId: e.target.value,
                  }))
                }
                name="reservorioId"
              />
            )}
            {!esReservorio && errors.fuelCardId && (
              <p className="mt-1 text-sm text-red-500">{errors.fuelCardId}</p>
            )}
            {esReservorio && errors.reservorioId && (
              <p className="mt-1 text-sm text-red-500">{errors.reservorioId}</p>
            )}
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
            {errors.tipoOperacion && (
              <p className="mt-1 text-sm text-red-500">
                {errors.tipoOperacion}
              </p>
            )}
          </div>
          <div>
            <InputGroup
              label="Fecha"
              name="fecha"
              type="datetime-local"
              placeholder="Selecciona la fecha y hora"
              value={
                formData.fecha
                  ? dayjs(formData.fecha).format('YYYY-MM-DDTHH:mm')
                  : ''
              }
              handleChange={handleChange}
            />
            {errors.fecha && (
              <p className="mt-1 text-sm text-red-500">{errors.fecha}</p>
            )}
          </div>
          {formData.tipoOperacion === 'Carga' && (
            <>
              <div>
                <InputGroup
                  label="Saldo Inicio"
                  name="saldoInicio"
                  type="number"
                  placeholder="Saldo inicial"
                  value={formData.fuelCard?.saldo.toFixed(2) || '0.00'}
                  handleChange={handleChange} // Disabled, so no change handler
                  disabled={true}
                />
              </div>
              <div>
                <InputGroup
                  label="Valor de la Operación (Dinero)"
                  name="valorOperacionDinero"
                  type="number"
                  placeholder="Introduce el valor en dinero"
                  value={formData.valorOperacionDinero?.toString() || ''}
                  handleChange={handleChange}
                />
                {errors.valorOperacionDinero && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.valorOperacionDinero}
                  </p>
                )}
              </div>

              <div>
                <InputGroup
                  label="Saldo Final"
                  name="saldoFinal"
                  type="number"
                  placeholder="Saldo final"
                  value={formData.saldoFinal?.toFixed(2) || '0.00'}
                  handleChange={handleChange} // Disabled
                  disabled={true}
                />
              </div>
            </>
          )}

          {/* Destino: Si es consumo y reservorio, solo vehículos. Si es consumo y tarjeta, vehículos o reservorios */}
          {!esReservorio && formData.tipoOperacion === 'Consumo' && (
            <>
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
                  label="Saldo Final (Litros)"
                  name="saldoFinalLitros"
                  type="number"
                  placeholder="Saldo final en litros"
                  value={formData.saldoFinalLitros?.toFixed(2) || '0.00'}
                  handleChange={() => {}} // Disabled
                  disabled={true}
                />
              </div>
              <div>
                <Select
                  label="Tipo de Combustible"
                  items={fuelTypes.map((fuelType) => ({
                    value: fuelType.id.toString(),
                    label: fuelType.nombre,
                  }))}
                  value={formData.tipoCombustible_id?.toString() || ''}
                  placeholder="Selecciona un tipo de combustible"
                  onChange={handleOperationsTipoChange}
                  name="tipoCombustible_id"
                />
              </div>

              <div>
                <InputGroup
                  label="Ubicación Cupet"
                  name={'ubicacion_cupet'}
                  type="text"
                  placeholder="Ubicación del Cupet"
                  value={formData.ubicacion_cupet}
                  handleChange={handleChange}
                />
              </div>
              <div className="md:col-span-2"></div>

              <div className="md:col-span-2">
                <label className="mb-3 block text-body-sm font-medium text-dark dark:text-white">
                  Destinos
                </label>

                <div className="space-y-4">
                  {reservorioDestination.map((dv, index) => (
                    <div key={dv.id} className="flex w-full items-start gap-4">
                      <div className="flex-1">
                        <Select
                          label={`Reservorio ${index + 1}`}
                          items={reservorios.map((r) => ({
                            value: r.id.toString(),
                            label: r.nombre,
                          }))}
                          value={dv.reservorio_id?.toString() || ''}
                          placeholder="Selecciona un reservorio"
                          onChange={(e) =>
                            handleDestinationReservorioChange(
                              index,
                              'reservorio_id',
                              e.target.value
                            )
                          }
                          name={`destinationVehicle-${index}-id`}
                        />
                      </div>

                      <div className="flex-1">
                        <InputGroup
                          label="Litros"
                          name={`destinationVehicle-${index}-litros`}
                          type="number"
                          placeholder="Cantidad de litros"
                          value={dv.litros.toString()}
                          handleChange={(e) =>
                            handleDestinationReservorioChange(
                              index,
                              'litros',
                              e.target.value
                            )
                          }
                        />
                      </div>

                      {reservorioDestination.length > 0 && (
                        <div className="flex items-end pb-1">
                          <button
                            type="button"
                            onClick={() => removeDestinationReservorio(dv.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <TrashIcon />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="space-y-4">
                  {destinationVehicles.map((dv, index) => (
                    <div key={dv.id} className="flex w-full items-start gap-4">
                      <div className="flex-1">
                        <Select
                          label={`Vehículo ${index + 1}`}
                          items={vehicles.map((v) => ({
                            value: v.id.toString(),
                            label: v.matricula,
                          }))}
                          value={dv.vehicleId?.toString() || ''}
                          placeholder="Selecciona un vehículo"
                          onChange={(e) =>
                            handleDestinationVehicleChange(
                              index,
                              'vehicleId',
                              e.target.value
                            )
                          }
                          name={`destinationVehicle-${index}-id`}
                        />
                      </div>

                      <div className="flex-1">
                        <InputGroup
                          label="Litros"
                          name={`destinationVehicle-${index}-litros`}
                          type="number"
                          placeholder="Cantidad de litros"
                          value={dv.litros.toString()}
                          handleChange={(e) =>
                            handleDestinationVehicleChange(
                              index,
                              'litros',
                              e.target.value
                            )
                          }
                        />
                      </div>

                      {destinationVehicles.length > 0 && (
                        <div className="flex items-end pb-1">
                          <button
                            type="button"
                            onClick={() => removeDestinationVehicle(dv.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <TrashIcon />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex flex-row">
                  <div className="mt-4 px-2">
                    <button
                      type="button"
                      onClick={addDestinationVehicle}
                      className="inline-flex items-center justify-center rounded-md bg-blue-500 px-4 py-2 text-center font-medium text-white hover:bg-blue-600"
                    >
                      <PlusIcon className="mr-2" /> Añadir Vehículo
                    </button>
                  </div>
                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={addDestinationReservorio}
                      className="inline-flex items-center justify-center rounded-md bg-blue-500 px-4 py-2 text-center font-medium text-white hover:bg-blue-600"
                    >
                      <PlusIcon className="mr-2" /> Añadir Reservorio
                    </button>
                  </div>
                </div>

                {errors.destinationVehicles && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.destinationVehicles}
                  </p>
                )}
              </div>
            </>
          )}

          <div className="flex flex-col">
            <InputGroup
              label="Descripción"
              name="descripcion"
              type="text"
              placeholder="Ingresa una descripción"
              value={formData.descripcion}
              handleChange={handleChange}
            />
            {errors.descripcion && (
              <p className="mt-1 text-sm text-red-500">{errors.descripcion}</p>
            )}
          </div>
        </div>
        <label className="mb-2 mt-4 block text-sm font-medium text-dark dark:text-white">
          <input
            type="checkbox"
            checked={esReservorio}
            onChange={(e) => setEsReservorio(e.target.checked)}
            className="mr-2"
          />
          ¿Operación con Reservorio?
        </label>

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
                ? 'Actualizar Operación'
                : 'Crear Operación'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FuelOperationForm;
