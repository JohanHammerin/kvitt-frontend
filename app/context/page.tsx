"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Failed to parse user from local storage", e);
        localStorage.removeItem("user");
      }
    }
    setLoading(false);
  }, []);

  const login = async (
    username: string,
    password: string
  ): Promise<boolean> => {
    try {
      console.log("🔐 Attempting login with:", { username });

      const response = await fetch(
        "http://localhost:8080/api/v1/kvittUser/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          // ✅ VIKTIGT: Detta säger åt webbläsaren att hantera cookies (både skicka och ta emot)
          credentials: "include",
          body: JSON.stringify({ username, password }),
        }
      );

      console.log("📡 Response status:", response.status);

      if (response.ok) {
        // Vi läser svaret som JSON
        const userData = await response.json();
        console.log("✅ Login successful, backend response:", userData);

        // ✅ ÄNDRING: Vi letar inte efter token längre.
        // Om status är 200 OK så har webbläsaren sparat kakan automatiskt.

        const user: User = {
          username: userData.username,
        };

        setUser(user);
        // Vi sparar bara användarnamnet i localStorage för att minnas att vi är inloggade
        localStorage.setItem("user", JSON.stringify(user));

        return true;
      } else {
        // Hantera fel
        const errorText = await response.text();
        console.error("❌ Login failed:", response.status, errorText);
        return false;
      }
    } catch (error) {
      console.error("❌ Login network error:", error);
      return false;
    }
  };

  const logout = () => {
    // OBS: För att logga ut "på riktigt" med cookies borde man också
    // anropa en endpoint på backend (t.ex. /logout) som rensar kakan.
    // Men för nu rensar vi bara klientens state.
    setUser(null);
    localStorage.removeItem("user");

    // (Valfritt) Tvinga en omladdning eller navigering till login kan behövas
    // om kakan ligger kvar, men eftersom vi kollar `if (!user)` i komponenterna
    // så fungerar detta oftast bra ändå.
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
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
