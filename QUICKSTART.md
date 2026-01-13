# Quick Start Guide

Follow these steps to get your Breezeway MCP server running in ChatGPT.

## Checklist

### ☐ Step 1: Install Node.js

1. Go to https://nodejs.org/
2. Download the LTS version (20.x or newer)
3. Run the installer
4. Verify installation:
   ```bash
   node --version
   npm --version
   ```

### ☐ Step 2: Install Project Dependencies

Open a terminal in this folder (`breezeway-mcp-server`) and run:

```bash
npm install
```

Wait for all packages to download and install.

### ☐ Step 3: Get Your Breezeway API Credentials

1. Log into your Breezeway account
2. Go to: **Settings → Integrations → API Access**
3. Click **Generate API Key** (if you don't have one)
4. Copy both:
   - API Key
   - API Secret

### ☐ Step 4: Create .env File

1. Copy the `.env.example` file and rename it to `.env`:
   ```bash
   cp .env.example .env
   ```

   Or on Windows:
   ```bash
   copy .env.example .env
   ```

2. Open `.env` in a text editor (Notepad, VS Code, etc.)

3. Paste your credentials:
   ```env
   BREEZEWAY_API_KEY=paste_your_api_key_here
   BREEZEWAY_API_SECRET=paste_your_api_secret_here
   ```

4. Save the file

### ☐ Step 5: Build the Project

Compile the TypeScript code:

```bash
npm run build
```

You should see a `dist/` folder appear with JavaScript files.

### ☐ Step 6: Test Locally (Optional)

Test that everything works before deploying:

```bash
npx @modelcontextprotocol/inspector node dist/server.js
```

This opens a web interface (usually at http://localhost:5173) where you can:
- See your tools listed (search and fetch)
- Try a search query like "property"
- Verify it connects to Breezeway

### ☐ Step 7: Deploy to Production

#### Option A: Quick Test with ngrok

1. **Start your server**:
   ```bash
   npm start
   ```

2. **In a NEW terminal window**, install and run ngrok:
   ```bash
   npx ngrok http 3000
   ```

3. **Copy the HTTPS URL** from ngrok (looks like `https://abc123.ngrok.app`)

4. **Keep both terminals open** (server must stay running)

#### Option B: Deploy to Vercel (Permanent)

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Deploy**:
   ```bash
   vercel
   ```

3. **Add environment variables** in Vercel dashboard:
   - Go to your project → Settings → Environment Variables
   - Add `BREEZEWAY_API_KEY`
   - Add `BREEZEWAY_API_SECRET`

4. **Redeploy** to apply the environment variables:
   ```bash
   vercel --prod
   ```

5. **Copy your production URL** (looks like `https://your-project.vercel.app`)

### ☐ Step 8: Connect to ChatGPT

1. **Open ChatGPT** (Business or Enterprise account)

2. **Go to Workspace Settings**:
   - Click your workspace name
   - Go to **Settings → Permissions & Roles**

3. **Enable Developer Mode**:
   - Find **Connected Data** or **Developer mode**
   - Toggle on **Create custom MCP connectors**

4. **Create the Connector**:
   - Go to **Developer Mode** section
   - Click **Create Connector** or **Add MCP Server**
   - Fill in:
     - **Name**: Breezeway
     - **Description**: "Search Breezeway properties, tasks, and reservations"
     - **MCP URL**: `https://your-server-url/mcp` (your ngrok or Vercel URL + `/mcp`)

5. **Save** the connector

### ☐ Step 9: Enable for Company Knowledge

1. **Go to Company Knowledge settings** in ChatGPT

2. **Find your Breezeway connector** in the list

3. **Enable it** for your organization

4. **Set permissions** for who can use it

### ☐ Step 10: Test It!

Start a new chat in ChatGPT and try these prompts:

```
Search for all properties in our system
```

```
Show me pending maintenance tasks
```

```
Find reservations for this week
```

ChatGPT should now be able to search your Breezeway data!

## Troubleshooting

### "Authentication failed"
- Double-check your `.env` file has the correct API credentials
- Make sure there are no extra spaces or quotes around the values
- Verify the credentials work by testing with the MCP Inspector

### "Cannot find module"
- Run `npm install` again
- Delete `node_modules` and `package-lock.json`, then run `npm install`

### "npm command not found"
- Node.js is not installed or not in your PATH
- Reinstall Node.js from https://nodejs.org/

### ChatGPT can't connect
- Make sure your server is running (check the terminal)
- Verify the URL is correct (HTTPS required)
- Check that `/mcp` is at the end of the URL
- Look at server logs for errors

## Next Steps

Once everything is working:

1. **Explore the code** in `src/` to understand how it works
2. **Add more Breezeway endpoints** by editing `breezeway-client.ts`
3. **Create new tools** in `server.ts` for specific use cases
4. **Plan your website dashboard** using the same client code

Need help? Check the full README.md for detailed explanations!
