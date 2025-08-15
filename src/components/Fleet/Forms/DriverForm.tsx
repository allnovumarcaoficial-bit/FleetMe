"use client";

import { useState, useEffect, useCallback } from "react";
import { Driver, Vehicle, DriverStatus } from "@/types/fleet";
import InputGroup from "@/components/FormElements/InputGroup";
import { Select } from "@/components/FormElements/select"; // Import Select component
import { Alert } from "@/components/ui-elements/alert";
import { useRouter } from "next/navigation";

interface DriverFormProps {
  initialData?: Driver;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const DriverForm = ({ initialData, onSuccess, onCancel }: DriverFormProps) => {
  const router = useRouter();
  const [selectedFecha, setSelectedFecha] = useState<Date>(new Date());
  const [lisStado, setEstado] = useState<DriverStatus>("Activo");
  const [formData, setFormData] = useState<Partial<Driver>>(
    initialData
      ? {
          ...initialData,
          fecha_vencimiento_licencia: initialData.fecha_vencimiento_licencia
            ? new Date(initialData.fecha_vencimiento_licencia)
            : null,
        }
      : {
          nombre: "",
          licencia: "",
          fecha_vencimiento_licencia: null,
          carnet_peritage: false,
          estado: "Activo", // Default to 'Activo'
        },
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formStatus, setFormStatus] = useState<{
    type: "success" | "error" | "";
    message: string;
  }>({ type: "", message: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData((prev) => ({
        ...prev,
        ...initialData,
        fecha_vencimiento_licencia: initialData.fecha_vencimiento_licencia
          ? new Date(initialData.fecha_vencimiento_licencia)
          : null,
      }));
      setSelectedFecha(
        initialData.fecha_vencimiento_licencia
          ? new Date(initialData.fecha_vencimiento_licencia)
          : new Date(),
      );
    }
  }, [initialData]);
  useEffect(() => {
    // Solo actualiza si `selectedFecha` cambia
    if (selectedFecha < new Date()) {
      setFormData((prev) => ({
        ...prev,
        estado: "Inactivo", // Fuerza "Inactivo" si la fecha está vencida
      }));
    } else if (selectedFecha > new Date()) {
      setFormData((prev) => {
        if (prev.estado === "Inactivo") {
          return {
            ...prev,
            estado: "Activo", // Fuerza "Activo" si estaba "Inactivo" y la fecha es futura
          };
        }
        return prev;
      });
    }
  }, [selectedFecha]);

