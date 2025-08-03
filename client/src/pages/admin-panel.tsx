import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  BarChart3,
  Search,
  Filter,
  Download,
  RefreshCw,
  Settings,
  Shield
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface AdminStats {
  totalUsers: number;
  activeLoans: number;
  totalVolume: number;
  defaultRate: number;
  platformRevenue: number;
  pendingApplications: number;
}

interface LoanForAdmin {
  id: string;
  userId: string;
  userEmail: string;
  amount: string;
  collateralType: string;
  collateralAmount: string;
  status: string;
  createdAt: string;
  totalRepayment: string;
  termDays: number;
}

interface UserForAdmin {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: string;
  totalBorrowed: number;
  activeLoans: number;
  defaulted: boolean;
}

export default function AdminPanel() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Check if user is admin (in production, this would be a proper role check)
  const isAdmin = user?.email?.includes("admin") || user?.email?.endsWith("replit.com");

  const { data: adminStats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/admin/stats"],
    enabled: isAdmin,
  });

  const { data: allLoans = [], isLoading: loansLoading } = useQuery({
    queryKey: ["/api/admin/loans"],
    enabled: isAdmin,
  });

  const { data: allUsers = [], isLoading: usersLoading } = useQuery({
    queryKey: ["/api/admin/users"],
    enabled: isAdmin,
  });

  const approveLoanMutation = useMutation({
    mutationFn: async (loanId: string) => {
      const response = await fetch(`/api/admin/loans/${loanId}/approve`, {
        method: "POST",
      });
      if (!response.ok) throw new Error("Failed to approve loan");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Loan Approved",
        description: "The loan has been approved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/loans"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to approve loan.",
        variant: "destructive",
      });
    },
  });

  const rejectLoanMutation = useMutation({
    mutationFn: async (loanId: string) => {
      const response = await fetch(`/api/admin/loans/${loanId}/reject`, {
        method: "POST",
      });
      if (!response.ok) throw new Error("Failed to reject loan");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Loan Rejected",
        description: "The loan has been rejected.",
        variant: "destructive",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/loans"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to reject loan.",
        variant: "destructive",
      });
    },
  });

  const suspendUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await fetch(`/api/admin/users/${userId}/suspend`, {
        method: "POST",
      });
      if (!response.ok) throw new Error("Failed to suspend user");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "User Suspended",
        description: "The user has been suspended.",
        variant: "destructive",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to suspend user.",
        variant: "destructive",
      });
    },
  });

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Access Denied
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertTriangle className="w-4 h-4" />
              <AlertDescription>
                You don't have permission to access the Admin Panel. 
                Please contact support if you believe this is an error.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  const filteredLoans = allLoans.filter((loan: LoanForAdmin) => {
    const matchesSearch = loan.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         loan.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || loan.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const filteredUsers = allUsers.filter((user: UserForAdmin) => {
    return user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
           (user.firstName + " " + user.lastName).toLowerCase().includes(searchTerm.toLowerCase());
  });

  const mockStats: AdminStats = {
    totalUsers: 1247,
    activeLoans: 89,
    totalVolume: 2450000,
    defaultRate: 2.1,
    platformRevenue: 48500,
    pendingApplications: 12
  };

  const stats = adminStats || mockStats;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Admin Panel</h1>
            <p className="text-muted-foreground">Manage loans, users, and platform operations</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </Button>
            <Button variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Users className="w-4 h-4" />
                Total Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">+12% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Active Loans
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeLoans}</div>
              <p className="text-xs text-muted-foreground">+5% from last week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Total Volume
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.totalVolume.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">+18% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Default Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.defaultRate}%</div>
              <p className="text-xs text-green-600">-0.3% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Platform Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.platformRevenue.toLocaleString()}</div>
              <p className="text-xs text-green-600">+22% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Pending Apps
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingApplications}</div>
              <p className="text-xs text-muted-foreground">Needs review</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="loans" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="loans">Loan Management</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="loans" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Loan Management</CardTitle>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search loans..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8 w-64"
                      />
                    </div>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="px-3 py-2 border rounded-md text-sm"
                    >
                      <option value="all">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="active">Active</option>
                      <option value="completed">Completed</option>
                      <option value="defaulted">Defaulted</option>
                    </select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loansLoading ? (
                  <div className="text-center py-8">Loading loans...</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Loan ID</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Collateral</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {/* Mock data for demonstration */}
                      {[
                        {
                          id: "LN001",
                          userEmail: "user1@example.com",
                          amount: "5000",
                          collateralType: "BTC",
                          collateralAmount: "0.12",
                          status: "pending",
                          createdAt: "2024-01-15T10:30:00Z",
                          totalRepayment: "5425",
                          termDays: 90
                        },
                        {
                          id: "LN002",
                          userEmail: "user2@example.com",
                          amount: "10000",
                          collateralType: "ETH",
                          collateralAmount: "4.2",
                          status: "active",
                          createdAt: "2024-01-14T14:20:00Z",
                          totalRepayment: "11200",
                          termDays: 180
                        },
                        {
                          id: "LN003",
                          userEmail: "user3@example.com",
                          amount: "2500",
                          collateralType: "BNB",
                          collateralAmount: "8.5",
                          status: "completed",
                          createdAt: "2024-01-10T09:15:00Z",
                          totalRepayment: "2712.50",
                          termDays: 60
                        }
                      ].map((loan) => (
                        <TableRow key={loan.id}>
                          <TableCell className="font-medium">{loan.id}</TableCell>
                          <TableCell>{loan.userEmail}</TableCell>
                          <TableCell>${parseFloat(loan.amount).toLocaleString()}</TableCell>
                          <TableCell>
                            {loan.collateralAmount} {loan.collateralType}
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={
                                loan.status === "active" ? "default" : 
                                loan.status === "completed" ? "secondary" :
                                loan.status === "pending" ? "outline" : "destructive"
                              }
                            >
                              {loan.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(loan.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              {loan.status === "pending" && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => approveLoanMutation.mutate(loan.id)}
                                    disabled={approveLoanMutation.isPending}
                                  >
                                    <CheckCircle className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => rejectLoanMutation.mutate(loan.id)}
                                    disabled={rejectLoanMutation.isPending}
                                  >
                                    <XCircle className="w-3 h-3" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>User Management</CardTitle>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8 w-64"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {usersLoading ? (
                  <div className="text-center py-8">Loading users...</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead>Total Borrowed</TableHead>
                        <TableHead>Active Loans</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {/* Mock data for demonstration */}
                      {[
                        {
                          id: "U001",
                          email: "alice@example.com",
                          firstName: "Alice",
                          lastName: "Smith",
                          createdAt: "2024-01-01T00:00:00Z",
                          totalBorrowed: 15000,
                          activeLoans: 2,
                          defaulted: false
                        },
                        {
                          id: "U002",
                          email: "bob@example.com",
                          firstName: "Bob",
                          lastName: "Johnson",
                          createdAt: "2024-01-05T00:00:00Z",
                          totalBorrowed: 8500,
                          activeLoans: 1,
                          defaulted: false
                        },
                        {
                          id: "U003",
                          email: "charlie@example.com",
                          firstName: "Charlie",
                          lastName: "Brown",
                          createdAt: "2024-01-10T00:00:00Z",
                          totalBorrowed: 25000,
                          activeLoans: 0,
                          defaulted: true
                        }
                      ].map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{user.firstName} {user.lastName}</div>
                              <div className="text-sm text-muted-foreground">{user.id}</div>
                            </div>
                          </TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            {new Date(user.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>${user.totalBorrowed.toLocaleString()}</TableCell>
                          <TableCell>{user.activeLoans}</TableCell>
                          <TableCell>
                            <Badge 
                              variant={user.defaulted ? "destructive" : "default"}
                            >
                              {user.defaulted ? "Defaulted" : "Active"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => suspendUserMutation.mutate(user.id)}
                              disabled={suspendUserMutation.isPending}
                            >
                              {user.defaulted ? "Suspended" : "Suspend"}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Platform Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Loan Approval Rate</span>
                      <span className="text-sm font-bold text-green-600">94.2%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Average Loan Size</span>
                      <span className="text-sm font-bold">$7,850</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Platform Utilization</span>
                      <span className="text-sm font-bold text-blue-600">87.3%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">User Retention Rate</span>
                      <span className="text-sm font-bold text-green-600">78.5%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Risk Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Average LTV Ratio</span>
                      <span className="text-sm font-bold">68.4%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Collateral Coverage</span>
                      <span className="text-sm font-bold text-green-600">146.2%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Late Payment Rate</span>
                      <span className="text-sm font-bold text-yellow-600">3.7%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Recovery Rate</span>
                      <span className="text-sm font-bold text-green-600">91.8%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}