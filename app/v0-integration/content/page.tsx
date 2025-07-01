"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Copy, 
  Trash2, 
  Eye, 
  Download,
  Share2,
  Calendar,
  Clock,
  TrendingUp,
  MessageSquare,
  Image,
  Video,
  Type,
  Hash,
  Zap,
  Sparkles,
  Bot,
  CheckCircle,
  AlertCircle,
  Play,
  Pause
} from "lucide-react";

// Enhanced mock data for content
const mockContent = [
  {
    id: 1,
    title: "10 Ways to Boost Your Social Media Engagement",
    type: "blog-post",
    status: "published",
    wordCount: 1200,
    readTime: 5,
    createdAt: "2024-06-15",
    updatedAt: "2024-06-15",
    views: 2847,
    shares: 156,
    aiGenerated: true,
    tags: ["social-media", "engagement", "marketing"],
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit...",
    seoScore: 92,
    readabilityScore: 88,
    thumbnail: "/placeholder.jpg"
  },
  {
    id: 2,
    title: "Summer Sale Announcement",
    type: "email-sequence",
    status: "draft",
    wordCount: 450,
    readTime: 2,
    createdAt: "2024-06-14",
    updatedAt: "2024-06-14",
    views: 0,
    shares: 0,
    aiGenerated: true,
    tags: ["email", "sales", "summer"],
    content: "Get ready for our biggest sale of the year...",
    seoScore: 85,
    readabilityScore: 92,
    thumbnail: "/placeholder.jpg"
  },
  {
    id: 3,
    title: "Product Launch Video Script",
    type: "video-script",
    status: "in-review",
    wordCount: 800,
    readTime: 3,
    createdAt: "2024-06-13",
    updatedAt: "2024-06-13",
    views: 156,
    shares: 23,
    aiGenerated: false,
    tags: ["video", "product", "launch"],
    content: "Welcome to our revolutionary new product...",
    seoScore: 78,
    readabilityScore: 95,
    thumbnail: "/placeholder.jpg"
  },
  {
    id: 4,
    title: "Instagram Carousel: Brand Story",
    type: "social-media",
    status: "published",
    wordCount: 200,
    readTime: 1,
    createdAt: "2024-06-12",
    updatedAt: "2024-06-12",
    views: 1247,
    shares: 89,
    aiGenerated: true,
    tags: ["instagram", "brand", "story"],
    content: "Our journey began with a simple idea...",
    seoScore: 82,
    readabilityScore: 90,
    thumbnail: "/placeholder.jpg"
  }
];

