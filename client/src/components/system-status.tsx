import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useHealthCheck } from "@/hooks/useHealthCheck";
import { useQuery } from "@tanstack/react-query";
import { 
  CheckCircle, 
  AlertCircle, 
  XCircle, 
  RefreshCw, 
  Wifi,
  WifiOff,
  Server,
  Database,
  Zap
} from "lucide-react";

interface SystemMetrics {
  uptime: string;
  totalRequests: number;
  errorRate: number;
  avgResponseTime: number;
  activeUsers: number;
  lastUpdated: string;
}

export function SystemStatus() {
  const { healthStatus, isOnline, isLoading, refetch, isHealthy } = useHealthCheck();
  const [showDetails, setShowDetails] = useState(false);

  const { data: metrics } = useQuery({
    queryKey: ['/api/system/metrics'],
    refetchInterval: 60000, // Update every minute
  });

  // Mock metrics for development
  const mockMetrics: SystemMetrics = {
    uptime: "2d 14h 32m",
    totalRequests: 15847,
    errorRate: 0.8,
    avgResponseTime: 245,
    activeUsers: 127,
    lastUpdated: new Date().toISOString()
  };

  const systemMetrics = metrics || mockMetrics;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'degraded': return 'text-yellow-600';
      case 'unhealthy': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'degraded': return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      case 'unhealthy': return <XCircle className="w-4 h-4 text-red-600" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Server className="w-5 h-5" />
            System Status
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant={isHealthy ? "default" : "destructive"}>
              {isHealthy ? "Operational" : "Issues Detected"}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Connection Status */}
        <div className="flex items-center justify-between p-3 border rounded-lg">
          <div className="flex items-center gap-3">
            {isOnline ? <Wifi className="w-4 h-4 text-green-600" /> : <WifiOff className="w-4 h-4 text-red-600" />}
            <span className="font-medium">Internet Connection</span>
          </div>
          <Badge variant={isOnline ? "default" : "destructive"}>
            {isOnline ? "Connected" : "Offline"}
          </Badge>
        </div>

        {/* API Status */}
        <div className="flex items-center justify-between p-3 border rounded-lg">
          <div className="flex items-center gap-3">
            {getStatusIcon(healthStatus.status)}
            <div>
              <div className="font-medium">API Services</div>
              <div className="text-xs text-muted-foreground">
                Response time: {healthStatus.responseTime}ms
              </div>
            </div>
          </div>
          <Badge 
            variant={healthStatus.status === 'healthy' ? "default" : "destructive"}
            className={getStatusColor(healthStatus.status)}
          >
            {healthStatus.status.charAt(0).toUpperCase() + healthStatus.status.slice(1)}
          </Badge>
        </div>

        {/* Database Status */}
        <div className="flex items-center justify-between p-3 border rounded-lg">
          <div className="flex items-center gap-3">
            <Database className={`w-4 h-4 ${healthStatus.database ? 'text-green-600' : 'text-red-600'}`} />
            <span className="font-medium">Database</span>
          </div>
          <Badge variant={healthStatus.database ? "default" : "destructive"}>
            {healthStatus.database ? "Connected" : "Disconnected"}
          </Badge>
        </div>

        {/* System Metrics Toggle */}
        <Button
          variant="ghost"
          className="w-full"
          onClick={() => setShowDetails(!showDetails)}
        >
          {showDetails ? "Hide" : "Show"} System Metrics
        </Button>

        {/* Detailed Metrics */}
        {showDetails && (
          <div className="space-y-3 pt-2 border-t">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-lg font-bold">{systemMetrics.uptime}</div>
                <div className="text-xs text-muted-foreground">Uptime</div>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-lg font-bold">{systemMetrics.activeUsers}</div>
                <div className="text-xs text-muted-foreground">Active Users</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-lg font-bold">{systemMetrics.totalRequests.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">Total Requests</div>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-lg font-bold">{systemMetrics.errorRate}%</div>
                <div className="text-xs text-muted-foreground">Error Rate</div>
              </div>
            </div>

            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="flex items-center justify-center gap-2">
                <Zap className="w-4 h-4 text-yellow-600" />
                <span className="font-bold">{systemMetrics.avgResponseTime}ms</span>
              </div>
              <div className="text-xs text-muted-foreground">Average Response Time</div>
            </div>

            <div className="text-xs text-muted-foreground text-center">
              Last updated: {new Date(systemMetrics.lastUpdated).toLocaleTimeString()}
            </div>
          </div>
        )}

        {/* Status Indicator */}
        <div className="flex items-center justify-center gap-2 pt-2">
          <div className={`w-2 h-2 rounded-full ${isHealthy ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
          <span className="text-xs text-muted-foreground">
            All systems {isHealthy ? "operational" : "experiencing issues"}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}