import { config } from 'dotenv';
import { BreezewayClient } from './breezeway-client.js';

// Load environment variables
config();

const BREEZEWAY_API_KEY = process.env.BREEZEWAY_API_KEY;
const BREEZEWAY_API_SECRET = process.env.BREEZEWAY_API_SECRET;

if (!BREEZEWAY_API_KEY || !BREEZEWAY_API_SECRET) {
  console.error('Error: BREEZEWAY_API_KEY and BREEZEWAY_API_SECRET must be set');
  process.exit(1);
}

async function searchEspadinProperties() {
  const client = new BreezewayClient({
    apiKey: BREEZEWAY_API_KEY!,
    apiSecret: BREEZEWAY_API_SECRET!,
  });

  console.log('Searching for Espadin properties in Breezeway...\n');

  try {
    // Search specifically for properties with "Espadin" in them
    const results = await client.search('Espadin', ['properties']);

    if (results.length === 0) {
      console.log('No Espadin properties found.');
      return;
    }

    console.log(`Found ${results.length} Espadin property/properties:\n`);

    results.forEach((result, index) => {
      console.log(`${index + 1}. ${result.title}`);
      console.log(`   ID: ${result.id}`);
      console.log(`   ${result.snippet}`);
      console.log(`   Full data:`, JSON.stringify(result.data, null, 2));
      console.log('');
    });

  } catch (error) {
    console.error('Error searching for Espadin properties:', error);
  }
}

searchEspadinProperties();
