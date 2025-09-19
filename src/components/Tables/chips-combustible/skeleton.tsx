import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export function TopChipSkeleton() {
  return (
    <div className="rounded-[10px] bg-white px-7.5 pb-4 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card">
      <h2 className="mb-5.5 text-body-2xlg font-bold text-dark dark:text-white">
        Chip de Combustible
      </h2>

      <Table>
        <TableHeader>
          <TableRow className="border-none uppercase [&>th]:text-center">
            <TableHead className="!text-left">Fecha</TableHead>
            <TableHead>Hora</TableHead>
            <TableHead className="!text-right">Operación</TableHead>
            <TableHead>Servicio</TableHead>
            <TableHead>Litros</TableHead>
            <TableHead>Saldo</TableHead>
            <TableHead>Saldo Final</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {Array.from({ length: 7 }).map((_, i) => (
            <TableRow key={i}>
              <TableCell colSpan={100}>
                <Skeleton className="h-8" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
