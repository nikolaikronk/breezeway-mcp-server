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
  // Health check endpoint
  if (req.url === '/health' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', service: 'breezeway-mcp-server' }));
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
