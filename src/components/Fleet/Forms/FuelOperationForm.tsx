'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  FuelOperation,
  FuelCard,
  Vehicle,
  Reservorio,
  FuelOperationForm2,
  TipoCombustible,
  FuelOperationType,
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
      valorOperacionDinero: undefined,
      fuelCardId: undefined,
      saldoInicio: undefined,
      valorOperacionLitros: undefined,
      saldoFinal: undefined,
      saldoFinalLitros: undefined,
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
  const [currentReservoirCapacity, setCurrentReservoirCapacity] = useState<
    number | undefined
  >(undefined);
  const [operationLiters, setOperationLiters] = useState<number | undefined>(
    undefined
  );
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

        const capacidadActual = reservorio.capacidad_actual || 0;
        setCurrentReservoirCapacity(capacidadActual);

        let calculatedSaldoFinalLitros = capacidadActual;
        const currentOperationLiters = operationLiters || 0;

        if (formData.tipoOperacion === 'Consumo') {
          calculatedSaldoFinalLitros = capacidadActual - currentOperationLiters;
        } else if (formData.tipoOperacion === 'Carga') {
          calculatedSaldoFinalLitros = capacidadActual + currentOperationLiters;
        }

        setFormData((prev) => ({
          ...prev,
          valorOperacionLitros: currentOperationLiters, // Actualizar formData con el valor editable
          saldoFinalLitros: calculatedSaldoFinalLitros,
        }));
      }
      // Si es operación con tarjeta
      else if (!esReservorio && formData.fuelCardId && formData.fuelCard) {
        const currentSaldoInicio = formData.fuelCard.saldo || 0; // Siempre tomar el saldo de la tarjeta como inicio

        let valorOperacionLitros = 0; // Inicializar a 0
        let calculatedSaldoFinal = 0; // Inicializar a 0
        let calculatedSaldoFinalLitros = 0; // Inicializar a 0

        if (formData.tipoOperacion === 'Consumo') {
          const selectedFuelType = fuelTypes.find(
            (ft) => ft.id === formData.tipoCombustible_id
          );
          const precioCombustible = selectedFuelType?.precio || 0; // Usar 0 si no hay precio para evitar divisiones por cero

          if (selectedFuelType && precioCombustible > 0) {
            // Solo calcular si hay tipo de combustible y precio válido
            valorOperacionLitros =
              formData.valorOperacionDinero && precioCombustible > 0
                ? formData.valorOperacionDinero / precioCombustible
                : 0; // Si no hay valor o precio, 0 litros

            calculatedSaldoFinal =
              (currentSaldoInicio || 0) - (formData.valorOperacionDinero || 0);
            calculatedSaldoFinalLitros =
              calculatedSaldoFinal && precioCombustible > 0
                ? calculatedSaldoFinal / precioCombustible
                : 0; // Si no hay saldo final o precio, 0 litros
          } else {
            // Si no hay tipo de combustible seleccionado o precio inválido, los litros son 0
            valorOperacionLitros = 0;
            calculatedSaldoFinalLitros = 0;
            calculatedSaldoFinal =
              (currentSaldoInicio || 0) - (formData.valorOperacionDinero || 0); // Saldo final en dinero sigue calculándose
          }
        } else if (formData.tipoOperacion === 'Carga') {
          calculatedSaldoFinal =
            (currentSaldoInicio || 0) + (formData.valorOperacionDinero || 0);
          valorOperacionLitros = 0; // Establecer a 0 para operaciones de carga con tarjeta
          calculatedSaldoFinalLitros = 0; // Establecer a 0 para operaciones de carga con tarjeta
        }

        setFormData((prev) => ({
          ...prev,
          saldoInicio: currentSaldoInicio,
          valorOperacionLitros: valorOperacionLitros,
          saldoFinal: calculatedSaldoFinal,
          saldoFinalLitros: calculatedSaldoFinalLitros,
        }));
      } else {
        // Resetear si no hay tarjeta o reservorio seleccionado
        setFormData((prev) => ({
          ...prev,
          saldoInicio: undefined,
          valorOperacionLitros: undefined,
          saldoFinal: undefined,
          saldoFinalLitros: undefined,
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
    formData.fuelCard,
    formData.tipoCombustible_id, // Añadir tipoCombustible_id a las dependencias
    fuelTypes, // Añadir fuelTypes a las dependencias
    operationLiters, // Añadir operationLiters a las dependencias
  ]);

  const validateField = useCallback(
    (name: string, value: any): string => {
      let error = '';
      switch (name) {
        case 'tipoOperacion':
        case 'fecha':
        case 'fuelCardId':
          if (!esReservorio && !value) error = 'Este campo es requerido.';
          break;
        case 'reservorioId':
          if (esReservorio && !value) error = 'Este campo es requerido.';
          break;
        case 'valorOperacionDinero':
          if (!esReservorio && !value) {
            error = 'Este campo es requerido.';
          } else if (!esReservorio && value <= 0) {
            error = 'El valor debe ser mayor que cero.';
          }
          break;
        case 'valorOperacionLitros':
          if (esReservorio && formData.tipoOperacion === 'Consumo' && !value) {
            error = 'Este campo es requerido.';
          } else if (
            esReservorio &&
            formData.tipoOperacion === 'Consumo' &&
            value <= 0
          ) {
            error = 'El valor debe ser mayor que cero.';
          } else if (
            esReservorio &&
            formData.tipoOperacion === 'Consumo' &&
            currentReservoirCapacity !== undefined &&
            value > currentReservoirCapacity
          ) {
            error =
              'El valor de la operación no puede ser mayor que la capacidad actual del reservorio.';
          }
          break;
        case 'tipoCombustible_id':
          if (!value) error = 'Este campo es requerido.';
          break;
        case 'destinationVehicles':
          if (destinationVehicles.some((dv) => !dv.vehicleId)) {
            error = 'Todos los vehículos destino deben ser seleccionados.';
          }
          break;
        case 'reservorioDestination':
          if (reservorioDestination.some((dr) => !dr.reservorio_id)) {
            error = 'Todos los reservorios destino deben ser seleccionados.';
          }
          break;
        case 'destinations':
          if (formData.tipoOperacion === 'Consumo') {
            if (
              destinationVehicles.length === 0 &&
              reservorioDestination.length === 0
            ) {
              error =
                'Debe seleccionar al menos un destino (vehículo o reservorio).';
            } else {
              const totalLitrosVehicles = destinationVehicles.reduce(
                (sum, dv) => sum + dv.litros,
                0
              );
              const totalLitrosReservorios = reservorioDestination.reduce(
                (sum, dr) => sum + dr.litros,
                0
              );
              const totalLitros = totalLitrosVehicles + totalLitrosReservorios;

              if (
                Math.abs(totalLitros - (formData.valorOperacionLitros || 0)) >
                0.01
              ) {
                error = `La suma de litros (${totalLitros.toFixed(2)}) debe ser igual al valor de la operación en litros (${(formData.valorOperacionLitros || 0).toFixed(2)}).`;
              }
            }
          }
          break;
      }
      return error;
    },
    [destinationVehicles, formData, esReservorio, currentReservoirCapacity]
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

    for (const fieldName of fieldsToValidate) {
      const value = (formData as any)[fieldName];
      const error = validateField(fieldName, value);
      if (error) {
        newErrors[fieldName] = error;
        isValid = false;
      }
    }

    // Specific validation for consumption operations
    if (formData.tipoOperacion === 'Consumo') {
      const destVehiclesError = validateField(
        'destinationVehicles',
        destinationVehicles
      );
      if (destVehiclesError) {
        newErrors.destinationVehicles = destVehiclesError;
        isValid = false;
      }

      const destReservoriosError = validateField(
        'reservorioDestination',
        reservorioDestination
      );
      if (destReservoriosError) {
        newErrors.reservorioDestination = destReservoriosError;
        isValid = false;
      }

      const destinationsCombinedError = validateField(
        'destinations',
        null // Value is not directly used for this validation
      );
      if (destinationsCombinedError) {
        newErrors.destinations = destinationsCombinedError;
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
      const errorMessages = Object.values(errors).filter(Boolean);
      const detailedMessage =
        errorMessages.length > 0
          ? `Por favor, corrige los siguientes campos: ${errorMessages.join(', ')}.`
          : 'Por favor, corrige los errores del formulario.';

      setFormStatus({
        type: 'error',
        message: detailedMessage,
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
        body: JSON.stringify({
          ...formData,
          fuelDistributions: destinationVehicles.map((dv) => ({
            vehicleId: dv.vehicleId,
            liters: dv.litros,
          })),
          operationReservorio: reservorioDestination.map((dr) => ({
            reservorio_id: dr.reservorio_id,
            litros: dr.litros,
          })),
          // Incluir saldoFinalLitros y reservorioId si es una operación con reservorio
          ...(esReservorio && {
            saldoFinalLitros: formData.saldoFinalLitros,
            reservorioId: formData.reservorioId,
          }),
        }),
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

    // Si el tipo de operación es 'Carga' y no es un reservorio, establecer litros a 0
    if (name === 'tipoOperacion' && newValue === 'Carga' && !esReservorio) {
      setFormData((prev) => ({
        ...prev,
        [name]: newValue,
        valorOperacionLitros: 0,
        saldoFinalLitros: 0,
      }));
    } else if (name === 'valorOperacionLitros' && esReservorio) {
      setOperationLiters(newValue);
      setFormData((prev) => ({ ...prev, [name]: newValue })); // También actualizar formData para el envío
    } else {
      setFormData((prev) => ({ ...prev, [name]: newValue }));
    }
    setErrors((prev) => ({ ...prev, [name]: validateField(name, newValue) }));
  };
  const handleOperationsTipoChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const selectedId = parseInt(e.target.value);

    // Si viene "", lo interpretamos como "sin selección"
    const isSelected = !isNaN(selectedId);
    const selectedFuelType = isSelected
      ? fuelTypes.find((ft) => ft.id === selectedId)
      : null;

    setFormData((prev) => ({
      ...prev,
      tipoCombustible_id: isSelected ? selectedId : null,
      tipoCombustible: selectedFuelType, // Actualizar el objeto completo
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
              items={
                esReservorio
                  ? [{ value: 'Consumo', label: 'Consumo' }]
                  : [
                      { value: 'Carga', label: 'Carga' },
                      { value: 'Consumo', label: 'Consumo' },
                    ]
              }
              value={formData.tipoOperacion || ''}
              placeholder="Selecciona el tipo de operación"
              onChange={handleChange}
              name="tipoOperacion"
              disabled={esReservorio} // Deshabilitar si es reservorio para evitar cambios manuales
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
          {esReservorio && formData.reservorioId && (
            <>
              <div>
                <InputGroup
                  label="Capacidad Actual del Reservorio (Litros)"
                  name="capacidadActualReservorio"
                  type="number"
                  placeholder="Capacidad actual"
                  value={currentReservoirCapacity?.toFixed(2) || ''}
                  handleChange={() => {}}
                  disabled={true}
                />
              </div>
              <div>
                <InputGroup
                  label="Valor de la Operación (Litros)"
                  name="valorOperacionLitros"
                  type="number"
                  placeholder="Introduce el valor en litros"
                  value={operationLiters?.toString() || ''}
                  handleChange={handleChange}
                  disabled={formData.tipoOperacion === 'Carga'} // Deshabilitar si es carga
                />
                {errors.valorOperacionLitros && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.valorOperacionLitros}
                  </p>
                )}
              </div>
              <div>
                <InputGroup
                  label="Saldo Final del Reservorio (Litros)"
                  name="saldoFinalLitros"
                  type="number"
                  placeholder="Saldo final en litros"
                  value={formData.saldoFinalLitros?.toFixed(2) || ''}
                  handleChange={() => {}}
                  disabled={true}
                />
              </div>
            </>
          )}

          {formData.tipoOperacion === 'Carga' && !esReservorio && (
            <>
              <div>
                <InputGroup
                  label="Saldo Inicio"
                  name="saldoInicio"
                  type="number"
                  placeholder="Saldo inicial"
                  value={formData.saldoInicio?.toFixed(2) || ''}
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
                  value={formData.saldoFinal?.toFixed(2) || ''}
                  handleChange={() => {}} // Disabled
                  disabled={true}
                />
              </div>
            </>
          )}

          {formData.tipoOperacion === 'Consumo' && (
            <>
              {!esReservorio && (
                <>
                  <div>
                    <InputGroup
                      label="Saldo Inicio"
                      name="saldoInicio"
                      type="number"
                      placeholder="Saldo inicial"
                      value={formData.saldoInicio?.toFixed(2) || ''}
                      handleChange={() => {}} // No editable
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
                      value={formData.saldoFinal?.toFixed(2) || ''}
                      handleChange={() => {}} // No editable
                      disabled={true}
                    />
                  </div>

                  <div>
                    <InputGroup
                      label="Valor de la Operación (Litros)"
                      name="valorOperacionLitros"
                      type="number"
                      placeholder="Valor en litros"
                      value={formData.valorOperacionLitros?.toFixed(2) || ''}
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
                      value={formData.saldoFinalLitros?.toFixed(2) || ''}
                      handleChange={() => {}} // Disabled
                      disabled={true}
                    />
                  </div>
                  <div>
                    <Select
                      label="Tipo de Combustible"
                      items={fuelTypes
                        .filter(
                          (fuelType) =>
                            !formData.fuelCardId ||
                            !formData.fuelCard ||
                            fuelType.moneda === formData.fuelCard.moneda
                        )
                        .map((fuelType) => ({
                          value: fuelType.id.toString(),
                          label: fuelType.nombre,
                        }))}
                      value={formData.tipoCombustible_id?.toString() || ''}
                      placeholder="Selecciona un tipo de combustible"
                      onChange={handleOperationsTipoChange}
                      name="tipoCombustible_id"
                    />
                    {errors.tipoCombustible_id && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.tipoCombustible_id}
                      </p>
                    )}
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
                </>
              )}
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
                          items={reservorios
                            .filter(
                              (r) =>
                                !formData.tipoCombustible_id ||
                                r.tipoCombustibleId ===
                                  formData.tipoCombustible_id
                            )
                            .map((r) => ({
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
                          name={`destinationReservorio-${index}-id`}
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
            onChange={(e) => {
              setEsReservorio(e.target.checked);
              if (e.target.checked) {
                // Si se marca "Operación con Reservorio", forzar "Consumo"
                setFormData((prev) => ({
                  ...prev,
                  tipoOperacion: FuelOperationType.Consumo,
                }));
              } else {
                // Si se desmarca, limpiar el tipo de operación o establecer un valor por defecto si es necesario
                setFormData((prev) => ({ ...prev, tipoOperacion: undefined }));
              }
            }}
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
