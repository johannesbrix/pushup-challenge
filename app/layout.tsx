import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { HabitProvider } from "@/context/HabitContext";
import AuthGuard from "@/components/AuthGuard";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pushup Challenge",
  description: "Track your daily habits with friends",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          <AuthGuard>
            <HabitProvider>
              {children}
            </HabitProvider>
          </AuthGuard>
        </body>
      </html>
    </ClerkProvider>
  );
}
