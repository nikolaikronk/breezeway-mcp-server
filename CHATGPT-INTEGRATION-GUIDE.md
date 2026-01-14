# ChatGPT Company Knowledge Integration Guide
## Breezeway MCP Server

**Service URL:** `https://breezeway-mcp-server-production.up.railway.app`

---

## ✅ Deployment Status

- **Health Check:** https://breezeway-mcp-server-production.up.railway.app/health
- **API Info:** https://breezeway-mcp-server-production.up.railway.app/
- **MCP Endpoint:** https://breezeway-mcp-server-production.up.railway.app/mcp (POST)

**Status:** ✅ Live and running

---

## Integration with ChatGPT Company Knowledge

### Option 1: Custom Action (Recommended)

**Step 1: Create Custom Action in ChatGPT**
1. Go to ChatGPT (Team account)
2. Click your profile → Settings
3. Navigate to **Actions** or **Integrations**
4. Click **Create new action**

**Step 2: Configure Action**
```yaml
Name: Breezeway Properties
Description: Access JZ Vacation Rentals property data, tasks, and reservations from Breezeway
```

**Step 3: Add Action Schema**
Copy this OpenAPI schema:

```yaml
openapi: 3.0.0
info:
  title: Breezeway MCP Server
  version: 1.0.0
  description: Access Breezeway property management data
servers:
  - url: https://breezeway-mcp-server-production.up.railway.app
paths:
  /health:
    get:
      summary: Health check
      responses:
        '200':
          description: Service is healthy
          content:
            application/json:
              schema:
                type: object
                properties:
                  status:
                    type: string
                  service:
                    type: string
  /mcp:
    post:
      summary: MCP endpoint for tool calls
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                method:
                  type: string
                params:
                  type: object
      responses:
        '200':
          description: Successful response
```

### Option 2: Direct API Calls

ChatGPT can also call the API directly using its built-in capabilities:

**Example Prompt:**
```
Please call this API:
POST https://breezeway-mcp-server-production.up.railway.app/mcp

Body:
{
  "method": "tools/list"
}

Then use the available tools to search for Espadin properties.
```

---

## Available Tools

Once integrated, you can ask ChatGPT:

### 1. Search Properties
```
"Search Breezeway for Espadin properties"
"Find properties in LoHi"
"Search for properties with 'Manchester' in the name"
```

### 2. Get Property Details
```
"Get details for Breezeway property 737329"
"Show me property 509366"
```

### 3. List All Properties
```
"List all Breezeway properties"
"Show me the first 10 properties"
```

### 4. Find by Internal ID
```
"Find Breezeway property with Streamline ID 442653"
"Get property by internal ID 781323"
```

### 5. Search Tasks
```
"Search for overdue tasks"
"Find maintenance tasks"
"Show tasks for property 737329"
```

### 6. Search Reservations
```
"Find reservations checking in today"
"Search for upcoming reservations"
"Show reservations for next week"
```

---

## For Team Members (Kim, etc.)

### Quick Start

Once the integration is set up by admin, you can simply ask ChatGPT:

**Property Lookups:**
- "What properties do we have in Denver?"
- "Show me the WiFi password for 4700 McPherson Ave"
- "List all Espadin properties"

**Task Management:**
- "What tasks are due today?"
- "Show me overdue maintenance tasks"
- "Are there any pending tasks for unit 402?"

**Reservation Checks:**
- "Who's checking in tomorrow?"
- "What reservations do we have next week?"
- "Is unit 208 occupied right now?"

---

## Testing the Integration

### Test 1: Health Check
Ask ChatGPT:
```
Please check if the Breezeway API is healthy by calling:
GET https://breezeway-mcp-server-production.up.railway.app/health
```

**Expected Response:**
```json
{"status":"ok","service":"breezeway-mcp-server"}
```

### Test 2: List Properties
Ask ChatGPT:
```
Search Breezeway for all properties
```

ChatGPT should return a list of properties with names, addresses, and IDs.

### Test 3: Specific Property
Ask ChatGPT:
```
Find Breezeway property with internal ID 442653
```

ChatGPT should return details for 4700 McPherson Ave.

---

## Troubleshooting

### ChatGPT says "I can't access that API"

**Solution 1:** Check if Custom Actions are enabled
- Go to ChatGPT Team Settings
- Verify Custom Actions feature is available
- May require team admin to enable

**Solution 2:** Use direct API calls
- Instead of integration, give ChatGPT the API endpoint directly
- Example: "Call POST https://breezeway-mcp-server-production.up.railway.app/mcp with this body: {...}"

### API returns "Not found" error

**Check:**
- URL is correct: `https://breezeway-mcp-server-production.up.railway.app`
- Endpoint is `/mcp` (not `/` or `/api`)
- Using POST method (not GET)

**Test health:**
```bash
curl https://breezeway-mcp-server-production.up.railway.app/health
```

### API times out or is slow

**Check Railway dashboard:**
1. Go to railway.app
2. View service logs
3. Check if service is running
4. Look for errors

**Restart service if needed:**
- In Railway dashboard, click service
- Click "Restart" button

---

## Security Notes

- API is **read-only** by default (no write operations exposed)
- Update operations require admin verification
- No sensitive data (passwords, keys) exposed via API
- SSL/HTTPS encryption on all requests

---

## Cost

- Railway hosting: ~$5/month
- No per-request charges
- Unlimited team usage

---

## Support

**For Technical Issues:**
- Check Railway logs: https://railway.app/project/breezeway-mcp-server
- Health endpoint: https://breezeway-mcp-server-production.up.railway.app/health
- GitHub repo: https://github.com/nikolaikronk/breezeway-mcp-server

**For Usage Questions:**
- Ask Nikolai
- Check documentation in repo
- Test with health endpoint first

---

## API Reference

### Endpoints

**GET /**
- Returns API information
- Response: Service name, version, available endpoints

**GET /health**
- Health check
- Response: `{"status":"ok","service":"breezeway-mcp-server"}`

**POST /mcp**
- MCP protocol endpoint
- Handles all tool calls
- Request body: MCP message format
- Response: MCP response format

### MCP Protocol

The server implements the Model Context Protocol (MCP) for AI integration.

**Supported MCP Methods:**
- `tools/list` - List available tools
- `tools/call` - Execute a tool

**Available Tools:**
- `search` - Search properties/tasks/reservations
- `fetch` - Get detailed entity information

---

## Next Steps

1. **Admin:** Set up ChatGPT Custom Action using this guide
2. **Team:** Test with simple queries once integrated
3. **Feedback:** Report any issues or feature requests to Nikolai

---

**Last Updated:** January 14, 2026
**Version:** 1.0.0
**Maintainer:** Nikolai Kronk
