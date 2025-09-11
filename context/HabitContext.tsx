"use client";

import { createContext, useContext, useState, ReactNode } from 'react';

type HabitData = {
  habitName: string;
  habitUnit: string;
  dailyGoal: string;
};

type HabitContextType = {
  habitData: HabitData;
  updateHabit: (data: HabitData) => void;
};

const HabitContext = createContext<HabitContextType | undefined>(undefined);

export function HabitProvider({ children }: { children: ReactNode }) {
  const [habitData, setHabitData] = useState<HabitData>({
    habitName: "reading",
    habitUnit: "minutes", 
    dailyGoal: "30"
  });

  const updateHabit = (data: HabitData) => {
    setHabitData(data);
  };

  return (
    <HabitContext.Provider value={{ habitData, updateHabit }}>
      {children}
    </HabitContext.Provider>
  );
}

export function useHabit() {
  const context = useContext(HabitContext);
  if (!context) {
    throw new Error('useHabit must be used within HabitProvider');
  }
  return context;
}