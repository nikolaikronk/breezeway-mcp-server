#!/usr/bin/env node

import { App, ExpressReceiver } from '@slack/bolt';
import { config } from 'dotenv';
import { BreezewayClient } from './breezeway-client.js';

// Load environment variables
config();

const SLACK_BOT_TOKEN = process.env.SLACK_BOT_TOKEN;
const SLACK_SIGNING_SECRET = process.env.SLACK_SIGNING_SECRET;
const BREEZEWAY_API_KEY = process.env.BREEZEWAY_API_KEY;
const BREEZEWAY_API_SECRET = process.env.BREEZEWAY_API_SECRET;

if (!SLACK_BOT_TOKEN || !SLACK_SIGNING_SECRET) {
  console.error('Error: SLACK_BOT_TOKEN and SLACK_SIGNING_SECRET must be set');
  process.exit(1);
}

if (!BREEZEWAY_API_KEY || !BREEZEWAY_API_SECRET) {
  console.error('Error: BREEZEWAY_API_KEY and BREEZEWAY_API_SECRET must be set');
  process.exit(1);
}

// Initialize Breezeway client
const breezewayClient = new BreezewayClient({
  apiKey: BREEZEWAY_API_KEY,
  apiSecret: BREEZEWAY_API_SECRET,
});

// Create Express receiver for custom routes
const receiver = new ExpressReceiver({
  signingSecret: SLACK_SIGNING_SECRET,
});

// Initialize Slack app
const app = new App({
  token: SLACK_BOT_TOKEN,
  receiver,
});

// Helper function to format property info
function formatProperty(property: any, detailed: boolean = false): string {
  let text = `*${property.name || property.display}*\n`;
  text += `📍 ${property.address1 || ''}${property.address2 ? ' ' + property.address2 : ''}, ${property.city || ''}\n`;
  text += `🆔 Breezeway ID: ${property.id}\n`;

  if (property.reference_property_id) {
    text += `🔗 Streamline ID: ${property.reference_property_id}\n`;
  }

  if (detailed && property.notes) {
    if (property.notes.wifi_network || property.notes['wifi network']) {
      const wifiNetwork = property.notes.wifi_network || property.notes['wifi network'];
      const wifiPassword = property.notes.wifi_password || property.notes['wifi password'];
      text += `📶 WiFi: ${wifiNetwork}${wifiPassword ? ' / ' + wifiPassword : ''}\n`;
    }
  }

  return text;
}

// /breezeway command
app.command('/breezeway', async ({ command, ack, respond }) => {
  await ack();

  try {
    const text = command.text.trim();

    if (!text) {
      await respond({
        text: 'Usage: `/breezeway [search|property|wifi] [query]`\n\nExamples:\n• `/breezeway search St Louis`\n• `/breezeway property 737329`\n• `/breezeway wifi 4700 McPherson`',
        response_type: 'ephemeral',
      });
      return;
    }

    const parts = text.split(' ');
    const subcommand = parts[0].toLowerCase();
    const query = parts.slice(1).join(' ');

    // Search command
    if (subcommand === 'search') {
      if (!query) {
        await respond({
          text: '❌ Please provide a search query.\nExample: `/breezeway search St Louis`',
          response_type: 'ephemeral',
        });
        return;
      }

      await respond({
        text: `🔍 Searching for "${query}"...`,
        response_type: 'ephemeral',
      });

      const results = await breezewayClient.search(query, ['properties']);

      if (results.length === 0) {
        await respond({
          text: `No properties found for "${query}"`,
          response_type: 'ephemeral',
        });
        return;
      }

      // Limit to 10 results for Slack
      const limitedResults = results.slice(0, 10);
      let responseText = `Found ${results.length} propert${results.length === 1 ? 'y' : 'ies'} matching "${query}"`;
      if (results.length > 10) {
        responseText += ` (showing first 10)`;
      }
      responseText += ':\n\n';

      limitedResults.forEach((result, index) => {
        responseText += `${index + 1}. ${formatProperty(result.data)}\n`;
      });

      await respond({
        text: responseText,
        response_type: 'in_channel',
      });
    }

    // Property details by ID
    else if (subcommand === 'property') {
      if (!query) {
        await respond({
          text: '❌ Please provide a property ID.\nExample: `/breezeway property 737329`',
          response_type: 'ephemeral',
        });
        return;
      }

      await respond({
        text: `🔍 Fetching property ${query}...`,
        response_type: 'ephemeral',
      });

      try {
        const property = await breezewayClient.fetch('property', query);
        const responseText = `Property Details:\n\n${formatProperty(property, true)}`;

        await respond({
          text: responseText,
          response_type: 'in_channel',
        });
      } catch (error: any) {
        await respond({
          text: `❌ Property ${query} not found`,
          response_type: 'ephemeral',
        });
      }
    }

    // WiFi lookup
    else if (subcommand === 'wifi') {
      if (!query) {
        await respond({
          text: '❌ Please provide a property name or address.\nExample: `/breezeway wifi 4700 McPherson`',
          response_type: 'ephemeral',
        });
        return;
      }

      await respond({
        text: `🔍 Looking up WiFi for "${query}"...`,
        response_type: 'ephemeral',
      });

      const results = await breezewayClient.search(query, ['properties']);

      if (results.length === 0) {
        await respond({
          text: `No properties found for "${query}"`,
          response_type: 'ephemeral',
        });
        return;
      }

      // Get detailed info for first result
      const firstResult = results[0];
      const property = await breezewayClient.fetch('property', firstResult.id);

      let responseText = `WiFi Info for ${property.name || property.display}:\n\n`;

      if (property.notes?.wifi_network || property.notes?.['wifi network']) {
        const wifiNetwork = property.notes.wifi_network || property.notes['wifi network'];
        const wifiPassword = property.notes.wifi_password || property.notes['wifi password'];
        responseText += `📶 *Network:* ${wifiNetwork}\n`;
        responseText += `🔑 *Password:* ${wifiPassword || 'Not set'}\n`;
      } else {
        responseText += '📶 WiFi information not available for this property';
      }

      await respond({
        text: responseText,
        response_type: 'in_channel',
      });
    }

    // List properties
    else if (subcommand === 'list') {
      await respond({
        text: '📋 Fetching property list...',
        response_type: 'ephemeral',
      });

      const properties = await breezewayClient.getProperties();
      const limitedProperties = properties.slice(0, 10);

      let responseText = `Total properties: ${properties.length} (showing first 10):\n\n`;
      limitedProperties.forEach((prop, index) => {
        responseText += `${index + 1}. ${formatProperty(prop)}\n`;
      });

      await respond({
        text: responseText,
        response_type: 'in_channel',
      });
    }

    // Unknown command
    else {
      await respond({
        text: `❌ Unknown command: ${subcommand}\n\nAvailable commands:\n• \`search [query]\` - Search properties\n• \`property [id]\` - Get property details\n• \`wifi [property]\` - Get WiFi credentials\n• \`list\` - List properties`,
        response_type: 'ephemeral',
      });
    }

  } catch (error) {
    console.error('Error handling command:', error);
    await respond({
      text: `❌ Error: ${error instanceof Error ? error.message : String(error)}`,
      response_type: 'ephemeral',
    });
  }
});

// Start the app
const PORT = process.env.PORT || 3000;

(async () => {
  await app.start(PORT);
  console.log(`⚡️ Breezeway Slack bot is running on port ${PORT}`);
})();

export { app, receiver };
