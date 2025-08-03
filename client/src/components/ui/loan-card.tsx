import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface LoanCardProps {
  loan: {
    id: string;
    amount: string;
    currency: string;
    collateralType: string;
    collateralAmount: string;
    interestRate: string;
    monthlyPayment: string;
    dueDate: string;
    status: string;
  };
}

export default function LoanCard({ loan }: LoanCardProps) {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(loan.monthlyPayment);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const paymentMutation = useMutation({
    mutationFn: async (amount: string) => {
      await apiRequest("POST", `/api/loans/${loan.id}/payment`, { amount: parseFloat(amount) });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Payment processed successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/loans"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      setShowPaymentModal(false);
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
    paymentMutation.mutate(paymentAmount);
  };

  return (
    <>
      <Card>
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="font-medium text-foreground">
                ${parseFloat(loan.amount).toLocaleString()} {loan.currency}
              </p>
              <p className="text-sm text-muted-foreground">
                Loan ID: #{loan.id.slice(-8)}
              </p>
            </div>
            <Badge variant={loan.status === "active" ? "default" : "secondary"}>
              {loan.status}
            </Badge>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm mb-4">
            <div>
              <p className="text-muted-foreground">Collateral</p>
              <p className="font-medium">
                {parseFloat(loan.collateralAmount).toFixed(4)} {loan.collateralType}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Interest Rate</p>
              <p className="font-medium">{loan.interestRate}% APR</p>
            </div>
            <div>
              <p className="text-muted-foreground">Due Date</p>
              <p className="font-medium">
                {new Date(loan.dueDate).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Monthly Payment</p>
              <p className="font-medium">${parseFloat(loan.monthlyPayment).toFixed(2)}</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button 
              className="flex-1" 
              onClick={() => setShowPaymentModal(true)}
              disabled={loan.status !== "active"}
            >
              Make Payment
            </Button>
            <Link href={`/loan/${loan.id}`}>
              <Button variant="outline" className="flex-1 w-full">
                View Details
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Payment Modal */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Make Payment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="paymentAmount">Payment Amount</Label>
              <Input
                id="paymentAmount"
                type="number"
                step="0.01"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                placeholder="Enter payment amount"
              />
            </div>
            <div className="flex space-x-2">
              <Button
                onClick={handlePayment}
                disabled={paymentMutation.isPending}
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
    </>
  );
}
