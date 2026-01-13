#!/usr/bin/env node

import { config } from 'dotenv';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
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

const ListPropertiesSchema = z.object({
  limit: z.number().optional().describe('Maximum number of properties to return'),
  offset: z.number().optional().describe('Number of properties to skip'),
});

const GetPropertySchema = z.object({
  id: z.string().describe('The Breezeway property ID'),
});

const GetPropertyByInternalIdSchema = z.object({
  internalId: z.string().describe('The Internal ID (Streamline Property ID)'),
});

const ListTasksSchema = z.object({
  propertyId: z.string().optional().describe('Filter tasks by property ID'),
  status: z.string().optional().describe('Filter tasks by status'),
});

const ListReservationsSchema = z.object({
  propertyId: z.string().optional().describe('Filter reservations by property ID'),
  startDate: z.string().optional().describe('Filter by check-in date (YYYY-MM-DD)'),
  endDate: z.string().optional().describe('Filter by check-out date (YYYY-MM-DD)'),
});

const UpdatePropertySchema = z.object({
  id: z.string().describe('The Breezeway property ID'),
  updates: z.object({
    wifi_name: z.string().optional().describe('WiFi network name'),
    wifi_password: z.string().optional().describe('WiFi password'),
    notes: z.object({
      about: z.string().optional().describe('Property description'),
      direction: z.string().optional().describe('Directions to property'),
      trash_info: z.string().optional().describe('Trash disposal information'),
      guest_access: z.string().optional().describe('Guest access instructions'),
    }).optional(),
  }).describe('Fields to update'),
});

// Create MCP server
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

// Define all tools
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

const listPropertiesTool: Tool = {
  name: 'list_properties',
  description: 'Get a list of all Breezeway properties with optional pagination. Returns property names, addresses, IDs, and basic info.',
  inputSchema: {
    type: 'object',
    properties: {
      limit: {
        type: 'number',
        description: 'Maximum number of properties to return',
      },
      offset: {
        type: 'number',
        description: 'Number of properties to skip for pagination',
      },
    },
  },
};

const getPropertyTool: Tool = {
  name: 'get_property',
  description: 'Get detailed information about a specific property by its Breezeway ID. Returns all property details including WiFi, descriptions, directions, and more.',
  inputSchema: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        description: 'The Breezeway property ID',
      },
    },
    required: ['id'],
  },
};

const getPropertyByInternalIdTool: Tool = {
  name: 'get_property_by_internal_id',
  description: 'Find a property by its Internal ID (Streamline Property ID). Useful for cross-referencing between Streamline and Breezeway.',
  inputSchema: {
    type: 'object',
    properties: {
      internalId: {
        type: 'string',
        description: 'The Internal ID (reference_property_id from Streamline)',
      },
    },
    required: ['internalId'],
  },
};

const listTasksTool: Tool = {
  name: 'list_tasks',
  description: 'Get a list of tasks, optionally filtered by property ID or status. Returns task details like title, status, assignee, and due dates.',
  inputSchema: {
    type: 'object',
    properties: {
      propertyId: {
        type: 'string',
        description: 'Filter tasks by property ID',
      },
      status: {
        type: 'string',
        description: 'Filter tasks by status (e.g., "open", "completed")',
      },
    },
  },
};

const listReservationsTool: Tool = {
  name: 'list_reservations',
  description: 'Get a list of reservations, optionally filtered by property ID or date range. Returns reservation details like check-in/out dates, guest info, and status.',
  inputSchema: {
    type: 'object',
    properties: {
      propertyId: {
        type: 'string',
        description: 'Filter reservations by property ID',
      },
      startDate: {
        type: 'string',
        description: 'Filter by check-in date (YYYY-MM-DD format)',
      },
      endDate: {
        type: 'string',
        description: 'Filter by check-out date (YYYY-MM-DD format)',
      },
    },
  },
};

