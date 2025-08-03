import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  BarChart3, 
  PieChart, 
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Download,
  RefreshCw
} from "lucide-react";

interface AnalyticsData {
  overview: {
    totalRequests: number;
    averageResponseTime: number;
    slowRequestsPercentage: number;
    errorRate: number;
    successRate: number;
  };
  topEndpoints: Array<{
    endpoint: string;
    count: number;
    averageTime: number;
    errors: number;
    errorRate: number;
  }>;
  alerts: Array<{
    type: string;
    message: string;
    severity: 'high' | 'medium' | 'low';
  }>;
}

interface PlatformMetrics {
  loanMetrics: {
    totalLoans: number;
    activeLoans: number;
    completedLoans: number;
    defaultedLoans: number;
    totalVolume: number;
    averageLoanSize: number;
    approvalRate: number;
  };
  userMetrics: {
    totalUsers: number;
    activeUsers: number;
    newUsersThisMonth: number;
    retentionRate: number;
    averageUserValue: number;
  };
  revenueMetrics: {
    totalRevenue: number;
    monthlyRevenue: number;
    revenueGrowth: number;
    averageRevenuePerUser: number;
  };
}

export function AnalyticsDashboard() {
  const [selectedTimeRange, setSelectedTimeRange] = useState("7d");

  const { data: analyticsData, isLoading: analyticsLoading } = useQuery({
    queryKey: ["/api/admin/performance"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: platformMetrics, isLoading: metricsLoading } = useQuery({
    queryKey: ["/api/admin/platform-metrics", selectedTimeRange],
  });

  // Mock data for demonstration
  const mockAnalytics: AnalyticsData = {
    overview: {
      totalRequests: 15432,
      averageResponseTime: 245,
      slowRequestsPercentage: 3.2,
      errorRate: 1.8,
      successRate: 98.2
    },
    topEndpoints: [
      { endpoint: "GET /api/loans", count: 4521, averageTime: 180, errors: 23, errorRate: 0.5 },
      { endpoint: "POST /api/loans", count: 1834, averageTime: 420, errors: 12, errorRate: 0.7 },
      { endpoint: "GET /api/auth/user", count: 8934, averageTime: 95, errors: 45, errorRate: 0.5 },
      { endpoint: "POST /api/loans/:id/payment", count: 2341, averageTime: 320, errors: 8, errorRate: 0.3 },
      { endpoint: "GET /api/crypto-prices", count: 12453, averageTime: 150, errors: 34, errorRate: 0.3 }
    ],
    alerts: [
      { type: "high_error_rate", message: "Error rate spike detected on payment endpoints", severity: "high" },
      { type: "slow_response", message: "Average response time increased by 15%", severity: "medium" }
    ]
  };

  const mockPlatformMetrics: PlatformMetrics = {
    loanMetrics: {
      totalLoans: 2847,
      activeLoans: 892,
      completedLoans: 1834,
      defaultedLoans: 121,
      totalVolume: 18750000,
      averageLoanSize: 6580,
      approvalRate: 94.2
    },
    userMetrics: {
      totalUsers: 4521,
      activeUsers: 3247,
      newUsersThisMonth: 387,
      retentionRate: 78.5,
      averageUserValue: 4150
    },
    revenueMetrics: {
      totalRevenue: 234500,
      monthlyRevenue: 18750,
      revenueGrowth: 12.3,
      averageRevenuePerUser: 52
    }
  };

  const analytics = analyticsData || mockAnalytics;
  const metrics = platformMetrics || mockPlatformMetrics;

  if (analyticsLoading || metricsLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
          <p className="text-muted-foreground">Real-time platform performance and business metrics</p>
        </div>
        <div className="flex gap-2">
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value)}
            className="px-3 py-2 border rounded-md text-sm"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Alerts */}
      {analytics.alerts.length > 0 && (
        <div className="space-y-2">
          {analytics.alerts.map((alert, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border flex items-center gap-3 ${
                alert.severity === 'high' 
                  ? 'bg-destructive/10 border-destructive' 
                  : alert.severity === 'medium'
                  ? 'bg-yellow-50 border-yellow-200'
                  : 'bg-blue-50 border-blue-200'
              }`}
            >
              <AlertTriangle className={`w-4 h-4 ${
                alert.severity === 'high' ? 'text-destructive' : 'text-yellow-600'
              }`} />
              <span className="font-medium">{alert.message}</span>
              <Badge variant={alert.severity === 'high' ? 'destructive' : 'secondary'}>
                {alert.severity.toUpperCase()}
              </Badge>
            </div>
          ))}
        </div>
      )}

      <Tabs defaultValue="performance" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="business">Business Metrics</TabsTrigger>
          <TabsTrigger value="endpoints">API Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-6">
          {/* Performance Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Total Requests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.overview.totalRequests.toLocaleString()}</div>
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  +12% from last period
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Avg Response Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.overview.averageResponseTime}ms</div>
                <p className={`text-xs flex items-center gap-1 ${
                  analytics.overview.averageResponseTime > 300 ? 'text-yellow-600' : 'text-green-600'
                }`}>
                  {analytics.overview.averageResponseTime > 300 ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  {analytics.overview.averageResponseTime > 300 ? '+5%' : '-3%'} from last period
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Success Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.overview.successRate}%</div>
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  +0.2% from last period
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Error Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.overview.errorRate}%</div>
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <TrendingDown className="w-3 h-3" />
                  -0.3% from last period
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="business" className="space-y-6">
          {/* Business Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Loan Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Total Volume</span>
                  <span className="font-bold">${metrics.loanMetrics.totalVolume.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Active Loans</span>
                  <span className="font-bold">{metrics.loanMetrics.activeLoans}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Approval Rate</span>
                  <span className="font-bold text-green-600">{metrics.loanMetrics.approvalRate}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Average Size</span>
                  <span className="font-bold">${metrics.loanMetrics.averageLoanSize.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  User Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Total Users</span>
                  <span className="font-bold">{metrics.userMetrics.totalUsers.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Active Users</span>
                  <span className="font-bold">{metrics.userMetrics.activeUsers.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Retention Rate</span>
                  <span className="font-bold text-green-600">{metrics.userMetrics.retentionRate}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">New This Month</span>
                  <span className="font-bold text-blue-600">+{metrics.userMetrics.newUsersThisMonth}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Revenue Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Total Revenue</span>
                  <span className="font-bold">${metrics.revenueMetrics.totalRevenue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Monthly Revenue</span>
                  <span className="font-bold">${metrics.revenueMetrics.monthlyRevenue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Growth Rate</span>
                  <span className="font-bold text-green-600">+{metrics.revenueMetrics.revenueGrowth}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">ARPU</span>
                  <span className="font-bold">${metrics.revenueMetrics.averageRevenuePerUser}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="endpoints" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Top API Endpoints</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.topEndpoints.map((endpoint, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <div className="font-mono text-sm font-medium">{endpoint.endpoint}</div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{endpoint.count.toLocaleString()} requests</span>
                        <span>{endpoint.averageTime}ms avg</span>
                        <span>{endpoint.errors} errors</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={endpoint.errorRate > 1 ? "destructive" : "secondary"}>
                        {endpoint.errorRate.toFixed(1)}% error rate
                      </Badge>
                      <Badge variant={endpoint.averageTime > 500 ? "destructive" : "default"}>
                        {endpoint.averageTime}ms
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}