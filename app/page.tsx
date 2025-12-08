"use client";

import { useAuth } from "./context/page";
import { useRouter } from "next/navigation";
import { LogOut, User, Calendar } from "lucide-react";
import { useState, useEffect } from "react";
import { FinancialOverview } from "./_components/FinancialOverview";
import { KvittStatusCard } from "./_components/KvittStatusCard";
import { QuickActions } from "./_components/QuickActions";
import { TransactionHistory } from "./_components/TransactionHistory";
import { TransactionModal } from "./_components/TransactionModal";

// Importera våra nya komponenter

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
      const fetchOptions: RequestInit = {
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      };

      const [incomeRes, expenseRes, kvittRes, eventsRes] = await Promise.all([
        fetch(
          `${API_BASE_URL}/getTotalIncome?username=${user.username}`,
          fetchOptions
        ),
        fetch(
          `${API_BASE_URL}/getTotalExpense?username=${user.username}`,
          fetchOptions
        ),
        fetch(
          `${API_BASE_URL}/getKvittStatus?username=${user.username}`,
          fetchOptions
        ),
        fetch(
          `${API_BASE_URL}/getAllEvents?username=${user.username}`,
          fetchOptions
        ),
      ]);

      if (incomeRes.ok && expenseRes.ok) {
        const incomeData = await incomeRes.json();
        const expenseData = await expenseRes.json();
        const totalIncome = parseFloat(incomeData.totalIncome || 0);
        const totalExpense = parseFloat(expenseData.totalExpense || 0);
        setFinancialData({
          totalIncome,
          totalExpense,
          balance: totalIncome - totalExpense,
        });
      }

      if (kvittRes.ok) {
        const responseMap = await kvittRes.json();
        setKvittStatus({
          expensesBack: responseMap.expensesBack,
          lastKvittDate: responseMap.lastKvittDate,
        });
      }

      if (eventsRes.ok) {
        const eventsData = await eventsRes.json();
        const formattedEvents = eventsData.events.map((event: any) => ({
          ...event,
          amount: parseFloat(event.amount),
        }));
        setEvents(formattedEvents);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTransaction = async (
    title: string,
    amountString: string,
    isExpense: boolean
  ) => {
    if (!user) return;

    if (!title.trim() || !amountString.trim()) {
      alert("Vänligen fyll i både titel och belopp");
      return;
    }

    const amount = parseFloat(amountString);
    if (isNaN(amount) || amount <= 0) {
      alert("Vänligen ange ett giltigt belopp");
      return;
    }

    setIsSubmitting(true);

    try {
      const transactionData = {
        title,
        amount,
        expense: isExpense,
        paid: !isExpense,
        username: user.username,
        accountType: "Vardag",
      };

      const response = await fetch(`${API_BASE_URL}/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(transactionData),
      });

      if (response.ok) {
        if (isExpense) {
          setShowExpenseModal(false);
          setNewExpense({ title: "", amount: "" });
        } else {
          setShowIncomeModal(false);
          setNewIncome({ title: "", amount: "" });
        }
        await fetchData();
      } else {
        alert("Kunde inte spara transaktionen.");
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  if (!user) return null;

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

          <div className="mb-8">
            {loading ? (
              <div className="bg-gray-200 h-28 rounded-lg animate-pulse"></div>
            ) : (
              <KvittStatusCard status={kvittStatus} />
            )}
          </div>

          {loading ? (
            <div className="animate-pulse bg-gray-200 h-32 rounded-lg mb-8"></div>
          ) : (
            <FinancialOverview data={financialData} />
          )}

          <QuickActions
            onAddIncome={() => setShowIncomeModal(true)}
            onAddExpense={() => setShowExpenseModal(true)}
          />

          <TransactionHistory events={events} loading={loading} />
        </div>
      </main>

      <TransactionModal
        isOpen={showIncomeModal}
        onClose={() => setShowIncomeModal(false)}
        onSubmit={() =>
          handleTransaction(newIncome.title, newIncome.amount, false)
        }
        isExpense={false}
        title={newIncome.title}
        amount={newIncome.amount}
        onTitleChange={(val: any) => setNewIncome({ ...newIncome, title: val })}
        onAmountChange={(val: any) =>
          setNewIncome({ ...newIncome, amount: val })
        }
        isSubmitting={isSubmitting}
      />

      <TransactionModal
        isOpen={showExpenseModal}
        onClose={() => setShowExpenseModal(false)}
        onSubmit={() =>
          handleTransaction(newExpense.title, newExpense.amount, true)
        }
        isExpense={true}
        title={newExpense.title}
        amount={newExpense.amount}
        onTitleChange={(val: any) =>
          setNewExpense({ ...newExpense, title: val })
        }
        onAmountChange={(val: any) =>
          setNewExpense({ ...newExpense, amount: val })
        }
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
