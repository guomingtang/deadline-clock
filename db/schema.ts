import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const conferences = sqliteTable("conferences", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  field: text("field").notNull(),
  deadline: text("deadline"),
  abstractDeadline: text("abstract_deadline"),
  timezone: text("timezone"),
  sourceName: text("source_name"),
  sourceUrl: text("source_url"),
  deadlineStatus: text("deadline_status").notNull().default("pending"),
  manuallyOverridden: integer("manually_overridden", { mode: "boolean" }).notNull().default(false),
  lastCheckedAt: text("last_checked_at"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});
