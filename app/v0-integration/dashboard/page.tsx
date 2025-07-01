"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Bot, 
  Activity,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  Zap,
  Target,
  MessageSquare,
  FileText,
  TrendingDown,
  Eye,
  MousePointer,
  Shield
} from "lucide-react";

// Enhanced mock data with real-time simulation
const mockData = {
  kpis: {
    revenue: { value: 124567, change: 12.5, trend: "up", format: "currency" },
    conversions: { value: 2847, change: 8.2, trend: "up", format: "number" },
    activeAgents: { value: 12, change: 2, trend: "up", format: "number" },
    responseTime: { value: 2.3, change: -15, trend: "down", format: "time" },
  },
  agents: [
    { 
      id: 1, 
      name: "Content Agent", 
      status: "active", 
      performance: 94, 
      type: "content",
      lastActivity: "2 min ago",
      tasksCompleted: 156,
      efficiency: 98.2
    },
    { 
      id: 2, 
      name: "Email Agent", 
      status: "active", 
      performance: 87, 
      type: "email",
      lastActivity: "1 min ago",
      tasksCompleted: 89,
      efficiency: 92.1
    },
    { 
      id: 3, 
      name: "Support Agent", 
      status: "idle", 
      performance: 92, 
      type: "support",
      lastActivity: "5 min ago",
      tasksCompleted: 234,
      efficiency: 95.7
    },
    { 
      id: 4, 
      name: "Trend Agent", 
      status: "training", 
      performance: 78, 
      type: "trend",
      lastActivity: "10 min ago",
      tasksCompleted: 67,
      efficiency: 88.9
    },
  ],
  recentActivity: [
    { 
      id: 1, 
      type: "campaign", 
      message: "Summer Sale campaign launched", 
      time: "2 min ago",
      icon: Target,
      color: "neon-blue"
    },
    { 
      id: 2, 
      type: "content", 
      message: "Generated 15 social media posts", 
      time: "5 min ago",
      icon: FileText,
      color: "neon-purple"
    },
    { 
      id: 3, 
      type: "support", 
      message: "Resolved 8 customer tickets", 
      time: "10 min ago",
      icon: MessageSquare,
      color: "neon-green"
    },
    { 
      id: 4, 
      type: "trend", 
      message: "Detected viral hashtag trend", 
      time: "15 min ago",
      icon: TrendingUp,
      color: "neon-pink"
    },
  ],
  systemHealth: {
    cpu: 23,
    memory: 67,
    storage: 45,
    network: 89
  }
};

function KPIMetricCard({ title, value, change, format = "number", icon, color, isTopPerformer = false }: any) {
  const [displayValue, setDisplayValue] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDisplayValue(value);
      setIsLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [value]);

  const formatValue = (val: number) => {
    switch (format) {
      case "currency":
        return `$${val.toLocaleString()}`;
      case "percentage":
        return `${val}%`;
      case "time":
        return `${val}s`;
      default:
        return val.toLocaleString();
    }
  };

  const colorClasses = {
    blue: "text-neon-blue border-neon-blue/30",
    purple: "text-neon-purple border-neon-purple/30",
    pink: "text-neon-pink border-neon-pink/30",
    green: "text-neon-green border-neon-green/30",
  };

  const glowClasses = {
    blue: "shadow-neon-blue/20",
    purple: "shadow-neon-purple/20",
    pink: "shadow-neon-pink/20",
    green: "shadow-neon-green/20",
  };

  const isPositive = change >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.02 }}
      className={`glass-strong p-6 rounded-lg border transition-all duration-300 ${
        colorClasses[color]
      } ${glowClasses[color]} ${isTopPerformer ? "glow-border animate-pulse" : ""} hover:border-opacity-50`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg bg-white/5 ${colorClasses[color].split(" ")[0]}`}>
          {isLoading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            >
              <RefreshCw className="w-6 h-6" />
            </motion.div>
          ) : (
            icon
          )}
        </div>
        <div className={`flex items-center space-x-1 text-sm ${isPositive ? "text-neon-green" : "text-neon-pink"}`}>
          {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          <span>
            {isPositive ? "+" : ""}
            {change}%
          </span>
        </div>
      </div>

      <div className="space-y-1">
        <p className="text-sm text-gray-400">{title}</p>
        <motion.p
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className={`text-3xl font-bold ${colorClasses[color].split(" ")[0]} counter-animate`}
        >
          {isLoading ? "..." : formatValue(displayValue)}
        </motion.p>
      </div>

      {isTopPerformer && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-3 px-2 py-1 bg-neon-green/20 text-neon-green text-xs font-medium rounded-full border border-neon-green/30 w-fit"
        >
          Top Performer
        </motion.div>
      )}
    </motion.div>
  );
}

function AgentStatusCard({ agent }: any) {
  const statusConfig = {
    active: {
      color: "text-neon-green",
      bg: "bg-neon-green/20",
      border: "border-neon-green/30",
      pulse: "agent-status-active",
      icon: Activity,
    },
    idle: {
      color: "text-gray-400",
      bg: "bg-gray-500/20",
      border: "border-gray-500/30",
      pulse: "agent-status-idle",
      icon: Clock,
    },
    training: {
      color: "text-neon-blue",
      bg: "bg-neon-blue/20",
      border: "border-neon-blue/30",
      pulse: "agent-status-training",
      icon: RefreshCw,
    },
    error: {
      color: "text-neon-pink",
      bg: "bg-neon-pink/20",
      border: "border-neon-pink/30",
      pulse: "agent-status-error",
      icon: AlertCircle,
    },
  };

  const config = statusConfig[agent.status];
  const StatusIcon = config.icon;

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`glassmorphism-effect p-6 rounded-lg cursor-pointer transition-all duration-300 ${
        agent.status === "active" ? "border-neon-blue/50 glow-border shadow-neon-blue/20" : "border-white/10 hover:border-neon-blue/30"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg bg-white/5 ${config.color}`}>
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-white text-lg">{agent.name}</h3>
            <p className="text-sm text-gray-400">{agent.lastActivity}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${config.bg} ${config.border} ${config.pulse}`} />
          <StatusIcon className={`w-4 h-4 ${config.color}`} />
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-400">Performance</span>
          <span className="text-sm font-medium text-white">{agent.performance}%</span>
        </div>
        <div className="neon-progress">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${agent.performance}%` }}
            transition={{ duration: 1, delay: 0.5 }}
            className="neon-progress-bar"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="glass p-3 rounded-lg text-center">
            <p className="text-lg font-bold text-neon-blue">{agent.tasksCompleted}</p>
            <p className="text-xs text-gray-400">Tasks</p>
          </div>
          <div className="glass p-3 rounded-lg text-center">
            <p className="text-lg font-bold text-neon-green">{agent.efficiency}%</p>
            <p className="text-xs text-gray-400">Efficiency</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function ActivityItem({ activity }: any) {
  const Icon = activity.icon;
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-start space-x-3 p-3 rounded-lg hover:bg-white/5 transition-colors"
    >
      <div className={`p-2 rounded-lg bg-white/5 ${activity.color}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-white">{activity.message}</p>
        <p className="text-xs text-gray-400">{activity.time}</p>
      </div>
    </motion.div>
  );
}

