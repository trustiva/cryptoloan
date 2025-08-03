import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  ArrowLeft, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock
} from "lucide-react";
import { Link } from "wouter";

interface LoanDetailsProps {
  loanId: string;
}

export default function LoanDetails({ loanId }: LoanDetailsProps) {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");

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

  // Fetch loan details
  const { data: loan, isLoading: loanLoading } = useQuery<any>({
    queryKey: ["/api/loans", loanId],
    enabled: isAuthenticated && !!loanId,
    retry: false,
  });

  // Fetch loan transactions
  const { data: transactions = [], isLoading: transactionsLoading } = useQuery<any[]>({
    queryKey: ["/api/loans", loanId, "transactions"],
    enabled: isAuthenticated && !!loanId,
    retry: false,
  });

  // Payment mutation
  const paymentMutation = useMutation({
    mutationFn: async (amount: string) => {
      await apiRequest("POST", `/api/loans/${loanId}/payment`, { amount: parseFloat(amount) });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Payment processed successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/loans"] });
      queryClient.invalidateQueries({ queryKey: ["/api/loans", loanId] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      setShowPaymentModal(false);
      setPaymentAmount("");
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: "Failed to process payment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handlePayment = () => {
    if (paymentAmount && parseFloat(paymentAmount) > 0) {
      paymentMutation.mutate(paymentAmount);
    }
  };

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (loanLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-64 bg-muted rounded"></div>
                <div className="h-48 bg-muted rounded"></div>
              </div>
              <div className="space-y-6">
                <div className="h-32 bg-muted rounded"></div>
                <div className="h-48 bg-muted rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!loan) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Loan Not Found</h1>
          <p className="text-muted-foreground mb-4">The loan you're looking for doesn't exist.</p>
          <Link href="/">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const remainingAmount = parseFloat(loan.totalRepayment) - 
    (transactions
      .filter((t: any) => t.type === "payment")
      .reduce((sum: number, t: any) => sum + parseFloat(t.amount), 0));
  
  const repaymentProgress = ((parseFloat(loan.totalRepayment) - remainingAmount) / parseFloat(loan.totalRepayment)) * 100;
  const daysRemaining = Math.ceil((new Date(loan.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div className="ml-4">
                <h1 className="text-2xl font-bold text-foreground">
                  Loan #{loan.id.slice(-8)}
                </h1>
                <p className="text-muted-foreground">
                  {loan.currency} loan secured by {loan.collateralType}
                </p>
              </div>
            </div>
            <Badge variant={loan.status === "active" ? "default" : "secondary"}>
              {loan.status}
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Loan Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Loan Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      ${parseFloat(loan.amount).toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">Principal</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-secondary">
                      {loan.interestRate}%
                    </div>
                    <div className="text-sm text-muted-foreground">APR</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-accent">
                      {daysRemaining}
                    </div>
                    <div className="text-sm text-muted-foreground">Days Left</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-destructive">
                      ${remainingAmount.toFixed(2)}
                    </div>
                    <div className="text-sm text-muted-foreground">Remaining</div>
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Repayment Progress</span>
                    <span>{repaymentProgress.toFixed(1)}%</span>
                  </div>
                  <Progress value={repaymentProgress} className="h-3" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="flex justify-between py-2">
                      <span className="text-muted-foreground">Loan Date:</span>
                      <span>{new Date(loan.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-muted-foreground">Due Date:</span>
                      <span>{new Date(loan.dueDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-muted-foreground">Term:</span>
                      <span>{loan.termDays} days</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between py-2">
                      <span className="text-muted-foreground">Total Interest:</span>
                      <span>${parseFloat(loan.totalInterest).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-muted-foreground">Monthly Payment:</span>
                      <span>${parseFloat(loan.monthlyPayment).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-muted-foreground">Total Repayment:</span>
                      <span>${parseFloat(loan.totalRepayment).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Transaction History */}
            <Card>
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
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
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {transactions.map((transaction: any) => (
                          <TableRow key={transaction.id}>
                            <TableCell>
                              {new Date(transaction.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="capitalize">
                              <div className="flex items-center">
                                {transaction.type === 'disbursement' && <DollarSign className="w-4 h-4 mr-2 text-green-600" />}
                                {transaction.type === 'payment' && <CheckCircle className="w-4 h-4 mr-2 text-blue-600" />}
                                {transaction.type === 'collateral_deposit' && <TrendingUp className="w-4 h-4 mr-2 text-orange-600" />}
                                {transaction.type.replace('_', ' ')}
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className={transaction.type === 'payment' ? 'text-red-600' : 'text-green-600'}>
                                {transaction.type === 'payment' ? '-' : '+'}
                                {transaction.amount} {transaction.currency}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant={transaction.status === 'completed' ? 'default' : 'secondary'}
                              >
                                {transaction.status}
                              </Badge>
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

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  className="w-full" 
                  onClick={() => {
                    setPaymentAmount(loan.monthlyPayment);
                    setShowPaymentModal(true);
                  }}
                  disabled={loan.status !== "active"}
                >
                  <DollarSign className="w-4 h-4 mr-2" />
                  Make Payment
                </Button>
                <Button variant="outline" className="w-full">
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Payment
                </Button>
                <Button variant="outline" className="w-full">
                  <Clock className="w-4 h-4 mr-2" />
                  Payment History
                </Button>
              </CardContent>
            </Card>

            {/* Collateral Info */}
            <Card>
              <CardHeader>
                <CardTitle>Collateral Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type:</span>
                    <span className="font-medium">{loan.collateralType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount:</span>
                    <span className="font-medium">
                      {parseFloat(loan.collateralAmount).toFixed(4)} {loan.collateralType}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <Badge variant="default">Locked</Badge>
                  </div>
                </div>
                
                {daysRemaining <= 7 && (
                  <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex">
                      <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 mr-2" />
                      <div>
                        <p className="text-sm font-medium text-amber-900">Payment Due Soon</p>
                        <p className="text-xs text-amber-800 mt-1">
                          Your loan payment is due in {daysRemaining} day{daysRemaining !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Make Payment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="paymentAmount">Payment Amount ($)</Label>
              <Input
                id="paymentAmount"
                type="number"
                step="0.01"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                placeholder="Enter payment amount"
              />
              <div className="mt-2 text-sm text-muted-foreground">
                Suggested: ${parseFloat(loan.monthlyPayment).toFixed(2)} (Monthly Payment)
              </div>
            </div>
            <div className="flex space-x-2">
              <Button
                onClick={handlePayment}
                disabled={paymentMutation.isPending || !paymentAmount}
                className="flex-1"
              >
                {paymentMutation.isPending ? "Processing..." : "Pay Now"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowPaymentModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}