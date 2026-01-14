# ChatGPT Custom GPT Setup - 5 Minute Guide
**For Kim's Call**

## Status: ✅ REST API LIVE
- **Production URL:** https://breezeway-mcp-server-production.up.railway.app
- **Tested:** Search endpoint working (28 Espadin properties found)
- **All endpoints:** Health, Properties, Search, Tasks, Reservations

---

## Setup Steps (5 minutes)

### Step 1: Create Custom GPT
1. Go to ChatGPT (https://chat.openai.com)
2. Click your profile icon (bottom left)
3. Click "My GPTs"
4. Click "Create a GPT"

### Step 2: Configure GPT
**Name:** JZ Breezeway Assistant

**Description:**
```
Access JZ Vacation Rentals property data from Breezeway. Search properties, get WiFi passwords, check tasks and reservations.
```

**Instructions:**
```
You are a helpful assistant for JZ Vacation Rentals team members. You have access to the Breezeway property management system through API.

When users ask about properties, tasks, or reservations, use the available actions to fetch real-time data from Breezeway.

Common queries:
- "What's the WiFi for [property address]?"
- "List all Espadin properties"
- "Show me tasks due today"
- "Who's checking in tomorrow?"

Always format property information clearly with addresses, WiFi credentials, and other key details.
```

### Step 3: Add Actions
1. In the GPT editor, scroll down to "Actions"
2. Click "Create new action"
3. Copy the entire contents of `openapi-chatgpt-schema.yaml`
4. Paste into the Schema field
5. Click "Save"

### Step 4: Test
Ask the GPT:
```
Search Breezeway for Espadin properties
```

Expected: Should return ~28 properties with names and addresses.

---

## Quick Test Queries for Kim

Once configured, try these:

**Property Lookup:**
```
What's the WiFi for 4700 McPherson Ave?
```

**Property Search:**
```
List all Espadin LoHi properties
```

**Location Search:**
```
What properties do we have in LoHi?
```

**Internal ID Lookup:**
```
Find property with Streamline ID 442653
```

---

## OpenAPI Schema Location
**File:** `breezeway-mcp-server/openapi-chatgpt-schema.yaml`
**Copy entire contents** into ChatGPT Custom GPT Actions schema

---

## Troubleshooting

**"I can't access that API"**
- Make sure you're using Custom GPT with Actions (not Company Knowledge)
- Verify the schema copied completely
- Check you saved the action

**"No results found"**
- Test the API directly first: https://breezeway-mcp-server-production.up.railway.app/health
- Should return: `{"status":"ok","service":"breezeway-mcp-server"}`

**API errors**
- Check Railway dashboard for service status
- Service auto-restarts on failure

---

## Available Endpoints

All working in production:

- `GET /api/properties` - List all properties
- `GET /api/properties/search?q=query` - Search properties
- `GET /api/properties/:id` - Get by Breezeway ID
- `GET /api/properties/internal/:id` - Get by Streamline ID
- `GET /api/tasks` - List tasks
- `GET /api/reservations` - List reservations

---

## Success!

Your Breezeway MCP Server is live and ready for team use.

**What this means for Kim:**
- Instant property lookups via ChatGPT
- No more manual Breezeway searches
- Natural language queries
- 24/7 availability

**Cost:** $5/month (Railway hosting)

---

**Deployment:** January 14, 2026
**Build:** 70ceb21
**Status:** ✅ Production Ready
