import { Request, Response, NextFunction } from 'express';

interface PerformanceMetrics {
  requestCount: number;
  totalResponseTime: number;
  averageResponseTime: number;
  slowRequests: number;
  errorRate: number;
  successfulRequests: number;
  failedRequests: number;
  endpointMetrics: { [key: string]: {
    count: number;
    totalTime: number;
    averageTime: number;
    errors: number;
  }};
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics = {
    requestCount: 0,
    totalResponseTime: 0,
    averageResponseTime: 0,
    slowRequests: 0,
    errorRate: 0,
    successfulRequests: 0,
    failedRequests: 0,
    endpointMetrics: {}
  };

  private slowRequestThreshold = 1000; // 1 second
  private resetInterval: NodeJS.Timeout;

  constructor() {
    // Reset metrics every hour
    this.resetInterval = setInterval(() => {
      this.resetMetrics();
    }, 60 * 60 * 1000);
  }

  middleware() {
    return (req: Request, res: Response, next: NextFunction) => {
      const startTime = Date.now();
      const endpoint = `${req.method} ${req.route?.path || req.path}`;

      // Override res.end to capture response metrics
      const originalEnd = res.end;
      res.end = function(this: Response, ...args: any[]) {
        const responseTime = Date.now() - startTime;
        const statusCode = res.statusCode;

        // Update metrics
        performance.updateMetrics(endpoint, responseTime, statusCode);

        // Log slow requests
        if (responseTime > performance.slowRequestThreshold) {
          console.warn(`Slow request detected: ${endpoint} took ${responseTime}ms`);
        }

        originalEnd.apply(this, args);
      };

      next();
    };
  }

  private updateMetrics(endpoint: string, responseTime: number, statusCode: number) {
    this.metrics.requestCount++;
    this.metrics.totalResponseTime += responseTime;
    this.metrics.averageResponseTime = this.metrics.totalResponseTime / this.metrics.requestCount;

    if (responseTime > this.slowRequestThreshold) {
      this.metrics.slowRequests++;
    }

    if (statusCode >= 200 && statusCode < 400) {
      this.metrics.successfulRequests++;
    } else {
      this.metrics.failedRequests++;
    }

    this.metrics.errorRate = (this.metrics.failedRequests / this.metrics.requestCount) * 100;

    // Update endpoint-specific metrics
    if (!this.metrics.endpointMetrics[endpoint]) {
      this.metrics.endpointMetrics[endpoint] = {
        count: 0,
        totalTime: 0,
        averageTime: 0,
        errors: 0
      };
    }

    const endpointMetric = this.metrics.endpointMetrics[endpoint];
    endpointMetric.count++;
    endpointMetric.totalTime += responseTime;
    endpointMetric.averageTime = endpointMetric.totalTime / endpointMetric.count;

    if (statusCode >= 400) {
      endpointMetric.errors++;
    }
  }

  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  getSummary() {
    const topEndpoints = Object.entries(this.metrics.endpointMetrics)
      .sort(([,a], [,b]) => b.count - a.count)
      .slice(0, 10)
      .map(([endpoint, metrics]) => ({
        endpoint,
        ...metrics,
        errorRate: (metrics.errors / metrics.count) * 100
      }));

    return {
      overview: {
        totalRequests: this.metrics.requestCount,
        averageResponseTime: Math.round(this.metrics.averageResponseTime),
        slowRequestsPercentage: Math.round((this.metrics.slowRequests / this.metrics.requestCount) * 100),
        errorRate: Math.round(this.metrics.errorRate * 100) / 100,
        successRate: Math.round(((this.metrics.successfulRequests / this.metrics.requestCount) * 100) * 100) / 100
      },
      topEndpoints,
      alerts: this.generateAlerts()
    };
  }

  private generateAlerts() {
    const alerts = [];

    if (this.metrics.errorRate > 5) {
      alerts.push({
        type: 'high_error_rate',
        message: `High error rate detected: ${this.metrics.errorRate.toFixed(2)}%`,
        severity: 'high'
      });
    }

    if (this.metrics.averageResponseTime > 500) {
      alerts.push({
        type: 'slow_response',
        message: `Average response time is high: ${this.metrics.averageResponseTime.toFixed(0)}ms`,
        severity: 'medium'
      });
    }

    const slowRequestPercentage = (this.metrics.slowRequests / this.metrics.requestCount) * 100;
    if (slowRequestPercentage > 10) {
      alerts.push({
        type: 'many_slow_requests',
        message: `${slowRequestPercentage.toFixed(1)}% of requests are slow (>${this.slowRequestThreshold}ms)`,
        severity: 'medium'
      });
    }

    return alerts;
  }

  private resetMetrics() {
    this.metrics = {
      requestCount: 0,
      totalResponseTime: 0,
      averageResponseTime: 0,
      slowRequests: 0,
      errorRate: 0,
      successfulRequests: 0,
      failedRequests: 0,
      endpointMetrics: {}
    };
    console.log('Performance metrics reset');
  }

  cleanup() {
    if (this.resetInterval) {
      clearInterval(this.resetInterval);
    }
  }
}

// Create singleton instance
const performance = new PerformanceMonitor();

export { performance };
export default PerformanceMonitor;