  const validateField = useCallback((name: string, value: any): string => {
    let error = "";
    switch (name) {
      case "nombre":
      case "licencia":
      case "estado": // Add validation for estado
        if (!value) error = "Este campo es requerido.";
        break;
      case "fecha_vencimiento_licencia":
        setSelectedFecha(value);
        if (!value || isNaN(new Date(value).getTime()))
          error = "Fecha inválida.";
        break;
      case "carnet":
        if (!value) {
          error = "El carnet es requerido.";
        } else if (!/^\d{7,11}$/.test(value)) {
          error = "El carnet debe tener entre 7 y 11 dígitos.";
        }
        break;

      case "phone":
        if (!value) error = "El teléfono es requerido.";
        else if (!/^\+?\d{7,15}$/.test(value))
          error = "Número de teléfono inválido.";
        break;
      case "address":
        if (!value) error = "La dirección es requerida.";
        break;
    }
    return error;
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value, type } = e.target;
    let newValue: any = value;
    console.log(name, value);

    if (type === "checkbox") {
      newValue = (e.target as HTMLInputElement).checked;
    } else if (type === "date") {
      newValue = new Date(value);
    }

    setFormData((prev) => ({ ...prev, [name]: newValue }));
    setErrors((prev) => ({ ...prev, [name]: validateField(name, newValue) }));
  };

  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};
    let isValid = true;
    const fieldsToValidate: (keyof Driver)[] = [
      "address",
      "carnet",
      "phone",
      "licencia",
      "estado",
      "fecha_vencimiento_licencia",
      "nombre",
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
    console.log(formData);
    setFormStatus({ type: "", message: "" });

    if (!validateForm()) {
      console.log(validateForm());
      setFormStatus({
        type: "error",
        message: "Por favor, corrige los errores del formulario.",
      });
      return;
    }
    console.log("handleSubmit: Validation passed");

    setLoading(true);
    try {
      const method = initialData ? "PUT" : "POST";
      const url = initialData
        ? `/api/drivers/${initialData.id}`
        : "/api/drivers";
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          fecha_vencimiento_licencia:
            formData.fecha_vencimiento_licencia?.toISOString(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al guardar el conductor.");
      }

      setFormStatus({
        type: "success",
        message: `Conductor ${initialData ? "actualizado" : "creado"} exitosamente.`,
      });
      if (onSuccess) onSuccess();
      router.push("/fleet/drivers");
    } catch (err: any) {
      setFormStatus({
        type: "error",
        message: err.message || "Ocurrió un error inesperado.",
      });
    } finally {
      setLoading(false);
    }
  };
  if (loading && !initialData) return <p>Cargando formulario...</p>;

  return (
    <div className="rounded-[10px] border border-stroke bg-white p-4 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card sm:p-7.5">
      {formStatus.type && (
        <Alert
          variant={formStatus.type === "success" ? "success" : "error"}
          title={formStatus.type === "success" ? "Éxito" : "Error"}
          description={formStatus.message}
        />
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <InputGroup
              label="Nombre"
              name="nombre"
              type="text"
              placeholder="Introduce el nombre"
              value={formData.nombre || ""}
              handleChange={handleChange}
            />
            {errors.nombre && (
              <p className="mt-1 text-sm text-red-500">{errors.nombre}</p>
            )}
          </div>
          <div>
            <InputGroup
              label="Carnet"
              name="carnet"
              type="text"
              placeholder="Introduce el Carnet de Identidad"
              value={formData.carnet || ""}
              handleChange={handleChange}
            />
            {errors.carnet && (
              <p className="mt-1 text-sm text-red-500">{errors.carnet}</p>
            )}
          </div>
          <div>
            <InputGroup
              label="Teléfono"
              name="phone"
              type="text"
              placeholder="Introduce el número de teléfono"
              value={formData.phone || ""}
              handleChange={handleChange}
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
            )}
          </div>
          <div>
            <InputGroup
              label="Dirección"
              name="address"
              type="text"
              placeholder="Introduzca su dirección"
              value={formData.address || ""}
              handleChange={handleChange}
            />
            {errors.address && (
              <p className="mt-1 text-sm text-red-500">{errors.address}</p>
            )}
          </div>
          <div>
            <InputGroup
              label="Foto de Perfil"
              name="photo"
              type="file"
              placeholder="Introduzca su foto de perfil"
              value={formData.photo || ""}
              handleChange={handleChange}
            />
            {errors.photo && (
              <p className="mt-1 text-sm text-red-500">{errors.photo}</p>
            )}
          </div>
          <div>
            <InputGroup
              label="Licencia"
              name="licencia"
              type="text"
              placeholder="Introduce la licencia"
              value={formData.licencia || ""}
              handleChange={handleChange}
            />
            {errors.licencia && (
              <p className="mt-1 text-sm text-red-500">{errors.licencia}</p>
            )}
          </div>
          <div>
            <InputGroup
              label="Fecha de Vencimiento de Licencia"
              name="fecha_vencimiento_licencia"
              type="date"
              placeholder="Selecciona la fecha"
              value={
                formData.fecha_vencimiento_licencia
                  ? formData.fecha_vencimiento_licencia
                      .toISOString()
                      .split("T")[0]
                  : ""
              }
              handleChange={handleChange}
            />
            {errors.fecha_vencimiento_licencia && (
              <p className="mt-1 text-sm text-red-500">
                {errors.fecha_vencimiento_licencia}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="carnet_peritage"
              checked={formData.carnet_peritage || false}
              onChange={handleChange}
              className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <label
              htmlFor="carnet_peritage"
              className="text-dark dark:text-white"
            >
              Tiene Carnet de Peritaje
            </label>
          </div>
          <div>
            <Select
              label="Estado"
              items={
                selectedFecha < new Date()
                  ? [{ value: "Inactivo", label: "Inactivo" }]
                  : [
                      { value: "Activo", label: "Activo" },
                      { value: "Vacaciones", label: "Vacaciones" },
                    ]
              }
              value={
                selectedFecha < new Date()
                  ? "Inactivo"
                  : formData.estado === "Inactivo"
                    ? "Activo"
                    : formData.estado || "Activo"
              }
              placeholder="Selecciona un estado"
              onChange={(
                e, // Solo permite cambios si la fecha es futura
              ) => handleChange(e as React.ChangeEvent<HTMLSelectElement>)}
              name="estado"
            />
            {errors.estado && (
              <p className="mt-1 text-sm text-red-500">{errors.estado}</p>
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
              ? "Guardando..."
              : initialData
                ? "Actualizar Conductor"
                : "Crear Conductor"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DriverForm;
