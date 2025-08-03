// Mock crypto price service - in production, this would use real APIs like CoinGecko
export interface CryptoPrices {
  BTC: number;
  ETH: number;
  BNB: number;
  ADA: number;
  SOL: number;
  MATIC: number;
  DOT: number;
  LINK: number;
}

export const CRYPTO_PRICES: CryptoPrices = {
  BTC: 43250,
  ETH: 2540,
  BNB: 315,
  ADA: 0.85,
  SOL: 65.50,
  MATIC: 0.92,
  DOT: 7.20,
  LINK: 14.80,
};

export const CRYPTO_INFO = {
  BTC: { symbol: "₿", name: "Bitcoin", icon: "🟠" },
  ETH: { symbol: "⟠", name: "Ethereum", icon: "🔷" },
  BNB: { symbol: "🔶", name: "BNB", icon: "🟡" },
  ADA: { symbol: "♠", name: "Cardano", icon: "🔵" },
  SOL: { symbol: "◉", name: "Solana", icon: "🟣" },
  MATIC: { symbol: "⬟", name: "Polygon", icon: "🟣" },
  DOT: { symbol: "●", name: "Polkadot", icon: "🔴" },
  LINK: { symbol: "🔗", name: "Chainlink", icon: "🔵" },
};

export function getCryptoPrice(symbol: keyof CryptoPrices): number {
  return CRYPTO_PRICES[symbol] || 0;
}

export function calculateCollateralValue(amount: number, cryptoType: keyof CryptoPrices): number {
  return amount * getCryptoPrice(cryptoType);
}

export function calculateLoanMetrics(
  loanAmount: number,
  collateralAmount: number,
  cryptoType: keyof CryptoPrices,
  termDays: number,
  interestRate: number = 8.5
) {
  const collateralValue = calculateCollateralValue(collateralAmount, cryptoType);
  const ltvRatio = loanAmount / collateralValue;
  const liquidationPrice = getCryptoPrice(cryptoType) * (loanAmount / collateralValue) * 1.2;
  
  const annualRate = interestRate / 100;
  const termInYears = termDays / 365;
  const totalInterest = loanAmount * annualRate * termInYears;
  const totalRepayment = loanAmount + totalInterest;
  const monthlyPayment = totalRepayment / (termDays / 30);

  return {
    collateralValue,
    ltvRatio,
    liquidationPrice,
    totalInterest,
    monthlyPayment,
    totalRepayment,
    interestRate,
  };
}

// Simulate real-time price updates (mock)
export function simulatePriceUpdates(): CryptoPrices {
  const updatedPrices = { ...CRYPTO_PRICES };
  
  Object.keys(updatedPrices).forEach((key) => {
    const cryptoKey = key as keyof CryptoPrices;
    const currentPrice = updatedPrices[cryptoKey];
    // Simulate ±2% price movement
    const changePercent = (Math.random() - 0.5) * 0.04;
    updatedPrices[cryptoKey] = currentPrice * (1 + changePercent);
  });
  
  return updatedPrices;
}