import { AuthProvider } from "./context/AuthContext";
import "./globals.css";

export const metadata = {
  title: "Kvitt - Din ekonomi",
  description: "Hantera din ekonomi enkelt",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="sv" className="light" style={{ colorScheme: "light" }}>
      <head>
        {/* Tvingar mobila webbläsare att endast använda ljust läge */}
        <meta name="color-scheme" content="light only" />
      </head>
      <body className="bg-white text-black antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
