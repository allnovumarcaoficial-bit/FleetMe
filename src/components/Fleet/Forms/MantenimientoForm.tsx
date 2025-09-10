'use client';

import { useState, useEffect } from 'react';
import {
  Mantenimiento,
  MantenimientoTipo,
  MantenimientoEstado,
  Vehicle,
} from '@/types/fleet';
import InputGroup from '@/components/FormElements/InputGroup';
import { Alert } from '@/components/ui-elements/alert';
import { useRouter } from 'next/navigation';
import { PlusIcon, MinusIcon } from '@/assets/icons'; // Assuming these icons exist or will be added

interface Piece {
  id: number; // Unique ID for React list rendering
  name: string;
  cambio_de_pieza: boolean;
  numero_serie_anterior?: string | null;
  numero_serie_nueva?: string | null;
}

interface MantenimientoFormProps {
  initialData?: Mantenimiento;
  onSuccess?: () => void;
  onCancel?: () => void;
  selectedVehicleId?: number; // Optional prop for pre-selecting a vehicle
}

const MantenimientoForm = ({
  initialData,
  onSuccess,
  onCancel,
  selectedVehicleId,
}: MantenimientoFormProps) => {
  const router = useRouter();
  const [formData, setFormData] = useState<
    Mantenimiento | Partial<Mantenimiento>
  >(
    initialData
      ? {
          ...initialData,
          fecha: initialData.fecha ? new Date(initialData.fecha) : null,
          lista_de_piezas: initialData.lista_de_piezas
            ? (
                JSON.parse(
                  initialData.lista_de_piezas as unknown as string
                ) as Piece[]
              ).map((p: any, index: number) => ({ ...p, id: index }))
            : [
                {
                  id: Date.now(),
                  name: '',
                  cambio_de_pieza: false,
                  numero_serie_anterior: '',
                  numero_serie_nueva: '',
                },
              ],
          cambio_de_pieza: initialData.cambio_de_pieza ?? false, // Initialize top-level cambio_de_pieza
          estado: initialData.estado ?? 'Pendiente', // Initialize estado
        }
      : {
          tipo: MantenimientoTipo.Correctivo,
          fecha: null,
          costo: 0,
          descripcion: '',
          lista_de_piezas: [
            {
              id: Date.now(),
              name: '',
              cambio_de_pieza: false,
              numero_serie_anterior: '',
              numero_serie_nueva: '',
            },
          ], // Initialize with one empty piece
          cambio_de_pieza: false, // Default to false for new maintenance
          estado: 'Pendiente', // Default to Pendiente for new maintenance
          vehicleId: selectedVehicleId || undefined,
        }
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formStatus, setFormStatus] = useState<{
    type: 'success' | 'error' | '';
    message: string;
  }>({ type: '', message: '' });
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const res = await fetch('/api/vehicles?limit=1000'); // Fetch all vehicles for selection
        const data = await res.json();
        setVehicles(data.data || []);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching vehicles:', err);
        setFormStatus({
          type: 'error',
          message: 'Error al cargar la lista de vehículos.',
        });
        setLoading(false);
      }
    };
    fetchVehicles();
  }, []);

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        fecha: initialData.fecha ? new Date(initialData.fecha) : null,
        lista_de_piezas: initialData.lista_de_piezas
          ? (
              JSON.parse(
                initialData.lista_de_piezas as unknown as string
              ) as Piece[]
            ).map((p: any, index: number) => ({ ...p, id: index }))
          : [
              {
                id: Date.now(),
                name: '',
                cambio_de_pieza: false,
                numero_serie_anterior: '',
                numero_serie_nueva: '',
              },
            ],
      });
    } else if (selectedVehicleId) {
      setFormData((prev) => ({ ...prev, vehicleId: selectedVehicleId }));
    }
  }, [initialData, selectedVehicleId]);

  const validateField = (name: string, value: any): string => {
    let error = '';
    switch (name) {
      case 'tipo':
        if (!value) error = 'Debe seleccionar un tipo de mantenimiento.';
        break;
      case 'fecha':
        if (!value || isNaN(new Date(value).getTime()))
          error = 'Fecha inválida.';
        break;
      case 'costo':
        if (value === null || value === undefined || isNaN(parseFloat(value)))
          error = 'Costo inválido.';
        if (parseFloat(value) < 0) error = 'El costo no puede ser negativo.';
        break;
      case 'descripcion':
        if (!value) error = 'La descripción es requerida.';
        break;
      case 'vehicleId':
        if (!value) error = 'Debe seleccionar un vehículo.';
        break;
      case 'estado':
        if (!value) error = 'Debe seleccionar un estado.';
        break;
    }
    return error;
  };

  const validatePieceField = (
    piece: Piece,
    index: number
  ): Record<string, string> => {
    const pieceErrors: Record<string, string> = {};
    if (!piece.name.trim()) {
      pieceErrors[`pieceName-${index}`] = 'El nombre de la pieza es requerido.';
    }
    if (piece.cambio_de_pieza) {
      if (!piece.numero_serie_anterior?.trim()) {
        pieceErrors[`numero_serie_anterior-${index}`] =
          'Número de serie anterior es requerido.';
      }
      if (!piece.numero_serie_nueva?.trim()) {
        pieceErrors[`numero_serie_nueva-${index}`] =
          'Número de serie nueva es requerido.';
      }
    }
    return pieceErrors;
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
      newValue = new Date(value);
    } else if (name === 'costo') {
      newValue = parseFloat(value);
    } else if (name === 'vehicleId') {
      newValue = parseInt(value);
    }

    setFormData((prev) => ({ ...prev, [name]: newValue }));
    const fieldError = validateField(name, newValue);
    setErrors((prev) => ({ ...prev, [name]: fieldError }));
  };

  const handlePieceChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const updatedPieces = [...(formData.lista_de_piezas as Piece[])];
    if (type === 'checkbox') {
      updatedPieces[index] = {
        ...updatedPieces[index],
        [name]: (e.target as HTMLInputElement).checked,
      };
      // Clear serial numbers if cambio_de_pieza is unchecked
      if (!(e.target as HTMLInputElement).checked) {
        updatedPieces[index].numero_serie_anterior = null;
        updatedPieces[index].numero_serie_nueva = null;
      }
    } else {
      updatedPieces[index] = { ...updatedPieces[index], [name]: value };
    }

    const newListaDePiezas = updatedPieces;
    const anyPieceChanged = newListaDePiezas.some(
      (piece) => piece.cambio_de_pieza
    );

    setFormData((prev) => ({
      ...prev,
      lista_de_piezas: newListaDePiezas,
      cambio_de_pieza: anyPieceChanged, // Update top-level cambio_de_pieza
    }));

    // Re-validate piece field
    const pieceErrors = validatePieceField(updatedPieces[index], index);
    setErrors((prev) => ({ ...prev, ...pieceErrors }));
  };

  const addPiece = () => {
    setFormData((prev) => ({
      ...prev,
      lista_de_piezas: [
        ...(prev.lista_de_piezas as Piece[]),
        {
          id: Date.now(),
          name: '',
          cambio_de_pieza: false,
          numero_serie_anterior: '',
          numero_serie_nueva: '',
        },
      ],
    }));
  };

  const removePiece = (id: number) => {
    setFormData((prev) => ({
      ...prev,
      lista_de_piezas: (prev.lista_de_piezas as Piece[]).filter(
        (piece) => piece.id !== id
      ),
    }));
    // Also remove errors associated with this piece
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[`pieceName-${id}`];
      delete newErrors[`numero_serie_anterior-${id}`];
      delete newErrors[`numero_serie_nueva-${id}`];
      return newErrors;
    });
  };

  const validateForm = () => {
    let newErrors: Record<string, string> = {};
    let isValid = true;

    // Validate main form fields
    for (const key in formData) {
      if (key !== 'lista_de_piezas') {
        // Exclude pieces for now
        const value = (formData as any)[key];
        const error = validateField(key, value);
        if (error) {
          newErrors[key] = error;
          isValid = false;
        }
      }
    }

    // Validate pieces
    if (
      !formData.lista_de_piezas ||
      (formData.lista_de_piezas as Piece[]).length === 0
    ) {
      newErrors.lista_de_piezas = 'Debe añadir al menos una pieza.';
      isValid = false;
    } else {
      (formData.lista_de_piezas as Piece[]).forEach((piece, index) => {
        const pieceErrors = validatePieceField(piece, index);
        if (Object.keys(pieceErrors).length > 0) {
          newErrors = { ...newErrors, ...pieceErrors };
          isValid = false;
        }
      });
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
        ? `/api/mantenimientos/${initialData.id}`
        : '/api/mantenimientos';

      const payload = {
        ...formData,
        fecha: formData.fecha?.toISOString(),
        // Map pieces to the format expected by the API (without the temporary 'id' field)
        lista_de_piezas: (formData.lista_de_piezas as Piece[]).map(
          ({ id, ...rest }) => rest
        ),
        cambio_de_pieza: formData.cambio_de_pieza, // Include the top-level cambio_de_pieza
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || 'Error al guardar el mantenimiento.'
        );
      }

      setFormStatus({
        type: 'success',
        message: `Mantenimiento ${initialData ? 'actualizado' : 'creado'} exitosamente.`,
      });
      if (onSuccess) onSuccess();
      router.push('/fleet/mantenimientos');
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
              disabled={!!selectedVehicleId} // Disable if vehicle is pre-selected
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

          <div>
            <label
              htmlFor="tipo"
              className="mb-3 block text-body-sm font-medium text-dark dark:text-white"
            >
              Tipo de Mantenimiento
            </label>
            <select
              id="tipo"
              name="tipo"
              value={formData.tipo || ''}
              onChange={handleChange}
              className="w-full rounded-lg border border-stroke bg-transparent px-5.5 py-3 outline-none transition focus:border-primary active:border-primary dark:border-dark-3 dark:bg-dark-2 dark:focus:border-primary [&>option]:text-dark-5 dark:[&>option]:text-dark-6"
            >
              <option value="" disabled>
                Selecciona un tipo
              </option>
              {Object.values(MantenimientoTipo).map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            {errors.tipo && (
              <p className="mt-1 text-sm text-red-500">{errors.tipo}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="estado"
              className="mb-3 block text-body-sm font-medium text-dark dark:text-white"
            >
              Estado
            </label>
            <select
              id="estado"
              name="estado"
              value={formData.estado || ''}
              onChange={handleChange}
              className="w-full rounded-lg border border-stroke bg-transparent px-5.5 py-3 outline-none transition focus:border-primary active:border-primary dark:border-dark-3 dark:bg-dark-2 dark:focus:border-primary [&>option]:text-dark-5 dark:[&>option]:text-dark-6"
            >
              <option value="" disabled>
                Selecciona un estado
              </option>
              <option value="Pendiente">Pendiente</option>
              <option value="Ejecutado">Ejecutado</option>
              <option value="Cancelado">Cancelado</option>
            </select>
            {errors.estado && (
              <p className="mt-1 text-sm text-red-500">{errors.estado}</p>
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
              label="Costo"
              name="costo"
              type="number"
              placeholder="Introduce el costo"
              value={formData.costo?.toString() || ''}
              handleChange={handleChange}
            />
            {errors.costo && (
              <p className="mt-1 text-sm text-red-500">{errors.costo}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <InputGroup
              label="Descripción"
              name="descripcion"
              type="textarea"
              placeholder="Introduce la descripción del mantenimiento"
              value={formData.descripcion || ''}
              handleChange={handleChange}
            />
            {errors.descripcion && (
              <p className="mt-1 text-sm text-red-500">{errors.descripcion}</p>
            )}
          </div>

          <div className="mt-4 md:col-span-2">
            <h4 className="mb-3 font-medium text-dark dark:text-white">
              Piezas
            </h4>
            {(formData.lista_de_piezas as Piece[]).map((piece, index) => (
              <div
                key={piece.id}
                className="mb-4 rounded-md border border-stroke p-4 dark:border-dark-3"
              >
                <div className="mb-3 flex items-center justify-between">
                  <h5 className="font-medium text-dark dark:text-white">
                    Pieza #{index + 1}
                  </h5>
                  {(formData.lista_de_piezas as Piece[]).length > 1 && (
                    <button
                      type="button"
                      onClick={() => removePiece(piece.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <MinusIcon />
                    </button>
                  )}
                </div>
                <InputGroup
                  label="Nombre de la Pieza"
                  name="name"
                  type="text"
                  placeholder="Introduce el nombre de la pieza"
                  value={piece.name || ''}
                  handleChange={(e) => handlePieceChange(index, e)}
                />
                {errors[`pieceName-${index}`] && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors[`pieceName-${index}`]}
                  </p>
                )}

                <div className="mt-3 flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="cambio_de_pieza"
                    checked={piece.cambio_de_pieza || false}
                    onChange={(e) => handlePieceChange(index, e)}
                    className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <label
                    htmlFor={`cambio_de_pieza-${piece.id}`}
                    className="text-dark dark:text-white"
                  >
                    ¿Hubo cambio de pieza?
                  </label>
                </div>

                {piece.cambio_de_pieza && (
                  <div className="mt-3 grid grid-cols-1 gap-5 md:grid-cols-2">
                    <div>
                      <InputGroup
                        label="Número de Serie Anterior"
                        name="numero_serie_anterior"
                        type="text"
                        placeholder="Introduce el número de serie anterior"
                        value={piece.numero_serie_anterior || ''}
                        handleChange={(e) => handlePieceChange(index, e)}
                      />
                      {errors[`numero_serie_anterior-${index}`] && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors[`numero_serie_anterior-${index}`]}
                        </p>
                      )}
                    </div>
                    <div>
                      <InputGroup
                        label="Número de Serie Nueva"
                        name="numero_serie_nueva"
                        type="text"
                        placeholder="Introduce el número de serie nueva"
                        value={piece.numero_serie_nueva || ''}
                        handleChange={(e) => handlePieceChange(index, e)}
                      />
                      {errors[`numero_serie_nueva-${index}`] && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors[`numero_serie_nueva-${index}`]}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addPiece}
              className="inline-flex items-center justify-center rounded-md bg-blue-500 px-4 py-2 text-center font-medium text-white hover:bg-opacity-90"
            >
              <PlusIcon className="mr-2" /> Añadir Pieza
            </button>
            {errors.lista_de_piezas && (
              <p className="mt-1 text-sm text-red-500">
                {errors.lista_de_piezas}
              </p>
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
            {loading
              ? 'Guardando...'
              : initialData
                ? 'Actualizar Mantenimiento'
                : 'Crear Mantenimiento'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MantenimientoForm;
