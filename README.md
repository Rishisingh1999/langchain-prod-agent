# 🤖 LangChain Production Agent with Supabase & LangSmith

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white) ![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white) ![LangChain](https://img.shields.io/badge/LangChain-1C3C3C?style=for-the-badge) ![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white) ![OpenAI](https://img.shields.io/badge/OpenAI-412991?style=for-the-badge&logo=openai&logoColor=white)

*Production-ready LangChain AI agent with Supabase backend and LangSmith monitoring. Built for scalability, observability, and real-world deployment.*

---

## ✨ Project Overview

This AI agent project, developed as part of a **personal portfolio initiative** in **December 2025**, demonstrates a complete production-ready implementation of LangChain with enterprise-grade monitoring and persistence. The project showcases expertise in:

- 🤖 **AI Agent Development** with LangChain
- 🗄️ **Vector Database Integration** (Supabase pgvector)
- 📊 **Production Monitoring** with LangSmith
- 🔧 **TypeScript Best Practices**
- 🚀 **Scalable Architecture Design**

### 🎯 Key Objectives

- 🔍 **Build production-grade AI agent** with conversation memory
- 🗄️ **Implement vector search** for semantic document retrieval
- 📈 **Enable full observability** through LangSmith tracing
- 💾 **Persist agent state** using Supabase PostgreSQL
- ⚡ **Create reusable architecture** for real-world applications

---

## 📋 Prerequisites

Before you start, make sure you have:

1. **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
2. **OpenAI API Key** - [Get it here](https://platform.openai.com/api-keys)
3. **Supabase Account** - [Sign up here](https://supabase.com/)
4. **LangSmith Account** - [Sign up here](https://smith.langchain.com/)

---

## 🛠️ Technical Stack

### 💻 Core Technologies

- **Language:** TypeScript 5.x
- **Runtime:** Node.js 18+
- **AI Framework:** LangChain
- **LLM Provider:** OpenAI GPT-4
- **Database:** Supabase (PostgreSQL + pgvector)
- **Monitoring:** LangSmith

### 📚 Key Libraries

| Library | Purpose |
|---------|----------|
| **LangChain** | AI agent orchestration and chains |
| **@langchain/openai** | OpenAI model integration |
| **@supabase/supabase-js** | Database client and vector store |
| **langsmith** | Production monitoring and tracing |
| **dotenv** | Environment configuration |

### 🧪 Skills Demonstrated

- ✅ TypeScript development with strict typing
- ✅ AI agent design and implementation
- ✅ Vector embedding and similarity search
- ✅ Conversation memory management
- ✅ Production monitoring and observability
- ✅ Environment configuration best practices

---

## ⚙️ Setup Instructions

### Step 1: Clone the Repository

```bash
git clone https://github.com/Rishisingh1999/langchain-prod-agent.git
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

2. Open the `.env` file and add your API keys:

```env
# OpenAI API Key - Get from https://platform.openai.com/api-keys
OPENAI_API_KEY=sk-your-actual-openai-key-here

# Supabase Configuration - Get from https://supabase.com/dashboard
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

1. Go to [LangSmith](https://smith.langchain.com/)
2. Sign in or create an account
3. Go to **Settings** → **API Keys**
4. Click **"Create API Key"**
5. Copy the key (starts with `ls-`)
6. Paste it in your `.env` file as `LANGSMITH_API_KEY`

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

## 🏗️ Architecture

### System Components

```
┌─────────────────────────────────────────────┐
│           User Interface / API              │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│         LangChain Agent Core                │
│  - Conversation Memory                      │
│  - Tool Selection                           │
│  - Response Generation                      │
└─────────────┬───────────────────┬───────────┘
              │                   │
              ▼                   ▼
     ┌────────────────┐   ┌──────────────────┐
     │    OpenAI      │   │    Supabase      │
     │    GPT-4       │   │  - PostgreSQL    │
     │                │   │  - pgvector      │
     └────────────────┘   │  - Persistence   │
                          └──────────────────┘
                                  │
                                  ▼
                          ┌──────────────────┐
                          │    LangSmith     │
                          │  - Tracing       │
                          │  - Monitoring    │
                          │  - Analytics     │
                          └──────────────────┘
```

### 🔄 Agent Workflow

1. **User Query** → Received by agent
2. **Context Retrieval** → Vector search in Supabase
3. **LLM Processing** → OpenAI GPT-4 generates response
4. **Memory Update** → Conversation stored in database
5. **Monitoring** → Full trace logged to LangSmith

---

## 📁 Project Structure

```
langchain-prod-agent/
├── src/
│   ├── index.ts          # Main entry point
│   ├── agent.ts          # Agent logic and configuration
│   └── tools.ts          # Custom agent tools
├── .env                  # ⚠️ YOUR API KEYS GO HERE
├── .env.example          # Template for .env
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
├── test-agent.js         # Agent testing script
└── README.md             # Project documentation
```

---

## 🔑 Key Features

### 🧠 Intelligent Conversation

- Maintains context across multiple interactions
- Semantic understanding of user intent
- Dynamic tool selection based on query

### 🗄️ Vector Search

- Stores documents as vector embeddings
- Semantic similarity search with pgvector
- Efficient retrieval for RAG applications

### 📊 Production Monitoring

- Full conversation traces in LangSmith
- Performance metrics and analytics
- Debug and optimize agent behavior

### 💾 Persistent Storage

- Conversation history in PostgreSQL
- Document versioning and metadata
- Scalable database architecture

---

## 💼 Business Applications

### 🎯 Use Cases

- **Customer Support:** AI-powered chatbot with memory
- **Knowledge Base:** Semantic document search
- **Data Analytics:** Natural language queries to databases
- **Content Generation:** Context-aware writing assistant
- **Research Assistant:** Multi-document question answering

### 📈 Value Proposition

This architecture provides:

- ✅ **Production-ready** AI agent infrastructure
- ✅ **Scalable** to handle thousands of users
- ✅ **Observable** with complete monitoring
- ✅ **Maintainable** TypeScript codebase
- ✅ **Extensible** for custom tools and features

---

## ✅ Verification

After setup, verify everything works:

1. **Check your `.env` file has all keys**
2. **Run `npm run dev`**
3. **Check LangSmith dashboard** - You should see traces appearing
4. **Test the agent** - It should respond to queries

---

## 🎓 Skills Highlighted

This project demonstrates proficiency in:

- **AI/ML Engineering:** LangChain agent development
- **TypeScript:** Advanced typing and best practices
- **Database Design:** PostgreSQL with vector extensions
- **Cloud Services:** Supabase integration
- **Observability:** Production monitoring with LangSmith
- **Software Architecture:** Scalable system design

---

## 🔮 Future Enhancements

- 🎨 **Web Interface:** React/Next.js frontend
- 🔌 **API Endpoints:** RESTful API with Express
- 📱 **Mobile App:** React Native client
- 🧪 **Testing Suite:** Unit and integration tests
- 🐳 **Docker Deployment:** Containerized deployment
- ☁️ **Cloud Hosting:** AWS/GCP/Azure deployment

---

## 📧 Contact

**Hrushikesh Singh**

- 📧 Email: hrushisingh697@gmail.com
- 💼 LinkedIn: [linkedin.com/in/hrushikesh-singh](https://www.linkedin.com/in/hrushikesh-singh-564b4035a)
- 🐙 GitHub: [@Rishisingh1999](https://github.com/Rishisingh1999)
- 🌐 Portfolio: [rishisingh1999.github.io/my-portfolio-website](https://rishisingh1999.github.io/my-portfolio-website/)

---

## 📄 License

MIT License - Feel free to use for your projects!

**Attribution appreciated** 🙏

---

## ⭐ Show Your Support

If you find this project useful, please give it a ⭐ on GitHub!

**Built with ❤️ for AI Engineering & Production Systems**

---
