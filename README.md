# Neon AI Dashboard v2.1

A comprehensive AI agent management platform featuring training analytics, asset management, and system configuration.

## 🚀 Features

### 📊 Agent Training Dashboard (Prompt 009)
- **Performance Tracking**: Real-time agent performance metrics and graphs
- **Learning Events**: Detailed logs of training events and score changes
- **Regression Detection**: Automatic alerts for declining agent performance
- **Improvement Opportunities**: Identify agents needing attention

### 🎨 AI Asset Library (Prompt 010)
- **Multi-Media Support**: Images, videos, copy, and text content
- **Approval Workflows**: Review and approve AI-generated content
- **Version Control**: Track revisions and content history
- **Smart Filtering**: Filter by type, status, agent, campaigns, and tags

### ⚙️ System Settings (Prompt 011)
- **AI Behavior Configuration**: Temperature, tokens, retry settings
- **API Key Management**: Secure storage of encrypted API keys
- **Feature Flags**: Dynamic feature toggles for system control
- **Resource Limits**: Configure system constraints and limits

## 🏗️ Architecture

This is a **TypeScript monorepo** built with:

- **Frontend**: Next.js 14 with App Router
- **Backend**: tRPC for type-safe APIs
- **Database**: Prisma with SQLite (easily configurable)
- **UI**: Tailwind CSS with custom components
- **Monorepo**: Turbo for build optimization

```Neon-v2.1/
├── apps/
│   └── dashboard/          # Next.js dashboard app
├── packages/
│   ├── api/               # tRPC API layer
│   ├── database/          # Prisma schema & client
│   └── ui/                # Shared UI components
└── turbo.json             # Monorepo configuration
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone and install dependencies**:
```bash
cd Neon-v2.1
npm install
```

2. **Set up the database**:
```bash
npm run db:generate
npm run db:push
```

3. **Start development server**:
```bash
npm run dev
```

4. **Open the dashboard**:
Visit `http://localhost:3000` to access the Neon AI Dashboard.

## 📱 Dashboard Pages

### 🏠 Home Dashboard (`/`)
- Overview of all system metrics
- Quick access to all features
- System health indicators

### 🧠 Training Dashboard (`/training`)
- Agent performance graphs with Recharts
- Training event timeline
- Performance regression alerts
- Agent management interface

### 🖼️ Asset Library (`/assets`)
- Grid and list views for assets
- Advanced filtering and search
- Approval workflow actions
- Asset preview and metadata

### ⚙️ Settings (`/settings`)
- AI behavior tuning controls
- Encrypted API key management
- Feature flag toggles
- System limit configuration

## 🗄️ Database Schema

The system uses **Prisma** with the following models:

```prisma
- Agent: AI agents with training data
- TrainingEvent: Learning events and score changes
- Asset: Generated content (images, videos, copy)
- Setting: System configuration values
- FeatureFlag: Dynamic feature controls
```

## 🔧 API Reference

All API endpoints are **type-safe** using tRPC:

### Training APIs
- `training.getAgents` - List all agents
- `training.getAgentTrainingHistory` - Get performance data
- `training.logTrainingEvent` - Log new training events
- `training.getImprovementOpportunities` - Find problematic agents

### Asset APIs
- `assets.getAssets` - List assets with filtering
- `assets.createAsset` - Upload new asset
- `assets.approveAsset` - Approve pending asset
- `assets.rejectAsset` - Reject asset
- `assets.reviseAsset` - Create asset revision

### Settings APIs
- `settings.getSystemSettings` - Get all settings
- `settings.updateSetting` - Update configuration
- `settings.getFeatureFlags` - List feature flags
- `settings.toggleFeatureFlag` - Toggle features
- `settings.setApiKey` - Store encrypted API keys

## 🛠️ Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript checks
npm run db:push      # Push schema to database
npm run db:generate  # Generate Prisma client
npm run db:studio    # Open Prisma Studio
```

### Adding New Features

1. **Database changes**: Update `packages/database/prisma/schema.prisma`
2. **API routes**: Add to `packages/api/src/router/`
3. **UI components**: Create in `packages/ui/src/components/`
4. **Pages**: Add to `apps/dashboard/app/`

## 🔒 Security Features

- **Encrypted API Keys**: Base64 encoding (extend with proper encryption)
- **Type Safety**: Full TypeScript coverage
- **Input Validation**: Zod schemas for all API inputs
- **CSRF Protection**: Built-in Next.js protections

## 📈 Performance

- **Monorepo Optimization**: Turbo for fast builds
- **Client-Side Caching**: React Query for API caching
- **Code Splitting**: Next.js automatic splitting
- **Bundle Analysis**: Built-in Next.js analyzer

## 🚀 Deployment

The application is ready for deployment on:

- **Vercel** (recommended for Next.js)
- **Railway** (with database)
- **Docker** (create Dockerfile as needed)

### Environment Variables

Create `.env` files:
```bash
# packages/database/.env
DATABASE_URL="file:./dev.db"

# For production, use PostgreSQL:
# DATABASE_URL="postgresql://..."
```

## 🎯 Autonomous Agent Integration

This dashboard is designed to work seamlessly with autonomous AI agents:

1. **Training Events**: Agents automatically log their learning
2. **Asset Generation**: Generated content flows through approval
3. **Performance Monitoring**: Real-time agent health tracking
4. **Configuration**: Agents read behavior settings dynamically

## 📊 Monitoring & Analytics

- **Real-time Metrics**: Live performance dashboards
- **Historical Analysis**: Training event timelines
- **Regression Detection**: Automatic alert system
- **Resource Usage**: Track API usage and limits

---

**🌟 Built for the future of AI agent management**

This system provides enterprise-grade tools for managing, monitoring, and optimizing AI agents at scale. 