"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import {
  Eye,
  EyeOff,
  User as UserIcon,
  Lock,
  Bird,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const success = await login(username, password);

    if (success) {
      router.push("/");
    } else {
      setError(
        "Inloggning misslyckades. Kontrollera användarnamn och lösenord."
      );
    }
    setIsLoading(false);
  };

  return (
    // Lagt till en snygg gradient bakgrund som matchar din app
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-blue-100 via-white to-gray-100 flex items-center justify-center p-4">
      {/* Container med samma design-språk som dina modaler */}
      <div className="max-w-md w-full bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-10 border border-white/20 animate-in fade-in zoom-in duration-300">
        <div className="text-center mb-10">
          <div className="flex justify-center mb-4">
            <Bird className="h-14 w-14 text-blue-600 drop-shadow-sm" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">
            Välkommen till Kvitt
          </h1>
          <p className="text-gray-500 font-medium">
            Logga in för att hantera din ekonomi
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-red-50/50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium animate-shake">
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
                className="w-full pl-12 pr-4 py-3 bg-white/50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="Ditt användarnamn"
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
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-12 py-3 bg-white/50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="Ditt lösenord"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-4 px-4 rounded-2xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 hover:shadow-blue-300 transform transition duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-4"
          >
            {isLoading ? "Loggar in..." : "Logga in"}
          </button>
        </form>

        {/* HÄR ÄR DEN NYA SEKTIONEN FÖR ATT SKAPA KONTO */}
        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <p className="text-gray-600 mb-3">Har du inget konto än?</p>
          <Link
            href="/register"
            className="inline-flex items-center text-blue-600 font-black hover:text-blue-700 transition-colors group"
          >
            Skapa ett konto här
            <ArrowRight className="h-4 w-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}
