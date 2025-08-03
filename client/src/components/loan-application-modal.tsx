import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, ChevronLeft, ChevronRight } from "lucide-react";

const loanSchema = z.object({
  amount: z.number().min(100, "Minimum loan amount is $100").max(100000, "Maximum loan amount is $100,000"),
  currency: z.string(),
  termDays: z.number().min(30).max(365),
  purpose: z.string(),
  collateralType: z.string(),
  collateralAmount: z.number().min(0.001, "Minimum collateral amount is 0.001"),
  interestRate: z.string(),
});

type LoanFormData = z.infer<typeof loanSchema>;

interface LoanApplicationModalProps {
  open: boolean;
  onClose: () => void;
}

// This will be fetched from the API
let CRYPTO_PRICES = {
  BTC: 43250,
  ETH: 2540,
  BNB: 315,
  ADA: 0.85,
  SOL: 65.50,
  MATIC: 0.92,
  DOT: 7.20,
  LINK: 14.80,
};

export default function LoanApplicationModal({ open, onClose }: LoanApplicationModalProps) {
  const [step, setStep] = useState(1);
  const maxSteps = 3;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch real-time crypto prices
  const { data: cryptoPrices } = useQuery({
    queryKey: ["/api/crypto-prices"],
    staleTime: 60000, // 1 minute
  });

  // Update CRYPTO_PRICES when data is fetched
  if (cryptoPrices) {
    CRYPTO_PRICES = { ...CRYPTO_PRICES, ...cryptoPrices };
  }

  const form = useForm<LoanFormData>({
    resolver: zodResolver(loanSchema),
    defaultValues: {
      currency: "USDT",
      termDays: 90,
      purpose: "Trading",
      interestRate: "8.5",
      collateralType: "",
      amount: 0,
      collateralAmount: 0,
    },
  });

  const { watch } = form;
  const watchedValues = watch();

  const createLoanMutation = useMutation({
    mutationFn: async (data: LoanFormData) => {
      await apiRequest("POST", "/api/loans", data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Loan application submitted successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/loans"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      onClose();
      form.reset();
      setStep(1);
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
        description: "Failed to submit loan application. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleNext = () => {
    if (step < maxSteps) {
      setStep(step + 1);
    }
  };

  const handlePrev = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = (data: LoanFormData) => {
    createLoanMutation.mutate(data);
  };

  const handleClose = () => {
    onClose();
    setStep(1);
    form.reset();
  };

  // Calculate loan metrics
  const calculateMetrics = () => {
    const { amount, collateralAmount, collateralType, termDays } = watchedValues;
    if (!amount || !collateralAmount || !collateralType) return null;

    const cryptoPrice = CRYPTO_PRICES[collateralType as keyof typeof CRYPTO_PRICES] || 0;
    const collateralValue = collateralAmount * cryptoPrice;
    const ltvRatio = amount / collateralValue;
    const liquidationPrice = cryptoPrice * (amount / collateralValue) * 1.2; // 20% buffer
    const interestRate = 0.085;
    const termInYears = termDays / 365;
    const totalInterest = amount * interestRate * termInYears;
    const monthlyPayment = (amount + totalInterest) / (termDays / 30);

    return {
      collateralValue,
      ltvRatio,
      liquidationPrice,
      totalInterest,
      monthlyPayment,
      totalRepayment: amount + totalInterest,
    };
  };

  const metrics = calculateMetrics();

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Apply for Crypto Loan</DialogTitle>
        </DialogHeader>

        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-8">
          {[1, 2, 3].map((stepNumber) => (
            <div key={stepNumber} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  stepNumber <= step
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {stepNumber}
              </div>
              <span className="ml-2 text-sm font-medium">
                {stepNumber === 1 && "Loan Details"}
                {stepNumber === 2 && "Collateral"}
                {stepNumber === 3 && "Review"}
              </span>
              {stepNumber < 3 && (
                <div className="flex-1 h-px bg-border mx-4" />
              )}
            </div>
          ))}
        </div>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Step 1: Loan Details */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="amount">Loan Amount ($)</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="10000"
                    {...form.register("amount", { valueAsNumber: true })}
                  />
                  {form.formState.errors.amount && (
                    <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.amount.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Select
                    value={watchedValues.currency}
                    onValueChange={(value) => form.setValue("currency", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USDT">USDT (Tether)</SelectItem>
                      <SelectItem value="USDC">USDC (USD Coin)</SelectItem>
                      <SelectItem value="DAI">DAI (Dai Stablecoin)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="termDays">Loan Term</Label>
                  <Select
                    value={watchedValues.termDays.toString()}
                    onValueChange={(value) => form.setValue("termDays", parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 days</SelectItem>
                      <SelectItem value="60">60 days</SelectItem>
                      <SelectItem value="90">90 days</SelectItem>
                      <SelectItem value="180">180 days</SelectItem>
                      <SelectItem value="365">365 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="purpose">Purpose</Label>
                  <Select
                    value={watchedValues.purpose}
                    onValueChange={(value) => form.setValue("purpose", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Trading">Trading</SelectItem>
                      <SelectItem value="Personal">Personal</SelectItem>
                      <SelectItem value="Business">Business</SelectItem>
                      <SelectItem value="Investment">Investment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Collateral */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <Label>Collateral Type</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
                  {Object.entries(CRYPTO_PRICES).map(([crypto, price]) => (
                    <div key={crypto} className="relative">
                      <input
                        type="radio"
                        id={crypto}
                        value={crypto}
                        {...form.register("collateralType")}
                        className="peer hidden"
                      />
                      <label
                        htmlFor={crypto}
                        className="flex flex-col items-center p-4 border-2 border-border rounded-lg cursor-pointer hover:border-primary peer-checked:border-primary peer-checked:bg-primary/5 transition-colors"
                      >
                        <span className="text-2xl mb-1">
                          {crypto === "BTC" && "₿"}
                          {crypto === "ETH" && "⟠"}
                          {crypto === "BNB" && "🔶"}
                          {crypto === "ADA" && "♠"}
                          {crypto === "SOL" && "◉"}
                          {crypto === "MATIC" && "⬟"}
                          {crypto === "DOT" && "●"}
                          {crypto === "LINK" && "🔗"}
                        </span>
                        <span className="text-sm font-medium">{crypto}</span>
                        <span className="text-xs text-muted-foreground">${price.toLocaleString()}</span>
                      </label>
                    </div>
                  ))}
                </div>
                {form.formState.errors.collateralType && (
                  <p className="text-sm text-destructive mt-1">
                    Please select a collateral type
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="collateralAmount">Collateral Amount</Label>
                <Input
                  id="collateralAmount"
                  type="number"
                  step="0.001"
                  placeholder="0.5"
                  {...form.register("collateralAmount", { valueAsNumber: true })}
                />
                {form.formState.errors.collateralAmount && (
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.collateralAmount.message}
                  </p>
                )}
              </div>
              {metrics && (
                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-3">Collateral Requirements</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Current Price ({watchedValues.collateralType}):</span>
                        <span className="font-medium">${CRYPTO_PRICES[watchedValues.collateralType as keyof typeof CRYPTO_PRICES]?.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Collateral Value:</span>
                        <span className="font-medium">${metrics.collateralValue.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Loan-to-Value Ratio:</span>
                        <span className="font-medium">{(metrics.ltvRatio * 100).toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Liquidation Price:</span>
                        <span className="font-medium text-destructive">${metrics.liquidationPrice.toLocaleString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <div className="space-y-4">
              <Card>
                <CardContent className="p-6">
                  <h4 className="font-medium mb-4">Loan Summary</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Loan Amount:</span>
                      <span className="font-medium">${watchedValues.amount?.toLocaleString()} {watchedValues.currency}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Loan Term:</span>
                      <span className="font-medium">{watchedValues.termDays} days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Interest Rate:</span>
                      <span className="font-medium">8.5% APR</span>
                    </div>
                    {metrics && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Monthly Payment:</span>
                          <span className="font-medium">${metrics.monthlyPayment.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Total Interest:</span>
                          <span className="font-medium">${metrics.totalInterest.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between border-t border-border pt-3">
                          <span className="text-muted-foreground">Total Repayment:</span>
                          <span className="font-semibold text-lg">${metrics.totalRepayment.toFixed(2)}</span>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-amber-50 border-amber-200">
                <CardContent className="p-4">
                  <div className="flex">
                    <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 mr-3" />
                    <div>
                      <h5 className="font-medium text-amber-900">Important Notice</h5>
                      <p className="text-sm text-amber-800 mt-1">
                        Your collateral will be locked in a smart contract. If you fail to repay the loan, 
                        your collateral may be liquidated to cover the outstanding amount.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrev}
              disabled={step === 1}
              className={step === 1 ? "invisible" : ""}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>
            <div className="flex space-x-3">
              {step < maxSteps ? (
                <Button type="button" onClick={handleNext}>
                  Next Step
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button 
                  type="submit" 
                  disabled={createLoanMutation.isPending}
                  className="bg-secondary hover:bg-secondary/90"
                >
                  {createLoanMutation.isPending ? "Submitting..." : "Submit Application"}
                </Button>
              )}
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
