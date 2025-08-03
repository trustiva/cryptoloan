import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertLoanSchema, insertTransactionSchema } from "@shared/schema";
import { z } from "zod";
import { CRYPTO_PRICES, calculateLoanMetrics } from "./cryptoService";

const loanApplicationSchema = insertLoanSchema.extend({
  amount: z.number().min(100).max(100000),
  termDays: z.number().min(30).max(365),
  collateralAmount: z.number().min(0.001),
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Get crypto prices endpoint
  app.get('/api/crypto-prices', (req, res) => {
    res.json(CRYPTO_PRICES);
  });

  // Loan routes
  app.post('/api/loans', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = loanApplicationSchema.parse(req.body);
      
      // Calculate loan metrics using the crypto service
      const metrics = calculateLoanMetrics(
        validatedData.amount,
        validatedData.collateralAmount,
        validatedData.collateralType as keyof typeof CRYPTO_PRICES,
        validatedData.termDays,
        parseFloat(validatedData.interestRate)
      );
      
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + validatedData.termDays);
      
      const nextPaymentDate = new Date();
      nextPaymentDate.setDate(nextPaymentDate.getDate() + 30);

      const loanData = {
        ...validatedData,
        userId,
        amount: validatedData.amount.toString(),
        collateralAmount: validatedData.collateralAmount.toString(),
        monthlyPayment: metrics.monthlyPayment.toFixed(2),
        totalInterest: metrics.totalInterest.toFixed(2),
        totalRepayment: metrics.totalRepayment.toFixed(2),
        dueDate,
        nextPaymentDate,
      };

      const loan = await storage.createLoan(loanData);

      // Create disbursement transaction
      await storage.createTransaction({
        userId,
        loanId: loan.id,
        type: "disbursement",
        amount: validatedData.amount.toString(),
        currency: validatedData.currency || "USDT",
        status: "completed",
      });

      // Create collateral deposit transaction
      await storage.createTransaction({
        userId,
        loanId: loan.id,
        type: "collateral_deposit",
        amount: validatedData.collateralAmount.toString(),
        currency: validatedData.collateralType,
        status: "completed",
      });

      res.json(loan);
    } catch (error) {
      console.error("Error creating loan:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid loan data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create loan" });
      }
    }
  });

  app.get('/api/loans', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const loans = await storage.getUserLoans(userId);
      res.json(loans);
    } catch (error) {
      console.error("Error fetching loans:", error);
      res.status(500).json({ message: "Failed to fetch loans" });
    }
  });

  // Transaction routes
  app.get('/api/transactions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const transactions = await storage.getUserTransactions(userId);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  // Analytics routes
  app.get('/api/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const stats = await storage.getUserStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Payment simulation route
  app.post('/api/loans/:loanId/payment', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { loanId } = req.params;
      const { amount } = req.body;

      const loan = await storage.getLoan(loanId);
      if (!loan || loan.userId !== userId) {
        return res.status(404).json({ message: "Loan not found" });
      }

      // Create payment transaction
      await storage.createTransaction({
        userId,
        loanId,
        type: "payment",
        amount: amount.toString(),
        currency: loan.currency,
        status: "completed",
      });

      res.json({ message: "Payment processed successfully" });
    } catch (error) {
      console.error("Error processing payment:", error);
      res.status(500).json({ message: "Failed to process payment" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
