"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  Bot,
  Campaign,
  FileText,
  Mail,
  Settings,
  TrendingUp,
  Users,
  MessageSquare,
  Shield,
} from "lucide-react";

const navigationItems = [
  {
    name: "Dashboard",
    href: "/v0-integration/dashboard",
    icon: BarChart3,
    description: "Overview & KPIs",
  },
  {
    name: "Campaigns",
    href: "/v0-integration/campaigns",
    icon: Campaign,
    description: "Campaign Management",
  },
  {
    name: "Content Studio",
    href: "/v0-integration/content",
    icon: FileText,
    description: "AI Content Generation",
  },
  {
    name: "Agent Hub",
    href: "/v0-integration/agents",
    icon: Bot,
    description: "AI Agent Management",
  },
  {
    name: "Trend Radar",
    href: "/v0-integration/trends",
    icon: TrendingUp,
    description: "Market Intelligence",
  },
  {
    name: "Support Inbox",
    href: "/v0-integration/support",
    icon: MessageSquare,
    description: "Customer Support",
  },
  {
    name: "Analytics",
    href: "/v0-integration/analytics",
    icon: BarChart3,
    description: "Performance Insights",
  },
  {
    name: "Settings",
    href: "/v0-integration/settings",
    icon: Settings,
    description: "Platform Configuration",
  },
  {
    name: "Admin Tools",
    href: "/v0-integration/admin",
    icon: Shield,
    description: "System Administration",
  },
];

export function V0Navigation() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col bg-card border-r">
      {/* Logo */}
      <div className="flex h-16 items-center px-6 border-b">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">N</span>
          </div>
          <span className="font-semibold text-lg">NeonHub v0</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {navigationItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
            >
              <item.icon
                className={cn(
                  "mr-3 h-5 w-5 flex-shrink-0",
                  isActive ? "text-primary-foreground" : "text-muted-foreground"
                )}
              />
              <div className="flex-1">
                <div className="font-medium">{item.name}</div>
                <div className="text-xs opacity-70">{item.description}</div>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="border-t p-4">
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Users className="h-4 w-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground">Admin User</p>
            <p className="text-xs text-muted-foreground">admin@neonhub.com</p>
          </div>
        </div>
      </div>
    </div>
  );
} 