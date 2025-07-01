import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Shield, 
  Users, 
  Activity, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  Database,
  Server,
  Cpu,
  Memory,
  Network,
  HardDrive,
  Zap,
  RefreshCw,
  Settings
} from "lucide-react";

// Mock data for development
const mockData = {
  systemHealth: {
    overall: 94,
    cpu: 67,
    memory: 82,
    disk: 45,
    network: 91,
  },
  activeUsers: 156,
  totalAgents: 12,
  systemUptime: "99.8%",
  lastBackup: "2 hours ago",
  alerts: [
    {
      id: 1,
      type: "warning",
      message: "High CPU usage detected on Agent-3",
      timestamp: "5 min ago",
      severity: "medium",
    },
    {
      id: 2,
      type: "error",
      message: "Database connection timeout",
      timestamp: "15 min ago",
      severity: "high",
    },
    {
      id: 3,
      type: "info",
      message: "System backup completed successfully",
      timestamp: "2 hours ago",
      severity: "low",
    },
  ],
  recentActivity: [
    {
      id: 1,
      action: "Agent deployed",
      user: "admin@neonhub.com",
      timestamp: "2 min ago",
      status: "success",
    },
    {
      id: 2,
      action: "System configuration updated",
      user: "admin@neonhub.com",
      timestamp: "10 min ago",
      status: "success",
    },
    {
      id: 3,
      action: "User permission changed",
      user: "admin@neonhub.com",
      timestamp: "1 hour ago",
      status: "success",
    },
  ],
  performanceMetrics: {
    avgResponseTime: "1.2s",
    requestsPerSecond: 245,
    errorRate: 0.3,
    activeConnections: 89,
  },
};

function SystemHealthCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Activity className="h-5 w-5 mr-2" />
          System Health
        </CardTitle>
        <CardDescription>
          Real-time system performance metrics
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Overall Health</span>
              <span>{mockData.systemHealth.overall}%</span>
            </div>
            <Progress value={mockData.systemHealth.overall} className="h-2" />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>CPU Usage</span>
              <span>{mockData.systemHealth.cpu}%</span>
            </div>
            <Progress value={mockData.systemHealth.cpu} className="h-2" />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Memory Usage</span>
              <span>{mockData.systemHealth.memory}%</span>
            </div>
            <Progress value={mockData.systemHealth.memory} className="h-2" />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Disk Usage</span>
              <span>{mockData.systemHealth.disk}%</span>
            </div>
            <Progress value={mockData.systemHealth.disk} className="h-2" />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Network</span>
              <span>{mockData.systemHealth.network}%</span>
            </div>
            <Progress value={mockData.systemHealth.network} className="h-2" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function AlertCard({ alert }: any) {
  const getAlertIcon = (type: string) => {
    switch (type) {
      case "error": return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "warning": return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "info": return <CheckCircle className="h-4 w-4 text-blue-500" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high": return "bg-red-500";
      case "medium": return "bg-yellow-500";
      case "low": return "bg-green-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <Card>
      <CardContent className="pt-4">
        <div className="flex items-start space-x-3">
          {getAlertIcon(alert.type)}
          <div className="flex-1">
            <p className="text-sm font-medium">{alert.message}</p>
            <p className="text-xs text-muted-foreground">{alert.timestamp}</p>
          </div>
          <div className={`w-2 h-2 rounded-full ${getSeverityColor(alert.severity)}`} />
        </div>
      </CardContent>
    </Card>
  );
}

function ActivityLogCard({ activity }: any) {
  return (
    <Card>
      <CardContent className="pt-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">{activity.action}</p>
            <p className="text-xs text-muted-foreground">{activity.user}</p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant={activity.status === "success" ? "default" : "secondary"}>
              {activity.status}
            </Badge>
            <span className="text-xs text-muted-foreground">{activity.timestamp}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function PerformanceMetricsCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Metrics</CardTitle>
        <CardDescription>
          System performance indicators
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Avg Response Time</p>
            <p className="text-lg font-semibold">{mockData.performanceMetrics.avgResponseTime}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Requests/sec</p>
            <p className="text-lg font-semibold">{mockData.performanceMetrics.requestsPerSecond}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Error Rate</p>
            <p className="text-lg font-semibold">{mockData.performanceMetrics.errorRate}%</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Active Connections</p>
            <p className="text-lg font-semibold">{mockData.performanceMetrics.activeConnections}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Tools</h1>
          <p className="text-muted-foreground">
            System administration and advanced controls.
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button>
            <Settings className="h-4 w-4 mr-2" />
            System Settings
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockData.activeUsers}</div>
            <p className="text-xs text-muted-foreground">+12 from yesterday</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Agents</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockData.totalAgents}</div>
            <p className="text-xs text-muted-foreground">All operational</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockData.systemUptime}</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Backup</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockData.lastBackup}</div>
            <p className="text-xs text-muted-foreground">Backup successful</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="activity">Activity Log</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <SystemHealthCard />
            <PerformanceMetricsCard />
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">System Alerts</h3>
              <p className="text-sm text-muted-foreground">
                Recent system alerts and notifications
              </p>
            </div>
            <Button variant="outline">
              <AlertTriangle className="h-4 w-4 mr-2" />
              View All
            </Button>
          </div>
          <div className="space-y-4">
            {mockData.alerts.map((alert) => (
              <AlertCard key={alert.id} alert={alert} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">Activity Log</h3>
              <p className="text-sm text-muted-foreground">
                Recent administrative activities
              </p>
            </div>
            <Button variant="outline">
              <Clock className="h-4 w-4 mr-2" />
              View All
            </Button>
          </div>
          <div className="space-y-4">
            {mockData.recentActivity.map((activity) => (
              <ActivityLogCard key={activity.id} activity={activity} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <PerformanceMetricsCard />
            <Card>
              <CardHeader>
                <CardTitle>Resource Usage</CardTitle>
                <CardDescription>
                  Real-time resource consumption
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Cpu className="h-4 w-4" />
                      <span className="text-sm">CPU</span>
                    </div>
                    <span className="text-sm font-medium">{mockData.systemHealth.cpu}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Memory className="h-4 w-4" />
                      <span className="text-sm">Memory</span>
                    </div>
                    <span className="text-sm font-medium">{mockData.systemHealth.memory}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <HardDrive className="h-4 w-4" />
                      <span className="text-sm">Disk</span>
                    </div>
                    <span className="text-sm font-medium">{mockData.systemHealth.disk}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Network className="h-4 w-4" />
                      <span className="text-sm">Network</span>
                    </div>
                    <span className="text-sm font-medium">{mockData.systemHealth.network}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>System Controls</CardTitle>
                <CardDescription>
                  Advanced system management
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full" variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Restart All Agents
                </Button>
                <Button className="w-full" variant="outline">
                  <Database className="h-4 w-4 mr-2" />
                  Backup Database
                </Button>
                <Button className="w-full" variant="outline">
                  <Server className="h-4 w-4 mr-2" />
                  System Maintenance
                </Button>
                <Button className="w-full" variant="outline">
                  <Zap className="h-4 w-4 mr-2" />
                  Clear Cache
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Security Status</CardTitle>
                <CardDescription>
                  System security overview
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Firewall</span>
                  <Badge variant="default">Active</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">SSL Certificate</span>
                  <Badge variant="default">Valid</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Intrusion Detection</span>
                  <Badge variant="default">Enabled</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Backup Encryption</span>
                  <Badge variant="default">Enabled</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 