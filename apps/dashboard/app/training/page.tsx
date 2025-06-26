'use client'

import { useState } from 'react'
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  Calendar,
  Filter,
  Plus
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, Button } from '@neon/ui'
import { api } from '../providers/trpc-provider'
import { AgentLearningGraph } from '../components/training/AgentLearningGraph'
import { ImprovementLog } from '../components/training/ImprovementLog'

export default function TrainingPage() {
  const [selectedAgent, setSelectedAgent] = useState<string>('')
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month')

  const { data: agents = [] } = api.training.getAgents.useQuery()
  const { data: opportunities = [] } = api.training.getImprovementOpportunities.useQuery()
  
  const { data: trainingData } = api.training.getAgentTrainingHistory.useQuery(
    { agentId: selectedAgent, timeRange },
    { enabled: !!selectedAgent }
  )

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Agent Training Dashboard</h1>
          <p className="text-muted-foreground">
            Track AI agent performance, learning events, and identify improvement opportunities
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Agent
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Agents</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{agents.length}</div>
            <p className="text-xs text-muted-foreground">
              Total registered agents
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
            <p className="text-xs text-green-600">
              +12% improvement this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Training Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">247</div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Need Attention</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{opportunities.length}</div>
            <p className="text-xs text-muted-foreground">
              Agents with issues
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Agent</label>
            <select 
              value={selectedAgent}
              onChange={(e) => setSelectedAgent(e.target.value)}
              className="flex h-10 w-[200px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Select an agent</option>
              {agents.map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {agent.name} ({agent.type})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Time Range</label>
            <select 
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="flex h-10 w-[150px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="week">Past Week</option>
              <option value="month">Past Month</option>
              <option value="quarter">Past Quarter</option>
              <option value="year">Past Year</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance Graph */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Agent Performance Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedAgent && trainingData ? (
                <AgentLearningGraph data={trainingData} />
              ) : (
                <div className="flex items-center justify-center h-64 text-muted-foreground">
                  Select an agent to view performance data
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Improvement Opportunities */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                Need Attention
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {opportunities.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    All agents performing well! 🎉
                  </p>
                ) : (
                  opportunities.map((item) => (
                    <div key={item.agent.id} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{item.agent.name}</span>
                        <div className="flex items-center gap-1">
                          {item.trend < 0 ? (
                            <TrendingDown className="h-4 w-4 text-red-500" />
                          ) : (
                            <TrendingUp className="h-4 w-4 text-green-500" />
                          )}
                          <span className="text-sm font-mono">
                            {item.currentScore.toFixed(2)}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {item.agent.type} • Score: {item.currentScore.toFixed(2)}
                      </p>
                      {item.trend < -0.1 && (
                        <p className="text-xs text-red-600 mt-1">
                          Declining performance detected
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Training Events Log */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Training Events</CardTitle>
        </CardHeader>
        <CardContent>
          {selectedAgent && trainingData ? (
            <ImprovementLog events={trainingData.events} />
          ) : (
            <div className="text-center text-muted-foreground py-8">
              Select an agent to view training events
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 