/**
 * Production-grade tools (runtime-friendly, typed as `any` to avoid TypeScript LangChain typing conflicts)
 * Replace or extend implementations as needed for production.
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { OpenAIEmbeddings } from '@langchain/openai';
import { z } from 'zod';

type ToolLike = any;

const supabase = process.env.SUPABASE_URL && process.env.SUPABASE_KEY
	? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY)
	: null as any;

const embeddings: any = process.env.OPENAI_API_KEY ? new OpenAIEmbeddings({ openAIApiKey: process.env.OPENAI_API_KEY }) : null;

const DocumentSearchTool: ToolLike = {
	name: 'document_search',
	description: 'Search company documents using semantic search (Supabase)',
	schema: z.object({ query: z.string(), limit: z.number().optional().default(5) }) as any,
	call: async (input: any) => {
		if (!supabase || !embeddings) return 'Document search not configured.';
		const { query, limit = 5 } = input || {};
		const queryEmbedding = await embeddings.embedQuery(query);
		const { data, error } = await supabase.rpc('match_documents', {
			query_embedding: queryEmbedding,
			match_threshold: 0.78,
			match_count: limit,
		});
		if (error) throw error;
		if (!data || data.length === 0) return 'No relevant documents found.';
		return data.map((d: any, i: number) => `Result ${i + 1}: ${d.content}`).join('\n');
	}
};

const DataAnalysisTool: ToolLike = {
	name: 'data_analysis',
	description: 'Perform basic stats: mean, median, sum, min, max, count',
	schema: z.object({ operation: z.enum(['mean','median','sum','count','min','max']), values: z.array(z.number()) }) as any,
	call: async (input: any) => {
		const { operation, values } = input || {};
		if (!Array.isArray(values) || values.length === 0) return 'No values provided.';
		let result: number;
		switch (operation) {
			case 'mean': result = values.reduce((a:number,b:number)=>a+b,0)/values.length; break;
			case 'sum': result = values.reduce((a:number,b:number)=>a+b,0); break;
			case 'min': result = Math.min(...values); break;
			case 'max': result = Math.max(...values); break;
			case 'count': result = values.length; break;
			case 'median':
				const s = [...values].sort((a,b)=>a-b); const m = Math.floor(s.length/2);
				result = s.length%2? s[m] : (s[m-1]+s[m])/2; break;
			default: return 'Invalid operation.';
		}
		return `${operation}: ${result}`;
	}
};

const DateTimeTool: ToolLike = {
	name: 'datetime',
	description: 'Get the current date/time or add days',
	schema: z.object({ action: z.enum(['current','add_days','format']), days: z.number().optional(), format: z.string().optional() }) as any,
	call: async (input: any) => {
		const now = new Date();
		const { action, days } = input || {};
		if (action === 'current') return `Current date and time: ${now.toISOString()}`;
		if (action === 'add_days' && typeof days === 'number') { const future = new Date(now); future.setDate(future.getDate()+days); return `Date after ${days} days: ${future.toISOString()}`; }
		return `Formatted date: ${now.toLocaleString()}`;
	}
};

const ConversationMemoryTool: ToolLike = {
	name: 'conversation_memory',
	description: 'Save or retrieve conversation messages (stub)',
	schema: z.object({ action: z.enum(['save','retrieve']), conversationId: z.string(), message: z.string().optional() }) as any,
	call: async (input: any) => {
		const { action, message } = input || {};
		if (action === 'save') return 'Conversation saved (stub).';
		return 'No conversation history (stub).';
	}
};

export const allTools: ToolLike[] = [DocumentSearchTool, DataAnalysisTool, DateTimeTool, ConversationMemoryTool];

export default allTools;
