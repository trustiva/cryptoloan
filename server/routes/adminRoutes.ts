import { Express } from "express";
import { isAuthenticated } from "../replitAuth";
import { storage } from "../storage";
import { strictLimiter } from "../middleware/rateLimiter";

// Admin role check middleware
const isAdmin = async (req: any, res: any, next: any) => {
  const user = await storage.getUser(req.user.claims.sub);
  
  // In production, implement proper role-based access control
  const isAdminUser = user?.email?.includes("admin") || user?.email?.endsWith("replit.com");
  
  if (!isAdminUser) {
    return res.status(403).json({ message: "Access denied. Admin privileges required." });
  }
  
  next();
};

export function registerAdminRoutes(app: Express) {
  // Admin stats endpoint
  app.get('/api/admin/stats', strictLimiter.middleware(), isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const allLoans = await storage.getAllLoans();
      const allUsers = await storage.getAllUsers();
      const allTransactions = await storage.getAllTransactions();

      const stats = {
        totalUsers: allUsers.length,
        activeLoans: allLoans.filter(loan => loan.status === 'active').length,
        totalVolume: allLoans.reduce((sum, loan) => sum + parseFloat(loan.amount), 0),
        defaultRate: (allLoans.filter(loan => loan.status === 'defaulted').length / allLoans.length) * 100 || 0,
        platformRevenue: allTransactions
          .filter(t => t.type === 'fee')
          .reduce((sum, t) => sum + parseFloat(t.amount), 0),
        pendingApplications: allLoans.filter(loan => loan.status === 'pending').length
      };

      res.json(stats);
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Failed to fetch admin statistics" });
    }
  });

  // Admin loans endpoint
  app.get('/api/admin/loans', strictLimiter.middleware(), isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const allLoans = await storage.getAllLoansWithUsers();
      res.json(allLoans);
    } catch (error) {
      console.error("Error fetching admin loans:", error);
      res.status(500).json({ message: "Failed to fetch loans data" });
    }
  });

  // Admin users endpoint
  app.get('/api/admin/users', strictLimiter.middleware(), isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const allUsers = await storage.getAllUsersWithStats();
      res.json(allUsers);
    } catch (error) {
      console.error("Error fetching admin users:", error);
      res.status(500).json({ message: "Failed to fetch users data" });
    }
  });

  // Approve loan endpoint
  app.post('/api/admin/loans/:loanId/approve', strictLimiter.middleware(), isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { loanId } = req.params;
      await storage.updateLoanStatus(loanId, 'active');
      
      // Log admin action
      console.log(`Admin ${req.user.claims.sub} approved loan ${loanId}`);
      
      res.json({ message: "Loan approved successfully" });
    } catch (error) {
      console.error("Error approving loan:", error);
      res.status(500).json({ message: "Failed to approve loan" });
    }
  });

  // Reject loan endpoint
  app.post('/api/admin/loans/:loanId/reject', strictLimiter.middleware(), isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { loanId } = req.params;
      await storage.updateLoanStatus(loanId, 'rejected');
      
      // Log admin action
      console.log(`Admin ${req.user.claims.sub} rejected loan ${loanId}`);
      
      res.json({ message: "Loan rejected successfully" });
    } catch (error) {
      console.error("Error rejecting loan:", error);
      res.status(500).json({ message: "Failed to reject loan" });
    }
  });

  // Suspend user endpoint
  app.post('/api/admin/users/:userId/suspend', strictLimiter.middleware(), isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { userId } = req.params;
      await storage.suspendUser(userId);
      
      // Log admin action
      console.log(`Admin ${req.user.claims.sub} suspended user ${userId}`);
      
      res.json({ message: "User suspended successfully" });
    } catch (error) {
      console.error("Error suspending user:", error);
      res.status(500).json({ message: "Failed to suspend user" });
    }
  });

  // Performance metrics endpoint
  app.get('/api/admin/performance', strictLimiter.middleware(), isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { performance } = await import("../middleware/performanceMonitor");
      const metrics = performance.getSummary();
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching performance metrics:", error);
      res.status(500).json({ message: "Failed to fetch performance metrics" });
    }
  });
}