import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { ArrowLeft, ArrowRight, CheckCircle, AlertCircle, TrendingUp, Shield, Clock, DollarSign } from "lucide-react";

interface LoanApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CRYPTO_OPTIONS = [
  { value: "BTC", label: "Bitcoin (BTC)", icon: "₿" },
  { value: "ETH", label: "Ethereum (ETH)", icon: "Ξ" },
  { value: "BNB", label: "Binance Coin (BNB)", icon: "BNB" },
  { value: "ADA", label: "Cardano (ADA)", icon: "ADA" },
  { value: "SOL", label: "Solana (SOL)", icon: "SOL" },
  { value: "MATIC", label: "Polygon (MATIC)", icon: "MATIC" },
  { value: "DOT", label: "Polkadot (DOT)", icon: "DOT" },
  { value: "LINK", label: "Chainlink (LINK)", icon: "LINK" }
];

const LOAN_TERMS = [
  { days: 30, label: "30 days", rate: 8.5 },
  { days: 60, label: "60 days", rate: 12.0 },
  { days: 90, label: "90 days", rate: 15.5 },
  { days: 180, label: "180 days", rate: 22.0 },
  { days: 365, label: "365 days", rate: 35.0 }
];

function LoanApplicationModal({ isOpen, onClose }: LoanApplicationModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    amount: "",
    collateralType: "",
    collateralAmount: "",
    termDays: 30,
    interestRate: 8.5
  });
  const [calculations, setCalculations] = useState({
    collateralValue: 0,
    ltvRatio: 0,
    totalRepayment: 0,
    monthlyPayment: 0,
    isEligible: false
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: cryptoPrices } = useQuery({
    queryKey: ["/api/crypto-prices"],
    refetchInterval: 30000 // Update every 30 seconds
  });

  const loanMutation = useMutation({
    mutationFn: async (loanData: any) => {
      const response = await fetch("/api/loans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loanData),
      });
      if (!response.ok) throw new Error("Failed to submit loan application");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Loan Application Submitted",
        description: "Your loan application has been approved and processed successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/loans"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/stats"] });
      onClose();
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Application Failed",
        description: error.message || "Failed to submit loan application",
        variant: "destructive",
      });
    },
  });

  // Real-time calculations
  useEffect(() => {
    if (formData.amount && formData.collateralType && formData.collateralAmount && cryptoPrices) {
      const loanAmount = parseFloat(formData.amount);
      const collateralQty = parseFloat(formData.collateralAmount);
      const cryptoPrice = (cryptoPrices as any)?.[formData.collateralType] || 0;
      const collateralValue = collateralQty * cryptoPrice;
      const ltvRatio = loanAmount / collateralValue;
      const interestAmount = (loanAmount * formData.interestRate) / 100;
      const totalRepayment = loanAmount + interestAmount;
      const monthlyPayment = totalRepayment / (formData.termDays / 30);

      setCalculations({
        collateralValue,
        ltvRatio: ltvRatio * 100,
        totalRepayment,
        monthlyPayment,
        isEligible: ltvRatio <= 0.75 && loanAmount >= 100 && loanAmount <= 100000
      });
    }
  }, [formData, cryptoPrices]);

  const resetForm = () => {
    setCurrentStep(1);
    setFormData({
      amount: "",
      collateralType: "",
      collateralAmount: "",
      termDays: 30,
      interestRate: 8.5
    });
    setCalculations({
      collateralValue: 0,
      ltvRatio: 0,
      totalRepayment: 0,
      monthlyPayment: 0,
      isEligible: false
    });
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    if (!calculations.isEligible) {
      toast({
        title: "Ineligible Application",
        description: "Please adjust your loan amount or collateral to meet requirements.",
        variant: "destructive",
      });
      return;
    }

    loanMutation.mutate({
      amount: parseFloat(formData.amount),
      collateralType: formData.collateralType,
      collateralAmount: parseFloat(formData.collateralAmount),
      termDays: formData.termDays,
      interestRate: formData.interestRate,
      totalRepayment: calculations.totalRepayment.toFixed(2)
    });
  };

  const handleTermChange = (days: number) => {
    const selectedTerm = LOAN_TERMS.find(term => term.days === days);
    setFormData(prev => ({
      ...prev,
      termDays: days,
      interestRate: selectedTerm?.rate || 8.5
    }));
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <DollarSign className="w-12 h-12 mx-auto text-primary mb-4" />
              <h3 className="text-lg font-semibold mb-2">Loan Amount</h3>
              <p className="text-sm text-muted-foreground">How much would you like to borrow?</p>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="amount">Loan Amount (USDT)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Enter amount (100 - 100,000)"
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                  min="100"
                  max="100000"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Min: $100</span>
                  <span>Max: $100,000</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[1000, 5000, 10000].map((amount) => (
                  <Button
                    key={amount}
                    variant="outline"
                    size="sm"
                    onClick={() => setFormData(prev => ({ ...prev, amount: amount.toString() }))}
                  >
                    ${amount.toLocaleString()}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Shield className="w-12 h-12 mx-auto text-primary mb-4" />
              <h3 className="text-lg font-semibold mb-2">Collateral Selection</h3>
              <p className="text-sm text-muted-foreground">Choose your cryptocurrency collateral</p>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="collateralType">Cryptocurrency</Label>
                <Select value={formData.collateralType} onValueChange={(value) => 
                  setFormData(prev => ({ ...prev, collateralType: value }))
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="Select cryptocurrency" />
                  </SelectTrigger>
                  <SelectContent>
                    {CRYPTO_OPTIONS.map((crypto) => (
                      <SelectItem key={crypto.value} value={crypto.value}>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm">{crypto.icon}</span>
                          <span>{crypto.label}</span>
                          {cryptoPrices && (
                            <Badge variant="secondary" className="ml-auto">
                              ${(cryptoPrices as any)?.[crypto.value]?.toLocaleString() || "N/A"}
                            </Badge>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="collateralAmount">Collateral Amount</Label>
                <Input
                  id="collateralAmount"
                  type="number"
                  placeholder="Enter collateral amount"
                  value={formData.collateralAmount}
                  onChange={(e) => setFormData(prev => ({ ...prev, collateralAmount: e.target.value }))}
                  step="0.001"
                />
                {formData.collateralType && cryptoPrices && formData.collateralAmount && (
                  <div className="mt-2 p-3 bg-muted rounded-lg">
                    <div className="flex justify-between text-sm">
                      <span>Current Price:</span>
                      <span className="font-medium">${(cryptoPrices as any)?.[formData.collateralType]?.toLocaleString() || "N/A"}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Collateral Value:</span>
                      <span className="font-medium text-primary">${calculations.collateralValue.toLocaleString()}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Clock className="w-12 h-12 mx-auto text-primary mb-4" />
              <h3 className="text-lg font-semibold mb-2">Loan Terms</h3>
              <p className="text-sm text-muted-foreground">Select your preferred repayment period</p>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-3">
                {LOAN_TERMS.map((term) => (
                  <Card 
                    key={term.days}
                    className={`cursor-pointer transition-all ${
                      formData.termDays === term.days 
                        ? 'ring-2 ring-primary bg-primary/5' 
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => handleTermChange(term.days)}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium">{term.label}</div>
                          <div className="text-sm text-muted-foreground">
                            {term.rate}% APR
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">Interest</div>
                          <div className="font-medium">
                            ${formData.amount ? ((parseFloat(formData.amount) * term.rate) / 100).toFixed(2) : '0.00'}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <CheckCircle className="w-12 h-12 mx-auto text-primary mb-4" />
              <h3 className="text-lg font-semibold mb-2">Loan Summary</h3>
              <p className="text-sm text-muted-foreground">Review your loan details before submitting</p>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Loan Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Loan Amount:</span>
                    <div className="font-medium">${parseFloat(formData.amount || '0').toLocaleString()}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Interest Rate:</span>
                    <div className="font-medium">{formData.interestRate}% APR</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Term:</span>
                    <div className="font-medium">{formData.termDays} days</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Total Repayment:</span>
                    <div className="font-medium text-primary">${calculations.totalRepayment.toFixed(2)}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Collateral Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Collateral:</span>
                    <div className="font-medium">{formData.collateralAmount} {formData.collateralType}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Current Value:</span>
                    <div className="font-medium">${calculations.collateralValue.toLocaleString()}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">LTV Ratio:</span>
                    <div className={`font-medium ${calculations.ltvRatio <= 75 ? 'text-green-600' : 'text-red-600'}`}>
                      {calculations.ltvRatio.toFixed(1)}%
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Status:</span>
                    <div className="flex items-center gap-1">
                      {calculations.isEligible ? (
                        <>
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-green-600 font-medium">Eligible</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-4 h-4 text-red-600" />
                          <span className="text-red-600 font-medium">Not Eligible</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {!calculations.isEligible && (
                  <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <div className="flex items-center gap-2 text-destructive text-sm">
                      <AlertCircle className="w-4 h-4" />
                      <span className="font-medium">Eligibility Requirements:</span>
                    </div>
                    <ul className="mt-2 text-xs text-destructive space-y-1 ml-6">
                      <li>• LTV ratio must be ≤ 75%</li>
                      <li>• Loan amount: $100 - $100,000</li>
                      <li>• Sufficient collateral value</li>
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Apply for Crypto Loan</DialogTitle>
        </DialogHeader>

        {/* Progress Indicator */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Step {currentStep} of 4</span>
            <span className="text-sm text-muted-foreground">
              {currentStep === 1 && "Loan Amount"}
              {currentStep === 2 && "Collateral"}
              {currentStep === 3 && "Terms"}
              {currentStep === 4 && "Review"}
            </span>
          </div>
          <Progress value={(currentStep / 4) * 100} className="h-2" />
        </div>

        {/* Step Content */}
        <div className="min-h-[400px]">
          {renderStepContent()}
        </div>

        <Separator />

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          <div className="flex gap-2">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            {currentStep < 4 ? (
              <Button
                onClick={handleNext}
                disabled={
                  (currentStep === 1 && !formData.amount) ||
                  (currentStep === 2 && (!formData.collateralType || !formData.collateralAmount)) ||
                  (currentStep === 3 && !formData.termDays)
                }
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!calculations.isEligible || loanMutation.isPending}
                className="min-w-[120px]"
              >
                {loanMutation.isPending ? "Submitting..." : "Submit Application"}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default LoanApplicationModal;