function SystemHealthCard() {
  const healthMetrics = [
    { name: "CPU", value: mockData.systemHealth.cpu, color: "neon-blue", icon: Activity },
    { name: "Memory", value: mockData.systemHealth.memory, color: "neon-purple", icon: Shield },
    { name: "Storage", value: mockData.systemHealth.storage, color: "neon-green", icon: Eye },
    { name: "Network", value: mockData.systemHealth.network, color: "neon-pink", icon: MousePointer },
  ];

  return (
    <div className="glassmorphism-effect p-6 rounded-lg">
      <h3 className="text-xl font-bold text-white mb-4 flex items-center">
        <Shield className="w-5 h-5 mr-2 text-neon-green" />
        System Health
      </h3>
      <div className="grid grid-cols-2 gap-4">
        {healthMetrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div key={metric.name} className="glass p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <Icon className={`w-4 h-4 ${metric.color}`} />
                <span className="text-sm text-gray-400">{metric.name}</span>
              </div>
              <div className="neon-progress">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${metric.value}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="neon-progress-bar"
                />
              </div>
              <p className="text-sm font-medium text-white mt-1">{metric.value}%</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-4xl font-bold text-gradient mb-2">Dashboard</h1>
          <p className="text-gray-400 text-lg">
            Welcome back! Here's what's happening with your NeonHub agents.
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleRefresh}
          className="btn-neon flex items-center space-x-2"
          disabled={isRefreshing}
        >
          <motion.div
            animate={{ rotate: isRefreshing ? 360 : 0 }}
            transition={{ duration: 1, repeat: isRefreshing ? Number.POSITIVE_INFINITY : 0 }}
          >
            <RefreshCw className="w-4 h-4" />
          </motion.div>
          <span>{isRefreshing ? "Refreshing..." : "Refresh"}</span>
        </motion.button>
      </motion.div>

      {/* KPIs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
      >
        <KPIMetricCard
          title="Total Revenue"
          value={mockData.kpis.revenue.value}
          change={mockData.kpis.revenue.change}
          format={mockData.kpis.revenue.format}
          icon={<DollarSign className="w-6 h-6" />}
          color="green"
          isTopPerformer={true}
        />
        <KPIMetricCard
          title="Conversions"
          value={mockData.kpis.conversions.value}
          change={mockData.kpis.conversions.change}
          format={mockData.kpis.conversions.format}
          icon={<Users className="w-6 h-6" />}
          color="blue"
        />
        <KPIMetricCard
          title="Active Agents"
          value={mockData.kpis.activeAgents.value}
          change={mockData.kpis.activeAgents.change}
          format={mockData.kpis.activeAgents.format}
          icon={<Bot className="w-6 h-6" />}
          color="purple"
        />
        <KPIMetricCard
          title="Avg Response Time"
          value={mockData.kpis.responseTime.value}
          change={mockData.kpis.responseTime.change}
          format={mockData.kpis.responseTime.format}
          icon={<Activity className="w-6 h-6" />}
          color="pink"
        />
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Agent Status */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2"
        >
          <div className="glassmorphism-effect p-6 rounded-lg">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center">
              <Bot className="w-5 h-5 mr-2 text-neon-blue" />
              Agent Status
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              {mockData.agents.map((agent, index) => (
                <motion.div
                  key={agent.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <AgentStatusCard agent={agent} />
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="glassmorphism-effect p-6 rounded-lg h-full">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center">
              <Activity className="w-5 h-5 mr-2 text-neon-purple" />
              Recent Activity
            </h3>
            <div className="space-y-2 max-h-96 overflow-y-auto scrollbar-hide">
              {mockData.recentActivity.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <ActivityItem activity={activity} />
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* System Health */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <SystemHealthCard />
      </motion.div>
    </div>
  );
} 