function ContentCard({ content, isSelected, onSelect, onEdit, onDelete, onDuplicate }: any) {
  const [showActions, setShowActions] = useState(false);

  const typeConfig = {
    "blog-post": { icon: FileText, color: "text-neon-blue" },
    "email-sequence": { icon: MessageSquare, color: "text-neon-purple" },
    "video-script": { icon: Video, color: "text-neon-pink" },
    "social-media": { icon: Hash, color: "text-neon-green" },
  };

  const statusConfig = {
    published: { color: "text-neon-green", bg: "bg-neon-green/20", border: "border-neon-green/30" },
    draft: { color: "text-gray-400", bg: "bg-gray-500/20", border: "border-gray-500/30" },
    "in-review": { color: "text-yellow-400", bg: "bg-yellow-400/20", border: "border-yellow-400/30" },
  };

  const typeConf = typeConfig[content.type];
  const statusConf = statusConfig[content.status];
  const TypeIcon = typeConf.icon;

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      onClick={onSelect}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      className={`glassmorphism-effect p-6 rounded-lg cursor-pointer transition-all duration-300 relative ${
        isSelected ? "glow-border shadow-neon-blue/20" : "hover:border-neon-blue/30"
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg bg-white/5 ${typeConf.color}`}>
            <TypeIcon className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-white text-lg leading-tight">{content.title}</h3>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-xs text-gray-400">{content.type.replace("-", " ")}</span>
              <span className="text-xs text-gray-500">•</span>
              <span className="text-xs text-gray-400">{content.wordCount} words</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white"
            onClick={(e) => { e.stopPropagation(); onEdit(content); }}
          >
            <Edit className="w-4 h-4" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white"
            onClick={(e) => { e.stopPropagation(); onDelete(content); }}
          >
            <Trash2 className="w-4 h-4" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white"
            onClick={(e) => { e.stopPropagation(); onDuplicate(content); }}
          >
            <Copy className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-4 gap-4 mb-4">
        <div className="text-center glass p-3 rounded-lg">
          <div className="flex items-center justify-center mb-1">
            <Eye className="w-4 h-4 text-neon-blue mr-1" />
            <span className="text-lg font-bold text-neon-blue">{content.views}</span>
          </div>
          <p className="text-xs text-gray-400">Views</p>
        </div>
        <div className="text-center glass p-3 rounded-lg">
          <div className="flex items-center justify-center mb-1">
            <Eye className="w-4 h-4 text-neon-purple mr-1" />
            <span className="text-lg font-bold text-neon-purple">{content.shares}</span>
          </div>
          <p className="text-xs text-gray-400">Shares</p>
        </div>
        <div className="text-center glass p-3 rounded-lg">
          <div className="flex items-center justify-center mb-1">
            <TrendingUp className="w-4 h-4 text-neon-green mr-1" />
            <span className="text-lg font-bold text-neon-green">{content.seoScore}%</span>
          </div>
          <p className="text-xs text-gray-400">SEO Score</p>
        </div>
        <div className="text-center glass p-3 rounded-lg">
          <div className="flex items-center justify-center mb-1">
            <TrendingUp className="w-4 h-4 text-neon-green mr-1" />
            <span className="text-lg font-bold text-neon-green">{content.readabilityScore}%</span>
          </div>
          <p className="text-xs text-gray-400">Readability Score</p>
        </div>
      </div>

      {/* Budget Progress */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-400">Created At</span>
          <span className="text-white">{content.createdAt}</span>
        </div>
        <div className="neon-progress">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(content.views / 1000) * 100}%` }}
            transition={{ duration: 1, delay: 0.5 }}
            className="neon-progress-bar"
          />
        </div>
      </div>

      <AnimatePresence>
        {showActions && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-6 pt-6 border-t border-white/10"
          >
            {/* Detailed Metrics */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center glass p-3 rounded-lg">
                <p className="text-lg font-bold text-neon-green">{content.views}</p>
                <p className="text-xs text-gray-400">Views</p>
              </div>
              <div className="text-center glass p-3 rounded-lg">
                <p className="text-lg font-bold text-neon-blue">{content.shares}</p>
                <p className="text-xs text-gray-400">Shares</p>
              </div>
              <div className="text-center glass p-3 rounded-lg">
                <p className="text-lg font-bold text-neon-purple">{content.seoScore}%</p>
                <p className="text-xs text-gray-400">SEO Score</p>
              </div>
            </div>

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

export default function ContentPage() {
  const [expandedContent, setExpandedContent] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredContent = mockContent.filter(content => {
    const matchesSearch = content.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         content.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || content.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-4xl font-bold text-gradient mb-2">Content</h1>
          <p className="text-gray-400 text-lg">
            Manage your content and marketing strategies
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="btn-neon flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>New Content</span>
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
            placeholder="Search content..."
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
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="in-review">In Review</option>
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

      {/* Content Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="space-y-6"
      >
        {filteredContent.map((content, index) => (
          <motion.div
            key={content.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index }}
          >
            <ContentCard
              content={content}
              isSelected={expandedContent === content.id}
              onSelect={() => setExpandedContent(
                expandedContent === content.id ? null : content.id
              )}
              onEdit={(c) => { /* Implement edit logic */ }}
              onDelete={(c) => { /* Implement delete logic */ }}
              onDuplicate={(c) => { /* Implement duplicate logic */ }}
            />
          </motion.div>
        ))}
      </motion.div>

      {filteredContent.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No content found</h3>
          <p className="text-gray-400">Create your first content piece to get started</p>
        </motion.div>
      )}
    </div>
  );
} 