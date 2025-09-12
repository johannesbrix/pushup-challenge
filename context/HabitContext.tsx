"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useUser } from '@clerk/nextjs';
import { getUserByClerkId } from '@/actions/users-actions';
import { getHabitsByUserId } from '@/actions/habits-actions';

type HabitData = {
  habitName: string;
  habitUnit: string;
  dailyGoal: string;
};

type HabitContextType = {
  habitData: HabitData;
  updateHabit: (data: HabitData) => void;
  isLoading: boolean;
};

const HabitContext = createContext<HabitContextType | undefined>(undefined);

export function HabitProvider({ children }: { children: ReactNode }) {
  const { user, isSignedIn } = useUser();
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoadedFromDB, setHasLoadedFromDB] = useState(false); // NEW: Track if we've loaded
  const [habitData, setHabitData] = useState<HabitData>({
    habitName: "reading",
    habitUnit: "minutes", 
    dailyGoal: "30"
  });

  // Load user's habit from database ONLY ONCE when they first sign in
  useEffect(() => {
    async function loadHabitFromDatabase() {
      // Don't load if we already loaded, or if user not signed in
      if (hasLoadedFromDB || !isSignedIn || !user) {
        setIsLoading(false);
        return;
      }

      try {
        const dbUser = await getUserByClerkId(user.id);
        if (dbUser) {
          const habits = await getHabitsByUserId(dbUser.id);
          if (habits.length > 0) {
            const habit = habits[0];
            setHabitData({
              habitName: habit.name,
              habitUnit: habit.unit,
              dailyGoal: habit.daily_goal.toString(),
            });
          }
        }
      } catch (error) {
        console.error('Failed to load habit from database:', error);
      } finally {
        setIsLoading(false);
        setHasLoadedFromDB(true); // Mark as loaded so we don't load again
      }
    }

    loadHabitFromDatabase();
  }, [isSignedIn, user, hasLoadedFromDB]);

  const updateHabit = (data: HabitData) => {
    setHabitData(data);
  };

  return (
    <HabitContext.Provider value={{ habitData, updateHabit, isLoading }}>
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