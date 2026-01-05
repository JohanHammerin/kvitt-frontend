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
