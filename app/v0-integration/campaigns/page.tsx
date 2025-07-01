"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Target, 
  Mail, 
  Users, 
  TrendingUp, 
  Calendar, 
  MoreVertical,
  Play,
  Pause,
  Edit,
  Copy,
  Trash2,
  Plus,
  Filter,
  Search,
  BarChart3,
  Eye,
  MousePointer,
  MessageSquare,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  Zap,
  Bot,
  Activity
} from "lucide-react";

// Enhanced mock data for campaigns with EmailAgent and OutreachAgent integration
const mockCampaigns = [
  {
    id: 1,
    name: "Summer Sale 2024",
    description: "Promote summer collection with 30% discount",
    type: "email",
    status: "active",
    startDate: "2024-06-01",
    endDate: "2024-08-31",
    budget: 5000,
    spent: 3200,
    recipients: 25000,
    openRate: 24.5,
    clickRate: 8.7,
    conversionRate: 3.2,
    revenue: 15600,
    sequences: [
      { id: 1, name: "Welcome Series", status: "active", openRate: 28.3, emailsSent: 1250 },
      { id: 2, name: "Abandoned Cart", status: "active", openRate: 22.1, emailsSent: 890 },
      { id: 3, name: "Follow-up", status: "draft", openRate: 0, emailsSent: 0 }
    ],
    abTests: [
      { id: 1, name: "Subject Line A/B", status: "running", winner: "A", improvement: 12.5 },
      { id: 2, name: "CTA Button Test", status: "completed", winner: "B", improvement: 8.3 }
    ],
    agentStatus: {
      emailAgent: "active",
      outreachAgent: "idle",
      lastEmailSent: "2 min ago",
      nextSequence: "Follow-up Series"
    }
  },
  {
    id: 2,
    name: "Product Launch",
    description: "Announce new product line",
    type: "social",
    status: "draft",
    startDate: "2024-07-15",
    endDate: "2024-07-30",
    budget: 3000,
    spent: 0,
    recipients: 15000,
    openRate: 0,
    clickRate: 0,
    conversionRate: 0,
    revenue: 0,
    sequences: [],
    abTests: [],
    agentStatus: {
      emailAgent: "idle",
      outreachAgent: "idle",
      lastEmailSent: null,
      nextSequence: null
    }
  },
  {
    id: 3,
    name: "Holiday Special",
    description: "Black Friday and Cyber Monday deals",
    type: "email",
    status: "paused",
    startDate: "2024-11-20",
    endDate: "2024-12-02",
    budget: 8000,
    spent: 1200,
    recipients: 35000,
    openRate: 31.2,
    clickRate: 11.4,
    conversionRate: 4.8,
    revenue: 28400,
    sequences: [
      { id: 1, name: "Early Access", status: "active", openRate: 35.1, emailsSent: 2100 },
      { id: 2, name: "Flash Sale", status: "paused", openRate: 29.8, emailsSent: 1800 }
    ],
    abTests: [
      { id: 1, name: "Discount Amount", status: "running", winner: null, improvement: 0 }
    ],
    agentStatus: {
      emailAgent: "paused",
      outreachAgent: "active",
      lastEmailSent: "1 hour ago",
      nextSequence: "Flash Sale"
    }
  }
];

