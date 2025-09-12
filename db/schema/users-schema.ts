import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  clerk_id: text("clerk_id").notNull().unique(),
  email: text("email").notNull(),
  first_name: text("first_name"),
  last_name: text("last_name"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});