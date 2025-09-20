"use server";

import { db } from "@/db";
import { users } from "@/db/schema/users-schema";
import { eq } from "drizzle-orm";

export async function createOrUpdateUser({
  clerk_id,
  email,
  first_name,
  last_name,
}: {
  clerk_id: string;
  email: string;
  first_name?: string;
  last_name?: string;
}) {
  try {
    // Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.clerk_id, clerk_id))
      .limit(1);

    if (existingUser.length > 0) {
      // Update existing user
      const [updatedUser] = await db
        .update(users)
        .set({
          email,
          first_name,
          last_name,
          updated_at: new Date(),
        })
        .where(eq(users.clerk_id, clerk_id))
        .returning();
      
      console.log("Server Action: User updated successfully");
      return updatedUser;
    } else {
      // Create new user
      const [newUser] = await db
        .insert(users)
        .values({
          clerk_id,
          email,
          first_name,
          last_name,
        })
        .returning();
      
      console.log("Server Action: User created successfully");
      return newUser;
    }
  } catch (error) {
    console.error("Server Action Error (createOrUpdateUser):", error);
    throw new Error("Failed to create or update user.");
  }
}

export async function getUserByClerkId(clerk_id: string) {
  try {
    const user = await db
      .select()
      .from(users)
      .where(eq(users.clerk_id, clerk_id))
      .limit(1);
    
    return user[0] || null;
  } catch (error) {
    console.error("Server Action Error (getUserByClerkId):", error);
    throw new Error("Failed to fetch user.");
  }
}

export async function updateUserNames({
  clerk_id,
  first_name,
  last_name,
}: {
  clerk_id: string;
  first_name: string;
  last_name: string;
}) {
  try {
    const [updatedUser] = await db
      .update(users)
      .set({
        first_name,
        last_name,
        updated_at: new Date(),
      })
      .where(eq(users.clerk_id, clerk_id))
      .returning();

    if (!updatedUser) {
      throw new Error("User not found for update.");
    }
    
    console.log("Server Action: User names updated successfully");
    return updatedUser;
  } catch (error) {
    console.error("Server Action Error (updateUserNames):", error);
    throw new Error("Failed to update user names.");
  }
}