import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  User,
  Mail,
  Phone,
  Star,
  Reply,
  Archive,
  Flag,
  Bot,
  TrendingUp,
  Users
} from "lucide-react";

// Mock data for development
const mockData = {
  tickets: [
    {
      id: 1,
      customer: {
        name: "Sarah Johnson",
        email: "sarah.j@example.com",
        avatar: "/placeholder-user.jpg",
      },
      subject: "Order #12345 - Delivery Issue",
      message: "Hi, I ordered a custom neon sign last week but haven't received any tracking information. Can you help me check the status?",
      status: "open",
      priority: "high",
      category: "delivery",
      sentiment: "neutral",
      createdAt: "2 hours ago",
      lastActivity: "1 hour ago",
      assignedTo: "Support Agent",
    },
    {
      id: 2,
      customer: {
        name: "Mike Chen",
        email: "mike.chen@example.com",
        avatar: "/placeholder-user.jpg",
      },
      subject: "Product Quality Concern",
      message: "The neon sign I received has a flickering issue. It's very disappointing for the price I paid. Need immediate resolution.",
      status: "in_progress",
      priority: "urgent",
      category: "quality",
      sentiment: "negative",
      createdAt: "4 hours ago",
      lastActivity: "30 min ago",
      assignedTo: "Support Agent",
    },
    {
      id: 3,
      customer: {
        name: "Emily Rodriguez",
        email: "emily.r@example.com",
        avatar: "/placeholder-user.jpg",
      },
      subject: "Custom Design Request",
      message: "I love your neon signs! I want to create a custom design for my restaurant. Can you help me with the design process?",
      status: "open",
      priority: "medium",
      category: "inquiry",
      sentiment: "positive",
      createdAt: "6 hours ago",
      lastActivity: "6 hours ago",
      assignedTo: "Unassigned",
    },
    {
      id: 4,
      customer: {
        name: "David Thompson",
        email: "david.t@example.com",
        avatar: "/placeholder-user.jpg",
      },
      subject: "Return Policy Question",
      message: "What's your return policy for custom orders? I need to return a sign that doesn't match my expectations.",
      status: "resolved",
      priority: "low",
      category: "policy",
      sentiment: "neutral",
      createdAt: "1 day ago",
      lastActivity: "2 hours ago",
      assignedTo: "Support Agent",
    },
  ],
  metrics: {
    totalTickets: 156,
    openTickets: 23,
    avgResponseTime: "2.3h",
    satisfactionScore: 4.7,
    resolvedToday: 12,
    escalatedTickets: 3,
  },
  suggestedReplies: [
    {
      id: 1,
      text: "Thank you for reaching out! I understand your concern about the delivery. Let me check the status of your order #12345 right away.",
      confidence: 95,
      sentiment: "helpful",
    },
    {
      id: 2,
      text: "I apologize for the inconvenience with your neon sign. I'll escalate this to our quality team immediately and get back to you within 24 hours.",
      confidence: 92,
      sentiment: "apologetic",
    },
    {
      id: 3,
      text: "We'd love to help you create a custom design! Our design team will contact you within 1-2 business days to discuss your requirements.",
      confidence: 88,
      sentiment: "enthusiastic",
    },
  ],
};

