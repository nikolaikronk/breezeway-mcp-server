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

async function listEspadinSummary() {
  const client = new BreezewayClient({
    apiKey: BREEZEWAY_API_KEY!,
    apiSecret: BREEZEWAY_API_SECRET!,
  });

  console.log('Fetching Espadin properties from Breezeway...\n');

  try {
    // Search specifically for properties with "Espadin" in them
    const results = await client.search('Espadin', ['properties']);

    if (results.length === 0) {
      console.log('No Espadin properties found.');
      return;
    }

    console.log(`Found ${results.length} Espadin properties:\n`);
    console.log('=' .repeat(80));

    results.forEach((result, index) => {
      const data = result.data;
      console.log(`\n${index + 1}. ${data.name || data.display}`);
      console.log(`   Property ID: ${data.id}`);
      console.log(`   Address: ${data.address1}${data.address2 ? ' ' + data.address2 : ''}, ${data.city}, ${data.country}`);
      console.log(`   Building: ${data.building || 'N/A'}`);
      console.log(`   Status: ${data.status || 'N/A'}`);
      if (data.groups && data.groups.length > 0) {
        console.log(`   Group: ${data.groups[0].name}`);
      }
    });

    console.log('\n' + '='.repeat(80));
    console.log(`\nTotal: ${results.length} Espadin properties`);

  } catch (error) {
    console.error('Error fetching Espadin properties:', error);
  }
}

listEspadinSummary();
