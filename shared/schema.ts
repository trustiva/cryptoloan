import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  decimal,
  text,
  integer,
  boolean,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table - required for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table - required for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Loans table
export const loans = pgTable("loans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  amount: decimal("amount", { precision: 18, scale: 2 }).notNull(),
  currency: varchar("currency").notNull().default("USDT"),
  collateralType: varchar("collateral_type").notNull(),
  collateralAmount: decimal("collateral_amount", { precision: 18, scale: 8 }).notNull(),
  interestRate: decimal("interest_rate", { precision: 5, scale: 2 }).notNull(),
  termDays: integer("term_days").notNull(),
  purpose: varchar("purpose").notNull(),
  status: varchar("status").notNull().default("active"), // active, repaid, defaulted
  monthlyPayment: decimal("monthly_payment", { precision: 18, scale: 2 }).notNull(),
  totalInterest: decimal("total_interest", { precision: 18, scale: 2 }).notNull(),
  totalRepayment: decimal("total_repayment", { precision: 18, scale: 2 }).notNull(),
  nextPaymentDate: timestamp("next_payment_date"),
  dueDate: timestamp("due_date").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Transactions table
export const transactions = pgTable("transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  loanId: varchar("loan_id").references(() => loans.id),
  type: varchar("type").notNull(), // disbursement, payment, collateral_deposit, collateral_release
  amount: decimal("amount", { precision: 18, scale: 2 }).notNull(),
  currency: varchar("currency").notNull(),
  status: varchar("status").notNull().default("completed"), // pending, completed, failed
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  loans: many(loans),
  transactions: many(transactions),
}));

export const loansRelations = relations(loans, ({ one, many }) => ({
  user: one(users, {
    fields: [loans.userId],
    references: [users.id],
  }),
  transactions: many(transactions),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, {
    fields: [transactions.userId],
    references: [users.id],
  }),
  loan: one(loans, {
    fields: [transactions.loanId],
    references: [loans.id],
  }),
}));

// Insert schemas
export const insertLoanSchema = createInsertSchema(loans).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertLoan = z.infer<typeof insertLoanSchema>;
export type Loan = typeof loans.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;
