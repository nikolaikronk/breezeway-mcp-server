import { config } from 'dotenv';
import { BreezewayClient } from './src/breezeway-client.js';

// Load environment variables
config();

const BREEZEWAY_API_KEY = process.env.BREEZEWAY_API_KEY;
const BREEZEWAY_API_SECRET = process.env.BREEZEWAY_API_SECRET;

if (!BREEZEWAY_API_KEY || !BREEZEWAY_API_SECRET) {
  console.error('Error: BREEZEWAY_API_KEY and BREEZEWAY_API_SECRET must be set');
  process.exit(1);
}

async function getPropertyCount() {
  try {
    const client = new BreezewayClient({
      apiKey: BREEZEWAY_API_KEY,
      apiSecret: BREEZEWAY_API_SECRET,
    });

    console.log('Fetching properties from Breezeway...\n');

    const properties = await client.getProperties();

    console.log(`Total Properties: ${properties.length}`);
    console.log('\nProperty Summary:');
    properties.forEach((prop, index) => {
      console.log(`  ${index + 1}. ${prop.name} (${prop.id})`);
      if (prop.address) {
        console.log(`     Address: ${prop.address}`);
      }
      if (prop.status) {
        console.log(`     Status: ${prop.status}`);
      }
    });
  } catch (error) {
    console.error('Error fetching properties:', error);
    process.exit(1);
  }
}

getPropertyCount();
