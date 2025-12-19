/**
 * Production-Grade LangChain Agent Tools
 * 
 * This module provides enterprise-ready tools for:
 * - Document retrieval (RAG)
 * - Database queries
 * - Web search
 * - Data analysis
 * - API integrations
 * 
 * @module tools
 * @author Your Name
 * @version 1.0.0
 */

import 'dotenv/config';
import { Tool } from '@langchain/core/tools';
import { createClient } from '@supabase/supabase-js';
import { OpenAIEmbeddings } from '@langchain/openai';
import { z } from 'zod';

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);

// Initialize embeddings
const embeddings = new OpenAIEmbeddings({
  openAIApiKey: process.env.OPENAI_API_KEY!,
});

/**
 * Document Search Tool
 * Performs semantic search across embedded documents using RAG
 */
export class DocumentSearchTool extends Tool {
  name = 'document_search';
  description = 'Search through company documents and knowledge base using semantic search. Use this when you need to find specific information from documents.';

  schema = z.object({
    query: z.string().describe('The search query'),
    limit: z.number().optional().default(5).describe('Number of results to return'),
  });

  async _call(input: z.infer<typeof this.schema>): Promise<string> {
    try {
      const { query, limit = 5 } = input;

      // Generate embedding for the query
      const queryEmbedding = await embeddings.embedQuery(query);

      // Search in Supabase vector store
      const { data, error } = await supabase.rpc('match_documents', {
        query_embedding: queryEmbedding,
        match_threshold: 0.78,
        match_count: limit,
      });

      if (error) throw error;

      if (!data || data.length === 0) {
        return 'No relevant documents found for your query.';
      }

      // Format results
      const results = data.map((doc: any, idx: number) => 
        `Result ${idx + 1}:\nContent: ${doc.content}\nSimilarity: ${doc.similarity.toFixed(2)}\n`
      ).join('\n');

      return results;
    } catch (error) {
      return `Error searching documents: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }
}

/**
 * Database Query Tool
 * Executes safe, read-only queries against the database
 */
export class DatabaseQueryTool extends Tool {
  name = 'database_query';
  description = 'Query the database for structured data like user records, transactions, or metrics. Only read operations are allowed.';

  schema = z.object({
    table: z.string().describe('The table to query'),
    filters: z.record(z.any()).optional().describe('Filter conditions'),
    limit: z.number().optional().default(10),
  });

  async _call(input: z.infer<typeof this.schema>): Promise<string> {
    try {
      const { table, filters = {}, limit = 10 } = input;

      // Validate table name to prevent SQL injection
      const allowedTables = ['documents', 'agent_conversations', 'document_chunks'];
      if (!allowedTables.includes(table)) {
        return `Error: Table '${table}' is not allowed. Allowed tables: ${allowedTables.join(', ')}`;
      }

      let query = supabase.from(table).select('*').limit(limit);

      // Apply filters
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });

      const { data, error } = await query;

      if (error) throw error;

      if (!data || data.length === 0) {
        return 'No data found matching your criteria.';
      }

      return JSON.stringify(data, null, 2);
    } catch (error) {
      return `Error querying database: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }
}

/**
 * Data Analysis Tool
 * Performs calculations and analysis on numerical data
 */
export class DataAnalysisTool extends Tool {
  name = 'data_analysis';
  description = 'Perform statistical analysis on data: calculate mean, median, sum, trends, etc.';

  schema = z.object({
    operation: z.enum(['mean', 'median', 'sum', 'count', 'min', 'max']).describe('The operation to perform'),
    values: z.array(z.number()).describe('Array of numbers to analyze'),
  });

  async _call(input: z.infer<typeof this.schema>): Promise<string> {
    try {
      const { operation, values } = input;

      if (values.length === 0) {
        return 'Error: No values provided for analysis.';
      }

      let result: number;

      switch (operation) {
        case 'mean':
          result = values.reduce((a, b) => a + b, 0) / values.length;
          break;
        case 'median':
          const sorted = [...values].sort((a, b) => a - b);
          const mid = Math.floor(sorted.length / 2);
          result = sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
          break;
        case 'sum':
          result = values.reduce((a, b) => a + b, 0);
          break;
        case 'count':
          result = values.length;
          break;
        case 'min':
          result = Math.min(...values);
          break;
        case 'max':
          result = Math.max(...values);
          break;
        default:
          return 'Error: Invalid operation.';
      }

      return `${operation.toUpperCase()}: ${result.toFixed(2)}`;
    } catch (error) {
      return `Error performing analysis: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }
}

/**
 * Conversation Memory Tool
 * Manages conversation history and context
 */
export class ConversationMemoryTool extends Tool {
  name = 'conversation_memory';
  description = 'Save and retrieve conversation history for maintaining context across sessions.';

  schema = z.object({
    action: z.enum(['save', 'retrieve']).describe('Action to perform'),
    conversationId: z.string().describe('Unique conversation identifier'),
    message: z.string().optional().describe('Message to save (only for save action)'),
  });

  async _call(input: z.infer<typeof this.schema>): Promise<string> {
    try {
      const { action, conversationId, message } = input;

      if (action === 'save') {
        if (!message) {
          return 'Error: Message is required for save action.';
        }

        const { error } = await supabase
          .from('agent_conversations')
          .upsert({
            id: conversationId,
            messages: message,
            updated_at: new Date().toISOString(),
          });

        if (error) throw error;
        return 'Conversation saved successfully.';
      }

      if (action === 'retrieve') {
        const { data, error } = await supabase
          .from('agent_conversations')
          .select('messages')
          .eq('id', conversationId)
          .single();

        if (error) throw error;
        return data?.messages || 'No conversation history found.';
      }

      return 'Error: Invalid action.';
    } catch (error) {
      return `Error with conversation memory: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }
}

/**
 * Time and Date Tool
 * Provides current date/time and date calculations
 */
export class DateTimeTool extends Tool {
  name = 'datetime';
  description = 'Get current date and time, or perform date calculations.';

  schema = z.object({
    action: z.enum(['current', 'add_days', 'format']).describe('Action to perform'),
    days: z.number().optional().describe('Number of days to add (for add_days)'),
    format: z.string().optional().describe('Date format (for format action)'),
  });

  async _call(input: z.infer<typeof this.schema>): Promise<string> {
    try {
      const { action, days, format } = input;
      const now = new Date();

      if (action === 'current') {
        return `Current date and time: ${now.toISOString()}`;
      }

      if (action === 'add_days' && typeof days === 'number') {
        const future = new Date(now);
        future.setDate(future.getDate() + days);
        return `Date after ${days} days: ${future.toISOString()}`;
      }

      if (action === 'format' && format) {
        // Basic formatting
        return `Formatted date: ${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;
      }

      return 'Error: Invalid action or missing parameters.';
    } catch (error) {
      return `Error with datetime: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }
}

// Export all tools as an array for easy agent initialization
export const allTools = [
  new DocumentSearchTool(),
  new DatabaseQueryTool(),
  new DataAnalysisTool(),
  new ConversationMemoryTool(),
  new DateTimeTool(),
];
