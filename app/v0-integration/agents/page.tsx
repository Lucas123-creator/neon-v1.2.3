"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bot, 
  Play, 
  Pause, 
  Settings, 
  Activity,
  CheckCircle,
  AlertCircle,
  Clock,
  Zap,
  BarChart3,
  Loader2,
  RefreshCw,
  TrendingUp,
  Cpu,
  Memory,
  Wifi,
  HardDrive,
  Target,
  MessageSquare,
  FileText,
  TrendingDown,
  Users,
  Eye
} from "lucide-react";

// Enhanced mock data for agents with real-time monitoring
const mockAgents = [
  {
    id: 1,
    name: "Content Agent",
    type: "content",
    status: "active",
    description: "AI-powered content generation and optimization",
    performance: 94,
    tasksCompleted: 156,
    uptime: "99.8%",
    avgResponseTime: "1.2s",
    cpu: 23,
    memory: 45,
    lastActivity: "2 min ago",
    efficiency: 98.2,
    logs: [
      { id: 1, level: "success", message: "Generated 15 social media posts", timestamp: "2 min ago" },
      { id: 2, level: "info", message: "Optimized content for SEO", timestamp: "5 min ago" },
      { id: 3, level: "info", message: "Scheduled posts for next week", timestamp: "8 min ago" }
    ]
  },
  {
    id: 2,
    name: "Email Agent",
    type: "email",
    status: "active",
    description: "Automated email campaign management and optimization",
    performance: 87,
    tasksCompleted: 89,
    uptime: "99.5%",
    avgResponseTime: "0.8s",
    cpu: 18,
    memory: 32,
    lastActivity: "1 min ago",
    efficiency: 92.1,
    logs: [
      { id: 1, level: "success", message: "Campaign sent to 5,000 subscribers", timestamp: "1 min ago" },
      { id: 2, level: "info", message: "A/B test completed - Variant A wins", timestamp: "3 min ago" },
      { id: 3, level: "info", message: "Sequence triggered for abandoned carts", timestamp: "6 min ago" }
    ]
  },
  {
    id: 3,
    name: "Support Agent",
    type: "support",
    status: "idle",
    description: "Customer support automation and ticket management",
    performance: 92,
    tasksCompleted: 234,
    uptime: "99.9%",
    avgResponseTime: "2.1s",
    cpu: 12,
    memory: 28,
    lastActivity: "5 min ago",
    efficiency: 95.7,
    logs: [
      { id: 1, level: "success", message: "Resolved 8 customer tickets", timestamp: "5 min ago" },
      { id: 2, level: "info", message: "Updated knowledge base", timestamp: "10 min ago" },
      { id: 3, level: "info", message: "Trained on new support patterns", timestamp: "15 min ago" }
    ]
  },
  {
    id: 4,
    name: "Trend Agent",
    type: "trend",
    status: "training",
    description: "Market trend analysis and prediction",
    performance: 78,
    tasksCompleted: 67,
    uptime: "98.2%",
    avgResponseTime: "3.5s",
    cpu: 45,
    memory: 62,
    lastActivity: "10 min ago",
    efficiency: 88.9,
    logs: [
      { id: 1, level: "warning", message: "High CPU usage detected", timestamp: "10 min ago" },
      { id: 2, level: "info", message: "Analyzing viral hashtag trends", timestamp: "12 min ago" },
      { id: 3, level: "info", message: "Training on new market data", timestamp: "15 min ago" }
    ]
  }
];

function AgentStatusCard({ agent }: any) {
  const statusConfig = {
    active: {
      color: "text-neon-green",
      bg: "bg-neon-green/20",
      border: "border-neon-green/30",
      pulse: "campaign-status-active",
      icon: Activity,
    },
    idle: {
      color: "text-gray-400",
      bg: "bg-gray-500/20",
      border: "border-gray-500/30",
      pulse: "campaign-status-idle",
      icon: Clock,
    },
    training: {
      color: "text-neon-blue",
      bg: "bg-neon-blue/20",
      border: "border-neon-blue/30",
      pulse: "campaign-status-draft",
      icon: RefreshCw,
    },
    error: {
      color: "text-neon-pink",
      bg: "bg-neon-pink/20",
      border: "border-neon-pink/30",
      pulse: "campaign-status-paused",
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

        {/* System Resources */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-gray-400">CPU</span>
            <span className="text-white">{agent.cpu}%</span>
          </div>
          <div className="neon-progress">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${agent.cpu}%` }}
              transition={{ duration: 1, delay: 0.5 }}
              className="neon-progress-bar"
            />
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-400">Memory</span>
            <span className="text-white">{agent.memory}%</span>
          </div>
          <div className="neon-progress">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${agent.memory}%` }}
              transition={{ duration: 1, delay: 0.5 }}
              className="neon-progress-bar"
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-2 mt-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="btn-neon flex-1 flex items-center justify-center space-x-2"
        >
          <Play className="w-4 h-4" />
          <span>Start</span>
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="glass px-3 py-2 rounded-lg border border-white/20 hover:border-neon-blue/30 transition-colors"
        >
          <Settings className="w-4 h-4" />
        </motion.button>
      </div>
    </motion.div>
  );
}

