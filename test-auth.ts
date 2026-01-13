import { config } from 'dotenv';
import fetch from 'node-fetch';

// Load environment variables
config();

const BREEZEWAY_API_KEY = process.env.BREEZEWAY_API_KEY;
const BREEZEWAY_API_SECRET = process.env.BREEZEWAY_API_SECRET;

async function testAuth() {
  console.log('Testing Breezeway Authentication...\n');
  console.log('API Key:', BREEZEWAY_API_KEY);
  console.log('API Secret:', BREEZEWAY_API_SECRET?.substring(0, 10) + '...\n');

  const authUrl = 'https://api.breezeway.io/public/auth/v1/';

  console.log('Auth URL:', authUrl);
  console.log('Request body:', JSON.stringify({
    client_id: BREEZEWAY_API_KEY,
    client_secret: BREEZEWAY_API_SECRET,
  }, null, 2));

  try {
    const response = await fetch(authUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        client_id: BREEZEWAY_API_KEY,
        client_secret: BREEZEWAY_API_SECRET,
      }),
    });

    console.log('\nResponse Status:', response.status, response.statusText);
    console.log('Response Headers:', Object.fromEntries(response.headers.entries()));

    const responseText = await response.text();
    console.log('\nResponse Body:', responseText);

    if (response.ok) {
      const data = JSON.parse(responseText);
      console.log('\nParsed Data:', JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

testAuth();
