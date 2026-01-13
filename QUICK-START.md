# Breezeway MCP - Quick Start

## For YOU (Nikol - Atlas/Claude Code)

**Status**: ✅ Already configured!

**To activate:**
1. Restart Claude Code
2. Ask: "Search Breezeway for Espadin properties"
3. Done!

The MCP is installed in your Claude Desktop config and will work automatically.

---

## For KIM (ChatGPT Team Access)

**Status**: ⏳ Needs deployment to Railway

**Quick Deploy (5 minutes):**

```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Login
railway login

# 3. Go to project folder
cd C:\Users\nikol\breezeway-mcp-server

# 4. Initialize (use YOUR Railway account, separate from Alex's)
railway init
# When prompted, choose "Create new project"
# Name it: nikol-breezeway-mcp

# 5. Set credentials
railway variables set BREEZEWAY_API_KEY=3wuzmtes5r8ifybej3ts4e63h5lkyicz
railway variables set BREEZEWAY_API_SECRET=hszznn5cvw58xy3679b6ppc1zoa00vu7
railway variables set PORT=3000

# 6. Deploy
npm run build
railway up

# 7. Get public URL
railway domain
```

**Copy the Railway URL, then:**
1. Open ChatGPT workspace settings
2. Enable "Custom MCP connectors" in Developer mode
3. Create new connector:
   - Name: `Breezeway Property Manager`
   - URL: `https://your-railway-url.railway.app/mcp`
4. Enable it in Company Knowledge
5. Add Kim to access list

**Test it:**
Kim can ask ChatGPT: "How many active properties do we have in Breezeway?"

---

## What You Can Query

**Properties:**
- "Show me all Espadin LoHi properties"
- "How many properties do we have in Denver?"
- "Give me details for property 858663"

**Tasks:**
- "Show me pending maintenance tasks"
- "What tasks are assigned today?"

**Reservations:**
- "Show me this week's check-ins"
- "Find reservations for property 781323"

---

## Files Reference

- `src/server.ts` - Stdio server (for Claude Code)
- `src/http-server.ts` - HTTP server (for ChatGPT)
- `src/breezeway-client.ts` - Breezeway API client
- `.env` - Your API credentials (local only)
- `RAILWAY-DEPLOYMENT-GUIDE.md` - Full deployment instructions

---

## Support

Questions? Check:
1. `RAILWAY-DEPLOYMENT-GUIDE.md` - Complete deployment guide
2. `README.md` - Technical documentation
3. Railway logs: `railway logs`
