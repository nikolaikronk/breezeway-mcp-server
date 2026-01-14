# Railway Deployment Guide - Breezeway MCP Server
**Quick deployment for team ChatGPT access**

---

## ✅ Pre-Deployment Checklist

- [x] Code pushed to GitHub: `https://github.com/nikolaikronk/breezeway-mcp-server`
- [x] Railway CLI installed
- [x] `railway.json` configured for HTTP server
- [x] `http-server.ts` ready with SSE transport
- [x] Build script in package.json: `npm run build`

---

## Deployment Steps

### Step 1: Initialize Railway Project (if not exists)

```bash
cd breezeway-mcp-server

# Login to Railway (opens browser)
railway login

# Create new project or link existing
railway init
# Choose: "Create new project"
# Name it: "breezeway-mcp-server"
```

**Alternative:** Create project via web dashboard at https://railway.app

### Step 2: Link to GitHub Repository

**Option A: Via Railway Web Dashboard (Recommended)**
1. Go to https://railway.app
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose `nikolaikronk/breezeway-mcp-server`
5. Railway will auto-detect Node.js and build

**Option B: Via CLI**
```bash
# In breezeway-mcp-server directory
railway link
# Select your project from the list
```

### Step 3: Set Environment Variables

**Via Web Dashboard:**
1. Go to your project on railway.app
2. Click "Variables" tab
3. Add these variables:

```
BREEZEWAY_API_KEY=3wuzmtes5r8ifybej3ts4e63h5lkyicz
BREEZEWAY_API_SECRET=hszznn5cvw58xy3679b6ppc1zoa00vu7.
PORT=3000
```

**Via CLI:**
```bash
railway variables set BREEZEWAY_API_KEY=3wuzmtes5r8ifybej3ts4e63h5lkyicz
railway variables set BREEZEWAY_API_SECRET=hszznn5cvw58xy3679b6ppc1zoa00vu7.
railway variables set PORT=3000
```

### Step 4: Deploy

**Via GitHub (Auto-deploy):**
- Railway auto-deploys on push to master
- Already pushed, so deployment should start automatically

**Via CLI:**
```bash
railway up
```

### Step 5: Get Public URL

**Via Web Dashboard:**
1. Go to your service settings
2. Click "Settings" tab
3. Scroll to "Networking"
4. Click "Generate Domain"
5. Copy the URL (e.g., `breezeway-mcp-server.up.railway.app`)

**Via CLI:**
```bash
railway domain
# Generates a public domain
```

---

## Testing Deployment

### Test Health Endpoint

```bash
curl https://your-domain.railway.app/health
```

**Expected Response:**
```json
{"status":"ok","service":"breezeway-mcp-server"}
```

### Test SSE Endpoint (Quick Check)

```bash
curl https://your-domain.railway.app/sse
```

Should return SSE stream headers.

---

## ChatGPT Company Knowledge Setup

### Step 1: Get Your Railway URL
Example: `https://breezeway-mcp-server-production.up.railway.app`

### Step 2: Configure in ChatGPT
1. Go to ChatGPT (team account)
2. Click Settings → Company → Knowledge
3. Add new "External Data Source"
4. Choose "MCP Server (SSE)"
5. Enter:
   - **Name:** Breezeway Properties
   - **URL:** `https://your-domain.railway.app/sse`
   - **Description:** Access JZ Vacation Rentals property data, tasks, and reservations

### Step 3: Test in ChatGPT
Ask ChatGPT:
- "List all Breezeway properties"
- "Search for Espadin properties"
- "Show me tasks for property 509366"

---

## Monitoring & Logs

### View Logs
**Web Dashboard:**
1. Go to your service
2. Click "Deployments" tab
3. Click latest deployment
4. View real-time logs

**CLI:**
```bash
railway logs
```

### Check Service Status
```bash
railway status
```

---

## Cost

**Railway Hobby Plan:** $5/month
- Includes $5 credit
- Pay-as-you-go after
- This service should stay under $5/month

---

## Troubleshooting

### Build Fails
**Check:**
- package.json has `"build": "tsc"` script
- TypeScript dependencies installed
- tsconfig.json exists

**Fix:**
```bash
# Test build locally first
npm run build
```

### Service Won't Start
**Check:**
- Environment variables are set correctly
- PORT variable is set (Railway needs this)
- Start command in railway.json: `node dist/http-server.js`

**View logs:**
```bash
railway logs
```

### Health Check Fails
**Check:**
- Service is running (check logs)
- Domain is generated and active
- Firewall/network not blocking

**Test locally:**
```bash
npm run build
npm start
# Then: curl http://localhost:3000/health
```

---

## Quick Commands Reference

```bash
# View current deployment
railway status

# View logs
railway logs

# Redeploy
railway up

# View environment variables
railway variables

# Open in browser
railway open

# Open Railway dashboard
railway open --dashboard
```

---

## Next Steps After Deployment

1. **Test the health endpoint** to confirm it's live
2. **Share the URL** with Kim for ChatGPT setup
3. **Monitor logs** for first few hours
4. **Document** the ChatGPT integration for team

---

## Support

**Railway Issues:** https://railway.app/help
**MCP Documentation:** https://modelcontextprotocol.io

---

**Deployed by:** Nikolai
**Date:** January 14, 2026
**Service:** Breezeway MCP Server v1.0
