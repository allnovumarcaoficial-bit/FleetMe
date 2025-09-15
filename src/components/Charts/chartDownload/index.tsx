'use client';
import {
  Dropdown,
  DropdownContent,
  DropdownTrigger,
} from '@/components/ui/dropdown';
import { MoreVertical } from 'lucide-react';
import { Button } from 'antd';
import { useState } from 'react';
interface MenuDropDowndProps {
  exportToPng: () => void;
  exportToJpg: () => void;
  exportToJSON?: () => void;
  exportToCsv: () => void;
}

interface MenuDropDowndFileProps {
  exportToExcel: () => void;
}

export function MenuDropDownd({
  exportToPng,
  exportToJpg,
  exportToCsv,
}: MenuDropDowndProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="rounded-full p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-800"
        type="button"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="12" r="2" />
          <circle cx="12" cy="5" r="2" />
          <circle cx="12" cy="19" r="2" />
        </svg>
      </button>

      {isMenuOpen && (
        <div className="absolute right-0 top-full z-10 mt-1 w-48 rounded-md border border-gray-200 bg-white shadow-lg dark:bg-gray-800 dark:text-white">
          <button
            onClick={() => {
              exportToPng();
              setIsMenuOpen(false);
            }}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:text-white dark:hover:bg-gray-500"
          >
            Exportar como PNG
          </button>
          <button
            onClick={() => {
              exportToJpg();
              setIsMenuOpen(false);
            }}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:text-white dark:hover:bg-gray-500"
          >
            Exportar como JPG
          </button>
          <button
            onClick={() => {
              exportToCsv();
              setIsMenuOpen(false);
            }}
            className="w-full border-t border-gray-100 px-4 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:text-white dark:hover:bg-gray-500"
          >
            Exportar datos CSV
          </button>
        </div>
      )}
    </div>
  );
}

export function MenuDropDowndTable({ exportToExcel }: MenuDropDowndFileProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="rounded-full p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-800"
        type="button"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="12" r="2" />
          <circle cx="12" cy="5" r="2" />
          <circle cx="12" cy="19" r="2" />
        </svg>
      </button>

      {isMenuOpen && (
        <div className="absolute right-0 top-full z-10 mt-1 w-48 rounded-md border border-gray-200 bg-white shadow-lg dark:bg-gray-800 dark:text-white">
          <button
            onClick={() => {
              exportToExcel();
              setIsMenuOpen(false);
            }}
            className="w-full border-t border-gray-100 px-4 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:text-white dark:hover:bg-gray-500"
          >
            Exportar datos Excel
          </button>
        </div>
      )}
    </div>
  );
}
