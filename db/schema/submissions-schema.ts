import { pgTable, timestamp, uuid, real, text, date } from "drizzle-orm/pg-core";
import { users } from "./users-schema";
import { habits } from "./habits-schema";

export const submissions = pgTable("submissions", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id").notNull().references(() => users.id),
  habit_id: uuid("habit_id").notNull().references(() => habits.id),
  submission_date: date("submission_date").notNull(),
  actual_amount: real("actual_amount").notNull(),
  points: real("points").notNull(),
  perceived_rating: text("perceived_rating").notNull(),
  note: text("note"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});