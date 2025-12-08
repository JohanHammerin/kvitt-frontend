import { DollarSign, TrendingUp, TrendingDown } from "lucide-react";

export function FinancialOverview({ data }: { data: FinancialData | null }) {
  if (!data) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Total Income */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Inkomst</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">
              {data.totalIncome.toLocaleString()} kr
            </p>
          </div>
          <div className="bg-green-100 p-3 rounded-full">
            <TrendingUp className="h-6 w-6 text-green-600" />
          </div>
        </div>
      </div>

      {/* Total Expense */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Utgift</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">
              {data.totalExpense.toLocaleString()} kr
            </p>
          </div>
          <div className="bg-red-100 p-3 rounded-full">
            <TrendingDown className="h-6 w-6 text-red-600" />
          </div>
        </div>
      </div>

      {/* Balance */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Saldo</p>
            <p
              className={`text-2xl font-bold mt-2 ${
                data.balance >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {data.balance.toLocaleString()} kr
            </p>
          </div>
          <div className="bg-blue-100 p-3 rounded-full">
            <DollarSign className="h-6 w-6 text-blue-600" />
          </div>
        </div>
      </div>
    </div>
  );
}
