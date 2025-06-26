import Link from 'next/link'
import { 
  Brain, 
  Images, 
  Settings, 
  TrendingUp, 
  CheckCircle, 
  Clock,
  AlertTriangle 
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@neon/ui'

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">AI System Dashboard</h1>
        <p className="text-muted-foreground">
          Monitor agent performance, manage assets, and configure system settings
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Agents</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              +2 from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
            <Images className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,247</div>
            <p className="text-xs text-muted-foreground">
              +180 this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Approval Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">87%</div>
            <p className="text-xs text-muted-foreground">
              +5% from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg Performance</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0.84</div>
            <p className="text-xs text-muted-foreground">
              +0.12 improvement
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <Link href="/training">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Brain className="h-8 w-8 text-primary" />
                <div className="flex items-center space-x-1 text-sm text-green-600">
                  <TrendingUp className="h-4 w-4" />
                  <span>+12% this week</span>
                </div>
              </div>
              <CardTitle>Agent Training Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Track AI agent performance, learning events, and identify improvement opportunities with visual analytics.
              </p>
              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Performance graphs & metrics
                </div>
                <div className="flex items-center text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Learning event tracking
                </div>
                <div className="flex items-center text-sm">
                  <AlertTriangle className="h-4 w-4 text-orange-500 mr-2" />
                  Regression detection alerts
                </div>
              </div>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <Link href="/assets">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Images className="h-8 w-8 text-primary" />
                <div className="flex items-center space-x-1 text-sm text-blue-600">
                  <Clock className="h-4 w-4" />
                  <span>47 pending</span>
                </div>
              </div>
              <CardTitle>AI Asset Library</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Manage AI-generated content including images, videos, and copy with approval workflows and version control.
              </p>
              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Multi-media asset storage
                </div>
                <div className="flex items-center text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Approval & revision flows
                </div>
                <div className="flex items-center text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Content reuse & remixing
                </div>
              </div>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <Link href="/settings">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Settings className="h-8 w-8 text-primary" />
                <div className="flex items-center space-x-1 text-sm text-purple-600">
                  <Settings className="h-4 w-4" />
                  <span>All systems OK</span>
                </div>
              </div>
              <CardTitle>System Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Configure AI behavior, manage API keys, control feature flags, and adjust system-wide settings.
              </p>
              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  AI behavior tuning
                </div>
                <div className="flex items-center text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Secure API key management
                </div>
                <div className="flex items-center text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Feature flag controls
                </div>
              </div>
            </CardContent>
          </Link>
        </Card>
      </div>
    </div>
  )
} 