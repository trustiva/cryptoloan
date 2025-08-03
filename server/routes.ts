import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { generalLimiter, authLimiter, loanApplicationLimiter, paymentLimiter } from "./middleware/rateLimiter";
import { performance } from "./middleware/performanceMonitor";
import { registerAdminRoutes } from "./routes/adminRoutes";
import { insertLoanSchema, insertTransactionSchema } from "@shared/schema";
import { z } from "zod";
import { CRYPTO_PRICES, calculateLoanMetrics } from "./cryptoService";

const loanApplicationSchema = insertLoanSchema.extend({
  amount: z.number().min(100).max(100000),
  termDays: z.number().min(30).max(365),
  collateralAmount: z.number().min(0.001),
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Performance monitoring middleware
  app.use(performance.middleware());
  
  // General rate limiting
  app.use(generalLimiter.middleware());
  
  // Auth middleware
  await setupAuth(app);

  // Auth routes with rate limiting
  app.get('/api/auth/user', authLimiter.middleware(), isAuthenticated, async (req: any, res) => {
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
  app.post('/api/loans', loanApplicationLimiter.middleware(), isAuthenticated, async (req: any, res) => {
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

  app.get('/api/loans/:loanId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { loanId } = req.params;
      const loan = await storage.getLoan(loanId);
      
      if (!loan || loan.userId !== userId) {
        return res.status(404).json({ message: "Loan not found" });
      }
      
      res.json(loan);
    } catch (error) {
      console.error("Error fetching loan:", error);
      res.status(500).json({ message: "Failed to fetch loan" });
    }
  });

  app.get('/api/loans/:loanId/transactions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { loanId } = req.params;
      const loan = await storage.getLoan(loanId);
      
      if (!loan || loan.userId !== userId) {
        return res.status(404).json({ message: "Loan not found" });
      }
      
      const transactions = await storage.getLoanTransactions(loanId);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching loan transactions:", error);
      res.status(500).json({ message: "Failed to fetch loan transactions" });
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

  // Payment simulation route with rate limiting
  app.post('/api/loans/:loanId/payment', paymentLimiter.middleware(), isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { loanId } = req.params;
      const { amount } = req.body;

      // Enhanced validation
      if (!amount || isNaN(amount) || amount <= 0) {
        return res.status(400).json({ message: "Invalid payment amount" });
      }

      if (amount > 100000) {
        return res.status(400).json({ message: "Payment amount exceeds maximum limit" });
      }

      // Verify loan ownership and status
      const loan = await storage.getLoan(loanId);
      if (!loan || loan.userId !== userId) {
        return res.status(404).json({ message: "Loan not found" });
      }

      if (loan.status !== "active") {
        return res.status(400).json({ message: "Cannot make payment on inactive loan" });
      }

      // Calculate remaining balance
      const existingPayments = await storage.getLoanTransactions(loanId);
      const totalPaid = existingPayments
        .filter(t => t.type === "payment")
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
      
      const totalOwed = parseFloat(loan.totalRepayment);
      const remainingBalance = totalOwed - totalPaid;

      if (amount > remainingBalance + 0.01) { // Allow small rounding differences
        return res.status(400).json({ 
          message: `Payment amount ($${amount}) exceeds remaining balance ($${remainingBalance.toFixed(2)})` 
        });
      }

      // Create payment transaction with enhanced details
      const transaction = await storage.createTransaction({
        userId,
        loanId,
        type: "payment",
        amount: amount.toString(),
        currency: loan.currency,
        status: "completed",
      });

      // Check if loan is fully paid
      const newRemainingBalance = remainingBalance - amount;
      if (newRemainingBalance <= 0.01) {
        await storage.updateLoanStatus(loanId, "completed");
      }

      res.json({ 
        message: "Payment processed successfully",
        transaction,
        remainingBalance: Math.max(0, newRemainingBalance),
        loanStatus: newRemainingBalance <= 0.01 ? "completed" : "active"
      });
    } catch (error) {
      console.error("Error processing payment:", error);
      res.status(500).json({ message: "Failed to process payment" });
    }
  });

  // Register admin routes
  registerAdminRoutes(app);

  const httpServer = createServer(app);
  return httpServer;
}
