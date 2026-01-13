# Breezeway MCP Server Setup Guide

## Overview

This MCP (Model Context Protocol) server connects Breezeway property management data to AI assistants like Claude Desktop, ChatGPT, and Slack. It provides read and write access to properties, tasks, and reservations.

## Features

### Available Tools

1. **search** - Search across properties, tasks, and reservations
2. **fetch** - Get detailed info about a specific entity
3. **list_properties** - List all properties with pagination
4. **get_property** - Get detailed property information by ID
5. **get_property_by_internal_id** - Find property by Streamline ID
6. **list_tasks** - List tasks with optional filtering
7. **list_reservations** - List reservations with optional filtering
8. **update_property** [ADMIN ONLY] - Update property information

## Setup for Claude Desktop

### Prerequisites

- Node.js 18+ installed
- Breezeway API credentials (.env file configured)
- Claude Desktop app installed

### Installation Steps

1. **Build the server:**
```bash
cd C:\Users\nikol\breezeway-mcp-server
npm install
npm run build
```

2. **Configure Claude Desktop:**

Open your Claude Desktop configuration file:
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **Mac**: `~/Library/Application Support/Claude/claude_desktop_config.json`

Add this configuration:

```json
{
  "mcpServers": {
    "breezeway": {
      "command": "node",
      "args": [
        "C:\\Users\\nikol\\breezeway-mcp-server\\dist\\server.js"
      ],
      "env": {
        "BREEZEWAY_API_KEY": "your_client_id_here",
        "BREEZEWAY_API_SECRET": "your_client_secret_here"
      }
    }
  }
}
```

**Important:** Replace the API credentials with your actual Breezeway credentials from the `.env` file.

3. **Restart Claude Desktop**

The MCP server will now be available as "breezeway" with all 8 tools.

### Testing in Claude Desktop

Try these commands in Claude:

```
Can you list all Breezeway properties?

Search for "Espadin" properties

Get details for property ID 509357

What properties are in the Espadin building?

Find property with Internal ID 781323
```

## Setup for ChatGPT (Company Knowledge)

### Prerequisites

- ChatGPT Team or Enterprise account
- Access to Company Knowledge settings
- MCP server running on a publicly accessible endpoint

### Option 1: Use Railway Deployment

1. **Deploy to Railway:**
```bash
cd C:\Users\nikol\breezeway-mcp-server
railway up
```

2. **In ChatGPT Settings:**
   - Go to Company Knowledge
   - Add New Source
   - Type: MCP Server
   - URL: Your Railway deployment URL
   - Authentication: Add API key if needed

3. **Configure in Chat:**

ChatGPT will automatically discover the `search` and `fetch` tools (required for Company Knowledge).

### Option 2: Run Locally with Ngrok

1. **Start the HTTP server:**
```bash
npm run dev
```

2. **Expose with ngrok:**
```bash
ngrok http 3000
```

3. **Use the ngrok URL in ChatGPT Company Knowledge settings**

## Setup for Slack

### Prerequisites

- Slack workspace admin access
- Slack app created with necessary permissions
- MCP server running on public endpoint

### Steps

1. **Create Slack App:**
   - Go to https://api.slack.com/apps
   - Create New App
   - Choose "From scratch"
   - Name: "Breezeway Assistant"
   - Select your workspace

2. **Configure OAuth & Permissions:**

Add these scopes:
   - `chat:write` - Send messages
   - `commands` - Create slash commands
   - `channels:history` - Read channel messages
   - `groups:history` - Read private channel messages

3. **Create Slash Commands:**

Examples:
```
/breezeway-search [query] - Search properties, tasks, reservations
/breezeway-property [id] - Get property details
/breezeway-list - List all properties
```

4. **Set up Event Subscriptions:**
   - Enable Events
   - Request URL: `https://your-server.com/slack/events`
   - Subscribe to bot events:
     - `message.channels`
     - `app_mention`

5. **Install App to Workspace**

## Usage Examples

### Read-Only Operations (Safe for Team)

```typescript
// Search for properties
search({ query: "Espadin", types: ["properties"] })

// List all properties
list_properties({ limit: 10 })

// Get property details
get_property({ id: "509357" })

// Find by Streamline ID
get_property_by_internal_id({ internalId: "781323" })

// List tasks for a property
list_tasks({ propertyId: "509357" })

// List upcoming reservations
list_reservations({ startDate: "2026-01-15" })
```

### Admin Operations (Update Access)

```typescript
// Update WiFi credentials
update_property({
  id: "509357",
  updates: {
    wifi_name: "JZ Guest Network",
    wifi_password: "NewPassword123"
  }
})

// Update property description
update_property({
  id: "509357",
  updates: {
    notes: {
      about: "Beautiful 2-bedroom apartment in LoHi..."
    }
  }
})
```

## Access Control

### For Kim (ChatGPT)
- Full read access to all properties, tasks, reservations
- Optional: Grant update access if needed

### For Team (Slack)
- **Read-Only Access**: Search, list, get operations
- **No Update Access**: Remove update_property from Slack integration

To restrict tools in Slack, modify the command handlers to only call non-destructive tools.

## Environment Variables

```env
BREEZEWAY_API_KEY=your_client_id
BREEZEWAY_API_SECRET=your_client_secret
BREEZEWAY_API_URL=https://api.breezeway.io  # Optional, defaults to this
```

## Troubleshooting

### Claude Desktop Issues

**Server not appearing:**
1. Check the config file path is correct
2. Verify Node.js is in PATH
3. Check the absolute path to `server.js` is correct
4. Restart Claude Desktop completely

**Authentication errors:**
1. Verify API credentials in config
2. Check credentials work with test script:
   ```bash
   npx tsx test-auth.ts
   ```

### ChatGPT Company Knowledge Issues

**Server not connecting:**
1. Ensure server is publicly accessible
2. Test endpoint with curl:
   ```bash
   curl https://your-server.com/health
   ```
3. Check Railway logs for errors

**Tools not discovered:**
- ChatGPT requires `search` and `fetch` tools (both included)
- Other tools are bonus features

### Slack Issues

**Commands not working:**
1. Verify slash commands are configured
2. Check Request URL is accessible
3. Review Slack app logs in dashboard

## Support

For issues or questions:
- Check Railway deployment logs
- Review Breezeway API documentation
- Test with the MCP Inspector: `npm run test`

## Next Steps

1. **Set up Claude Desktop** (easiest for local testing)
2. **Deploy to Railway** for ChatGPT/Slack access
3. **Configure Slack bot** for team-wide access
4. **Test with real queries** from your team

## Security Notes

- Store API credentials securely (use environment variables)
- For Slack: Implement user-level permissions
- For ChatGPT: Limit to Team/Enterprise accounts
- Monitor API usage and rate limits
- Rotate API credentials regularly

---

**Created:** January 13, 2026
**Version:** 1.0.0
**Status:** Production Ready ✅