function TicketCard({ ticket }: any) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "open": return "bg-blue-500";
      case "in_progress": return "bg-yellow-500";
      case "resolved": return "bg-green-500";
      case "closed": return "bg-gray-500";
      default: return "bg-gray-500";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "bg-red-500";
      case "high": return "bg-orange-500";
      case "medium": return "bg-yellow-500";
      case "low": return "bg-green-500";
      default: return "bg-gray-500";
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case "positive": return <Star className="h-4 w-4 text-green-500" />;
      case "negative": return <AlertCircle className="h-4 w-4 text-red-500" />;
      case "neutral": return <MessageSquare className="h-4 w-4 text-blue-500" />;
      default: return <MessageSquare className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <Avatar>
              <AvatarImage src={ticket.customer.avatar} />
              <AvatarFallback>{ticket.customer.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <CardTitle className="text-lg">{ticket.subject}</CardTitle>
              <CardDescription className="flex items-center space-x-2 mt-1">
                <span>{ticket.customer.name}</span>
                <span>•</span>
                <span>{ticket.customer.email}</span>
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {getSentimentIcon(ticket.sentiment)}
            <div className={`w-2 h-2 rounded-full ${getStatusColor(ticket.status)}`} />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {ticket.message}
        </p>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex space-x-2">
            <Badge variant="outline">{ticket.category}</Badge>
            <Badge variant="outline" className={`${getPriorityColor(ticket.priority)} text-white`}>
              {ticket.priority}
            </Badge>
          </div>
          <span className="text-sm text-muted-foreground">{ticket.createdAt}</span>
        </div>

        <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
          <span>Assigned to: {ticket.assignedTo}</span>
          <span>Last activity: {ticket.lastActivity}</span>
        </div>

        <div className="flex space-x-2">
          <Button size="sm" className="flex-1">
            <Reply className="h-4 w-4 mr-2" />
            Reply
          </Button>
          <Button size="sm" variant="outline">
            <Flag className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="outline">
            <Archive className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function SuggestedReply({ reply }: any) {
  return (
    <Card>
      <CardContent className="pt-4">
        <p className="text-sm mb-3">{reply.text}</p>
        <div className="flex items-center justify-between">
          <Badge variant="outline">{reply.sentiment}</Badge>
          <span className="text-xs text-muted-foreground">{reply.confidence}% confidence</span>
        </div>
        <div className="flex space-x-2 mt-3">
          <Button size="sm" className="flex-1">
            Use Reply
          </Button>
          <Button size="sm" variant="outline">
            Edit
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function SupportPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Support Inbox</h1>
          <p className="text-muted-foreground">
            Manage customer support tickets with AI assistance.
          </p>
        </div>
        <Button>
          <MessageSquare className="h-4 w-4 mr-2" />
          New Ticket
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockData.metrics.totalTickets}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockData.metrics.openTickets}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockData.metrics.avgResponseTime}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Satisfaction</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockData.metrics.satisfactionScore}/5</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockData.metrics.resolvedToday}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Escalated</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockData.metrics.escalatedTickets}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="tickets" className="space-y-6">
        <TabsList>
          <TabsTrigger value="tickets">Tickets</TabsTrigger>
          <TabsTrigger value="ai-assist">AI Assistant</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="tickets" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {mockData.tickets.map((ticket) => (
              <TicketCard key={ticket.id} ticket={ticket} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="ai-assist" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bot className="h-5 w-5 mr-2" />
                  AI Reply Assistant
                </CardTitle>
                <CardDescription>
                  Get AI-suggested replies for customer tickets
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Customer Message</label>
                  <Textarea
                    placeholder="Paste the customer's message here to get AI suggestions..."
                    className="mt-2 min-h-[100px]"
                  />
                </div>
                <Button className="w-full">
                  <Bot className="h-4 w-4 mr-2" />
                  Generate Suggestions
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Suggested Replies</CardTitle>
                <CardDescription>
                  AI-generated responses based on sentiment analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockData.suggestedReplies.map((reply) => (
                    <SuggestedReply key={reply.id} reply={reply} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Ticket Volume Trends</CardTitle>
                <CardDescription>
                  Support ticket volume over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span>Today</span>
                    <span>23 tickets</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>This Week</span>
                    <span>156 tickets</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>This Month</span>
                    <span>642 tickets</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Avg Daily</span>
                    <span>21.4 tickets</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Customer Satisfaction</CardTitle>
                <CardDescription>
                  Satisfaction scores by category
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span>Delivery Issues</span>
                    <span>4.2/5</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Product Quality</span>
                    <span>4.8/5</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Custom Orders</span>
                    <span>4.9/5</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>General Inquiries</span>
                    <span>4.6/5</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 