"use client";

import { useAuth } from "./context/AuthContext";
import { useRouter } from "next/navigation";
import { LogOut, User, Bird } from "lucide-react";
import { useState, useEffect } from "react";

import { FinancialOverview } from "./_components/FinancialOverview";
import { KvittStatusCard } from "./_components/KvittStatusCard";
import { QuickActions } from "./_components/QuickActions";
import { TransactionHistory } from "./_components/TransactionHistory";
import { TransactionModal } from "./_components/TransactionModal";
import useSound from "use-sound";

interface EditableEventData extends EventData {}

export default function Home() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [playChirp] = useSound("/bird-song.mp3", { volume: 0.5 });

  const [financialData, setFinancialData] = useState<FinancialData | null>(
    null
  );
  const [kvittStatus, setKvittStatus] = useState<KvittStatus | null>(null);
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);

  const [editingEvent, setEditingEvent] = useState<EditableEventData | null>(
    null
  );

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

  const API_BASE_URL = "https://kvitt.onrender.com/api/v1/event";

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    fetchData();
  }, [user, router]);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);

    try {
      const token = localStorage.getItem("jwtToken");
      const fetchOptions: RequestInit = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
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

        const totalIncome =
          typeof incomeData === "object"
            ? parseFloat(incomeData.totalIncome || 0)
            : parseFloat(incomeData || 0);

        const totalExpense =
          typeof expenseData === "object"
            ? parseFloat(expenseData.totalExpense || 0)
            : parseFloat(expenseData || 0);

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

        let formattedEvents: EventData[] = eventsData.map((event: any) => ({
          ...event,
          amount: parseFloat(event.amount),
        }));

        formattedEvents = formattedEvents.sort((a: EventData, b: EventData) => {
          const dateA = new Date(a.dateTime).getTime();
          const dateB = new Date(b.dateTime).getTime();
          return dateB - dateA;
        });

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

    const isEditing = editingEvent !== null;
    const method = isEditing ? "PUT" : "POST";
    const endpoint = isEditing
      ? `${API_BASE_URL}/edit`
      : `${API_BASE_URL}/create`;

    try {
      const token = localStorage.getItem("jwtToken");
      const transactionData = {
        id: isEditing ? editingEvent?.id : undefined,
        title,
        amount: amount,
        expense: isExpense,
        dateTime: isEditing
          ? editingEvent!.dateTime.length > 10
            ? editingEvent!.dateTime
            : `${editingEvent!.dateTime}T00:00:00`
          : new Date().toISOString(),
        username: user.username,
        accountType: "Vardag",
      };

      const response = await fetch(endpoint, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(transactionData),
      });

      if (response.ok) {
        playChirp();
        handleModalClose();
        await fetchData();
      } else {
        alert(
          `Kunde inte ${isEditing ? "spara ändringen" : "skapa transaktionen"}.`
        );
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    try {
      const token = localStorage.getItem("jwtToken");
      const response = await fetch(`${API_BASE_URL}/delete?id=${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        await fetchData();
      } else {
        alert("Kunde inte ta bort transaktionen.");
      }
    } catch (error) {
      console.error("Fel vid borttagning:", error);
    }
  };

  const handleEditClick = (event: EventData) => {
    const eventWithPaid = event as EditableEventData;
    setEditingEvent(eventWithPaid);

    const amountString = eventWithPaid.amount.toString();
    const data = { title: eventWithPaid.title, amount: amountString };

    if (eventWithPaid.expense) {
      setNewExpense(data);
      setShowExpenseModal(true);
    } else {
      setNewIncome(data);
      setShowIncomeModal(true);
    }
  };

  const handleModalClose = () => {
    setEditingEvent(null);
    setShowIncomeModal(false);
    setShowExpenseModal(false);
    setNewExpense({ title: "", amount: "" });
    setNewIncome({ title: "", amount: "" });
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  if (!user) return null;

  const isEditing = editingEvent !== null;
  const currentModalIsExpense = editingEvent?.expense ?? showExpenseModal;
  const currentModalData = currentModalIsExpense ? newExpense : newIncome;

  const handleInputChange = (
    field: "title" | "amount" | "dateTime",
    value: string
  ) => {
    if (isEditing) {
      setEditingEvent((prev) => ({
        ...prev!,
        [field]: value,
      }));
    }

    if (field === "title" || field === "amount") {
      const updateFunc = currentModalIsExpense ? setNewExpense : setNewIncome;
      updateFunc(
        (prev) =>
          ({
            ...prev,
            [field]: value,
          } as NewExpenseData | NewIncomeData)
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Bird className="h-8 w-8 text-blue-600 mr-3" />
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
            onAddIncome={() => {
              handleModalClose();
              setShowIncomeModal(true);
            }}
            onAddExpense={() => {
              handleModalClose();
              setShowExpenseModal(true);
            }}
          />

          <TransactionHistory
            events={events}
            loading={loading}
            onDelete={handleDeleteEvent}
            onEditClick={handleEditClick}
          />
        </div>
      </main>

      {(showIncomeModal || showExpenseModal || isEditing) && (
        <TransactionModal
          isOpen={true}
          onClose={handleModalClose}
          onSubmit={() =>
            handleTransaction(
              currentModalData.title,
              currentModalData.amount,
              currentModalIsExpense
            )
          }
          isExpense={currentModalIsExpense}
          title={currentModalData.title}
          amount={currentModalData.amount}
          dateTime={editingEvent?.dateTime ?? new Date().toISOString()}
          onTitleChange={(val) => handleInputChange("title", val)}
          onAmountChange={(val) => handleInputChange("amount", val)}
          onDateTimeChange={(val) => handleInputChange("dateTime", val)}
          isSubmitting={isSubmitting}
          isEditing={isEditing}
        />
      )}
    </div>
  );
}
