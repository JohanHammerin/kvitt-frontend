interface TransactionHistoryProps {
  events: EventData[];
  loading: boolean;
  onDelete: (id: string) => void;
  onEditClick: (event: EventData) => void;
}