function LogEntry({ log }: any) {
  const getLogColor = (level: string) => {
    switch (level) {
      case "success": return "text-neon-green";
      case "error": return "text-neon-pink";
      case "warning": return "text-yellow-400";
      default: return "text-neon-blue";
    }
  };

  const getLogIcon = (level: string) => {
    switch (level) {
      case "success": return <CheckCircle className="h-4 w-4" />;
      case "error": return <AlertCircle className="h-4 w-4" />;
      case "warning": return <AlertCircle className="h-4 w-4" />;
      default: return <Activity className="h-4 h-4" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-start space-x-3 p-3 rounded-lg hover:bg-white/5 transition-colors"
    >
      <div className={`${getLogColor(log.level)} mt-0.5`}>
        {getLogIcon(log.level)}
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-white">{log.message}</p>
        <p className="text-xs text-gray-400">{log.timestamp}</p>
      </div>
    </motion.div>
  );
}

function SystemHealthCard() {
  const systemMetrics = {
    cpu: 23,
    memory: 67,
    storage: 45,
    network: 89
  };

  const healthMetrics = [
    { name: "CPU", value: systemMetrics.cpu, color: "neon-blue", icon: Cpu },
    { name: "Memory", value: systemMetrics.memory, color: "neon-purple", icon: Memory },
    { name: "Storage", value: systemMetrics.storage, color: "neon-green", icon: HardDrive },
    { name: "Network", value: systemMetrics.network, color: "neon-pink", icon: Wifi },
  ];

  return (
    <div className="glassmorphism-effect p-6 rounded-lg">
      <h3 className="text-xl font-bold text-white mb-4 flex items-center">
        <Activity className="w-5 h-5 mr-2 text-neon-green" />
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

export default function AgentsPage() {
  const [selectedAgent, setSelectedAgent] = useState<number | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  // Calculate metrics from mock data
  const metrics = {
    totalAgents: mockAgents.length,
    activeAgents: mockAgents.filter(a => a.status === "active").length,
    avgPerformance: Math.round(mockAgents.reduce((acc, agent) => acc + agent.performance, 0) / mockAgents.length),
    totalTasks: mockAgents.reduce((acc, agent) => acc + agent.tasksCompleted, 0),
    systemHealth: 94,
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-4xl font-bold text-gradient mb-2">Agent Hub</h1>
          <p className="text-gray-400 text-lg">
            Monitor and manage your AI agents in real-time
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

      {/* Metrics Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
      >
        <div className="glass-strong p-6 rounded-lg border border-neon-blue/30">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-white/5 text-neon-blue">
              <Bot className="w-6 h-6" />
            </div>
            <div className="text-sm text-neon-green">+2</div>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-gray-400">Total Agents</p>
            <p className="text-3xl font-bold text-neon-blue">{metrics.totalAgents}</p>
          </div>
        </div>

        <div className="glass-strong p-6 rounded-lg border border-neon-green/30">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-white/5 text-neon-green">
              <Activity className="w-6 h-6" />
            </div>
            <div className="text-sm text-neon-green">+1</div>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-gray-400">Active Agents</p>
            <p className="text-3xl font-bold text-neon-green">{metrics.activeAgents}</p>
          </div>
        </div>

        <div className="glass-strong p-6 rounded-lg border border-neon-purple/30">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-white/5 text-neon-purple">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div className="text-sm text-neon-green">+5%</div>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-gray-400">Avg Performance</p>
            <p className="text-3xl font-bold text-neon-purple">{metrics.avgPerformance}%</p>
          </div>
        </div>

        <div className="glass-strong p-6 rounded-lg border border-neon-pink/30">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-white/5 text-neon-pink">
              <Target className="w-6 h-6" />
            </div>
            <div className="text-sm text-neon-green">+23</div>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-gray-400">Total Tasks</p>
            <p className="text-3xl font-bold text-neon-pink">{metrics.totalTasks}</p>
          </div>
        </div>
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
              {mockAgents.map((agent, index) => (
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

        {/* Recent Logs */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="glassmorphism-effect p-6 rounded-lg h-full">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center">
              <Activity className="w-5 h-5 mr-2 text-neon-purple" />
              Recent Logs
            </h3>
            <div className="space-y-2 max-h-96 overflow-y-auto scrollbar-hide">
              {mockAgents.flatMap(agent => agent.logs.slice(0, 2)).map((log, index) => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <LogEntry log={log} />
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
