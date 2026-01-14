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

async function getCompletedTasksToday() {
  try {
    const client = new BreezewayClient({
      apiKey: BREEZEWAY_API_KEY,
      apiSecret: BREEZEWAY_API_SECRET,
    });

    console.log('Fetching tasks from Breezeway...\n');

    // Get today's date range (start and end of day)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStart = today.toISOString();

    const todayEnd = new Date(today);
    todayEnd.setHours(23, 59, 59, 999);
    const todayEndStr = todayEnd.toISOString();

    console.log(`Looking for tasks completed today: ${today.toDateString()}`);
    console.log(`Date range: ${todayStart} to ${todayEndStr}\n`);

    // Try fetching tasks with date filter without property_id first
    console.log('Attempting to fetch all tasks with date filter...');
    let tasks: any[] = [];

    try {
      // Try with completion date filter
      tasks = await client.getTasks({
        completed_after: todayStart,
        completed_before: todayEndStr
      });
      console.log(`✓ Successfully fetched ${tasks.length} tasks with date filter\n`);
    } catch (error: any) {
      console.log('✗ Date filter approach failed, falling back to property-by-property...\n');

      // Fallback: Fetch properties and iterate with delays
      console.log('Fetching properties...');
      const properties = await client.getProperties();
      console.log(`Found ${properties.length} properties\n`);

      // Filter out unlikely properties (warehouses, training, management)
      const activeProperties = properties.filter(prop =>
        !prop.name.startsWith('ZZ') &&
        !prop.name.startsWith('#00') &&
        prop.status === 'active'
      );

      console.log(`Filtered to ${activeProperties.length} active rental properties\n`);
      console.log('Fetching tasks (with 500ms delay between requests)...\n');

      let allTasks: any[] = [];
      let processed = 0;

      for (const property of activeProperties) {
        try {
          const propertyTasks = await client.getTasks({ property_id: property.id });
          allTasks = allTasks.concat(propertyTasks);
          processed++;

          if (propertyTasks.length > 0) {
            console.log(`  ✓ ${property.name}: ${propertyTasks.length} tasks`);
          }

          // Add delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
          console.error(`  ✗ ${property.name}: Error`);
        }
      }

      tasks = allTasks;
      console.log(`\nTotal tasks fetched from ${processed} properties: ${tasks.length}\n`);
    }

    // Filter for completed tasks today
    const completedToday = tasks.filter((task: any) => {
      // Check if task has a completed status
      const isCompleted = task.status === 'completed' || task.status === 'complete';

      // Check if completed date is today
      const completedDate = task.completed_at || task.completed_date || task.updated_at;
      if (!completedDate) return false;

      const taskDate = new Date(completedDate);
      return isCompleted && taskDate >= today && taskDate <= todayEnd;
    });

    console.log(`Tasks completed today: ${completedToday.length}\n`);

    if (completedToday.length > 0) {
      console.log('Completed tasks:');
      completedToday.forEach((task: any, index: number) => {
        console.log(`  ${index + 1}. ${task.title || task.name || 'Untitled'} (${task.id})`);
        if (task.completed_at || task.completed_date) {
          const completedDate = new Date(task.completed_at || task.completed_date);
          console.log(`     Completed at: ${completedDate.toLocaleString()}`);
        }
        if (task.property_id) {
          console.log(`     Property ID: ${task.property_id}`);
        }
      });
    }

    // Also show task status breakdown
    console.log('\nTask Status Breakdown:');
    const statusCounts: Record<string, number> = {};
    tasks.forEach((task: any) => {
      const status = task.status || 'unknown';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });

    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`  ${status}: ${count}`);
    });

  } catch (error) {
    console.error('Error fetching tasks:', error);
    process.exit(1);
  }
}

getCompletedTasksToday();
