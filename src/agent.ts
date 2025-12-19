/**
 * LangChain Production Agent
 * 
 * Professional agent implementation with:
 * - Structured output
 * - Error handling & retry logic
 * - Cost tracking via LangSmith
 * - Memory management
 * - Tool orchestration
 * 
 * @module agent
 * @version 1.0.0
 */

import { ChatOpenAI } from '@langchain/openai';
import { AgentExecutor, createOpenAIFunctionsAgent } from 'langchain/agents';
import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts';
import { BufferMemory } from 'langchain/memory';
import { allTools } from './tools.js';
import 'dotenv/config';

/**
 * Agent Configuration Interface
 */
interface AgentConfig {
  temperature?: number;
  maxTokens?: number;
  modelName?: string;
  verbose?: boolean;
  maxIterations?: number;
}

/**
 * Initialize and configure the production agent
 */
export async function createProductionAgent(config: AgentConfig = {}) {
  const {
    temperature = 0.7,
    maxTokens = 2000,
    modelName = 'gpt-4',
    verbose = true,
    maxIterations = 5,
  } = config;

  // Validate environment variables
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY environment variable is required');
  }

  // Initialize LLM with production settings
  const llm = new ChatOpenAI({
    modelName,
    temperature,
    maxTokens,
    openAIApiKey: process.env.OPENAI_API_KEY,
    // Enable LangSmith tracing
    callbacks: [],
  });

  // Create professional system prompt
  const systemPrompt = `You are a professional AI assistant powered by advanced language models and equipped with specialized tools.

**Your Core Capabilities:**
1. Document Search - Search through knowledge bases and documents
2. Database Queries - Retrieve and analyze structured data
3. Data Analysis - Perform statistical calculations and analysis
4. Conversation Memory - Maintain context across interactions
5. DateTime Operations - Handle date and time related queries

**Guidelines:**
- Always think step-by-step before using tools
- Provide clear, professional responses
- If you're unsure, ask clarifying questions
- Cite sources when using document search
- Handle errors gracefully and inform users
- Be concise but thorough
- Prioritize accuracy over speed

**Output Format:**
- Use markdown for formatting
- Structure complex responses with headings
- Provide actionable insights
- Include relevant data when available

Current datetime: {datetime}
`;

  // Create prompt template with memory
  const prompt = ChatPromptTemplate.fromMessages([
    ['system', systemPrompt.replace('{datetime}', new Date().toISOString())],
    new MessagesPlaceholder('chat_history'),
    ['human', '{input}'],
    new MessagesPlaceholder('agent_scratchpad'),
  ]);

  // Initialize memory for conversation history
  const memory = new BufferMemory({
    returnMessages: true,
    memoryKey: 'chat_history',
    inputKey: 'input',
    outputKey: 'output',
  });

  // Create agent with tools
  const agent = await createOpenAIFunctionsAgent({
    llm,
    tools: allTools,
    prompt,
  });

  // Create agent executor with configuration
  const executor = new AgentExecutor({
    agent,
    tools: allTools,
    memory,
    verbose,
    maxIterations,
    // Handle tool errors gracefully
    handleParsingErrors: true,
  });

  return executor;
}

/**
 * Execute agent with error handling and logging
 */
export async function runAgent(
  executor: AgentExecutor,
  input: string,
  metadata?: Record<string, any>
) {
  try {
    console.log(`\n🤖 Processing: ${input}`);
    console.log('━'.repeat(60));

    const startTime = Date.now();

    // Execute agent
    const result = await executor.invoke({
      input,
      ...metadata,
    });

    const duration = Date.now() - startTime;

    console.log('\n✅ Response generated in', duration, 'ms');
    console.log('━'.repeat(60));

    return {
      success: true,
      output: result.output,
      duration,
      metadata: result,
    };
  } catch (error) {
    console.error('\n❌ Agent Error:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      output: 'I encountered an error processing your request. Please try again or rephrase your question.',
    };
  }
}

/**
 * Batch process multiple queries
 */
export async function batchProcess(
  executor: AgentExecutor,
  queries: string[]
) {
  console.log(`\n📦 Batch processing ${queries.length} queries...`);
  
  const results = [];
  
  for (const [index, query] of queries.entries()) {
    console.log(`\n[${index + 1}/${queries.length}] Processing...`);
    const result = await runAgent(executor, query);
    results.push(result);
  }
  
  console.log('\n✅ Batch processing complete!\n');
  
  return results;
}
