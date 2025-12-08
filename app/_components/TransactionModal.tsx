import { X } from "lucide-react";

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  isExpense: boolean;
  title: string;
  amount: string;
  onTitleChange: (value: string) => void;
  onAmountChange: (value: string) => void;
  isSubmitting: boolean;
}

export function TransactionModal({
  isOpen,
  onClose,
  onSubmit,
  isExpense,
  title,
  amount,
  onTitleChange,
  onAmountChange,
  isSubmitting,
}: TransactionModalProps) {
  if (!isOpen) return null;

  const typeText = isExpense ? "utgift" : "inkomst";
  const btnColor = isExpense
    ? "bg-red-600 hover:bg-red-700"
    : "bg-blue-600 hover:bg-blue-700";
  const focusRing = isExpense ? "focus:ring-red-500" : "focus:ring-blue-500";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Lägg till {typeText}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Titel *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              placeholder="T.ex. Lön, Hyra, etc."
              className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 ${focusRing} focus:border-transparent`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Belopp (kr) *
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => onAmountChange(e.target.value)}
              placeholder="0"
              min="0"
              step="0.01"
              className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 ${focusRing} focus:border-transparent`}
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:text-gray-900 border border-gray-300 rounded-lg transition duration-200"
            disabled={isSubmitting}
          >
            Avbryt
          </button>
          <button
            onClick={onSubmit}
            disabled={isSubmitting}
            className={`px-4 py-2 text-white rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${btnColor}`}
          >
            {isSubmitting ? "Lägger till..." : `Lägg till ${typeText}`}
          </button>
        </div>
      </div>
    </div>
  );
}
