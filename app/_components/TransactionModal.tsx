import { X } from "lucide-react";

// Helper för att formatera LocalDateTime till YYYY-MM-DD
const formatDateForInput = (dateTimeString: string) => {
  if (!dateTimeString) return "";
  return dateTimeString.split("T")[0];
};

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  isExpense: boolean;
  title: string;
  amount: string;
  isSubmitting: boolean;
  isEditing: boolean;
  dateTime: string;
  onTitleChange: (value: string) => void;
  onAmountChange: (value: string) => void;
  onDateTimeChange: (value: string) => void;
}

export function TransactionModal({
  isOpen,
  onClose,
  onSubmit,
  isExpense,
  title,
  amount,
  isSubmitting,
  isEditing,
  dateTime,
  onTitleChange,
  onAmountChange,
  onDateTimeChange,
}: TransactionModalProps) {
  if (!isOpen) return null;

  const typeText = isExpense ? "utgift" : "inkomst";
  const headerText = isEditing
    ? `Redigera ${typeText}`
    : `Lägg till ${typeText}`;

  const btnColor = isExpense
    ? "bg-red-600 hover:bg-red-700"
    : "bg-blue-600 hover:bg-blue-700";
  const focusRing = isExpense ? "focus:ring-red-500" : "focus:ring-blue-500";

  return (
    /* HÄR ÄR ÄNDRINGEN: 
       'bg-black/40' gör den svart med 40% opacitet.
       'backdrop-blur-md' suddar ut allt bakom modalen. 
    */
    <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center p-4 z-50 transition-all">
      {/* Själva modal-boxen */}
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 border border-white/20 animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900">{headerText}</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-5">
          {/* Titel */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Titel *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              placeholder="T.ex. Lön, Hyra, etc."
              className={`w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 ${focusRing} focus:border-transparent outline-none transition-all`}
            />
          </div>

          {/* Belopp */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Belopp (kr) *
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => onAmountChange(e.target.value)}
              placeholder="0"
              min="0"
              step="0.01"
              className={`w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 ${focusRing} focus:border-transparent outline-none transition-all`}
            />
          </div>

          {/* Datum (Endast vid redigering) */}
          {isEditing && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Datum
              </label>
              <input
                type="date"
                value={formatDateForInput(dateTime)}
                onChange={(e) => onDateTimeChange(e.target.value)}
                className={`w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 ${focusRing} focus:border-transparent outline-none transition-all`}
              />
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3 mt-8">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-gray-600 font-medium hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all duration-200"
            disabled={isSubmitting}
          >
            Avbryt
          </button>
          <button
            onClick={onSubmit}
            disabled={isSubmitting}
            className={`px-6 py-2.5 text-white font-bold rounded-xl shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${btnColor} active:scale-95`}
          >
            {isSubmitting
              ? "Sparar..."
              : isEditing
              ? "Spara ändringar"
              : `Lägg till ${typeText}`}
          </button>
        </div>
      </div>
    </div>
  );
}
