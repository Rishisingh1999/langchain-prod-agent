/**
 * LangChain Production Agent - Main Entry Point
 * 
 * This is the main application file that demonstrates:
 * - Agent initialization
 * - Interactive CLI usage
 * - Example queries
 * - Error handling
 * - LangSmith monitoring
 * 
 * @module index
 * @version 1.0.0
 * @author Your Name <your.email@example.com>
 */

import 'dotenv/config';
import { createProductionAgent, runAgent, batchProcess } from './agent.ts';
import * as readline from 'readline';

/**
 * Main application function
 */
async function main() {
  console.log('\n🚀 LangChain Production Agent Starting...');
  console.log('━'.repeat(70));

  try {
    // Validate required environment variables
    const requiredEnvVars = [
      'OPENAI_API_KEY',
      'SUPABASE_URL',
      'SUPABASE_KEY',
      'LANGSMITH_API_KEY',
    ];

    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      console.error('\n❌ Missing required environment variables:');
      missingVars.forEach(varName => console.error(`   - ${varName}`));
      console.error('\nPlease check your .env file and add the missing keys.');
      console.error('See README.md for instructions on getting API keys.\n');
      process.exit(1);
    }

    console.log('✅ Environment variables loaded');
    console.log('✅ LangSmith tracing enabled');
    console.log(`✅ Project: ${process.env.LANGSMITH_PROJECT}`);
    console.log('━'.repeat(70));

    // Initialize the agent
    console.log('\n🤖 Initializing AI Agent...');
    const agent = await createProductionAgent({
      modelName: 'gpt-4',
      temperature: 0.7,
      verbose: true,
      maxIterations: 5,
    });
    console.log('✅ Agent initialized successfully!\n');

    // Example usage modes
    const mode = process.env.AGENT_MODE || 'interactive';

    if (mode === 'demo') {
      await runDemoMode(agent);
    } else if (mode === 'batch') {
      await runBatchMode(agent);
    } else {
      await runInteractiveMode(agent);
    }

  } catch (error) {
    console.error('\n❌ Fatal Error:', error);
    console.error('\nPlease check your configuration and try again.\n');
    process.exit(1);
  }
}

/**
 * Demo mode - Run predefined example queries
 */
async function runDemoMode(agent: any) {
  console.log('🎯 Running Demo Mode...\n');
  console.log('━'.repeat(70));

  const demoQueries = [
    'What is the current date and time?',
    'Calculate the mean of these numbers: 10, 20, 30, 40, 50',
    'Search for documents about "AI and machine learning"',
  ];

  for (const query of demoQueries) {
    const result = await runAgent(agent, query);
    
    if (result.success) {
      console.log('\n💬 Response:', result.output);
      console.log(`⏱️  Duration: ${result.duration}ms`);
    } else {
      console.log('\n❌ Error:', result.error);
    }
    
    console.log('\n' + '━'.repeat(70) + '\n');
    
    // Brief pause between queries
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('\n✅ Demo completed!\n');
}

/**
 * Batch mode - Process multiple queries efficiently
 */
async function runBatchMode(agent: any) {
  console.log('📦 Running Batch Mode...\n');
  
  const queries = [
    'What tools do you have available?',
    'Calculate the sum of 100, 200, and 300',
    'Get the current datetime',
  ];

  const results = await batchProcess(agent, queries);
  
  console.log('\n📊 Batch Results Summary:');
  console.log('━'.repeat(70));
  
  results.forEach((result, idx) => {
    console.log(`\n${idx + 1}. ${result.success ? '✅ Success' : '❌ Failed'}`);
    if (result.success) {
      console.log(`   Duration: ${result.duration}ms`);
    }
  });
  
  console.log('\n');
}

/**
 * Interactive mode - Chat with the agent via CLI
 */
async function runInteractiveMode(agent: any) {
  console.log('💬 Interactive Mode - Chat with your AI Agent!');
  console.log('━'.repeat(70));
  console.log('\nCommands:');
  console.log('  - Type your question and press Enter');
  console.log('  - Type "exit" or "quit" to stop');
  console.log('  - Type "help" to see available tools');
  console.log('\n' + '━'.repeat(70) + '\n');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const askQuestion = () => {
    rl.question('You: ', async (input) => {
      const query = input.trim();

      if (!query) {
        askQuestion();
        return;
      }

      if (query.toLowerCase() === 'exit' || query.toLowerCase() === 'quit') {
        console.log('\n👋 Goodbye! Thanks for using the agent.\n');
        rl.close();
        process.exit(0);
      }

      if (query.toLowerCase() === 'help') {
        console.log('\n🛠️  Available Tools:');
        console.log('  1. Document Search - Find information in documents');
        console.log('  2. Database Queries - Query structured data');
        console.log('  3. Data Analysis - Calculate statistics');
        console.log('  4. Conversation Memory - Remember chat history');
        console.log('  5. DateTime - Get current time and date info\n');
        askQuestion();
        return;
      }

      const result = await runAgent(agent, query);
      
      console.log('\nAgent:', result.output);
      console.log('\n' + '━'.repeat(70) + '\n');
      
      askQuestion();
    });
  };

  askQuestion();
}

/**
 * Start the application
 */
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { main, runDemoMode, runBatchMode, runInteractiveMode };
