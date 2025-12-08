import { TrendingUp, TrendingDown } from "lucide-react";

export function TransactionHistory({
  events,
  loading,
}: {
  events: EventData[];
  loading: boolean;
}) {
  return (
    <div className="bg-white rounded-lg shadow-lg border p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Transaktionshistorik
      </h3>

      {loading ? (
        <div className="text-center py-10 text-gray-500">
          Laddar transaktioner...
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          Inga transaktioner hittades. Lägg till en inkomst eller utgift!
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
          {events.map((event) => (
            <div
              key={event.id}
              className={`flex items-center justify-between p-3 rounded-lg border 
                          ${
                            event.expense
                              ? "border-red-100 bg-red-50"
                              : "border-green-100 bg-green-50"
                          }`}
            >
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">
                  {event.title}
                </p>
                <p className="text-sm text-gray-500">
                  {new Date(event.dateTime).toLocaleDateString("sv-SE", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>

              <div className="flex items-center space-x-4 ml-4">
                <p
                  className={`font-bold text-lg whitespace-nowrap 
                              ${
                                event.expense
                                  ? "text-red-600"
                                  : "text-green-600"
                              }`}
                >
                  {event.expense ? "-" : "+"}
                  {event.amount.toLocaleString("sv-SE", {
                    minimumFractionDigits: 0,
                  })}{" "}
                  kr
                </p>

                {event.expense && (
                  <span
                    className={`px-3 py-1 text-xs font-semibold rounded-full whitespace-nowrap
                                      ${
                                        event.paid
                                          ? "bg-blue-100 text-blue-700"
                                          : "bg-yellow-100 text-yellow-700"
                                      }`}
                  >
                    {event.paid ? "Betald" : "Obetald"}
                  </span>
                )}

                {event.expense ? (
                  <TrendingDown className="h-5 w-5 text-red-600 hidden sm:block" />
                ) : (
                  <TrendingUp className="h-5 w-5 text-green-600 hidden sm:block" />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