const updatePropertyTool: Tool = {
  name: 'update_property',
  description: '[ADMIN ONLY] Update property information like WiFi credentials, descriptions, directions, or trash info. Requires admin permissions.',
  inputSchema: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        description: 'The Breezeway property ID',
      },
      updates: {
        type: 'object',
        properties: {
          wifi_name: {
            type: 'string',
            description: 'WiFi network name',
          },
          wifi_password: {
            type: 'string',
            description: 'WiFi password',
          },
          notes: {
            type: 'object',
            properties: {
              about: {
                type: 'string',
                description: 'Property description',
              },
              direction: {
                type: 'string',
                description: 'Directions to property',
              },
              trash_info: {
                type: 'string',
                description: 'Trash disposal information',
              },
              guest_access: {
                type: 'string',
                description: 'Guest access instructions',
              },
            },
          },
        },
      },
    },
    required: ['id', 'updates'],
  },
};

// Handle tool listing
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      searchTool,
      fetchTool,
      listPropertiesTool,
      getPropertyTool,
      getPropertyByInternalIdTool,
      listTasksTool,
      listReservationsTool,
      updatePropertyTool,
    ],
  };
});

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    if (name === 'search') {
      // Validate arguments
      const validated = SearchSchema.parse(args);

      // Execute search
      const results = await breezewayClient.search(
        validated.query,
        validated.types
      );

      // Format results for ChatGPT
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

      // Create a formatted text response with search results
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
      // Validate arguments
      const validated = FetchSchema.parse(args);

      // Fetch detailed data
      const data = await breezewayClient.fetch(validated.type, validated.id);

      // Format the detailed data
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

    if (name === 'list_properties') {
      const validated = ListPropertiesSchema.parse(args);
      const properties = await breezewayClient.getProperties();

      // Apply pagination if specified
      let result = properties;
      if (validated.offset !== undefined) {
        result = result.slice(validated.offset);
      }
      if (validated.limit !== undefined) {
        result = result.slice(0, validated.limit);
      }

      // Format property list
      const formatted = result.map((prop, index) => {
        return `${index + 1}. ${prop.name}\n   ID: ${prop.id}\n   Internal ID: ${prop.reference_property_id || 'N/A'}\n   Address: ${prop.address1 || 'N/A'}`;
      }).join('\n\n');

      return {
        content: [
          {
            type: 'text',
            text: `Found ${result.length} propert${result.length === 1 ? 'y' : 'ies'} (of ${properties.length} total):\n\n${formatted}`,
          },
        ],
      };
    }

    if (name === 'get_property') {
      const validated = GetPropertySchema.parse(args);
      const property = await breezewayClient.fetch('property', validated.id);

      // Format key property details in a readable way
      const details = [
        `**${property.name}**`,
        '',
        `🆔 Breezeway ID: ${property.id}`,
        `🔢 Internal ID: ${property.reference_property_id || 'N/A'}`,
        `📍 Address: ${property.address1 || 'N/A'}`,
        `🏙️  City: ${property.city || 'N/A'}, ${property.state || 'N/A'} ${property.zip || ''}`,
        '',
        `📶 WiFi: ${property.wifi_name || 'Not set'}`,
        `🔐 WiFi Password: ${property.wifi_password || 'Not set'}`,
        '',
        `📝 Description: ${property.notes?.about ? `${property.notes.about.substring(0, 200)}...` : 'Not set'}`,
        `🗺️  Directions: ${property.notes?.direction ? `${property.notes.direction.substring(0, 100)}...` : 'Not set'}`,
        `🗑️  Trash Info: ${property.notes?.trash_info ? `${property.notes.trash_info.substring(0, 100)}...` : 'Not set'}`,
      ].join('\n');

      return {
        content: [
          {
            type: 'text',
            text: details,
          },
        ],
      };
    }

    if (name === 'get_property_by_internal_id') {
      const validated = GetPropertyByInternalIdSchema.parse(args);
      const properties = await breezewayClient.getProperties();

      const property = properties.find(p => p.reference_property_id === validated.internalId);

      if (!property) {
        return {
          content: [
            {
              type: 'text',
              text: `No property found with Internal ID: ${validated.internalId}`,
            },
          ],
        };
      }

      // Fetch full details
      const fullProperty = await breezewayClient.fetch('property', property.id);

      const details = [
        `**${fullProperty.name}**`,
        '',
        `🆔 Breezeway ID: ${fullProperty.id}`,
        `🔢 Internal ID: ${fullProperty.reference_property_id}`,
        `📍 Address: ${fullProperty.address1 || 'N/A'}`,
        `🏙️  City: ${fullProperty.city || 'N/A'}, ${fullProperty.state || 'N/A'} ${fullProperty.zip || ''}`,
        '',
        `📶 WiFi: ${fullProperty.wifi_name || 'Not set'}`,
        `🔐 WiFi Password: ${fullProperty.wifi_password || 'Not set'}`,
      ].join('\n');

      return {
        content: [
          {
            type: 'text',
            text: details,
          },
        ],
      };
    }

    if (name === 'list_tasks') {
      const validated = ListTasksSchema.parse(args);
      const params: any = {};
      if (validated.propertyId) params.property_id = validated.propertyId;
      if (validated.status) params.status = validated.status;

      const tasks = await breezewayClient.getTasks(params);

      if (tasks.length === 0) {
        return {
          content: [
            {
              type: 'text',
              text: 'No tasks found matching the criteria.',
            },
          ],
        };
      }

      const formatted = tasks.map((task, index) => {
        return `${index + 1}. ${task.title}\n   ID: ${task.id}\n   Status: ${task.status || 'N/A'}\n   Property: ${task.property_id || 'N/A'}`;
      }).join('\n\n');

      return {
        content: [
          {
            type: 'text',
            text: `Found ${tasks.length} task${tasks.length === 1 ? '' : 's'}:\n\n${formatted}`,
          },
        ],
      };
    }

    if (name === 'list_reservations') {
      const validated = ListReservationsSchema.parse(args);
      const params: any = {};
      if (validated.propertyId) params.property_id = validated.propertyId;
      if (validated.startDate) params.start_date = validated.startDate;
      if (validated.endDate) params.end_date = validated.endDate;

      const reservations = await breezewayClient.getReservations(params);

      if (reservations.length === 0) {
        return {
          content: [
            {
              type: 'text',
              text: 'No reservations found matching the criteria.',
            },
          ],
        };
      }

      const formatted = reservations.map((res, index) => {
        return `${index + 1}. Reservation ${res.id}\n   Check-in: ${res.check_in || 'N/A'}\n   Check-out: ${res.check_out || 'N/A'}\n   Property: ${res.property_id || 'N/A'}`;
      }).join('\n\n');

      return {
        content: [
          {
            type: 'text',
            text: `Found ${reservations.length} reservation${reservations.length === 1 ? '' : 's'}:\n\n${formatted}`,
          },
        ],
      };
    }

    if (name === 'update_property') {
      const validated = UpdatePropertySchema.parse(args);

      // Fetch current property
      const currentProperty = await breezewayClient.fetch('property', validated.id);

      // Build update payload
      const updatePayload: any = {};

      if (validated.updates.wifi_name !== undefined) {
        updatePayload.wifi_name = validated.updates.wifi_name;
      }
      if (validated.updates.wifi_password !== undefined) {
        updatePayload.wifi_password = validated.updates.wifi_password;
      }
      if (validated.updates.notes) {
        updatePayload.notes = {
          ...currentProperty.notes,
          ...validated.updates.notes,
        };
      }

      // Update property
      const updated = await breezewayClient.updateProperty(validated.id, updatePayload);

      return {
        content: [
          {
            type: 'text',
            text: `✅ Successfully updated property ${validated.id} (${currentProperty.name})\n\nUpdated fields:\n${JSON.stringify(validated.updates, null, 2)}`,
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

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Breezeway MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error in main():', error);
  process.exit(1);
});
