import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Shield, Key, Smartphone, Lock, CheckCircle, AlertTriangle, Eye, EyeOff } from "lucide-react";

export function SecuritySettings() {
  const [showPassword, setShowPassword] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current: "",
    new: "",
    confirm: ""
  });
  const { toast } = useToast();

  const handlePasswordChange = () => {
    if (passwordData.new !== passwordData.confirm) {
      toast({
        title: "Password Mismatch",
        description: "New passwords do not match.",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.new.length < 8) {
      toast({
        title: "Weak Password",
        description: "Password must be at least 8 characters long.",
        variant: "destructive",
      });
      return;
    }

    // Simulate password change
    toast({
      title: "Password Updated",
      description: "Your password has been successfully changed.",
    });
    setPasswordData({ current: "", new: "", confirm: "" });
  };

  const enable2FA = () => {
    setTwoFactorEnabled(true);
    toast({
      title: "2FA Enabled",
      description: "Two-factor authentication has been enabled for your account.",
    });
  };

  const disable2FA = () => {
    setTwoFactorEnabled(false);
    toast({
      title: "2FA Disabled",
      description: "Two-factor authentication has been disabled.",
      variant: "destructive",
    });
  };

  const validatePasswordStrength = (password: string) => {
    const hasLength = password.length >= 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    const score = [hasLength, hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length;
    
    if (score < 3) return { strength: "Weak", color: "text-red-500" };
    if (score < 4) return { strength: "Medium", color: "text-yellow-500" };
    return { strength: "Strong", color: "text-green-500" };
  };

  const passwordStrength = validatePasswordStrength(passwordData.new);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-bold">Security Settings</h2>
      </div>

      {/* Two-Factor Authentication */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            Two-Factor Authentication
            <Badge variant={twoFactorEnabled ? "default" : "secondary"}>
              {twoFactorEnabled ? "Enabled" : "Disabled"}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Add an extra layer of security to your account by requiring a verification code 
            from your mobile device when signing in.
          </p>
          
          {!twoFactorEnabled ? (
            <Dialog>
              <DialogTrigger asChild>
                <Button className="w-full sm:w-auto">
                  <Key className="w-4 h-4 mr-2" />
                  Enable 2FA
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Enable Two-Factor Authentication</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Alert>
                    <AlertTriangle className="w-4 h-4" />
                    <AlertDescription>
                      This is a demo implementation. In production, you would integrate with 
                      services like Google Authenticator or Authy.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="space-y-3">
                    <h4 className="font-medium">Setup Instructions:</h4>
                    <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                      <li>Download Google Authenticator or similar app</li>
                      <li>Scan the QR code with your authenticator app</li>
                      <li>Enter the 6-digit code to verify setup</li>
                    </ol>
                  </div>

                  <div className="p-4 bg-muted rounded-lg text-center">
                    <div className="w-32 h-32 bg-white mx-auto mb-2 rounded border-2 border-dashed border-muted-foreground flex items-center justify-center">
                      <span className="text-xs text-muted-foreground">QR Code</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Manual Entry Code: DEMO1234567890ABCDEF
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="verificationCode">Verification Code</Label>
                    <Input
                      id="verificationCode"
                      placeholder="Enter 6-digit code"
                      maxLength={6}
                    />
                  </div>

                  <Button onClick={enable2FA} className="w-full">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Verify and Enable
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          ) : (
            <div className="flex flex-col sm:flex-row gap-3">
              <Button variant="outline" className="flex-1">
                <Key className="w-4 h-4 mr-2" />
                View Backup Codes
              </Button>
              <Button variant="destructive" onClick={disable2FA} className="flex-1">
                Disable 2FA
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Password Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Password Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div>
              <Label htmlFor="currentPassword">Current Password</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showPassword ? "text" : "password"}
                  value={passwordData.current}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, current: e.target.value }))}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={passwordData.new}
                onChange={(e) => setPasswordData(prev => ({ ...prev, new: e.target.value }))}
              />
              {passwordData.new && (
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Strength:</span>
                  <span className={`text-xs font-medium ${passwordStrength.color}`}>
                    {passwordStrength.strength}
                  </span>
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={passwordData.confirm}
                onChange={(e) => setPasswordData(prev => ({ ...prev, confirm: e.target.value }))}
              />
              {passwordData.confirm && passwordData.new !== passwordData.confirm && (
                <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
              )}
            </div>

            <Alert>
              <AlertTriangle className="w-4 h-4" />
              <AlertDescription>
                <strong>Password Requirements:</strong>
                <ul className="mt-1 text-xs list-disc list-inside">
                  <li>At least 8 characters long</li>
                  <li>Contains uppercase and lowercase letters</li>
                  <li>Contains at least one number</li>
                  <li>Contains at least one special character</li>
                </ul>
              </AlertDescription>
            </Alert>

            <Button 
              onClick={handlePasswordChange}
              disabled={!passwordData.current || !passwordData.new || !passwordData.confirm || passwordData.new !== passwordData.confirm}
              className="w-full sm:w-auto"
            >
              Update Password
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Security Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Security Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Two-Factor Authentication</span>
              <Badge variant={twoFactorEnabled ? "default" : "secondary"}>
                {twoFactorEnabled ? (
                  <>
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Enabled
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    Disabled
                  </>
                )}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">Session Security</span>
              <Badge variant="default">
                <CheckCircle className="w-3 h-3 mr-1" />
                Active
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">Account Verification</span>
              <Badge variant="default">
                <CheckCircle className="w-3 h-3 mr-1" />
                Verified
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}