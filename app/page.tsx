"use client";

import { useAuth } from "./context/page";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import {
  LogOut,
  User,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Plus,
  X,
  Wallet,
  AlertTriangle,
} from "lucide-react";

export default function Home() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const [financialData, setFinancialData] = useState<FinancialData | null>(
    null
  );
  const [kvittStatus, setKvittStatus] = useState<KvittStatus | null>(null);
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);

  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showIncomeModal, setShowIncomeModal] = useState(false);

  const [newIncome, setNewIncome] = useState<NewIncomeData>({
    title: "",
    amount: "",
  });

  const [newExpense, setNewExpense] = useState<NewExpenseData>({
    title: "",
    amount: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // ℹ️ Byt ut mot env-variabel i produktion
  const API_BASE_URL = "http://localhost:8080/api/v1/event";

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, router]);

  const fetchData = async () => {
    if (!user) return;

    setLoading(true);

    try {
      // ✅ ÄNDRING: Vi använder credentials: 'include' för att skicka med kakan automatiskt
      // Vi tar bort Authorization-headern helt.
      const fetchOptions: RequestInit = {
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      };

      // --- 1. Hämta Finansiell Översikt ---
      const [incomeRes, expenseRes] = await Promise.all([
        fetch(
          `${API_BASE_URL}/getTotalIncome?username=${user.username}`,
          fetchOptions
        ),
        fetch(
          `${API_BASE_URL}/getTotalExpense?username=${user.username}`,
          fetchOptions
        ),
      ]);

      let totalIncome = 0;
      let totalExpense = 0;

      if (incomeRes.ok) {
        const incomeData = await incomeRes.json();
        totalIncome = parseFloat(incomeData.totalIncome || 0);
      }

      if (expenseRes.ok) {
        const expenseData = await expenseRes.json();
        totalExpense = parseFloat(expenseData.totalExpense || 0);
      }

      setFinancialData({
        totalIncome,
        totalExpense,
        balance: totalIncome - totalExpense,
      });

      // --- 2. Hämta KVITT STATUS ---
      const kvittRes = await fetch(
        `${API_BASE_URL}/getKvittStatus?username=${user.username}`,
        fetchOptions
      );

      if (kvittRes.ok) {
        const responseMap = await kvittRes.json();
        const kvittData: KvittStatus = {
          expensesBack: responseMap.expensesBack,
          lastKvittDate: responseMap.lastKvittDate,
        };
        setKvittStatus(kvittData);
      } else {
        console.error("❌ Kvitt Status API error:", await kvittRes.text());
        setKvittStatus({
          expensesBack: 0,
          lastKvittDate: new Date().toISOString().split("T")[0],
        });
      }

      // --- 3. Hämta ALLA Events ---
      const eventsRes = await fetch(
        `${API_BASE_URL}/getAllEvents?username=${user.username}`,
        fetchOptions
      );

      if (eventsRes.ok) {
        const eventsData = await eventsRes.json();
        const formattedEvents: EventData[] = eventsData.events.map(
          (event: any) => ({
            ...event,
            amount: parseFloat(event.amount),
          })
        );

        // Sortering: Nyast först (Datum > ID)
        formattedEvents.sort((a, b) => {
          const timeA = new Date(a.dateTime).getTime();
          const timeB = new Date(b.dateTime).getTime();
          if (timeB !== timeA) {
            return timeB - timeA;
          }
          return b.id.localeCompare(a.id);
        });

        setEvents(formattedEvents);
      } else {
        console.error("❌ Events API error:", await eventsRes.text());
        setEvents([]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setFinancialData({ totalIncome: 0, totalExpense: 0, balance: 0 });
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddIncome = async () => {
    if (!user) {
      router.push("/login");
      return;
    }

    if (!newIncome.title.trim() || !newIncome.amount.trim()) {
      alert("Vänligen fyll i både titel och belopp");
      return;
    }

    const amount = parseFloat(newIncome.amount);
    if (isNaN(amount) || amount <= 0) {
      alert("Vänligen ange ett giltigt belopp");
      return;
    }

    setIsSubmitting(true);

    try {
      const incomeData = {
        title: newIncome.title,
        amount: amount,
        expense: false,
        paid: true,
        username: user.username,
        accountType: "Vardag",
      };

      // ✅ ÄNDRING: credentials: 'include' istället för Authorization header
      const response = await fetch(`${API_BASE_URL}/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(incomeData),
      });

      if (response.ok) {
        setShowIncomeModal(false);
        setNewIncome({ title: "", amount: "" });
        await fetchData();
      } else {
        const errorText = await response.text();
        alert("Kunde inte lägga till inkomst: " + errorText);
      }
    } catch (error) {
      console.error("❌ Error adding income:", error);
      alert("Ett fel uppstod när inkomsten skulle läggas till");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddExpense = async () => {
    if (!user) {
      router.push("/login");
      return;
    }

    if (!newExpense.title.trim() || !newExpense.amount.trim()) {
      alert("Vänligen fyll i både titel och belopp för utgiften");
      return;
    }

    const amount = parseFloat(newExpense.amount);
    if (isNaN(amount) || amount <= 0) {
      alert("Vänligen ange ett giltigt belopp för utgiften");
      return;
    }

    setIsSubmitting(true);

    try {
      const expenseData = {
        title: newExpense.title,
        amount: amount,
        expense: true,
        paid: false,
        username: user.username,
        accountType: "Vardag",
      };

      // ✅ ÄNDRING: credentials: 'include' istället för Authorization header
      const response = await fetch(`${API_BASE_URL}/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(expenseData),
      });

      if (response.ok) {
        setShowExpenseModal(false);
        setNewExpense({ title: "", amount: "" });
        await fetchData();
      } else {
        const errorText = await response.text();
        alert("Kunde inte lägga till utgift: " + errorText);
      }
    } catch (error) {
      console.error("❌ Error adding expense:", error);
      alert("Ett fel uppstod när utgiften skulle läggas till");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  if (!user) {
    return null;
  }

  const KvittStatusCard = () => {
    if (!kvittStatus) return null;

    const isKvitt = kvittStatus.expensesBack === 0;
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
    } else if (kvittStatus.expensesBack === 1) {
      description = `Du är back 1 utgift.`;
    } else {
      description = `Du är back ${kvittStatus.expensesBack} utgifter.`;
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
              {new Date(kvittStatus.lastKvittDate).toLocaleDateString("sv-SE", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Kvitt</h1>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center text-gray-700">
                <User className="h-5 w-5 mr-2" />
                <span>Hej, {user.username}!</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition duration-200"
              >
                <LogOut className="h-5 w-5 mr-2" />
                Logga ut
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Översikt</h2>
          </div>

          {/* KVITT STATUS KORTET */}
          <div className="mb-8">
            {loading ? (
              <div className="bg-gray-200 h-28 rounded-lg animate-pulse"></div>
            ) : (
              <KvittStatusCard />
            )}
          </div>

          {/* Financial Overview */}
          {loading ? (
            <div className="animate-pulse">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-gray-200 h-32 rounded-lg"></div>
                ))}
              </div>
            </div>
          ) : (
            financialData && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Total Income */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Total Inkomst
                      </p>
                      <p className="text-2xl font-bold text-gray-900 mt-2">
                        {financialData.totalIncome.toLocaleString()} kr
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
                      <p className="text-sm font-medium text-gray-600">
                        Total Utgift
                      </p>
                      <p className="text-2xl font-bold text-gray-900 mt-2">
                        {financialData.totalExpense.toLocaleString()} kr
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
                          financialData.balance >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {financialData.balance.toLocaleString()} kr
                      </p>
                    </div>
                    <div className="bg-blue-100 p-3 rounded-full">
                      <DollarSign className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </div>
              </div>
            )
          )}

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Snabba åtgärder
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <button
                onClick={() => setShowIncomeModal(true)}
                className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition duration-200 text-gray-600 hover:text-blue-700 flex items-center justify-center"
              >
                <Plus className="h-5 w-5 mr-2" />
                Lägg till inkomst
              </button>
              <button
                onClick={() => setShowExpenseModal(true)}
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

          {/* Transaktionshistorik */}
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
        </div>
      </main>

      {/* Income Modal */}
      {showIncomeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Lägg till inkomst
              </h3>
              <button
                onClick={() => setShowIncomeModal(false)}
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
                  value={newIncome.title}
                  onChange={(e) =>
                    setNewIncome({ ...newIncome, title: e.target.value })
                  }
                  placeholder="T.ex. Lön, Arvode, etc."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Belopp (kr) *
                </label>
                <input
                  type="number"
                  value={newIncome.amount}
                  onChange={(e) =>
                    setNewIncome({ ...newIncome, amount: e.target.value })
                  }
                  placeholder="0"
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowIncomeModal(false)}
                className="px-4 py-2 text-gray-700 hover:text-gray-900 border border-gray-300 rounded-lg transition duration-200"
                disabled={isSubmitting}
              >
                Avbryt
              </button>
              <button
                onClick={handleAddIncome}
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Lägger till..." : "Lägg till inkomst"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Expense Modal */}
      {showExpenseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Lägg till utgift
              </h3>
              <button
                onClick={() => setShowExpenseModal(false)}
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
                  value={newExpense.title}
                  onChange={(e) =>
                    setNewExpense({ ...newExpense, title: e.target.value })
                  }
                  placeholder="T.ex. Hyra, Matinköp, Gymkort, etc."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Belopp (kr) *
                </label>
                <input
                  type="number"
                  value={newExpense.amount}
                  onChange={(e) =>
                    setNewExpense({ ...newExpense, amount: e.target.value })
                  }
                  placeholder="0"
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowExpenseModal(false)}
                className="px-4 py-2 text-gray-700 hover:text-gray-900 border border-gray-300 rounded-lg transition duration-200"
                disabled={isSubmitting}
              >
                Avbryt
              </button>
              <button
                onClick={handleAddExpense}
                disabled={isSubmitting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Lägger till..." : "Lägg till utgift"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
