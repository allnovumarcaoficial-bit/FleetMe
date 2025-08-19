"use client";

import { useState, useEffect, useCallback } from "react";
import { FuelCard, Reservorio } from "@/types/fleet";
import InputGroup from "@/components/FormElements/InputGroup";
import { Select } from "@/components/FormElements/select";
import { Alert } from "@/components/ui-elements/alert";
import { useRouter } from "next/navigation";

interface ReservorioFormProps {
  initialData?: Partial<Reservorio>;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const ReservorioForm = ({
  initialData,
  onSuccess,
  onCancel,
}: ReservorioFormProps) => {
  const router = useRouter();
  const [formData, setFormData] = useState<Partial<Reservorio>>(() => {
    if (initialData) {
      return {
        ...initialData,
        capacidad_actual: initialData.capacidad_actual
          ? Number(initialData.capacidad_actual)
          : 0,
        capacidad_total: initialData.capacidad_total
          ? Number(initialData.capacidad_total)
          : 0,
        tipoCombustible: initialData.tipoCombustible || undefined,
        tipoCombustibleId: initialData.tipoCombustibleId || undefined,
      };
    }
    return {
      nombre: "",
      capacidad_actual: 0,
      capacidad_total: 0,
      tipoCombustible: undefined, // Mejor usar undefined que null para Prisma
      tipoCombustibleId: undefined,
    };
  });
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
      }));
    }
  }, [initialData]);

  const validateField = useCallback((name: string, value: any): string => {
    let error = "";
    switch (name) {
      case "nombre":
        if (!value) error = "El número de tarjeta es requerido.";
        break;
      case "capacidad_actual":
        if (!value) error = "El tipo de tarjeta es requerido.";
        break;
      case "capacidad_total":
        if (!value) error = "El tipo de combustible es requerido.";
        break;
      case "tipoCombustibleId":
        if (!value) error = "El tipo de combustible es requerido.";
        break;
    }
    return error;
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    let newValue: any = value;

    if (type === "number") {
      newValue = value === "" ? null : parseFloat(value);
    } else if (type === "date") {
      newValue = value ? new Date(value) : null;
    } else if (type === "checkbox") {
      newValue = checked;
    }

    setFormData((prev) => ({ ...prev, [name]: newValue }));
    setErrors((prev) => ({ ...prev, [name]: validateField(name, newValue) }));
  };

  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};
    const isValid = true;
    const fieldsToValidate: (keyof FuelCard)[] = [
      "numeroDeTarjeta",
      "tipoDeTarjeta",
      "tipoDeCombustible",
      "precioCombustible",
      "moneda",
      "fechaVencimiento",
    ];

    // fieldsToValidate.forEach((field) => {
    //   const value = formData[field];
    //   const error = validateField(field as string, value);
    //   if (error) {
    //     newErrors[field as string] = error;
    //     isValid = false;
    //   }
    // });

    setErrors(newErrors);
    return isValid;
  }, [formData, validateField]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus({ type: "", message: "" });

    if (!validateForm()) {
      setFormStatus({
        type: "error",
        message: "Por favor, corrige los errores del formulario.",
      });
      return;
    }

    setLoading(true);
    try {
      const method = initialData ? "PUT" : "POST";
      const url = initialData
        ? `/api/fuel-cards/${initialData.id}`
        : "/api/fuel-cards";
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Error al guardar la tarjeta de combustible.",
        );
      }

      setFormStatus({
        type: "success",
        message: `Tarjeta de combustible ${initialData ? "actualizada" : "creada"} exitosamente.`,
      });
      if (onSuccess) onSuccess();
      router.push("/fleet/fuel-cards");
    } catch (err: any) {
      setFormStatus({
        type: "error",
        message: err.message || "Ocurrió un error inesperado.",
      });
    } finally {
      setLoading(false);
    }
  };

  const fuelCardTypes = [
    { value: "Fincimex", label: "Fincimex" },
    { value: "Clasica", label: "Clasica" },
    { value: "Metropolitano", label: "Metropolitano" },
  ];

  const fuelTypes = [
    { value: "Gasolina_Regular", label: "Gasolina Regular" },
    { value: "Gasolina_Especial", label: "Gasolina Especial" },
    { value: "Diesel", label: "Diésel" },
  ];

  const currencies = [
    { value: "CUP", label: "CUP" },
    { value: "MLC", label: "MLC" },
    { value: "USD", label: "USD" },
    { value: "EUR", label: "EUR" },
  ];

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
              label="Nombre del Reservorio"
              name="nombre"
              type="text"
              placeholder="Introduce el nombre del reservorio"
              value={formData.nombre || ""}
              handleChange={handleChange}
            />
            {errors.nombre && (
              <p className="mt-1 text-sm text-red-500">{errors.nombre}</p>
            )}
          </div>
          <div>
            <InputGroup
              label="Capacidad Actual"
              name="capacidad_actual"
              type="number"
              placeholder="Introduzca la capacidad actual"
              value={formData.capacidad_actual?.toString() || ""}
              handleChange={handleChange}
            />
            {errors.capacidad_actual && (
              <p className="mt-1 text-sm text-red-500">
                {errors.capacidad_actual}
              </p>
            )}
          </div>
          <InputGroup
            label="Capacidad Total"
            name="capacidad_total"
            type="number"
            placeholder="Introduzca la capacidad total"
            value={formData.capacidad_total?.toString() || ""}
            handleChange={handleChange}
          />
          {errors.capacidad_total && (
            <p className="mt-1 text-sm text-red-500">
              {errors.capacidad_total}
            </p>
          )}
          <div>
            <Select
              label="Tipo de Combustible"
              items={fuelTypes}
              value={formData.tipoCombustibleId?.toString() || ""}
              placeholder="Selecciona el tipo de combustible"
              onChange={(e) =>
                handleChange(e as React.ChangeEvent<HTMLSelectElement>)
              }
              name="tipoDeCombustible"
            />
            {errors.tipoDeCombustible && (
              <p className="mt-1 text-sm text-red-500">
                {errors.tipoDeCombustible}
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
              ? "Guardando..."
              : initialData
                ? "Actualizar Reservorio"
                : "Crear Reservorio"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReservorioForm;
