import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, json, boolean, decimal } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Subscribers table
export const subscribers = mysqlTable("subscribers", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  name: varchar("name", { length: 255 }),
  status: mysqlEnum("status", ["active", "unsubscribed", "bounced"]).default("active").notNull(),
  tags: json("tags").$type<string[]>().default([]),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Subscriber = typeof subscribers.$inferSelect;
export type InsertSubscriber = typeof subscribers.$inferInsert;

// Segments table
export const segments = mysqlTable("segments", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  filterRules: json("filterRules").$type<Array<{ field: string; operator: string; value: string }>>().default([]),
  subscriberCount: int("subscriberCount").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Segment = typeof segments.$inferSelect;
export type InsertSegment = typeof segments.$inferInsert;

// Email Templates table
export const emailTemplates = mysqlTable("emailTemplates", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  subject: varchar("subject", { length: 255 }),
  blocks: json("blocks").$type<Array<any>>().default([]),
  isPrebuilt: boolean("isPrebuilt").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type EmailTemplate = typeof emailTemplates.$inferSelect;
export type InsertEmailTemplate = typeof emailTemplates.$inferInsert;

// Campaigns table
export const campaigns = mysqlTable("campaigns", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  subject: varchar("subject", { length: 255 }),
  blocks: json("blocks").$type<Array<any>>().default([]),
  status: mysqlEnum("status", ["draft", "scheduled", "sent"]).default("draft").notNull(),
  segmentId: int("segmentId"),
  subscriberCount: int("subscriberCount").default(0),
  scheduledAt: timestamp("scheduledAt"),
  sentAt: timestamp("sentAt"),
  openRate: decimal("openRate", { precision: 5, scale: 2 }).default("0"),
  clickRate: decimal("clickRate", { precision: 5, scale: 2 }).default("0"),
  openCount: int("openCount").default(0),
  clickCount: int("clickCount").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Campaign = typeof campaigns.$inferSelect;
export type InsertCampaign = typeof campaigns.$inferInsert;

// Email Blocks table (for builder)
export const emailBlocks = mysqlTable("emailBlocks", {
  id: int("id").autoincrement().primaryKey(),
  campaignId: int("campaignId"),
  templateId: int("templateId"),
  type: mysqlEnum("type", ["text", "image", "button", "divider"]).notNull(),
  content: json("content").$type<Record<string, any>>().default({}),
  order: int("order").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type EmailBlock = typeof emailBlocks.$inferSelect;
export type InsertEmailBlock = typeof emailBlocks.$inferInsert;

// Analytics table for tracking opens and clicks
export const emailAnalytics = mysqlTable("emailAnalytics", {
  id: int("id").autoincrement().primaryKey(),
  campaignId: int("campaignId").notNull(),
  subscriberId: int("subscriberId").notNull(),
  opened: boolean("opened").default(false),
  openedAt: timestamp("openedAt"),
  clicked: boolean("clicked").default(false),
  clickedAt: timestamp("clickedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type EmailAnalytic = typeof emailAnalytics.$inferSelect;
export type InsertEmailAnalytic = typeof emailAnalytics.$inferInsert;
