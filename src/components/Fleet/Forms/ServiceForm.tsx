'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Servicio,
  ServicioTipo,
  ServicioEstado,
  Vehicle,
  Driver,
} from '@/types/fleet';
import InputGroup from '@/components/FormElements/InputGroup';
import { Select } from '@/components/FormElements/select';
import { Alert } from '@/components/ui-elements/alert';
import { useRouter } from 'next/navigation';

interface ServiceFormProps {
  initialData?: Partial<Servicio>;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const ServiceForm = ({
  initialData,
  onSuccess,
  onCancel,
}: ServiceFormProps) => {
  const router = useRouter();
  const [formData, setFormData] = useState<Partial<Servicio>>(() => {
    if (initialData) {
      return {
        ...initialData,
        fecha: initialData.fecha ? new Date(initialData.fecha) : null,
        vehicle: initialData.vehicle || undefined, // Asegúrate de incluir esto
        driver: initialData.driver || undefined,
        driverId: initialData.driver_id || undefined, // Asegúrate de incluir esto
      };
    }
    return {
      tipoServicio: Object.keys(ServicioTipo)[0] as ServicioTipo,
      fecha: new Date(),
      odometroInicial: 0,
      odometroFinal: 0,
      cantidadPedidos: 0,
      origen: '',
      destino: '',
      descripcion: '',
      kilometrosRecorridos: 0,
      estado: ServicioEstado.Pendiente,
      vehicleId: undefined,
      vehicle: undefined,
      driver: undefined,
      driver_id: undefined,
    };
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formStatus, setFormStatus] = useState<{
    type: 'success' | 'error' | '';
    message: string;
  }>({ type: '', message: '' });
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [vehiclesRes, driversRes] = await Promise.all([
          fetch('/api/vehicles'),
          fetch('/api/drivers'),
        ]);

        const vehiclesData = (await vehiclesRes.json()) as { data: Vehicle[] };
        const driversData = (await driversRes.json()) as { data: Driver[] };

        const activeVehicles =
          vehiclesData.data.filter((car) => car.estado === 'Activo') || [];
        setVehicles(activeVehicles);
        setDrivers(driversData.data || []);

        // Si hay datos iniciales, carga el vehículo correspondiente
        if (initialData?.vehicleId) {
          const initialVehicle = activeVehicles.find(
            (v) => v.id === initialData.vehicleId
          );
          if (initialVehicle) {
            setFormData((prev) => ({
              ...prev,
              vehicle: initialVehicle,
              odometroInicial: initialVehicle.odometro || 0,
              driver_id: initialData.driver_id || undefined,
              driver: initialData.driver || undefined,
            }));
          }
        }

        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setFormStatus({
          type: 'error',
          message: 'Error al cargar vehículos o conductores.',
        });
        setLoading(false);
      }
    };
    fetchInitialData();
  }, [initialData?.vehicleId]); // Agrega dependencia

  useEffect(() => {
    if (initialData) {
      setFormData((prev) => ({
        ...prev,
        ...initialData,
        fecha: initialData.fecha ? new Date(initialData.fecha) : null,
        driver_id: initialData.driver_id,
        vehicleId: initialData.vehicleId,
        driver: initialData.driver,
      }));
    }
  }, [initialData]);
  // Calculate kilometrosRecorridos whenever odometroInicial or odometroFinal changes
  useEffect(() => {
    const initial = formData.odometroInicial || 0;
    const final = formData.odometroFinal || 0;
    if (final >= initial) {
      setFormData((prev) => ({
        ...prev,
        kilometrosRecorridos: final - initial,
      }));
    } else if (final !== 0) {
      // Only set to 0 if final is less than initial and not 0
      setFormData((prev) => ({ ...prev, kilometrosRecorridos: 0 }));
    }
  }, [formData.odometroInicial, formData.odometroFinal]);

  const validateField = useCallback(
    (name: string, value: any): string => {
      let error = '';
      switch (name) {
        case 'tipoServicio':
        case 'fecha':
        case 'odometroInicial':
          if (value === null || value === undefined)
            error = 'Este campo es requerido.';
          break;
        case 'estado':
        case 'vehicleId':
          if (!value) error = 'Este campo es requerido.';
          break;
        case 'odometroFinal':
          if (formData.estado === ServicioEstado.Completado) {
            if (!value || value <= 0) {
              error =
                'Odómetro final es requerido y debe ser mayor que cero cuando el estado es Terminado.';
            } else if (
              formData.odometroInicial &&
              value < formData.odometroInicial
            ) {
              error = 'Odómetro final no puede ser menor que el inicial.';
            }
          }
          break;
        case 'cantidadPedidos':
          if (
            formData.tipoServicio === ServicioTipo.EntregaDePedidos &&
            (!value || value <= 0)
          ) {
            error =
              'Cantidad de pedidos es requerida y debe ser mayor que cero para este tipo de servicio.';
          }
          break;
        case 'origen':
        case 'destino':
          if (formData.tipoServicio === ServicioTipo.Logistico && !value) {
            error = 'Este campo es requerido para servicios logísticos.';
          }
          break;
        case 'descripcion':
          if (formData.tipoServicio === ServicioTipo.Administrativo && !value) {
            error = 'Descripción es requerida para servicios administrativos.';
          }
          break;
        case 'driver_id':
          if (value === undefined || value === null) {
            error = 'Selecciona un conductor';
          }
          break;
      }
      return error;
    },
    [formData.estado, formData.odometroInicial, formData.tipoServicio]
  );

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;
    let newValue: any = value;

    if (name === 'vehicleId') {
      const selectedVehicle = vehicles.find((v) => v.id === Number(value));
      if (selectedVehicle) {
        setFormData((prev) => ({
          ...prev,
          vehicleId: Number(value),
          vehicle: selectedVehicle,
          odometroInicial: selectedVehicle.odometro || 0, // Actualiza odómetro automáticamente
        }));
      }
      return;
    }
    if (type === 'number') {
      newValue = value === '' ? null : parseFloat(value);
    } else if (type === 'date') {
      newValue = new Date(value);
    }

    setFormData((prev) => ({ ...prev, [name]: newValue }));
    setErrors((prev) => ({ ...prev, [name]: validateField(name, newValue) }));
  };

  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};
    let isValid = true;
    const fieldsToValidate: (keyof Servicio)[] = [
      'tipoServicio',
      'fecha',
      'odometroInicial',
      'estado',
      'vehicleId',
      'odometroFinal',
      'cantidadPedidos',
      'origen',
      'destino',
      'descripcion',
      'driver_id',
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

    setLoading(true);
    try {
      const method = initialData ? 'PUT' : 'POST';
      const url = initialData
        ? `/api/services/${initialData.id}`
        : '/api/services';
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tipoServicio: formData.tipoServicio,
          fecha: formData.fecha?.toISOString(),
          odometroInicial: Number(formData.odometroInicial),
          odometroFinal: formData.odometroFinal
            ? Number(formData.odometroFinal)
            : 0,
          cantidadPedidos: formData.cantidadPedidos
            ? Number(formData.cantidadPedidos)
            : 0,
          kilometrosRecorridos: Number(formData.kilometrosRecorridos),
          estado: formData.estado,
          vehicleId: Number(formData.vehicleId),
          driver_id: Number(formData.driver_id), // Asegura que sea número
          // Campos opcionales
          origen: formData.origen || undefined,
          destino: formData.destino || undefined,
          descripcion: formData.descripcion || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al guardar el servicio.');
      }

      setFormStatus({
        type: 'success',
        message: `Servicio ${initialData ? 'actualizado' : 'creado'} exitosamente.`,
      });
      if (onSuccess) onSuccess();
      router.push('/fleet/services');
    } catch (err: any) {
      setFormStatus({
        type: 'error',
        message: err.message || 'Ocurrió un error inesperado.',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading && vehicles.length === 0 && !initialData)
    return <p>Cargando formulario...</p>;
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
              label="Tipo de Servicio"
              items={Object.keys(ServicioTipo).map((type) => ({
                value: type,
                label: ServicioTipo[type as keyof typeof ServicioTipo],
              }))}
              value={formData.tipoServicio ? formData.tipoServicio : ''}
              placeholder="Selecciona un tipo de servicio"
              onChange={(e) =>
                handleChange(e as React.ChangeEvent<HTMLSelectElement>)
              }
              name="tipoServicio"
            />
            {errors.tipoServicio && (
              <p className="mt-1 text-sm text-red-500">{errors.tipoServicio}</p>
            )}
          </div>
          <div>
            <InputGroup
              label="Fecha"
              name="fecha"
              type="date"
              placeholder="Selecciona la fecha"
              value={
                formData.fecha ? formData.fecha.toISOString().split('T')[0] : ''
              }
              handleChange={handleChange}
            />
            {errors.fecha && (
              <p className="mt-1 text-sm text-red-500">{errors.fecha}</p>
            )}
          </div>
          <div>
            <InputGroup
              label="Odómetro Inicial"
              name="odometroInicial"
              type="number"
              placeholder="Introduce el odómetro inicial"
              value={formData.vehicle?.odometro?.toString() || '0'}
              handleChange={handleChange}
              disabled={true}
            />
            {errors.odometroInicial && (
              <p className="mt-1 text-sm text-red-500">
                {errors.odometroInicial}
              </p>
            )}
          </div>
          <div>
            <InputGroup
              label="Odómetro Final"
              name="odometroFinal"
              type="number"
              placeholder="Introduce el odómetro final"
              value={formData.odometroFinal?.toString() || ''}
              handleChange={handleChange}
              disabled={
                true ? formData.estado === ServicioEstado.Pendiente : false
              }
            />
            {errors.odometroFinal && (
              <p className="mt-1 text-sm text-red-500">
                {errors.odometroFinal}
              </p>
            )}
          </div>
          <div>
            <InputGroup
              label="Kilómetros Recorridos"
              name="kilometrosRecorridos"
              type="number"
              placeholder="Calculado automáticamente"
              value={formData.kilometrosRecorridos?.toString() || '0'}
              handleChange={() => {}} // Disabled, so no change handler
              disabled={true}
            />
          </div>
          <div>
            <Select
              label="Estado"
              items={Object.values(ServicioEstado).map((estado) => ({
                value: estado,
                label: estado,
              }))}
              value={formData.estado || ''}
              placeholder="Selecciona un estado"
              onChange={(e) =>
                handleChange(e as React.ChangeEvent<HTMLSelectElement>)
              }
              name="estado"
            />
            {errors.estado && (
              <p className="mt-1 text-sm text-red-500">{errors.estado}</p>
            )}
          </div>
          <div>
            <label
              htmlFor="vehicleId"
              className="mb-3 block text-body-sm font-medium text-dark dark:text-white"
            >
              Vehículo
            </label>
            <select
              id="vehicleId"
              name="vehicleId"
              value={formData.vehicleId || ''}
              onChange={handleChange}
              className="w-full rounded-lg border border-stroke bg-transparent px-5.5 py-3 outline-none transition focus:border-primary active:border-primary dark:border-dark-3 dark:bg-dark-2 dark:focus:border-primary [&>option]:text-dark-5 dark:[&>option]:text-dark-6"
            >
              <option value="" disabled>
                Selecciona un vehículo
              </option>
              {vehicles.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.marca} {vehicle.modelo} ({vehicle.matricula})
                </option>
              ))}
            </select>
            {errors.vehicleId && (
              <p className="mt-1 text-sm text-red-500">{errors.vehicleId}</p>
            )}
          </div>
          {formData.vehicleId && (
            <div>
              <Select
                label="Conductor"
                items={drivers.map((driver) => ({
                  value: driver.id.toString(),
                  label: driver.nombre,
                }))}
                value={formData.driver_id ? formData.driver_id.toString() : ''}
                placeholder="Selecciona un conductor"
                onChange={(e) =>
                  handleChange(e as React.ChangeEvent<HTMLSelectElement>)
                }
                name="driver_id"
              />
              {errors.driver_id && (
                <p className="mt-1 text-sm text-red-500">{errors.driver_id}</p>
              )}
            </div>
          )}

          {formData.tipoServicio === ServicioTipo.EntregaDePedidos && (
            <div>
              <InputGroup
                label="Cantidad de Pedidos"
                name="cantidadPedidos"
                type="number"
                placeholder="Introduce la cantidad de pedidos"
                value={formData.cantidadPedidos?.toString() || ''}
                handleChange={handleChange}
              />
              {errors.cantidadPedidos && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.cantidadPedidos}
                </p>
              )}
            </div>
          )}

          {formData.tipoServicio === ServicioTipo.Logistico && (
            <>
              <div>
                <InputGroup
                  label="Origen"
                  name="origen"
                  type="text"
                  placeholder="Introduce el origen"
                  value={formData.origen || ''}
                  handleChange={handleChange}
                />
                {errors.origen && (
                  <p className="mt-1 text-sm text-red-500">{errors.origen}</p>
                )}
              </div>
              <div>
                <InputGroup
                  label="Destino"
                  name="destino"
                  type="text"
                  placeholder="Introduce el destino"
                  value={formData.destino || ''}
                  handleChange={handleChange}
                />
                {errors.destino && (
                  <p className="mt-1 text-sm text-red-500">{errors.destino}</p>
                )}
              </div>
            </>
          )}

          {formData.tipoServicio === ServicioTipo.Administrativo && (
            <div>
              <InputGroup
                label="Descripción"
                name="descripcion"
                type="textarea"
                placeholder="Introduce la descripción"
                value={formData.descripcion || ''}
                handleChange={handleChange}
              />
              {errors.descripcion && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.descripcion}
                </p>
              )}
            </div>
          )}
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
            {loading
              ? 'Guardando...'
              : initialData
                ? 'Actualizar Servicio'
                : 'Crear Servicio'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ServiceForm;
