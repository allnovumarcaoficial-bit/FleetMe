"use client";

import React from "react";

interface DetailsButtonsProps {
  handleEdit: () => void;
  handleDelete: () => void;
  handleBack: () => void;
}

const DetailsButtons: React.FC<DetailsButtonsProps> = ({
  handleEdit,
  handleDelete,
  handleBack,
}) => {
  return (
    <div className="mb-4 mt-8 flex justify-end gap-4">
      <button
        onClick={handleEdit}
        className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10"
      >
        Editar
      </button>
      <button
        onClick={handleDelete}
        className="inline-flex items-center justify-center rounded-md bg-red-500 px-4 py-2 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10"
      >
        Eliminar
      </button>
      <button
        type="button"
        onClick={handleBack}
        className="inline-flex items-center justify-center rounded-md border border-stroke bg-gray-2 px-4 py-2 text-center font-medium text-dark hover:bg-opacity-90 dark:border-dark-3 dark:bg-dark-2 dark:text-white lg:px-8 xl:px-10"
      >
        Volver
      </button>
    </div>
  );
};

export default DetailsButtons;
