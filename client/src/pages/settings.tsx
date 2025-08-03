import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { SecuritySettings } from "@/components/security-features";
import { PaymentReminders } from "@/components/payment-reminders";
import { AnalyticsDashboard } from "@/components/analytics-dashboard";
import { SystemStatus } from "@/components/system-status";
import { ProductionReadinessCheck } from "@/components/production-readiness-check";
import { Settings, Shield, Bell, BarChart3, User, CreditCard } from "lucide-react";

export default function SettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");

  // Check if user is admin
  const isAdmin = user?.email?.includes("admin") || user?.email?.endsWith("replit.com");

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Settings className="w-6 h-6 text-primary" />
          <h1 className="text-3xl font-bold">Settings</h1>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className={`grid w-full ${isAdmin ? 'grid-cols-7' : 'grid-cols-5'}`}>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Security
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="payments" className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Payments
            </TabsTrigger>
            <TabsTrigger value="system" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              System
            </TabsTrigger>
            {isAdmin && (
              <>
                <TabsTrigger value="analytics" className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Analytics
                </TabsTrigger>
                <TabsTrigger value="testing" className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Testing
                </TabsTrigger>
              </>
            )}
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Email</label>
                    <div className="text-sm font-medium">{user?.email || "Not available"}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">First Name</label>
                    <div className="text-sm font-medium">{user?.firstName || "Not available"}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Last Name</label>
                    <div className="text-sm font-medium">{user?.lastName || "Not available"}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Account Type</label>
                    <div className="text-sm font-medium">{isAdmin ? "Administrator" : "Standard User"}</div>
                  </div>
                </div>
                
                <div className="pt-4">
                  <Button variant="outline">
                    Update Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <SecuritySettings />
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <PaymentReminders />
          </TabsContent>

          <TabsContent value="payments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Payment Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Default Payment Method</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Choose your preferred cryptocurrency for loan payments
                    </p>
                    <select className="w-full p-2 border rounded-md">
                      <option value="USDT">USDT (Tether)</option>
                      <option value="USDC">USDC (USD Coin)</option>
                      <option value="DAI">DAI (MakerDAO)</option>
                      <option value="BUSD">BUSD (Binance USD)</option>
                    </select>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Auto-Payment Settings</h4>
                    <div className="flex items-center gap-2 mb-2">
                      <input type="checkbox" id="autopay" className="rounded" />
                      <label htmlFor="autopay" className="text-sm">
                        Enable automatic payments for loans
                      </label>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Automatically deduct loan payments from your wallet balance when due
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Payment Confirmation</h4>
                    <div className="flex items-center gap-2 mb-2">
                      <input type="checkbox" id="confirm" className="rounded" defaultChecked />
                      <label htmlFor="confirm" className="text-sm">
                        Require confirmation for payments over $1,000
                      </label>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <Button>
                    Save Payment Preferences
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="system" className="space-y-6">
            <SystemStatus />
          </TabsContent>

          {isAdmin && (
            <>
              <TabsContent value="analytics" className="space-y-6">
                <AnalyticsDashboard />
              </TabsContent>
              <TabsContent value="testing" className="space-y-6">
                <ProductionReadinessCheck />
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>
    </div>
  );
}