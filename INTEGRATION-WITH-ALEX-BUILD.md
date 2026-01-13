# Integrating Breezeway Client with Alex's Build

This guide is for **later** - when you're ready to start working with Alex on his JZ-Vacation-Rentals codebase.

---

## What Alex Already Has

Based on the JZ-Vacation-Rentals repo structure:

```
JZ-Vacation-Rentals/
├── shared/
│   ├── integrations/
│   │   └── breezeway/          # Alex may already have Breezeway code here
│   ├── config/
│   └── types/
├── services/
│   └── jz-revenue-manager/
│       ├── backend/
│       └── frontend/
└── supabase/
```

---

## Integration Options

### Option 1: Add Your Client to Shared

**Best for:** When Alex wants to use your Breezeway client throughout his app

**Steps:**
1. Copy `src/breezeway-client.ts` to `shared/integrations/breezeway/`
2. Update imports to match his structure
3. Add to his shared config

```typescript
// shared/integrations/breezeway/breezeway-client.ts
export class BreezewayClient {
  // Your existing client code
}

// shared/integrations/breezeway/index.ts
export { BreezewayClient } from './breezeway-client';
export type { Property, Task, Reservation } from './types';
```

**Then services can use it:**
```typescript
// services/jz-revenue-manager/backend/src/api/breezeway.js
import { BreezewayClient } from '@/shared/integrations/breezeway';

const client = new BreezewayClient({
  apiKey: process.env.BREEZEWAY_API_KEY,
  apiSecret: process.env.BREEZEWAY_API_SECRET,
});
```

---

### Option 2: API Endpoints in His Backend

**Best for:** When Alex wants to control how Breezeway data flows

**Steps:**
1. Add Breezeway client to his backend only
2. Create REST endpoints that wrap your client
3. His frontend calls those endpoints

```javascript
// services/jz-revenue-manager/backend/src/api/breezeway/properties.js
import { BreezewayClient } from '../../lib/breezeway-client';

export async function getProperties(req, res) {
  try {
    const client = new BreezewayClient({
      apiKey: process.env.BREEZEWAY_API_KEY,
      apiSecret: process.env.BREEZEWAY_API_SECRET,
    });

    const properties = await client.getProperties();
    res.json({ properties });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Register route
app.get('/api/breezeway/properties', getProperties);
```

---

### Option 3: Keep MCP Separate, Add Direct Queries

**Best for:** When you need Breezeway data in commission statements

**Steps:**
1. Keep your MCP server running independently
2. Add Breezeway client to YOUR commission statement code
3. Query Breezeway directly when generating reports

```typescript
// your-commission-tool/src/breezeway-data.ts
import { BreezewayClient } from './breezeway-client';

export async function getPropertyData(propertyId: string) {
  const client = new BreezewayClient({
    apiKey: process.env.BREEZEWAY_API_KEY,
    apiSecret: process.env.BREEZEWAY_API_SECRET,
  });

  return await client.fetch('property', propertyId);
}
```

---

## Commission Statement Integration

**Your workflow:**
1. Query Breezeway for property details
2. Get reservation data for date range
3. Calculate commissions based on tasks/maintenance
4. Generate PDF statement
5. Send to accounting

**What you might need from Alex's build:**
- Access to Supabase for storing commission data
- Integration with his revenue dashboard
- Owner contact information
- Payment tracking

**What you DON'T need from Alex:**
- Permission to query Breezeway (you have that)
- Access to his Railway deployment
- Changes to his frontend

---

## Coordination Points with Alex

### Before You Start Integrating

**1. Show him your work:**
- "Hey, I built this Breezeway MCP for commission statements"
- Demo querying properties, tasks, reservations
- Show the commission calculation logic

**2. Ask about his approach:**
- "Do you already have Breezeway integration code?"
- "Where would you want this to live in the repo?"
- "Should I add it to shared/integrations?"

**3. Follow his patterns:**
- Use his coding style
- Match his file structure
- Follow his TypeScript conventions
- Use his error handling patterns

### During Integration

**Ask before:**
- Adding new dependencies to his package.json
- Creating new database tables
- Adding environment variables to Railway
- Modifying shared utilities

**Safe to do:**
- Add new files in agreed-upon locations
- Create new API endpoints in his backend
- Use existing Supabase tables
- Follow his existing patterns

---

## Code Compatibility

**Your code is already compatible with his style:**

✅ **TypeScript** - He uses TypeScript
✅ **Node.js** - Same runtime
✅ **Environment variables** - Standard approach
✅ **Async/await** - Modern patterns
✅ **Error handling** - Try/catch blocks
✅ **Type definitions** - Interfaces for data

**Easy to adapt:**
- Rename imports to use his `@/` aliases
- Match his file naming conventions
- Use his logger instead of console.log
- Follow his API response format

---

## Commission Statement Architecture

**Recommended approach:**

```
your-commission-tool/
├── src/
│   ├── breezeway-client.ts      # Your Breezeway client
│   ├── commission-calculator.ts  # Calculate commissions
│   ├── pdf-generator.ts         # Generate PDF statements
│   └── index.ts                 # Main entry point
├── scripts/
│   └── generate-monthly-report.ts
└── package.json
```

**Later integration with Alex's build:**

```
JZ-Vacation-Rentals/
├── shared/
│   └── integrations/
│       └── breezeway/
│           └── breezeway-client.ts   # Your client (copied)
└── services/
    └── jz-commission-manager/         # New service (your work)
        ├── backend/
        │   └── src/
        │       ├── commission-calculator.ts
        │       └── pdf-generator.ts
        └── frontend/
            └── app/
                └── commissions/
                    └── page.tsx
```

---

## Environment Variables

**Your current setup:**
```env
BREEZEWAY_API_KEY=3wuzmtes5r8ifybej3ts4e63h5lkyicz
BREEZEWAY_API_SECRET=hszznn5cvw58xy3679b6ppc1zoa00vu7
```

**Alex's setup might include:**
```env
# His existing variables
DATABASE_URL=...
SUPABASE_URL=...
SUPABASE_KEY=...
STREAMLINE_API_KEY=...

# Your additions (when integrated)
BREEZEWAY_API_KEY=...
BREEZEWAY_API_SECRET=...
```

---

## Testing Strategy

**Before integrating:**
1. Test your commission tool independently
2. Verify calculations are accurate
3. Generate sample PDFs
4. Show Alex the outputs

**During integration:**
1. Test in Alex's development environment
2. Don't touch production until approved
3. Get his review on pull requests
4. Follow his deployment process

---

## Timeline

**Phase 1: Independent (Now)**
- Build commission statement tool
- Use Breezeway MCP separately
- Test and refine
- Show results to Alex

**Phase 2: Coordination (After handoff)**
- Discuss integration approach with Alex
- Get access to his repo (if needed)
- Understand his architecture
- Plan where your code fits

**Phase 3: Integration (When ready)**
- Add code to shared/integrations
- Create necessary services
- Follow his review process
- Deploy when approved

---

## Key Principle

🎯 **"As he lets me"**

- Don't force integration
- Wait for his guidance
- Follow his timeline
- Respect his architecture
- Ask before changing anything in his repo

Your Breezeway MCP works independently right now - that's perfect for your commission work. Integration can happen naturally when the time is right.
