import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

interface NotificationSystemProps {
  user?: any;
}

export function NotificationSystem({ user }: NotificationSystemProps) {
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;

    // Welcome notification for new users
    const lastLogin = localStorage.getItem(`lastLogin_${user.id}`);
    const now = new Date().toISOString();
    
    if (!lastLogin) {
      toast({
        title: "Welcome to CryptoLend!",
        description: "Your secure cryptocurrency lending platform is ready to use.",
        duration: 5000,
      });
    }
    
    localStorage.setItem(`lastLogin_${user.id}`, now);
  }, [user, toast]);

  return null;
}

// Loan status notifications
export function useLoanNotifications() {
  const { toast } = useToast();

  const notifyLoanApproved = (loanId: string, amount: string) => {
    toast({
      title: "Loan Approved!",
      description: `Your loan of $${amount} has been approved and disbursed.`,
      duration: 8000,
    });
  };

  const notifyPaymentDue = (loanId: string, daysLeft: number) => {
    toast({
      title: "Payment Reminder",
      description: `Your loan payment is due in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}.`,
      variant: "destructive",
      duration: 10000,
    });
  };

  const notifyPaymentSuccess = (amount: string) => {
    toast({
      title: "Payment Successful",
      description: `Your payment of $${amount} has been processed successfully.`,
    });
  };

  const notifyLowCollateral = (loanId: string) => {
    toast({
      title: "Collateral Warning",
      description: "Your collateral value is approaching liquidation threshold.",
      variant: "destructive",
      duration: 10000,
    });
  };

  return {
    notifyLoanApproved,
    notifyPaymentDue,
    notifyPaymentSuccess,
    notifyLowCollateral,
  };
}