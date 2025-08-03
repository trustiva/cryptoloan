import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Bell, Clock, AlertTriangle, DollarSign, Calendar, Mail, Smartphone } from "lucide-react";

interface PaymentReminder {
  id: string;
  loanId: string;
  amount: number;
  dueDate: string;
  daysUntilDue: number;
  overdue: boolean;
  reminderSent: boolean;
  reminderType: "email" | "sms" | "push";
}

interface NotificationPreferences {
  emailReminders: boolean;
  smsReminders: boolean;
  pushNotifications: boolean;
  reminderDays: number[];
}

export function PaymentReminders() {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    emailReminders: true,
    smsReminders: false,
    pushNotifications: true,
    reminderDays: [7, 3, 1]
  });

  const { toast } = useToast();

  const { data: reminders = [], isLoading } = useQuery({
    queryKey: ["/api/payment-reminders"],
  });

  const { data: upcomingPayments = [] } = useQuery({
    queryKey: ["/api/loans/upcoming-payments"],
  });

  // Mock data for demonstration
  const mockReminders: PaymentReminder[] = [
    {
      id: "R001",
      loanId: "LN001",
      amount: 1500,
      dueDate: "2024-02-01T00:00:00Z",
      daysUntilDue: 3,
      overdue: false,
      reminderSent: true,
      reminderType: "email"
    },
    {
      id: "R002",
      loanId: "LN002",
      amount: 2800,
      dueDate: "2024-01-28T00:00:00Z",
      daysUntilDue: -1,
      overdue: true,
      reminderSent: true,
      reminderType: "sms"
    },
    {
      id: "R003",
      loanId: "LN003",
      amount: 950,
      dueDate: "2024-02-05T00:00:00Z",
      daysUntilDue: 7,
      overdue: false,
      reminderSent: false,
      reminderType: "push"
    }
  ];

  const activeReminders = reminders.length > 0 ? reminders : mockReminders;

  const overduePayments = activeReminders.filter(r => r.overdue);
  const upcomingDuePayments = activeReminders.filter(r => !r.overdue && r.daysUntilDue <= 7);

  // Auto-send reminders based on preferences
  useEffect(() => {
    const checkReminders = () => {
      activeReminders.forEach((reminder) => {
        if (!reminder.reminderSent && preferences.reminderDays.includes(reminder.daysUntilDue)) {
          sendPaymentReminder(reminder);
        }
      });
    };

    checkReminders();
  }, [activeReminders, preferences.reminderDays]);

  const sendPaymentReminder = (reminder: PaymentReminder) => {
    // Simulate sending reminder
    const reminderType = preferences.emailReminders ? "email" : 
                        preferences.smsReminders ? "SMS" : "push notification";
    
    toast({
      title: "Payment Reminder Sent",
      description: `${reminderType} reminder sent for payment due in ${reminder.daysUntilDue} days.`,
    });
  };

  const updatePreferences = (newPreferences: Partial<NotificationPreferences>) => {
    setPreferences(prev => ({ ...prev, ...newPreferences }));
    toast({
      title: "Preferences Updated",
      description: "Your notification preferences have been saved.",
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center">Loading payment reminders...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Alert for Overdue Payments */}
      {overduePayments.length > 0 && (
        <Alert className="border-destructive bg-destructive/10">
          <AlertTriangle className="w-4 h-4" />
          <AlertDescription>
            <strong>Urgent:</strong> You have {overduePayments.length} overdue payment{overduePayments.length > 1 ? 's' : ''} 
            totaling ${overduePayments.reduce((sum, r) => sum + r.amount, 0).toLocaleString()}.
            Please make payments immediately to avoid penalties.
          </AlertDescription>
        </Alert>
      )}

      {/* Alert for Upcoming Payments */}
      {upcomingDuePayments.length > 0 && (
        <Alert className="border-warning bg-warning/10">
          <Clock className="w-4 h-4" />
          <AlertDescription>
            You have {upcomingDuePayments.length} payment{upcomingDuePayments.length > 1 ? 's' : ''} due within the next 7 days 
            totaling ${upcomingDuePayments.reduce((sum, r) => sum + r.amount, 0).toLocaleString()}.
          </AlertDescription>
        </Alert>
      )}

      {/* Payment Reminders List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Payment Reminders
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activeReminders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No payment reminders at this time
            </div>
          ) : (
            <div className="space-y-4">
              {activeReminders.map((reminder) => (
                <div
                  key={reminder.id}
                  className={`p-4 rounded-lg border ${
                    reminder.overdue 
                      ? "border-destructive bg-destructive/5" 
                      : reminder.daysUntilDue <= 3
                      ? "border-warning bg-warning/5"
                      : "border-border"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4" />
                          <span className="font-medium">
                            ${reminder.amount.toLocaleString()}
                          </span>
                        </div>
                        <Badge variant="outline">
                          Loan {reminder.loanId}
                        </Badge>
                        <Badge 
                          variant={reminder.overdue ? "destructive" : "outline"}
                        >
                          {reminder.overdue 
                            ? `${Math.abs(reminder.daysUntilDue)} days overdue`
                            : `Due in ${reminder.daysUntilDue} days`
                          }
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Due: {new Date(reminder.dueDate).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          {reminder.reminderType === "email" && <Mail className="w-3 h-3" />}
                          {reminder.reminderType === "sms" && <Smartphone className="w-3 h-3" />}
                          {reminder.reminderType === "push" && <Bell className="w-3 h-3" />}
                          {reminder.reminderSent ? "Reminder sent" : "No reminder sent"}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {!reminder.reminderSent && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => sendPaymentReminder(reminder)}
                        >
                          Send Reminder
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant={reminder.overdue ? "destructive" : "default"}
                      >
                        Make Payment
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span className="font-medium">Email Reminders</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Receive payment reminders via email
                </p>
              </div>
              <Button
                variant={preferences.emailReminders ? "default" : "outline"}
                size="sm"
                onClick={() => updatePreferences({ emailReminders: !preferences.emailReminders })}
              >
                {preferences.emailReminders ? "Enabled" : "Disabled"}
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4" />
                  <span className="font-medium">SMS Reminders</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Receive payment reminders via SMS
                </p>
              </div>
              <Button
                variant={preferences.smsReminders ? "default" : "outline"}
                size="sm"
                onClick={() => updatePreferences({ smsReminders: !preferences.smsReminders })}
              >
                {preferences.smsReminders ? "Enabled" : "Disabled"}
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4" />
                  <span className="font-medium">Push Notifications</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Receive in-app push notifications
                </p>
              </div>
              <Button
                variant={preferences.pushNotifications ? "default" : "outline"}
                size="sm"
                onClick={() => updatePreferences({ pushNotifications: !preferences.pushNotifications })}
              >
                {preferences.pushNotifications ? "Enabled" : "Disabled"}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Reminder Schedule</label>
            <p className="text-xs text-muted-foreground">
              Get reminders this many days before payment is due
            </p>
            <div className="flex gap-2">
              {[1, 3, 7, 14].map((days) => (
                <Button
                  key={days}
                  variant={preferences.reminderDays.includes(days) ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    const newDays = preferences.reminderDays.includes(days)
                      ? preferences.reminderDays.filter(d => d !== days)
                      : [...preferences.reminderDays, days].sort((a, b) => b - a);
                    updatePreferences({ reminderDays: newDays });
                  }}
                >
                  {days} day{days > 1 ? 's' : ''}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}