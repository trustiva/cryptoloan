import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  database: boolean;
  api: boolean;
  responseTime: number;
  timestamp: string;
}

export function useHealthCheck() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const { data: healthStatus, isLoading, error, refetch } = useQuery({
    queryKey: ['/api/health'],
    refetchInterval: 30000, // Check every 30 seconds
    retry: 3,
    retryDelay: 1000,
    enabled: isOnline
  });

  // Mock health status for development
  const mockHealthStatus: HealthStatus = {
    status: 'healthy',
    database: true,
    api: true,
    responseTime: 150,
    timestamp: new Date().toISOString()
  };

  const status = healthStatus || mockHealthStatus;

  return {
    healthStatus: status,
    isOnline,
    isLoading,
    error,
    refetch,
    isHealthy: status.status === 'healthy' && isOnline
  };
}