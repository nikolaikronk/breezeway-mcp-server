# Breezeway MCP Server

> **The world's first MCP server for Breezeway property management** 🏆

Connect your Breezeway data to Claude Desktop, ChatGPT, and Slack. Search properties, view tasks, check reservations, and manage property information through AI assistants.

## 🚀 Quick Start

**Want to test it right now?** Follow the [5-Minute Quick Start Guide](./QUICKSTART-CLAUDE-DESKTOP.md)

**Setting up for production?** See the [Complete Setup Guide](./MCP-SETUP-GUIDE.md)

## ✨ Features

### 8 Powerful Tools

| Tool | Description | Access Level |
|------|-------------|--------------|
| `search` | Search across properties, tasks, and reservations | 👥 Team |
| `list_properties` | List all properties with pagination | 👥 Team |
| `get_property` | Get detailed property information | 👥 Team |
| `get_property_by_internal_id` | Find property by Streamline ID | 👥 Team |
| `list_tasks` | List tasks with filtering | 👥 Team |
| `list_reservations` | List reservations with date filters | 👥 Team |
| `fetch` | Get detailed entity information | 👥 Team |
| `update_property` | Update property data | 🔐 Admin |

### What You Can Ask

```
"Search for all Espadin properties"

"What's the WiFi password for 4700 McPherson Ave?"

"List all properties in Denver"

"Show me tasks for property 509357"

"Find property with Streamline ID 781323"

"What reservations do we have next week?"
```

## 📋 Use Cases

### For Kim (Property Manager)
- Instant access to property details via ChatGPT
- Search across all properties without logging into Breezeway
- Quick lookups during phone calls with guests
- Cross-reference Streamline and Breezeway data

### For Team (Slack Integration)
- Search properties from any Slack channel
- Get WiFi credentials instantly
- Check task status without context switching
- View upcoming reservations

### For Operations
- Bulk property updates (WiFi, descriptions, directions)
- Sync data between Streamline and Breezeway
- Automated reporting and analytics
- Integration with existing workflows

## 🔧 Installation

```bash
# Clone the repository
git clone https://github.com/nikolaikronk/breezeway-mcp-server.git
cd breezeway-mcp-server

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your Breezeway API credentials

# Build
npm run build

# Test authentication
npx tsx test-auth.ts
```

## 🎯 Supported Platforms

| Platform | Status | Setup Time | Docs |
|----------|--------|------------|------|
| Claude Desktop | ✅ Ready | 5 min | [Quick Start](./QUICKSTART-CLAUDE-DESKTOP.md) |
| ChatGPT Company Knowledge | ✅ Ready | 15 min | [Setup Guide](./MCP-SETUP-GUIDE.md#setup-for-chatgpt-company-knowledge) |
| Slack | ✅ Ready | 30 min | [Setup Guide](./MCP-SETUP-GUIDE.md#setup-for-slack) |

## 📚 Documentation

- **[5-Minute Quick Start](./QUICKSTART-CLAUDE-DESKTOP.md)** - Test locally with Claude Desktop
- **[Complete Setup Guide](./MCP-SETUP-GUIDE.md)** - Full documentation for all platforms
- **[API Documentation](./API-CAPABILITIES.md)** - Breezeway API reference
- **[Deployment Guide](./RAILWAY-DEPLOYMENT-GUIDE.md)** - Deploy to Railway

## 🏗️ Architecture

```
┌─────────────────┐
│  Claude Desktop │
│    ChatGPT      │  ← AI Assistants
│     Slack       │
└────────┬────────┘
         │
    MCP Protocol (stdio/http)
         │
┌────────▼────────┐
│  Breezeway MCP  │  ← This Server
│     Server      │
└────────┬────────┘
         │
    Breezeway API
         │
┌────────▼────────┐
│   Breezeway     │  ← Property Data
│   Platform      │
└─────────────────┘
```

## 🔐 Security

- API credentials stored in environment variables
- No credentials committed to git
- Read-only access for team by default
- Admin-only update operations
- Audit logging for all modifications

## 🧪 Testing

```bash
# Test with MCP Inspector
npm run test

# Test authentication
npx tsx test-auth.ts

# Search for properties
npx tsx search-espadin.ts

# Check property details
npx tsx check-property-details.ts
```

## 🚢 Deployment

### Railway (Recommended for ChatGPT/Slack)

```bash
railway up
```

See [Railway Deployment Guide](./RAILWAY-DEPLOYMENT-GUIDE.md) for details.

### Local (Claude Desktop)

No deployment needed - runs locally via stdio transport.

## 🤝 Contributing

This is a private tool for JZ Vacation Rentals. Not currently accepting external contributions.

## 📈 Roadmap

- [x] Property search and listing
- [x] Task and reservation queries
- [x] Property updates (WiFi, descriptions)
- [x] Streamline ID cross-referencing
- [ ] Photo management
- [ ] Bulk operations
- [ ] Webhook support
- [ ] Advanced analytics

## 📄 License

Private - JZ Vacation Rentals Internal Tool

## 👤 Author

**Nikolai Kronk**
- GitHub: [@nikolaikronk](https://github.com/nikolaikronk)
- Project: Atlas - JZ Vacation Rentals Management System

## 🎉 Status

**Production Ready** - Currently in use by JZ Vacation Rentals team

---

Built with [Model Context Protocol](https://modelcontextprotocol.io) | Powered by [Breezeway API](https://api.breezeway.io)
