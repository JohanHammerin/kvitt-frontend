"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Hanterar applikationens autentiseringstillstånd.
 * Använder HttpOnly-cookies för säker tokenlagring och localStorage för att persistera användardata i UI:t.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Återställ användarsessionen från localStorage vid start
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Kunde inte parsa användardata", e);
        localStorage.removeItem("user");
      }
    }
    setLoading(false);
  }, []);

  /**
   * Autentiserar användaren mot backend.
   */
  const login = async (
    username: string,
    password: string
  ): Promise<boolean> => {
    try {
      console.log("🔐 Autentiserar användare:", { username });

      // TODO: Byt ut hårdkodad URL mot miljövariabel i produktion
      const response = await fetch(
        "https://kvitt.onrender.com/api/v1/kvittUser/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // Krävs för att ta emot och skicka HttpOnly-cookies
          body: JSON.stringify({ username, password }),
        }
      );

      console.log("📡 Serverstatus:", response.status);

      if (response.ok) {
        const userData = await response.json();

        const user: User = {
          username: userData.username,
        };

        // Uppdatera state och localStorage. JWT hanteras automatiskt via kakan.
        setUser(user);
        localStorage.setItem("user", JSON.stringify(user));

        return true;
      } else {
        const errorText = await response.text();
        console.error(
          "❌ Inloggning misslyckades:",
          response.status,
          errorText
        );
        return false;
      }
    } catch (error) {
      console.error("❌ Nätverksfel vid inloggning:", error);
      return false;
    }
  };

  /**
   * Loggar ut användaren genom att rensa lokalt tillstånd.
   * Obs: För fullständig utloggning bör kakan även rensas via ett anrop till backend.
   */
  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth måste användas inom en AuthProvider");
  }
  return context;
}
