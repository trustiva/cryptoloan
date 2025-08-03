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

      {/* Additional Sections */}
      <div id="rates" className="py-20 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Competitive Rates & Flexible Terms
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Get the best rates in the market with flexible repayment options
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center p-8">
              <CardContent>
                <div className="text-4xl font-bold text-primary mb-2">8.5%</div>
                <div className="text-sm text-muted-foreground mb-4">Starting APR</div>
                <div className="space-y-2 text-sm">
                  <div>• 30-365 day terms</div>
                  <div>• No prepayment penalties</div>
                  <div>• Instant approval</div>
                </div>
              </CardContent>
            </Card>
            <Card className="text-center p-8 border-primary">
              <CardContent>
                <div className="text-4xl font-bold text-primary mb-2">150%</div>
                <div className="text-sm text-muted-foreground mb-4">Max LTV Ratio</div>
                <div className="space-y-2 text-sm">
                  <div>• Borrow up to 66% of collateral</div>
                  <div>• Real-time liquidation alerts</div>
                  <div>• Secure smart contracts</div>
                </div>
              </CardContent>
            </Card>
            <Card className="text-center p-8">
              <CardContent>
                <div className="text-4xl font-bold text-primary mb-2">24/7</div>
                <div className="text-sm text-muted-foreground mb-4">Processing</div>
                <div className="space-y-2 text-sm">
                  <div>• Instant loan approval</div>
                  <div>• Automated disbursements</div>
                  <div>• Real-time monitoring</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Security Section */}
      <div id="security" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Bank-Level Security
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Your funds and data are protected by enterprise-grade security measures
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">Smart Contracts</h3>
              <p className="text-sm text-muted-foreground">Audited smart contracts ensure secure collateral management</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">Multi-Signature</h3>
              <p className="text-sm text-muted-foreground">Multi-sig wallets for enhanced security protocols</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">Real-time Monitoring</h3>
              <p className="text-sm text-muted-foreground">24/7 monitoring of all transactions and activities</p>
            </div>
            <div className="text-center">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="font-semibold mb-2">Insurance Fund</h3>
              <p className="text-sm text-muted-foreground">Emergency fund to protect against extreme market events</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gradient-to-r from-primary to-blue-800 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Ready to Get Your Crypto Loan?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of users who trust CryptoLend for their lending needs
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-white text-primary hover:bg-gray-100"
              onClick={handleGetStarted}
            >
              Get Started Now
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer id="support" className="bg-background border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center mb-4">
                <CheckCircle className="h-8 w-8 text-primary" />
                <span className="ml-2 text-xl font-bold text-foreground">CryptoLend</span>
              </div>
              <p className="text-muted-foreground mb-4 max-w-md">
                The most trusted platform for instant cryptocurrency-backed loans. 
                Get the funds you need while keeping your crypto investments.
              </p>
              <div className="text-sm text-muted-foreground">
                <p>© 2024 CryptoLend. All rights reserved.</p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#features" className="hover:text-primary transition-colors">How it Works</a></li>
                <li><a href="#rates" className="hover:text-primary transition-colors">Rates & Terms</a></li>
                <li><a href="#security" className="hover:text-primary transition-colors">Security</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Supported Crypto</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
