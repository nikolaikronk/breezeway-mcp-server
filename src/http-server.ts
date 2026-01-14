#!/usr/bin/env node

import { config } from 'dotenv';
import http from 'http';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { BreezewayClient } from './breezeway-client.js';

// Load environment variables from .env file
config();

// Get API credentials from environment
const BREEZEWAY_API_KEY = process.env.BREEZEWAY_API_KEY;
const BREEZEWAY_API_SECRET = process.env.BREEZEWAY_API_SECRET;
const PORT = process.env.PORT || 3000;

if (!BREEZEWAY_API_KEY || !BREEZEWAY_API_SECRET) {
  console.error('Error: BREEZEWAY_API_KEY and BREEZEWAY_API_SECRET must be set');
  process.exit(1);
}

// Initialize Breezeway client
const breezewayClient = new BreezewayClient({
  apiKey: BREEZEWAY_API_KEY,
  apiSecret: BREEZEWAY_API_SECRET,
});

// Define tool schemas
const SearchSchema = z.object({
  query: z.string().describe('The search query to find relevant Breezeway data'),
  types: z.array(z.enum(['properties', 'tasks', 'reservations']))
    .optional()
    .describe('Optional: Specific entity types to search. Defaults to all types.'),
});

const FetchSchema = z.object({
  type: z.enum(['property', 'task', 'reservation'])
    .describe('The type of entity to fetch'),
  id: z.string().describe('The ID of the entity to fetch'),
});

// Tool definitions
const searchTool: Tool = {
  name: 'search',
  description: 'Search across Breezeway properties, tasks, and reservations. Returns a list of relevant results based on the search query.',
  inputSchema: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'The search query to find relevant Breezeway data',
      },
      types: {
        type: 'array',
        items: {
          type: 'string',
          enum: ['properties', 'tasks', 'reservations'],
        },
        description: 'Optional: Specific entity types to search. Defaults to all types.',
      },
    },
    required: ['query'],
  },
};

const fetchTool: Tool = {
  name: 'fetch',
  description: 'Fetch detailed information about a specific Breezeway entity (property, task, or reservation) by its ID.',
  inputSchema: {
    type: 'object',
    properties: {
      type: {
        type: 'string',
        enum: ['property', 'task', 'reservation'],
        description: 'The type of entity to fetch',
      },
      id: {
        type: 'string',
        description: 'The ID of the entity to fetch',
      },
    },
    required: ['type', 'id'],
  },
};

