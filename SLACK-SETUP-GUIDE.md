# Breezeway Slack Bot Setup Guide
**5-Minute Setup for Team**

---

## What You'll Get

A `/breezeway` slash command in Slack that lets your team:
- Search properties: `/breezeway search St Louis`
- Get WiFi passwords: `/breezeway wifi 4700 McPherson`
- Get property details: `/breezeway property 737329`
- List properties: `/breezeway list`

---

## Step 1: Create Slack App (5 minutes)

### 1.1 Go to Slack API
1. Visit: https://api.slack.com/apps
2. Click **"Create New App"**
3. Choose **"From scratch"**

### 1.2 Configure Basic Info
**App Name:** `Breezeway Bot`
**Workspace:** Select your JZ Vacation Rentals workspace
Click **"Create App"**

---

## Step 2: Add Slash Command

### 2.1 Enable Slash Commands
1. In the left sidebar, click **"Slash Commands"**
2. Click **"Create New Command"**

### 2.2 Configure Command
Fill in these fields:

**Command:** `/breezeway`

**Request URL:**
```
https://breezeway-mcp-server-production.up.railway.app/slack/events
```

**Short Description:**
```
Search Breezeway properties, get WiFi passwords, and more
```

**Usage Hint:**
```
[search|wifi|property|list] [query]
```

Click **"Save"**

---

## Step 3: Configure OAuth & Permissions

### 3.1 Add Bot Token Scopes
1. In the left sidebar, click **"OAuth & Permissions"**
2. Scroll down to **"Scopes"** section
3. Under **"Bot Token Scopes"**, click **"Add an OAuth Scope"**
4. Add these scopes:
   - `commands` - Required for slash commands
   - `chat:write` - Allow bot to post messages
   - `chat:write.public` - Allow bot to post in channels without joining

### 3.2 Install App to Workspace
1. Scroll to top of **"OAuth & Permissions"** page
2. Click **"Install to Workspace"**
3. Review permissions
4. Click **"Allow"**

### 3.3 Copy Bot Token
After installation, you'll see **"Bot User OAuth Token"**
- Starts with `xoxb-`
- Click **"Copy"** button
- **Save this token** - you'll need it for Railway

---

## Step 4: Get Signing Secret

1. In the left sidebar, click **"Basic Information"**
2. Scroll down to **"App Credentials"**
3. Find **"Signing Secret"**
4. Click **"Show"**, then copy it
5. **Save this secret** - you'll need it for Railway

---

## Step 5: Configure Railway Environment Variables

### 5.1 Go to Railway Dashboard
1. Visit: https://railway.app
2. Open your `breezeway-mcp-server` project
3. Click on the service
4. Go to **"Variables"** tab

### 5.2 Add Slack Variables
Click **"New Variable"** and add these two:

**Variable 1:**
- Name: `SLACK_BOT_TOKEN`
- Value: `xoxb-your-token-here` (paste the token from Step 3.3)

**Variable 2:**
- Name: `SLACK_SIGNING_SECRET`
- Value: `your-secret-here` (paste the secret from Step 4)

### 5.3 Verify Existing Variables
Make sure these are still set:
- `BREEZEWAY_API_KEY`
- `BREEZEWAY_API_SECRET`
- `PORT` (should be 3000)

Click **"Deploy"** if prompted, or Railway will auto-deploy in ~2 minutes.

---

## Step 6: Test in Slack

### 6.1 Open Slack
Go to any channel in your workspace

### 6.2 Try Commands

**Test 1: Search Properties**
```
/breezeway search St Louis
```
Should return list of properties in St. Louis

**Test 2: Get WiFi**
```
/breezeway wifi 4700 McPherson
```
Should return WiFi network and password

**Test 3: Property Details**
```
/breezeway property 737329
```
Should return full details for property 737329

**Test 4: List Properties**
```
/breezeway list
```
Should return first 10 properties

---

## Available Commands

### `/breezeway search [query]`
Search for properties by name, address, city, etc.

**Examples:**
```
/breezeway search Espadin
/breezeway search LoHi
/breezeway search Manchester
/breezeway search 2880 Zuni
```

### `/breezeway wifi [property]`
Get WiFi credentials for a property

**Examples:**
```
/breezeway wifi 4700 McPherson Ave
/breezeway wifi Espadin Unit 402
```

### `/breezeway property [id]`
Get detailed info for a specific Breezeway property ID

**Examples:**
```
/breezeway property 737329
/breezeway property 944926
```

### `/breezeway list`
List first 10 properties

```
/breezeway list
```

---

## Troubleshooting

### "dispatch_failed" error
**Problem:** Slack can't reach your server
**Solution:**
- Check Railway deployment is running
- Verify URL in Slack command settings is: `https://breezeway-mcp-server-production.up.railway.app/slack/events`
- Check Railway logs for errors

### "Invalid signature" error
**Problem:** SLACK_SIGNING_SECRET is wrong
**Solution:**
- Go to Slack App → Basic Information → App Credentials
- Copy Signing Secret again
- Update in Railway environment variables

### "No properties found"
**Problem:** Search query is too specific or misspelled
**Solution:**
- Try broader search terms
- Check spelling
- Example: Use "McPherson" instead of "4700 McPherson Ave Unit 2"

### Bot doesn't respond
**Problem:** Missing scopes or token
**Solution:**
- Verify OAuth scopes are set (commands, chat:write, chat:write.public)
- Check SLACK_BOT_TOKEN is correct in Railway
- Reinstall app to workspace if needed

---

## Team Usage Tips

### For Kim (Property Manager)
Most common commands you'll use:
```
/breezeway wifi [property name]    ← Get WiFi fast!
/breezeway search [location]       ← Find properties
```

### For Field Team
Quick property lookups:
```
/breezeway search [address]        ← Find by address
/breezeway property [id]           ← Full details
```

### For Everyone
The bot works in:
- Direct messages to yourself (test privately)
- Team channels (share results with team)
- Direct messages with coworkers

---

## Security Notes

- Bot token is secure (never exposed to users)
- All commands are logged in Railway
- Only workspace members can use commands
- WiFi passwords are shown - use in appropriate channels

---

## Cost

- **Slack:** Free (included in your Slack plan)
- **Railway Hosting:** ~$5/month (existing server)
- **Total additional cost:** $0

---

## Next Steps After Setup

1. Share this guide with Kim and team
2. Add bot to main team channel
3. Pin this message: "Use `/breezeway` to search properties and get WiFi passwords"
4. Consider creating a #breezeway-bot channel for testing

---

## Support

**Technical Issues:**
- Check Railway logs: https://railway.app/project/breezeway-mcp-server
- GitHub repo: https://github.com/nikolaikronk/breezeway-mcp-server

**Usage Questions:**
- Type `/breezeway` with no arguments for help
- Examples included in each error message

---

**Last Updated:** January 14, 2026
**Version:** 1.0.0
**Maintainer:** Nikolai Kronk
