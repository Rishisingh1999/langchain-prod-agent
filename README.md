# LangChain Production Agent

## 🚀 Overview
Production-ready LangChain AI agent with Supabase backend and LangSmith monitoring. Built for scalability, observability, and real-world deployment.

---

## 📋 Prerequisites

Before you start, make sure you have:

1. **Node.js** (v18 or higher) - [Download here](https://nodejs.org)
2. **OpenAI API Key** - [Get it here](https://platform.openai.com/api-keys)
3. **Supabase Account** - [Sign up here](https://supabase.com)
4. **LangSmith Account** - [Sign up here](https://smith.langchain.com)

---

## ⚙️ Setup Instructions

### Step 1: Clone the Repository

```bash
git clone https://github.com/researchsociety1999-hub/langchain-prod-agent.git
cd langchain-prod-agent
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Configure Environment Variables

**This is where you add your API keys!** 🔑

1. Copy the example environment file:

```bash
cp .env.example .env
```

2. Open the `.env` file in your text editor:

```bash
code .env
# or
notepad .env
```

3. **Add your API keys** by replacing the placeholder values:

```env
# OpenAI API Key - Get from https://platform.openai.com/api-keys
OPENAI_API_KEY=sk-your-actual-openai-key-here

# Supabase Configuration - Get from https://supabase.com/dashboard/project/_/settings/api
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=your-actual-supabase-anon-key-here

# LangSmith Configuration - Get from https://smith.langchain.com/settings
LANGSMITH_API_KEY=ls-your-actual-langsmith-key-here
LANGSMITH_PROJECT=langchain-prod-agent
LANGSMITH_TRACING=true
```

---

## 🔑 How to Get Your API Keys

### OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign in or create an account
3. Click **"Create new secret key"**
4. Copy the key (starts with `sk-`)
5. Paste it in your `.env` file as `OPENAI_API_KEY`

### Supabase Configuration

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Create a new project or select existing one
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** → Paste as `SUPABASE_URL`
   - **anon/public key** → Paste as `SUPABASE_KEY`

### LangSmith API Key

1. Go to [LangSmith](https://smith.langchain.com)
2. Sign in or create an account
3. Go to **Settings** → **API Keys**
4. Click **"Create API Key"**
5. Copy the key (starts with `ls-`)
6. Paste it in your `.env` file as `LANGSMITH_API_KEY`
7. Set your project name as `LANGSMITH_PROJECT`

---

## 🗄️ Database Setup (Supabase)

Run this SQL in your Supabase SQL Editor:

```sql
-- Enable pgvector extension
create extension if not exists vector;

-- Create documents table
create table documents (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone default now()
);

-- Create document_chunks table with vector embeddings
create table document_chunks (
  id uuid primary key default gen_random_uuid(),
  document_id uuid references documents(id) on delete cascade,
  content text not null,
  embedding vector(1536),
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone default now()
);

-- Create index for vector similarity search
create index on document_chunks using ivfflat (embedding vector_cosine_ops);

-- Create agent_conversations table
create table agent_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id text,
  messages jsonb not null default '[]'::jsonb,
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);
```

---

## ▶️ Running the Agent

### Development Mode

```bash
npm run dev
```

### Production Build

```bash
npm run build
npm start
```

---

## 📁 Project Structure

```
langchain-prod-agent/
├── src/
│   ├── index.ts          # Main entry point
│   ├── agent.ts          # Agent logic
│   └── tools.ts          # Custom tools
├── .env                  # ⚠️ YOUR API KEYS GO HERE (create this file)
├── .env.example          # Template for .env
├── package.json          # Dependencies
├── tsconfig.json         # TypeScript config
└── README.md            # This file
```

---

## ✅ Verification

After setup, verify everything works:

1. **Check your `.env` file has all keys**
2. **Run `npm run dev`**
3. **Check LangSmith dashboard** - You should see traces appearing
4. **Test the agent** - It should respond to queries

---

## 🎯 Next Steps

1. ✅ **Add API keys to `.env` file**
2. ✅ **Set up Supabase database**
3. ✅ **Run the agent locally**
4. 📊 **Monitor on LangSmith**
5. 🚀 **Deploy to production**

---

## 🤝 Support

If you need help:
- Check the `.env.example` file for reference
- Make sure all API keys are correct
- Verify database is set up in Supabase

---

## 📝 License

MIT License - Feel free to use for your projects!

---

**Happy Building! 🎉**