// Create HTTP server
const httpServer = http.createServer(async (req, res) => {
  // Root endpoint - API info
  if (req.url === '/' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      service: 'breezeway-mcp-server',
      version: '1.0.0',
      description: 'Breezeway property management API',
      endpoints: {
        health: 'GET /health',
        properties: 'GET /api/properties?limit=20',
        search: 'GET /api/properties/search?q=query&limit=20',
        propertyById: 'GET /api/properties/:id',
        propertyByInternalId: 'GET /api/properties/internal/:id',
        tasks: 'GET /api/tasks?property_id=&status=&limit=20',
        reservations: 'GET /api/reservations?property_id=&start_date=&end_date=&limit=20',
        mcp: 'POST /mcp'
      },
      notes: 'All list endpoints default to 20 results. Use ?limit=N to change (max 100).'
    }));
    return;
  }

  // Health check endpoint
  if (req.url === '/health' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', service: 'breezeway-mcp-server' }));
    return;
  }

  // REST API ENDPOINTS

  // GET /api/properties - List all properties
  if (req.url?.startsWith('/api/properties') && req.method === 'GET' && !req.url.includes('search') && !req.url.includes('internal') && req.url.split('/').length === 3) {
    try {
      const urlObj = new URL(req.url, `http://${req.headers.host}`);
      const limitParam = urlObj.searchParams.get('limit');
      const limit = limitParam ? parseInt(limitParam, 10) : 20; // Default to 20 properties

      const properties = await breezewayClient.getProperties();
      const limitedProperties = properties.slice(0, limit);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        count: limitedProperties.length,
        total: properties.length,
        data: limitedProperties
      }));
    } catch (error: any) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: error.message }));
    }
    return;
  }

  // GET /api/properties/search?q=query - Search properties
  if (req.url?.startsWith('/api/properties/search') && req.method === 'GET') {
    try {
      const urlObj = new URL(req.url, `http://${req.headers.host}`);
      const query = urlObj.searchParams.get('q') || '';
      const limitParam = urlObj.searchParams.get('limit');
      const limit = limitParam ? parseInt(limitParam, 10) : 20; // Default to 20 results

      if (!query) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Missing query parameter: q' }));
        return;
      }

      const results = await breezewayClient.search(query, ['properties']);
      const limitedResults = results.slice(0, limit);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        query,
        count: limitedResults.length,
        total: results.length,
        data: limitedResults
      }));
    } catch (error: any) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: error.message }));
    }
    return;
  }

  // GET /api/properties/internal/:id - Get property by internal ID (Streamline ID)
  if (req.url?.startsWith('/api/properties/internal/') && req.method === 'GET') {
    try {
      const internalId = req.url.split('/api/properties/internal/')[1];
      const properties = await breezewayClient.getProperties();
      const property = properties.find(p => p.reference_property_id === internalId);

      if (!property) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: `Property with internal ID ${internalId} not found` }));
        return;
      }

      // Get full details
      const fullProperty = await breezewayClient.fetch('property', property.id);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, data: fullProperty }));
    } catch (error: any) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: error.message }));
    }
    return;
  }

  // GET /api/properties/:id - Get property by Breezeway ID
  if (req.url?.startsWith('/api/properties/') && req.method === 'GET' && !req.url.includes('search') && !req.url.includes('internal')) {
    try {
      const propertyId = req.url.split('/api/properties/')[1];
      const property = await breezewayClient.fetch('property', propertyId);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, data: property }));
    } catch (error: any) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: error.message }));
    }
    return;
  }

  // GET /api/tasks - List tasks
  if (req.url?.startsWith('/api/tasks') && req.method === 'GET') {
    try {
      const urlObj = new URL(req.url, `http://${req.headers.host}`);
      const propertyId = urlObj.searchParams.get('property_id');
      const status = urlObj.searchParams.get('status');
      const limitParam = urlObj.searchParams.get('limit');
      const limit = limitParam ? parseInt(limitParam, 10) : 20; // Default to 20 tasks

      const params: any = {};
      if (propertyId) params.property_id = propertyId;
      if (status) params.status = status;

      const tasks = await breezewayClient.getTasks(params);
      const limitedTasks = tasks.slice(0, limit);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        count: limitedTasks.length,
        total: tasks.length,
        data: limitedTasks
      }));
    } catch (error: any) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: error.message }));
    }
    return;
  }

  // GET /api/reservations - List reservations
  if (req.url?.startsWith('/api/reservations') && req.method === 'GET') {
    try {
      const urlObj = new URL(req.url, `http://${req.headers.host}`);
      const propertyId = urlObj.searchParams.get('property_id');
      const startDate = urlObj.searchParams.get('start_date');
      const endDate = urlObj.searchParams.get('end_date');
      const limitParam = urlObj.searchParams.get('limit');
      const limit = limitParam ? parseInt(limitParam, 10) : 20; // Default to 20 reservations

      const params: any = {};
      if (propertyId) params.property_id = propertyId;
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;

      const reservations = await breezewayClient.getReservations(params);
      const limitedReservations = reservations.slice(0, limit);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        count: limitedReservations.length,
        total: reservations.length,
        data: limitedReservations
      }));
    } catch (error: any) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: error.message }));
    }
    return;
  }

  // MCP endpoint
  if (req.url === '/mcp' && req.method === 'POST') {
    // Create a new MCP server instance for each request
    const server = new Server(
      {
        name: 'breezeway-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    // Register handlers
    server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [searchTool, fetchTool],
      };
    });

    server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        if (name === 'search') {
          const validated = SearchSchema.parse(args);
          const results = await breezewayClient.search(
            validated.query,
            validated.types
          );

          if (results.length === 0) {
            return {
              content: [
                {
                  type: 'text',
                  text: `No results found for query: "${validated.query}"`,
                },
              ],
            };
          }

          const resultText = results.map((result, index) => {
            return `${index + 1}. [${result.type.toUpperCase()}] ${result.title}\n   ID: ${result.id}\n   ${result.snippet}`;
          }).join('\n\n');

          return {
            content: [
              {
                type: 'text',
                text: `Found ${results.length} result(s) for "${validated.query}":\n\n${resultText}`,
              },
            ],
          };
        }

        if (name === 'fetch') {
          const validated = FetchSchema.parse(args);
          const data = await breezewayClient.fetch(validated.type, validated.id);
          const formattedData = JSON.stringify(data, null, 2);

          return {
            content: [
              {
                type: 'text',
                text: `Details for ${validated.type} ${validated.id}:\n\n\`\`\`json\n${formattedData}\n\`\`\``,
              },
            ],
          };
        }

        throw new Error(`Unknown tool: ${name}`);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
          content: [
            {
              type: 'text',
              text: `Error executing tool "${name}": ${errorMessage}`,
            },
          ],
          isError: true,
        };
      }
    });

    // Use SSE transport for HTTP
    const transport = new SSEServerTransport('/mcp', res);
    await server.connect(transport);

    // Handle request body
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
    });

    req.on('end', async () => {
      try {
        const message = JSON.parse(body);
        await transport.send(message);
      } catch (error) {
        console.error('Error processing request:', error);
        if (!res.headersSent) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Invalid request' }));
        }
      }
    });

    return;
  }

  // 404 for other routes
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

// Start server
httpServer.listen(PORT, () => {
  console.log(`Breezeway MCP Server listening on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`MCP endpoint: http://localhost:${PORT}/mcp`);
});
