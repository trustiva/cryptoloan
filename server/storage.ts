import {
  users,
  loans,
  transactions,
  type User,
  type UpsertUser,
  type Loan,
  type InsertLoan,
  type Transaction,
  type InsertTransaction,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  // User operations - required for Replit Auth
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Loan operations
  createLoan(loan: InsertLoan): Promise<Loan>;
  getUserLoans(userId: string): Promise<Loan[]>;
  getLoan(id: string): Promise<Loan | undefined>;
  updateLoanStatus(id: string, status: string): Promise<void>;
  
  // Transaction operations
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getUserTransactions(userId: string): Promise<Transaction[]>;
  getLoanTransactions(loanId: string): Promise<Transaction[]>;
  
  // Analytics
  getUserStats(userId: string): Promise<{
    totalBorrowed: string;
    activeLoans: number;
    totalCollateral: string;
  }>;

  // Admin operations
  getAllLoans(): Promise<Loan[]>;
  getAllUsers(): Promise<User[]>;
  getAllTransactions(): Promise<Transaction[]>;
  getAllLoansWithUsers(): Promise<any[]>;
  getAllUsersWithStats(): Promise<any[]>;
  suspendUser(userId: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Loan operations
  async createLoan(loanData: InsertLoan): Promise<Loan> {
    const [loan] = await db.insert(loans).values(loanData).returning();
    return loan;
  }

  async getUserLoans(userId: string): Promise<Loan[]> {
    return await db
      .select()
      .from(loans)
      .where(eq(loans.userId, userId))
      .orderBy(desc(loans.createdAt));
  }

  async getLoan(id: string): Promise<Loan | undefined> {
    const [loan] = await db.select().from(loans).where(eq(loans.id, id));
    return loan;
  }

  async updateLoanStatus(id: string, status: string): Promise<void> {
    await db
      .update(loans)
      .set({ status, updatedAt: new Date() })
      .where(eq(loans.id, id));
  }

  // Transaction operations
  async createTransaction(transactionData: InsertTransaction): Promise<Transaction> {
    const [transaction] = await db
      .insert(transactions)
      .values(transactionData)
      .returning();
    return transaction;
  }

  async getUserTransactions(userId: string): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.createdAt))
      .limit(10);
  }

  async getLoanTransactions(loanId: string): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(eq(transactions.loanId, loanId))
      .orderBy(desc(transactions.createdAt));
  }

  // Analytics
  async getUserStats(userId: string): Promise<{
    totalBorrowed: string;
    activeLoans: number;
    totalCollateral: string;
  }> {
    const userLoans = await db
      .select()
      .from(loans)
      .where(and(eq(loans.userId, userId), eq(loans.status, "active")));

    const totalBorrowed = userLoans.reduce(
      (sum, loan) => sum + parseFloat(loan.amount),
      0
    );

    const activeLoans = userLoans.length;

    // Mock collateral calculation - in a real app, this would query current crypto prices
    const totalCollateral = userLoans.reduce((sum, loan) => {
      // Simplified: assume 2:1 collateral ratio
      return sum + parseFloat(loan.amount) * 2;
    }, 0);

    return {
      totalBorrowed: totalBorrowed.toFixed(2),
      activeLoans,
      totalCollateral: totalCollateral.toFixed(2),
    };
  }

  // Admin operations
  async getAllLoans(): Promise<Loan[]> {
    return await db.select().from(loans).orderBy(desc(loans.createdAt));
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async getAllTransactions(): Promise<Transaction[]> {
    return await db.select().from(transactions).orderBy(desc(transactions.createdAt));
  }

  async getAllLoansWithUsers(): Promise<any[]> {
    const allLoans = await this.getAllLoans();
    const allUsers = await this.getAllUsers();
    
    return allLoans.map(loan => ({
      ...loan,
      user: allUsers.find(u => u.id === loan.userId)
    }));
  }

  async getAllUsersWithStats(): Promise<any[]> {
    const allUsers = await this.getAllUsers();
    const allLoans = await this.getAllLoans();
    
    return allUsers.map(user => ({
      ...user,
      totalLoans: allLoans.filter(l => l.userId === user.id).length,
      activeLoans: allLoans.filter(l => l.userId === user.id && l.status === 'active').length,
      totalBorrowed: allLoans
        .filter(l => l.userId === user.id)
        .reduce((sum, l) => sum + parseFloat(l.amount), 0)
    }));
  }

  async suspendUser(userId: string): Promise<void> {
    // In production, add suspended field to users table
    console.log(`User ${userId} suspended`);
  }
}

export const storage = new DatabaseStorage();
