# Conversation Log - Breezeway MCP Server Setup

**Date:** January 6, 2026
**Project:** Breezeway MCP Server for ChatGPT Company Knowledge

---

## Project Overview

Built an MCP (Model Context Protocol) server to connect Breezeway property management data to ChatGPT's Company Knowledge feature. This will eventually be integrated into a custom Operations dashboard on the website.

## What Was Built

### Files Created

```
breezeway-mcp-server/
├── src/
│   ├── breezeway-client.ts    # Breezeway API client with auth & data fetching
│   ├── server.ts              # MCP server for local testing (stdio)
│   └── http-server.ts         # HTTP server for ChatGPT (production)
├── package.json               # Dependencies and scripts
├── tsconfig.json              # TypeScript configuration
├── .env.example               # Template for API credentials
├── .gitignore                 # Prevents committing secrets
├── README.md                  # Full technical documentation
├── QUICKSTART.md              # Step-by-step setup guide
└── CONVERSATION_LOG.md        # This file
```

### Technology Stack

- **Language:** TypeScript/Node.js (chosen for future web dashboard compatibility)
- **Protocol:** Model Context Protocol (MCP) by Anthropic
- **API Integration:** Breezeway REST API with JWT authentication
- **Validation:** Zod schemas for type-safe input validation
- **Transport:** HTTP with SSE (Server-Sent Events) for ChatGPT

### Key Features Implemented

1. **Breezeway API Client** (`breezeway-client.ts`)
   - Automatic JWT authentication and token refresh (24-hour tokens)
   - Search across properties, tasks, and reservations
   - Fetch detailed entity information by ID
   - Reusable for future website dashboard

2. **MCP Tools** (Required for ChatGPT Company Knowledge)
   - **search** - Searches Breezeway data with optional type filtering
   - **fetch** - Retrieves detailed information about specific entities

3. **Dual Server Architecture**
   - `server.ts` - Stdio transport for local testing with MCP Inspector
   - `http-server.ts` - HTTP server for ChatGPT integration (port 3000)

## Technical Decisions Made

### 1. Language Choice: TypeScript/Node.js
**Why:** Code can be reused in future website dashboard, team familiarity, easier for learning

### 2. Architecture: Separate Client Class
**Why:** `BreezewayClient` can be extracted and reused in frontend/backend of website

### 3. Authentication: API Key (for now)
**Why:** Simpler to start, OAuth can be added later when building user-facing dashboard

### 4. Searchable Data Types
**Current:** Properties, Tasks, Reservations
**Future:** Can easily extend to include costs, maintenance records, etc.

## Current Status

### ✅ Completed
- [x] Project structure and configuration
- [x] Breezeway API client with authentication
- [x] Search and fetch tools implementation
- [x] HTTP server for ChatGPT
- [x] Documentation (README, QUICKSTART)
- [x] Local testing setup
- [x] ngrok tunnel configured and running

### 🔄 In Progress
- [ ] Testing with ChatGPT Company Knowledge
- [ ] Connecting MCP connector in ChatGPT Developer Mode

### ⏳ Pending
- [ ] Deploy to permanent hosting (Vercel)
- [ ] Enable in Company Knowledge for team
- [ ] Production testing and validation

## Deployment Information

### Current Setup (Testing)
- **Server URL:** `http://localhost:3000`
- **ngrok Public URL:** `https://unroused-aiyana-propretorial.ngrok-free.dev`
- **MCP Endpoint:** `https://unroused-aiyana-propretorial.ngrok-free.dev/mcp`
- **Health Check:** `https://unroused-aiyana-propretorial.ngrok-free.dev/health`

### ngrok Configuration
- **Authtoken:** Configured (regenerate after testing for security)
- **Status Dashboard:** `http://localhost:4040/status`
- **Note:** ngrok URL changes on restart - temporary testing only

### Environment Variables Required
```env
BREEZEWAY_API_KEY=<your_breezeway_api_key>
BREEZEWAY_API_SECRET=<your_breezeway_api_secret>
PORT=3000  # Optional, defaults to 3000
```

## Implementation Plan (Updated)

### Phase 1: Proof of Concept (Current)
**Goal:** Get it working in ChatGPT with test data

**Tasks:**
1. ✅ Build MCP server with search/fetch tools
2. ✅ Configure ngrok for public access
3. 🔄 Connect to ChatGPT Developer Mode
4. ⏳ Test with real Breezeway queries
5. ⏳ Validate data retrieval works correctly

**Timeline:** This week

### Phase 2: Production Deployment (Next)
**Goal:** Permanent URL, no need to keep terminals open

**Tasks:**
1. Deploy to Vercel (or similar service)
2. Configure environment variables in hosting dashboard
3. Update ChatGPT connector with permanent URL
4. Enable for Company Knowledge
5. Share with team for testing

**Timeline:** After successful ChatGPT testing

### Phase 3: Enhancement & Security (Later)
**Goal:** OAuth, logging, expanded features

**Tasks:**
1. Research Breezeway OAuth support
2. Implement OAuth flow if supported
3. Add user authentication/authorization
4. Add audit logging (who searched what)
5. Expand to more Breezeway endpoints (costs, maintenance, etc.)

**Timeline:** When ready to build website Operations dashboard

### Phase 4: Website Dashboard Integration (Future)
**Goal:** Embed in company website Operations section

