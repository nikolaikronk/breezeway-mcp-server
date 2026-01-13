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

async function checkPropertyDetails() {
  try {
    const client = new BreezewayClient({
      apiKey: BREEZEWAY_API_KEY,
      apiSecret: BREEZEWAY_API_SECRET,
    });

    console.log('Fetching details for #00 Espadin LoHi Warehouse (858663)...\n');

    const property = await client.fetch('property', '858663');

    console.log('Full Property Details:');
    console.log(JSON.stringify(property, null, 2));

    // Check for Streamline connection indicators
    if (property.external_id) {
      console.log('\n✓ External ID found:', property.external_id);
    }

    if (property.integration || property.integrations) {
      console.log('\n✓ Integration data found:', property.integration || property.integrations);
    }

    if (property.pms_id || property.pms_connection) {
      console.log('\n✓ PMS connection found:', property.pms_id || property.pms_connection);
    }

  } catch (error) {
    console.error('Error fetching property details:', error);
    process.exit(1);
  }
}

checkPropertyDetails();