function CampaignCard({ campaign, isExpanded, onToggleExpand }: any) {
  const statusConfig = {
    active: {
      color: "text-neon-green",
      bg: "bg-neon-green/20",
      border: "border-neon-green/30",
      pulse: "campaign-status-active",
      icon: Play,
    },
    paused: {
      color: "text-yellow-400",
      bg: "bg-yellow-400/20",
      border: "border-yellow-400/30",
      pulse: "campaign-status-paused",
      icon: Pause,
    },
    draft: {
      color: "text-neon-blue",
      bg: "bg-neon-blue/20",
      border: "border-neon-blue/30",
      pulse: "campaign-status-draft",
      icon: Edit,
    },
  };

  const config = statusConfig[campaign.status];
  const StatusIcon = config.icon;

  const roi = campaign.revenue > 0 ? ((campaign.revenue - campaign.spent) / campaign.spent * 100) : 0;
  const roiClass = roi >= 300 ? "roi-excellent" : roi >= 200 ? "roi-good" : roi >= 100 ? "roi-average" : "roi-poor";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.01 }}
      className={`glassmorphism-effect p-6 rounded-lg cursor-pointer transition-all duration-300 ${
        isExpanded ? "glow-border shadow-neon-blue/20" : "hover:border-neon-blue/30"
      }`}
      onClick={onToggleExpand}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-lg bg-white/5 text-neon-blue">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-white text-lg">{campaign.name}</h3>
            <p className="text-sm text-gray-400">{campaign.description}</p>
            <div className="flex items-center space-x-2 mt-1">
              <Calendar className="w-3 h-3 text-gray-500" />
              <span className="text-xs text-gray-500">
                {new Date(campaign.startDate).toLocaleDateString()} - {new Date(campaign.endDate).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span
            className={`px-3 py-1 text-xs font-medium rounded-full border ${config.bg} ${config.border} ${config.color} ${config.pulse}`}
          >
            <StatusIcon className="w-3 h-3 inline mr-1" />
            {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
          </span>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreVertical className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-4 gap-4 mb-4">
        <div className="text-center glass p-3 rounded-lg">
          <div className="flex items-center justify-center mb-1">
            <Eye className="w-4 h-4 text-neon-blue mr-1" />
            <span className="text-lg font-bold text-neon-blue">{campaign.openRate}%</span>
          </div>
          <p className="text-xs text-gray-400">Open Rate</p>
        </div>
        <div className="text-center glass p-3 rounded-lg">
          <div className="flex items-center justify-center mb-1">
            <MousePointer className="w-4 h-4 text-neon-purple mr-1" />
            <span className="text-lg font-bold text-neon-purple">{campaign.clickRate}%</span>
          </div>
          <p className="text-xs text-gray-400">Click Rate</p>
        </div>
        <div className="text-center glass p-3 rounded-lg">
          <div className="flex items-center justify-center mb-1">
            <TrendingUp className="w-4 h-4 text-neon-green mr-1" />
            <span className="text-lg font-bold text-neon-green">{campaign.conversionRate}%</span>
          </div>
          <p className="text-xs text-gray-400">Conversion</p>
        </div>
        <div className="text-center glass p-3 rounded-lg">
          <div className="flex items-center justify-center mb-1">
            <DollarSign className="w-4 h-4 text-yellow-400 mr-1" />
            <span className={`text-lg font-bold ${roiClass}`}>{roi.toFixed(1)}%</span>
          </div>
          <p className="text-xs text-gray-400">ROI</p>
        </div>
      </div>

      {/* Budget Progress */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-400">Budget Usage</span>
          <span className="text-white">${campaign.spent.toLocaleString()} / ${campaign.budget.toLocaleString()}</span>
        </div>
        <div className="neon-progress">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(campaign.spent / campaign.budget) * 100}%` }}
            transition={{ duration: 1, delay: 0.5 }}
            className="neon-progress-bar"
          />
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-6 pt-6 border-t border-white/10"
          >
            {/* Agent Status */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-white mb-3 flex items-center">
                <Bot className="w-5 h-5 mr-2 text-neon-blue" />
                Agent Status
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="glass p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">Email Agent</span>
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${
                        campaign.agentStatus.emailAgent === "active" ? "bg-neon-green" : 
                        campaign.agentStatus.emailAgent === "paused" ? "bg-yellow-400" : "bg-gray-500"
                      }`} />
                      <span className="text-xs text-white capitalize">{campaign.agentStatus.emailAgent}</span>
                    </div>
                  </div>
                  {campaign.agentStatus.lastEmailSent && (
                    <p className="text-xs text-gray-400">Last sent: {campaign.agentStatus.lastEmailSent}</p>
                  )}
                </div>
                <div className="glass p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">Outreach Agent</span>
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${
                        campaign.agentStatus.outreachAgent === "active" ? "bg-neon-green" : 
                        campaign.agentStatus.outreachAgent === "paused" ? "bg-yellow-400" : "bg-gray-500"
                      }`} />
                      <span className="text-xs text-white capitalize">{campaign.agentStatus.outreachAgent}</span>
                    </div>
                  </div>
                  {campaign.agentStatus.nextSequence && (
                    <p className="text-xs text-gray-400">Next: {campaign.agentStatus.nextSequence}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Sequences */}
            {campaign.sequences.length > 0 && (
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-white mb-3">Email Sequences</h4>
                <div className="space-y-2">
                  {campaign.sequences.map((sequence: any) => (
                    <div key={sequence.id} className="flex items-center justify-between glass p-3 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Mail className="w-4 h-4 text-neon-blue" />
                        <span className="text-white">{sequence.name}</span>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          sequence.status === "active" 
                            ? "bg-neon-green/20 text-neon-green border border-neon-green/30"
                            : "bg-gray-500/20 text-gray-400 border border-gray-500/30"
                        }`}>
                          {sequence.status}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="text-sm text-neon-blue">{sequence.openRate}% open rate</span>
                        <span className="text-sm text-gray-400">{sequence.emailsSent} sent</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* A/B Tests */}
            {campaign.abTests.length > 0 && (
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-white mb-3">A/B Tests</h4>
                <div className="space-y-2">
                  {campaign.abTests.map((test: any) => (
                    <div key={test.id} className="flex items-center justify-between glass p-3 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <BarChart3 className="w-4 h-4 text-neon-purple" />
                        <span className="text-white">{test.name}</span>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          test.status === "running" 
                            ? "bg-neon-blue/20 text-neon-blue border border-neon-blue/30"
                            : "bg-neon-green/20 text-neon-green border border-neon-green/30"
                        }`}>
                          {test.status}
                        </span>
                      </div>
                      {test.winner && (
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-neon-green">Winner: {test.winner}</span>
                          <span className="text-sm text-neon-blue">+{test.improvement}%</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-neon flex items-center space-x-2"
              >
                <Zap className="w-4 h-4" />
                <span>Generate Sequence</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="glass px-4 py-2 rounded-lg border border-white/20 hover:border-neon-blue/30 transition-colors flex items-center space-x-2"
              >
                <Edit className="w-4 h-4" />
                <span>Edit</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="glass px-4 py-2 rounded-lg border border-white/20 hover:border-neon-blue/30 transition-colors flex items-center space-x-2"
              >
                <Copy className="w-4 h-4" />
                <span>Duplicate</span>
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function CampaignsPage() {
  const [expandedCampaign, setExpandedCampaign] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredCampaigns = mockCampaigns.filter(campaign => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || campaign.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-4xl font-bold text-gradient mb-2">Campaigns</h1>
          <p className="text-gray-400 text-lg">
            Manage your email campaigns and outreach strategies with AI agents
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="btn-neon flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>New Campaign</span>
        </motion.button>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex items-center space-x-4"
      >
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search campaigns..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:border-neon-blue/50 focus:outline-none"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-neon-blue/50 focus:outline-none"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="paused">Paused</option>
          <option value="draft">Draft</option>
        </select>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="glass px-4 py-2 rounded-lg border border-white/20 hover:border-neon-blue/30 transition-colors flex items-center space-x-2"
        >
          <Filter className="w-4 h-4" />
          <span>Filters</span>
        </motion.button>
      </motion.div>

      {/* Campaigns Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="space-y-6"
      >
        {filteredCampaigns.map((campaign, index) => (
          <motion.div
            key={campaign.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index }}
          >
            <CampaignCard
              campaign={campaign}
              isExpanded={expandedCampaign === campaign.id}
              onToggleExpand={() => setExpandedCampaign(
                expandedCampaign === campaign.id ? null : campaign.id
              )}
            />
          </motion.div>
        ))}
      </motion.div>

      {filteredCampaigns.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No campaigns found</h3>
          <p className="text-gray-400">Create your first campaign to get started</p>
        </motion.div>
      )}
    </div>
  );
}
