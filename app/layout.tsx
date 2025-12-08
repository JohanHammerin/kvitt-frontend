import { AuthProvider } from "./context/page"; // 👈 Ändra sökvägen här
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
    <html lang="sv">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
