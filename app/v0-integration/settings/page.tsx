import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Settings, 
  Key, 
  User, 
  Bell, 
  Shield, 
  Palette,
  Save,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle
} from "lucide-react";

// Mock data for development
const mockData = {
  apiKeys: [
    {
      id: 1,
      name: "OpenAI API",
      key: "sk-...abc123",
      status: "active",
      lastUsed: "2 hours ago",
      permissions: ["content", "analysis"],
    },
    {
      id: 2,
      name: "Stripe API",
      key: "sk_live_...xyz789",
      status: "active",
      lastUsed: "1 day ago",
      permissions: ["billing", "payments"],
    },
    {
      id: 3,
      name: "Twitter API",
      key: "1a2b3c...",
      status: "expired",
      lastUsed: "1 week ago",
      permissions: ["social", "posting"],
    },
  ],
  integrations: [
    {
      id: 1,
      name: "Slack",
      status: "connected",
      description: "Receive notifications in Slack",
      icon: "💬",
    },
    {
      id: 2,
      name: "Zapier",
      status: "connected",
      description: "Automate workflows",
      icon: "⚡",
    },
    {
      id: 3,
      name: "Google Analytics",
      status: "disconnected",
      description: "Track website analytics",
      icon: "📊",
    },
  ],
  teamMembers: [
    {
      id: 1,
      name: "Admin User",
      email: "admin@neonhub.com",
      role: "admin",
      status: "active",
      lastLogin: "2 hours ago",
    },
    {
      id: 2,
      name: "Marketing Manager",
      email: "marketing@neonhub.com",
      role: "manager",
      status: "active",
      lastLogin: "1 day ago",
    },
    {
      id: 3,
      name: "Content Creator",
      email: "content@neonhub.com",
      role: "editor",
      status: "inactive",
      lastLogin: "1 week ago",
    },
  ],
};

function ApiKeyCard({ apiKey }: any) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-500";
      case "expired": return "bg-red-500";
      case "pending": return "bg-yellow-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm">{apiKey.name}</CardTitle>
            <CardDescription className="flex items-center space-x-2 mt-1">
              <span className="font-mono text-xs">{apiKey.key}</span>
              <div className={`w-2 h-2 rounded-full ${getStatusColor(apiKey.status)}`} />
            </CardDescription>
          </div>
          <Badge variant={apiKey.status === "active" ? "default" : "secondary"}>
            {apiKey.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span>Last Used</span>
            <span>{apiKey.lastUsed}</span>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">Permissions</span>
            <div className="flex space-x-2 mt-1">
              {apiKey.permissions.map((perm: string) => (
                <Badge key={perm} variant="outline" className="text-xs">
                  {perm}
                </Badge>
              ))}
            </div>
          </div>
          <div className="flex space-x-2">
            <Button size="sm" variant="outline" className="flex-1">
              <Eye className="h-4 w-4 mr-2" />
              View
            </Button>
            <Button size="sm" variant="outline">
              <Key className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function IntegrationCard({ integration }: any) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{integration.icon}</span>
            <div>
              <CardTitle className="text-sm">{integration.name}</CardTitle>
              <CardDescription>{integration.description}</CardDescription>
            </div>
          </div>
          <Badge variant={integration.status === "connected" ? "default" : "secondary"}>
            {integration.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Button size="sm" variant="outline" className="w-full">
          {integration.status === "connected" ? "Disconnect" : "Connect"}
        </Button>
      </CardContent>
    </Card>
  );
}

function TeamMemberCard({ member }: any) {
  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin": return "bg-red-500";
      case "manager": return "bg-blue-500";
      case "editor": return "bg-green-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm">{member.name}</CardTitle>
            <CardDescription>{member.email}</CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${getRoleColor(member.role)}`} />
            <Badge variant="outline" className="text-xs">
              {member.role}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span>Status</span>
            <Badge variant={member.status === "active" ? "default" : "secondary"}>
              {member.status}
            </Badge>
          </div>
          <div className="flex justify-between text-sm">
            <span>Last Login</span>
            <span>{member.lastLogin}</span>
          </div>
          <div className="flex space-x-2">
            <Button size="sm" variant="outline" className="flex-1">
              Edit
            </Button>
            <Button size="sm" variant="outline">
              Remove
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your platform configuration and preferences.
          </p>
        </div>
        <Button>
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="api-keys">API Keys</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your account information and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" defaultValue="Admin" />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" defaultValue="User" />
                </div>
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" defaultValue="admin@neonhub.com" />
              </div>
              <div>
                <Label htmlFor="company">Company</Label>
                <Input id="company" defaultValue="NeonHub Inc." />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api-keys" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">API Keys</h3>
              <p className="text-sm text-muted-foreground">
                Manage your API keys and integrations
              </p>
            </div>
            <Button>
              <Key className="h-4 w-4 mr-2" />
              Add API Key
            </Button>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {mockData.apiKeys.map((apiKey) => (
              <ApiKeyCard key={apiKey.id} apiKey={apiKey} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">Integrations</h3>
              <p className="text-sm text-muted-foreground">
                Connect with third-party services
              </p>
            </div>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {mockData.integrations.map((integration) => (
              <IntegrationCard key={integration.id} integration={integration} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="team" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">Team Management</h3>
              <p className="text-sm text-muted-foreground">
                Manage team members and permissions
              </p>
            </div>
            <Button>
              <User className="h-4 w-4 mr-2" />
              Add Member
            </Button>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {mockData.teamMembers.map((member) => (
              <TeamMemberCard key={member.id} member={member} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Configure how you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="email-notifications">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications via email
                  </p>
                </div>
                <Switch id="email-notifications" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="slack-notifications">Slack Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications in Slack
                  </p>
                </div>
                <Switch id="slack-notifications" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="sms-notifications">SMS Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive urgent notifications via SMS
                  </p>
                </div>
                <Switch id="sms-notifications" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Manage your account security
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="current-password">Current Password</Label>
                <Input id="current-password" type="password" />
              </div>
              <div>
                <Label htmlFor="new-password">New Password</Label>
                <Input id="new-password" type="password" />
              </div>
              <div>
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input id="confirm-password" type="password" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="two-factor">Two-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground">
                    Add an extra layer of security
                  </p>
                </div>
                <Switch id="two-factor" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>
                Customize your interface appearance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="theme">Theme</Label>
                <Select defaultValue="dark">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="accent-color">Accent Color</Label>
                <Select defaultValue="blue">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="blue">Blue</SelectItem>
                    <SelectItem value="purple">Purple</SelectItem>
                    <SelectItem value="green">Green</SelectItem>
                    <SelectItem value="orange">Orange</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 