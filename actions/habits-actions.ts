"use server";

import { db } from "@/db";
import { habits } from "@/db/schema/habits-schema";
import { eq } from "drizzle-orm";

export async function createHabit({
  user_id,
  name,
  unit,
  daily_goal,
}: {
  user_id: string;
  name: string;
  unit: string;
  daily_goal: number;
}) {
  try {
    console.log("Server Action: Creating habit...");
    
    const [newHabit] = await db
      .insert(habits)
      .values({
        user_id,
        name,
        unit,
        daily_goal,
      })
      .returning();
    
    console.log("Server Action: Habit created:", newHabit);
    return newHabit;
  } catch (error) {
    console.error("Server Action Error (createHabit):", error);
    throw new Error("Failed to create habit.");
  }
}

export async function getHabitsByUserId(user_id: string) {
  try {
    const userHabits = await db
      .select()
      .from(habits)
      .where(eq(habits.user_id, user_id));
    
    console.log(`Server Action: Fetched ${userHabits.length} habits for user`);
    return userHabits;
  } catch (error) {
    console.error("Server Action Error (getHabitsByUserId):", error);
    throw new Error("Failed to fetch habits.");
  }
}

export async function updateHabit({
  id,
  name,
  unit,
  daily_goal,
}: {
  id: string;
  name: string;
  unit: string;
  daily_goal: number;
}) {
  try {
    console.log("Server Action: Updating habit...");
    
    const [updatedHabit] = await db
      .update(habits)
      .set({
        name,
        unit,
        daily_goal,
        updated_at: new Date(),
      })
      .where(eq(habits.id, id))
      .returning();

    if (!updatedHabit) {
      throw new Error("Habit not found for update.");
    }
    
    console.log("Server Action: Habit updated:", updatedHabit);
    return updatedHabit;
  } catch (error) {
    console.error("Server Action Error (updateHabit):", error);
    throw new Error("Failed to update habit.");
  }
}