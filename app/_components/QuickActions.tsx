import { Plus } from "lucide-react";

interface QuickActionsProps {
  onAddIncome: () => void;
  onAddExpense: () => void;
}

export function QuickActions({ onAddIncome, onAddExpense }: QuickActionsProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Snabba åtgärder
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          onClick={onAddIncome}
          className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition duration-200 text-gray-600 hover:text-blue-700 flex items-center justify-center"
        >
          <Plus className="h-5 w-5 mr-2" />
          Lägg till inkomst
        </button>
        <button
          onClick={onAddExpense}
          className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-red-500 hover:bg-red-50 transition duration-200 text-gray-600 hover:text-red-700 flex items-center justify-center"
        >
          <Plus className="h-5 w-5 mr-2" />
          Lägg till utgift
        </button>
        <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition duration-200 text-gray-600 hover:text-green-700">
          📊 Visa statistik
        </button>
        <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition duration-200 text-gray-600 hover:text-purple-700">
          📋 Hantera event
        </button>
      </div>
    </div>
  );
}
