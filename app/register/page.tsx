"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bird,
  ArrowLeft,
  User as UserIcon,
  Lock,
  UserPlus,
} from "lucide-react";
import Link from "next/link";

export default function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Lösenorden matchar inte.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        "http://localhost:8080/api/v1/kvittUser/create",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        }
      );

      if (response.ok) {
        // Om backend skapar användaren framgångsrikt
        router.push("/login?registered=true");
      } else {
        const data = await response.json();
        setError(
          data.message ||
            "Kunde inte skapa konto. Användarnamnet kan vara upptaget."
        );
      }
    } catch (err) {
      setError("Ett nätverksfel uppstod. Kontrollera att din backend körs.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-blue-100 via-white to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-10 border border-white/20 animate-in fade-in zoom-in duration-300">
        <div className="text-center mb-10">
          <div className="flex justify-center mb-4">
            <Bird className="h-14 w-14 text-blue-600 drop-shadow-sm" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">
            Gå med i Kvitt
          </h1>
          <p className="text-gray-500 font-medium">
            Skapa ett konto för att få koll på kvitton
          </p>
        </div>

        <form onSubmit={handleRegister} className="space-y-5">
          {error && (
            <div className="bg-red-50/50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">
              Användarnamn
            </label>
            <div className="relative">
              <UserIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="Välj ett användarnamn"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">
              Lösenord
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="Välj ett lösenord"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">
              Bekräfta lösenord
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="Upprepa ditt lösenord"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-4 px-4 rounded-2xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition duration-200 active:scale-[0.98] disabled:opacity-50 mt-4 flex items-center justify-center"
          >
            <UserPlus className="h-5 w-5 mr-2" />
            {isLoading ? "Skapar konto..." : "Registrera konto"}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <Link
            href="/login"
            className="inline-flex items-center text-gray-500 font-bold hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Tillbaka till logga in
          </Link>
        </div>
      </div>
    </div>
  );
}
