import { Plus, ArrowUpRight, ArrowDownLeft } from "lucide-react";

interface QuickActionsProps {
  onAddIncome: () => void;
  onAddExpense: () => void;
}

export function QuickActions({ onAddIncome, onAddExpense }: QuickActionsProps) {
  return (
    <div className="bg-white/60 backdrop-blur-md rounded-3xl shadow-sm border border-white/20 p-6 mb-8">
      <h3 className="text-lg font-bold text-gray-900 mb-4 ml-1">
        Snabba åtgärder
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={onAddIncome}
          className="group p-5 bg-blue-50/50 border-2 border-dashed border-blue-200 rounded-2xl hover:border-blue-500 hover:bg-blue-50 transition-all duration-300 flex items-center justify-between"
        >
          <div className="flex items-center">
            <div className="bg-blue-600 p-2 rounded-xl mr-4 shadow-lg shadow-blue-200">
              <ArrowUpRight className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-blue-900">Lägg till inkomst</span>
          </div>
          <Plus className="h-6 w-6 text-blue-400 group-hover:text-blue-600 transition-colors" />
        </button>

        <button
          onClick={onAddExpense}
          className="group p-5 bg-red-50/50 border-2 border-dashed border-red-200 rounded-2xl hover:border-red-500 hover:bg-red-50 transition-all duration-300 flex items-center justify-between"
        >
          <div className="flex items-center">
            <div className="bg-red-600 p-2 rounded-xl mr-4 shadow-lg shadow-red-200">
              <ArrowDownLeft className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-red-900">Lägg till utgift</span>
          </div>
          <Plus className="h-6 w-6 text-red-400 group-hover:text-red-600 transition-colors" />
        </button>
      </div>
    </div>
  );
}
