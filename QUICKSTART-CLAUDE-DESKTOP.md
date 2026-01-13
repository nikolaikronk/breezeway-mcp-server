# Quick Start: Test Breezeway MCP in Claude Desktop

## 5-Minute Setup

### Step 1: Build the Server (30 seconds)

```bash
cd C:\Users\nikol\breezeway-mcp-server
npm run build
```

### Step 2: Configure Claude Desktop (2 minutes)

1. Open: `%APPDATA%\Claude\claude_desktop_config.json` in Notepad

2. Paste this (replace with your actual credentials):

```json
{
  "mcpServers": {
    "breezeway": {
      "command": "node",
      "args": [
        "C:\\Users\\nikol\\breezeway-mcp-server\\dist\\server.js"
      ],
      "env": {
        "BREEZEWAY_API_KEY": "3wuzmtes5r8ifybej3ts4e63h5lkyicz",
        "BREEZEWAY_API_SECRET": "hszznn5cvw58xy3679b6ppc1zoa00vu7"
      }
    }
  }
}
```

3. Save the file

### Step 3: Restart Claude Desktop (30 seconds)

1. Quit Claude Desktop completely
2. Reopen Claude Desktop
3. Look for the 🔌 icon showing "breezeway" is connected

### Step 4: Test It! (1 minute)

Try these in Claude Desktop:

```
List all Breezeway properties

Search for "Espadin"

Get property details for ID 509357

What's the WiFi password for 4700 McPherson Ave?

Find property with Internal ID 781323
```

## What You Can Do

### Read Operations (Team-Safe ✅)

- **search** - "Search for properties in LoHi"
- **list_properties** - "Show me all properties"
- **get_property** - "Get details for property 509357"
- **get_property_by_internal_id** - "Find property with Streamline ID 781323"
- **list_tasks** - "What tasks are open for property 509357?"
- **list_reservations** - "Show reservations for next week"

### Write Operations (Admin Only ⚠️)

- **update_property** - "Update WiFi for property 509357"

## Troubleshooting

### Server Not Connected?

1. **Check config path:**
   ```
   %APPDATA%\Claude\claude_desktop_config.json
   ```
   Should be: `C:\Users\nikol\AppData\Roaming\Claude\claude_desktop_config.json`

2. **Verify dist/server.js exists:**
   ```bash
   ls C:\Users\nikol\breezeway-mcp-server\dist\server.js
   ```

3. **Test credentials:**
   ```bash
   cd C:\Users\nikol\breezeway-mcp-server
   npx tsx test-auth.ts
   ```

4. **Check Claude Desktop logs:**
   - Windows: `%APPDATA%\Claude\logs`
   - Look for errors mentioning "breezeway"

### Still Not Working?

Restart computer (sometimes Node path issues need a full restart)

## Next: Share with Team

Once it works locally:

1. **For Kim (ChatGPT):** Deploy to Railway, add to ChatGPT Company Knowledge
2. **For Team (Slack):** Set up Slack bot integration (read-only)

See `MCP-SETUP-GUIDE.md` for full instructions.

---

**Time to first query:** ~5 minutes
**Difficulty:** Easy ⭐
**Status:** Ready to test! 🚀
