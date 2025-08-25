import { compactFormat } from '@/lib/format-number';
import { getOverviewData } from '../../fetch';
import { OverviewCard } from './card';
import * as icons from './icons';
import {
  getTotalExpenses,
  getTotalExpensesMoney,
  getVehicles,
} from '@/lib/actions/actions';

export async function OverviewCardsGroup() {
  const vehicles = await getVehicles();
  const expenses = await getTotalExpenses();
  const expensesMoney = await getTotalExpensesMoney();

  return (
    <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 xl:grid-cols-3 2xl:gap-7.5">
      <OverviewCard
        label="Total de vehículos"
        data={{
          value: compactFormat(vehicles),
        }}
        Icon={icons.Views}
      />

      <OverviewCard
        label="Total de saldo gastado en el mes"
        data={{
          ...expenses,
          value: '$' + compactFormat(expenses.value || 0),
        }}
        Icon={icons.Profit}
      />

      <OverviewCard
        label="Total de combustible gastado en el mes"
        data={{
          ...expensesMoney,
          value: compactFormat(expensesMoney.value || 0),
        }}
        Icon={icons.Product}
      />
    </div>
  );
}
