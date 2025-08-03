import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  DollarSign, 
  CheckCircle, 
  TrendingUp, 
  BarChart3,
  Plus
} from "lucide-react";
import StatCard from "@/components/ui/stat-card";
import LoanCard from "@/components/ui/loan-card";
import LoanApplicationModal from "@/components/loan-application-modal";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function Dashboard() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [showLoanModal, setShowLoanModal] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, authLoading, toast]);

  // Fetch user stats
  const { data: stats, isLoading: statsLoading } = useQuery<{
    totalBorrowed: string;
    activeLoans: number;
    totalCollateral: string;
  }>({
    queryKey: ["/api/stats"],
    enabled: isAuthenticated,
    retry: false,
  });

  // Fetch loans
  const { data: loans = [], isLoading: loansLoading } = useQuery<any[]>({
    queryKey: ["/api/loans"],
    enabled: isAuthenticated,
    retry: false,
  });

  // Fetch transactions
  const { data: transactions = [], isLoading: transactionsLoading } = useQuery<any[]>({
    queryKey: ["/api/transactions"],
    enabled: isAuthenticated,
    retry: false,
  });

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  const userName = (user as any)?.firstName && (user as any)?.lastName 
    ? `${(user as any).firstName} ${(user as any).lastName}`
    : (user as any)?.email || "User";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
              <p className="text-muted-foreground">Welcome back, {userName}</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button onClick={() => setShowLoanModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Apply for Loan
              </Button>
              <Button variant="ghost" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Borrowed"
            value={statsLoading ? "Loading..." : `$${stats?.totalBorrowed || "0.00"}`}
            icon={DollarSign}
            iconColor="text-primary"
            iconBg="bg-primary/10"
          />
          <StatCard
            title="Active Loans"
            value={statsLoading ? "Loading..." : stats?.activeLoans?.toString() || "0"}
            icon={CheckCircle}
            iconColor="text-secondary"
            iconBg="bg-secondary/10"
          />
          <StatCard
            title="Total Collateral"
            value={statsLoading ? "Loading..." : `$${stats?.totalCollateral || "0.00"}`}
            icon={TrendingUp}
            iconColor="text-accent"
            iconBg="bg-accent/10"
          />
          <StatCard
            title="Credit Score"
            value="785"
            icon={BarChart3}
            iconColor="text-purple-600"
            iconBg="bg-purple-100"
          />
        </div>

        {/* Active Loans and Quick Apply */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Active Loans */}
          <Card>
            <CardHeader>
              <CardTitle>Active Loans</CardTitle>
            </CardHeader>
            <CardContent>
              {loansLoading ? (
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="animate-pulse border border-border rounded-lg p-4">
                      <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : loans.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No active loans</p>
                  <Button 
                    className="mt-4" 
                    onClick={() => setShowLoanModal(true)}
                  >
                    Apply for your first loan
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {loans.map((loan: any) => (
                    <LoanCard key={loan.id} loan={loan} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Apply Card */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Apply</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <DollarSign className="w-16 h-16 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Need a loan?</h3>
                <p className="text-muted-foreground mb-4">
                  Get instant access to funds using your crypto as collateral
                </p>
                <Button 
                  size="lg" 
                  onClick={() => setShowLoanModal(true)}
                  className="w-full"
                >
                  Apply Now
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Transaction History */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {transactionsLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse h-12 bg-muted rounded"></div>
                ))}
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No transactions yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Loan ID</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((transaction: any) => (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          {new Date(transaction.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="capitalize">
                          {transaction.type.replace('_', ' ')}
                        </TableCell>
                        <TableCell>
                          {transaction.type === 'disbursement' ? '+' : 
                           transaction.type === 'payment' ? '-' : ''}
                          {transaction.amount} {transaction.currency}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={transaction.status === 'completed' ? 'default' : 'secondary'}
                          >
                            {transaction.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {transaction.loanId ? `#${transaction.loanId.slice(-8)}` : '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Loan Application Modal */}
      <LoanApplicationModal 
        open={showLoanModal} 
        onClose={() => setShowLoanModal(false)} 
      />
    </div>
  );
}
