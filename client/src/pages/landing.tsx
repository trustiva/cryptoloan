import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Zap, 
  Shield, 
  DollarSign,
  CheckCircle,
  ArrowRight
} from "lucide-react";

export default function Landing() {
  const handleGetStarted = () => {
    window.location.href = "/api/login";
  };

  const handleLearnMore = () => {
    const featuresSection = document.getElementById('features');
    featuresSection?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <CheckCircle className="h-8 w-8 text-primary" />
                <span className="ml-2 text-xl font-bold text-foreground">CryptoLend</span>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <a href="#features" className="text-muted-foreground hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors">How it Works</a>
                <a href="#rates" className="text-muted-foreground hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors">Rates</a>
                <a href="#security" className="text-muted-foreground hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors">Security</a>
                <a href="#support" className="text-muted-foreground hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors">Support</a>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="ghost" onClick={() => window.location.href = "/api/login"}>
                Sign In
              </Button>
              <Button onClick={handleGetStarted}>
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
              Instant Loans with <br />
              <span className="text-blue-200">Crypto Collateral</span>
            </h1>
            <p className="text-xl sm:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Get instant access to stablecoin loans using your cryptocurrency as collateral. 
              Secure, transparent, and powered by smart contracts.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-white text-primary hover:bg-gray-100"
                onClick={handleGetStarted}
              >
                Apply for Loan
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white text-white hover:bg-white hover:text-primary"
                onClick={handleLearnMore}
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Why Choose CryptoLend?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Experience the future of lending with our secure, transparent, and efficient platform
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardContent className="p-6">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Instant Processing</h3>
                <p className="text-muted-foreground">Get your loan approved and funded within minutes, not days</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-6">
                <div className="bg-secondary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-secondary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Secure & Transparent</h3>
                <p className="text-muted-foreground">Smart contracts ensure secure collateral management and transparent terms</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-6">
                <div className="bg-accent/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="w-8 h-8 text-accent" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Competitive Rates</h3>
                <p className="text-muted-foreground">Enjoy competitive interest rates starting from 8% APR</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
