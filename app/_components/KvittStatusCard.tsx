import { Wallet, AlertTriangle } from "lucide-react";

export function KvittStatusCard({ status }: { status: KvittStatus | null }) {
  if (!status) return null;

  const isKvitt = status.expensesBack === 0;
  const bgColor = isKvitt ? "bg-green-500" : "bg-red-500";
  const icon = isKvitt ? (
    <Wallet className="h-6 w-6 text-white" />
  ) : (
    <AlertTriangle className="h-6 w-6 text-white" />
  );
  const title = isKvitt ? "GRATTIS! Du är KVITT" : "Du är back";

  let description;
  if (isKvitt) {
    description = "Ditt saldo täcker alla utgifter i historiken.";
  } else {
    const count = status.expensesBack;
    description = `Du är back ${count} utgift${count > 1 ? "er" : ""}.`;
  }

  return (
    <div
      className={`rounded-lg shadow-lg p-6 flex items-center space-x-4 text-white ${bgColor}`}
    >
      <div
        className={`p-3 rounded-full ${
          isKvitt ? "bg-green-600" : "bg-red-600"
        } flex-shrink-0`}
      >
        {icon}
      </div>
      <div>
        <h3 className="text-xl font-bold">{title}</h3>
        <p className="text-sm">{description}</p>
        {!isKvitt && (
          <p className="text-xs font-semibold mt-1">
            Senaste utgift som täcktes:{" "}
            {new Date(status.lastKvittDate).toLocaleDateString("sv-SE", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </p>
        )}
      </div>
    </div>
  );
}
