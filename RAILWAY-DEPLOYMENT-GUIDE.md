# Deploy Breezeway MCP to Railway

This guide will help you deploy the Breezeway MCP server to Railway so Kim (and the team) can access it through ChatGPT.

## Prerequisites

- Railway account (free tier works fine)
- Your Breezeway API credentials

## Step 1: Install Railway CLI

Open PowerShell and run:

```bash
npm install -g @railway/cli
```

## Step 2: Login to Railway

```bash
railway login
```

This will open your browser to authenticate.

## Step 3: Initialize Railway Project

In the `breezeway-mcp-server` directory:

```bash
cd C:\Users\nikol\breezeway-mcp-server
railway init
```

- Choose "Create new project"
- Name it: `breezeway-mcp-server`

## Step 4: Set Environment Variables

Add your Breezeway credentials:

```bash
railway variables set BREEZEWAY_API_KEY=3wuzmtes5r8ifybej3ts4e63h5lkyicz
railway variables set BREEZEWAY_API_SECRET=hszznn5cvw58xy3679b6ppc1zoa00vu7
railway variables set PORT=3000
```

## Step 5: Deploy

```bash
npm run build
railway up
```

This will:
1. Upload your code to Railway
2. Install dependencies
3. Build the TypeScript
4. Start the HTTP server

## Step 6: Generate Public URL

```bash
railway domain
```

This creates a public HTTPS URL like: `https://breezeway-mcp-server-production.up.railway.app`

**Copy this URL!** You'll need it for ChatGPT setup.

## Step 7: Test the Deployment

Check if it's working:

```bash
curl https://your-railway-url.railway.app/health
```

You should see: `{"status":"ok","service":"breezeway-mcp-server"}`

---

## Configure ChatGPT Company Knowledge

### Step 8: Enable MCP Connector Creation

1. Go to ChatGPT workspace settings
2. Navigate to **Settings → Data controls**
3. Find **Developer mode** or **Custom connectors**
4. Enable **Create custom MCP connectors**

### Step 9: Create the Breezeway Connector

1. Go to **Developer mode** section
2. Click **Create Connector** or **Add MCP Server**
3. Fill in:
   - **Name**: Breezeway Property Manager
   - **Description**: "Search and manage JZ Vacation Rentals properties, tasks, and reservations from Breezeway"
   - **MCP URL**: `https://your-railway-url.railway.app/mcp`

4. Click **Save**

### Step 10: Enable for Company Knowledge

1. Go to **Company Knowledge** settings
2. Find **Breezeway Property Manager** in the list
3. **Enable it** for your organization
4. Set permissions:
   - Allow Kim (and any other team members who need access)

### Step 11: Test in ChatGPT!

Kim can now open ChatGPT and ask:

```
Search Breezeway for Espadin properties
```

```
How many active properties do we have?
```

```
Show me details for property 858663
```

**Mobile Access**: This works on the ChatGPT mobile app too! Kim can query Breezeway data from her phone.

---

## Monitoring & Maintenance

### View Logs

```bash
railway logs
```

### Redeploy (after code changes)

```bash
npm run build
railway up
```

### Check Status

```bash
railway status
```

---

## Security Notes

✅ **HTTPS**: Railway automatically provides HTTPS
✅ **Environment Variables**: Credentials stored securely in Railway
✅ **Rate Limiting**: Breezeway API has built-in rate limits (1 auth request per minute)

---

## Troubleshooting

### "Authentication failed"
- Check environment variables are set correctly in Railway
- Verify no trailing characters in API secret

### "Cannot connect"
- Verify the service is running: `railway status`
- Check logs: `railway logs`
- Test health endpoint: `curl https://your-url.railway.app/health`

### ChatGPT can't connect
- Ensure URL ends with `/mcp` in ChatGPT config
- Verify HTTPS (HTTP won't work)
- Check Railway logs for errors

---

## Cost

Railway free tier includes:
- $5 of usage per month
- 500 hours of execution time

This MCP server uses minimal resources, so free tier should be sufficient!

---

## Next Steps

Once deployed and tested:
1. Document the Railway URL in your team docs
2. Add Kim and other team members to ChatGPT access
3. Consider adding more Breezeway endpoints (maintenance costs, work orders, etc.)
