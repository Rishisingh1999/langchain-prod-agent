#!/usr/bin/env node

import 'dotenv/config';
import { createProductionAgent, runAgent } from './dist/agent.js';

async function testAgent() {
  console.log('Starting test...');
  
  try {
    console.log('Creating agent...');
    const agent = await createProductionAgent({
      modelName: 'gpt-4',
      temperature: 0.7,
      verbose: true,
    });
    
    console.log('Agent created! Testing with a simple query...');
    const result = await runAgent(agent, 'Hello, what is your name?');
    console.log('Result:', result);
  } catch (error) {
    console.error('Error:', error);
  }
}

testAgent();