**Tasks:**
1. Extract `BreezewayClient` for frontend use
2. Build React/Next.js dashboard UI
3. Add rich data visualizations
4. Implement MCP widgets for ChatGPT (optional)
5. Add role-based access control

**Timeline:** TBD - after ChatGPT version proven

## Key Decisions & Rationale

### OAuth Security
**Decision:** Implement later, not now
**Rationale:**
- Adds significant complexity (OAuth flow, token management, callbacks)
- Need to verify Breezeway supports OAuth
- Current API key method is secure enough for internal testing
- Better to prove concept first, then add security layers
- Will be essential for website dashboard with multiple users

### Deployment Strategy
**Decision:** Use ngrok for testing, Vercel for production
**Rationale:**
- ngrok: Quick testing, no config needed, free
- ngrok downside: URL changes on restart, must keep terminal open
- Vercel: Permanent URL, free tier, automatic HTTPS, built for Node.js
- Vercel: Easy env variable management, good for eventual website hosting

### Technology: MCP vs GPT Actions
**Decision:** MCP (Model Context Protocol)
**Rationale:**
- ChatGPT now supports full MCP in Developer Mode
- MCP is more powerful than basic Actions/GPTs
- Future-proof: can work with both ChatGPT and Claude
- Better for complex integrations with read/write operations

## Resources & Documentation

### Project Documentation
- **README.md** - Full technical documentation, file structure, troubleshooting
- **QUICKSTART.md** - Step-by-step setup checklist for getting started
- **This file** - Conversation log, decisions, and implementation plan

### External Resources
- **Breezeway API Docs:** https://developer.breezeway.io/
- **ChatGPT Apps SDK:** https://developers.openai.com/apps-sdk/
- **MCP Protocol Spec:** https://modelcontextprotocol.io/
- **ChatGPT Developer Mode Guide:** https://help.openai.com/en/articles/12584461

### Useful Commands
```bash
# Install dependencies
npm install

# Build TypeScript to JavaScript
npm run build

# Start HTTP server (for ChatGPT)
npm start

# Start stdio server (for MCP Inspector testing)
npm start:stdio

# Test with MCP Inspector
npm test

# Deploy to Vercel
vercel
```

## Security Notes

### ⚠️ Important Security Reminders

1. **Never commit `.env` file** - Contains sensitive API credentials
2. **Regenerate ngrok authtoken** - The one shared in conversation should be regenerated: https://dashboard.ngrok.com/authtokens
3. **Rotate Breezeway API keys** - Periodically rotate for security
4. **Use environment variables** - Never hardcode credentials in source code
5. **Review ChatGPT permissions** - Control who can access Breezeway data through Company Knowledge
6. **HTTPS required** - ChatGPT only connects to HTTPS endpoints (ngrok and Vercel both provide this)

## Context & Background

### User Situation
- Name: Nikol (working with Alex who manages technical direction)
- Alex prefers using AI tools (Cursor) for speed over manual learning
- This limits hands-on coding experience
- Goal: Build something functional while understanding how it works

### Learning Approach for This Project
- Code written to be **readable and educational**, not just functional
- Comments explain WHY, not just WHAT
- File structure is organized logically
- Documentation includes "How It Works" sections
- Designed for future modification and learning

### Business Context
- Building internal Operations tool first
- Will eventually become customer-facing website feature
- Need to prove value with ChatGPT integration first
- Then expand to full dashboard with visualizations

## Next Steps

### Immediate (Today)
1. Test the ChatGPT connection with ngrok URL
2. Try sample queries in ChatGPT:
   - "Search for properties in Miami"
   - "Show me pending tasks"
   - "Find reservations for this week"
3. Verify data is being retrieved correctly
4. Note any issues or needed adjustments

### Short-term (This Week)
1. Deploy to Vercel for permanent URL
2. Update ChatGPT connector with production URL
3. Enable for Company Knowledge organization-wide
4. Gather feedback from team usage

### Medium-term (Next Few Weeks)
1. Add more Breezeway endpoints based on user needs
2. Improve search relevance and filtering
3. Consider adding data caching for performance
4. Plan website dashboard architecture

### Long-term (Future)
1. Implement OAuth authentication
2. Build web-based Operations dashboard
3. Add rich visualizations and analytics
4. Expand to more property management features

## Questions to Resolve

1. **Does Breezeway support OAuth?** - Need to check API documentation
2. **What data is most valuable to search?** - Will learn from ChatGPT usage patterns
3. **Performance at scale** - Monitor response times with real usage
4. **Caching strategy** - Determine what data can/should be cached
5. **Error handling** - Improve based on real-world errors encountered

## Modifications to Original Plan

User noted: "We're going to end up making slight modifications to that plan"

**To document later:**
- What modifications are needed?
- Why are they necessary?
- How do they affect timeline/implementation?

---

## Conversation Summary

1. Started with question about connecting Breezeway to ChatGPT
2. Clarified MCP vs GPT Actions confusion
3. Built complete MCP server with TypeScript
4. Discussed deployment options (ngrok vs production)
5. Configured ngrok for testing
6. Discussed OAuth security (decided to implement later)
7. Created phased implementation plan
8. User indicated some plan modifications coming

---

**Last Updated:** January 6, 2026
**Status:** Testing phase with ngrok tunnel
**Next Action:** Connect MCP server to ChatGPT Developer Mode and test queries
