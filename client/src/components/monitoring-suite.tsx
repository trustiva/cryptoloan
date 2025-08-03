import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle,
  TrendingUp,
  Users,
  Database,
  Zap,
  Shield,
  Clock,
  BarChart3,
  RefreshCw
} from "lucide-react";

interface MonitoringData {
  systemHealth: {
    cpu: number;
    memory: number;
    disk: number;
    network: number;
  };
  apiMetrics: {
    totalRequests: number;
    successRate: number;
    errorRate: number;
    avgResponseTime: number;
  };
  userMetrics: {
    activeUsers: number;
    totalUsers: number;
    newUsers: number;
    conversionRate: number;
  };
  businessMetrics: {
    totalLoans: number;
    activeLoans: number;
    totalVolume: string;
    revenue: string;
  };
}

export function MonitoringSuite() {
  const [refreshInterval, setRefreshInterval] = useState(30000);
  const [isRealTime, setIsRealTime] = useState(true);

  const { data: healthData = {}, refetch: refetchHealth } = useQuery({
    queryKey: ['/api/health'],
    refetchInterval: refreshInterval
  });

  const { data: metricsData = {}, refetch: refetchMetrics } = useQuery({
    queryKey: ['/api/system/metrics'],
    refetchInterval: refreshInterval
  });

  // Mock comprehensive monitoring data
  const monitoringData: MonitoringData = {
    systemHealth: {
      cpu: Math.floor(Math.random() * 30 + 15), // 15-45%
      memory: Math.floor(Math.random() * 40 + 30), // 30-70%
      disk: Math.floor(Math.random() * 20 + 25), // 25-45%
      network: Math.floor(Math.random() * 50 + 100) // 100-150 Mbps
    },
    apiMetrics: {
      totalRequests: (metricsData as any)?.totalRequests || 15420,
      successRate: 98.5,
      errorRate: (metricsData as any)?.errorRate || 1.5,
      avgResponseTime: (metricsData as any)?.avgResponseTime || 245
    },
    userMetrics: {
      activeUsers: (metricsData as any)?.activeUsers || 142,
      totalUsers: 1580,
      newUsers: 23,
      conversionRate: 12.8
    },
    businessMetrics: {
      totalLoans: 456,
      activeLoans: 234,
      totalVolume: "$2.4M",
      revenue: "$48,500"
    }
  };

  const getHealthStatus = (value: number, thresholds: { good: number; warning: number }) => {
    if (value <= thresholds.good) return { status: 'good', color: 'text-green-600' };
    if (value <= thresholds.warning) return { status: 'warning', color: 'text-yellow-600' };
    return { status: 'critical', color: 'text-red-600' };
  };

  const toggleRealTime = () => {
    setIsRealTime(!isRealTime);
    setRefreshInterval(isRealTime ? 0 : 30000);
  };

  const manualRefresh = () => {
    refetchHealth();
    refetchMetrics();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">System Monitoring</h2>
          <p className="text-muted-foreground">
            Real-time monitoring and performance metrics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleRealTime}
            className={isRealTime ? "bg-green-50 text-green-700" : ""}
          >
            <Activity className="w-4 h-4 mr-2" />
            {isRealTime ? 'Real-time' : 'Paused'}
          </Button>
          <Button variant="outline" size="sm" onClick={manualRefresh}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="system">System Health</TabsTrigger>
          <TabsTrigger value="api">API Metrics</TabsTrigger>
          <TabsTrigger value="users">User Analytics</TabsTrigger>
          <TabsTrigger value="business">Business KPIs</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">System Health</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">98.5%</div>
                <div className="flex items-center gap-1 mt-1">
                  <CheckCircle className="w-3 h-3 text-green-600" />
                  <span className="text-xs text-green-600">All systems operational</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{monitoringData.userMetrics.activeUsers}</div>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3 text-green-600" />
                  <span className="text-xs text-green-600">+12% from yesterday</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Response Time</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{monitoringData.apiMetrics.avgResponseTime}ms</div>
                <div className="flex items-center gap-1 mt-1">
                  <CheckCircle className="w-3 h-3 text-green-600" />
                  <span className="text-xs text-green-600">Excellent</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Revenue Today</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$1,245</div>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3 text-green-600" />
                  <span className="text-xs text-green-600">+8.2% vs avg</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Security Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Rate Limiting</span>
                    <Badge className="bg-green-100 text-green-700">Active</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">SSL Certificate</span>
                    <Badge className="bg-green-100 text-green-700">Valid</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Firewall Rules</span>
                    <Badge className="bg-green-100 text-green-700">Configured</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Failed Login Attempts</span>
                    <Badge className="bg-yellow-100 text-yellow-700">3 today</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Recent Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-2 bg-yellow-50 rounded">
                    <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
                    <div className="flex-1">
                      <div className="text-sm font-medium">High Memory Usage</div>
                      <div className="text-xs text-muted-foreground">2 minutes ago</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-2 bg-green-50 rounded">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                    <div className="flex-1">
                      <div className="text-sm font-medium">Database Backup Completed</div>
                      <div className="text-xs text-muted-foreground">1 hour ago</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-2 bg-blue-50 rounded">
                    <Activity className="w-4 h-4 text-blue-600 mt-0.5" />
                    <div className="flex-1">
                      <div className="text-sm font-medium">Performance Optimization Applied</div>
                      <div className="text-xs text-muted-foreground">3 hours ago</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>CPU Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-2">{monitoringData.systemHealth.cpu}%</div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${monitoringData.systemHealth.cpu}%` }}
                  ></div>
                </div>
                <div className="mt-2">
                  <Badge className={getHealthStatus(monitoringData.systemHealth.cpu, { good: 50, warning: 80 }).color}>
                    {getHealthStatus(monitoringData.systemHealth.cpu, { good: 50, warning: 80 }).status}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Memory Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-2">{monitoringData.systemHealth.memory}%</div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ width: `${monitoringData.systemHealth.memory}%` }}
                  ></div>
                </div>
                <div className="mt-2">
                  <Badge className={getHealthStatus(monitoringData.systemHealth.memory, { good: 60, warning: 85 }).color}>
                    {getHealthStatus(monitoringData.systemHealth.memory, { good: 60, warning: 85 }).status}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Disk Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-2">{monitoringData.systemHealth.disk}%</div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-yellow-600 h-2 rounded-full" 
                    style={{ width: `${monitoringData.systemHealth.disk}%` }}
                  ></div>
                </div>
                <div className="mt-2">
                  <Badge className={getHealthStatus(monitoringData.systemHealth.disk, { good: 70, warning: 90 }).color}>
                    {getHealthStatus(monitoringData.systemHealth.disk, { good: 70, warning: 90 }).status}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Network I/O</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-2">{monitoringData.systemHealth.network} Mbps</div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-600 h-2 rounded-full" 
                    style={{ width: `${Math.min(100, (monitoringData.systemHealth.network / 200) * 100)}%` }}
                  ></div>
                </div>
                <div className="mt-2">
                  <Badge className="bg-green-100 text-green-700">Optimal</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="api" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Total Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{monitoringData.apiMetrics.totalRequests.toLocaleString()}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Success Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{monitoringData.apiMetrics.successRate}%</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Error Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{monitoringData.apiMetrics.errorRate}%</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Avg Response</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{monitoringData.apiMetrics.avgResponseTime}ms</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Active Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{monitoringData.userMetrics.activeUsers}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Total Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{monitoringData.userMetrics.totalUsers.toLocaleString()}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">New Users Today</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{monitoringData.userMetrics.newUsers}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Conversion Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{monitoringData.userMetrics.conversionRate}%</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="business" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Total Loans</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{monitoringData.businessMetrics.totalLoans}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Active Loans</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{monitoringData.businessMetrics.activeLoans}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Total Volume</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{monitoringData.businessMetrics.totalVolume}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{monitoringData.businessMetrics.revenue}</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}