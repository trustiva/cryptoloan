// Extension methods for storage to support admin functionality
import type { IStorage } from '../storage';

declare module '../storage' {
  interface IStorage {
    getAllLoans(): Promise<any[]>;
    getAllUsers(): Promise<any[]>;
    getAllTransactions(): Promise<any[]>;
    getAllLoansWithUsers(): Promise<any[]>;
    getAllUsersWithStats(): Promise<any[]>;
    updateLoanStatus(loanId: string, status: string): Promise<void>;
    suspendUser(userId: string): Promise<void>;
  }
}