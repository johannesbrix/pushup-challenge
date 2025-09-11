import type { Metadata } from "next";
import { HabitProvider } from "@/context/HabitContext";
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
    <html lang="en">
      <body>
        <HabitProvider>
          {children}
        </HabitProvider>
      </body>
    </html>
  );
}
