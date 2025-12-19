declare module 'langchain' {
  export const ChatPromptTemplate: any;
  export const MessagesPlaceholder: any;
  export const AgentExecutor: any;
  export const createOpenAIFunctionsAgent: any;
  export const BufferMemory: any;
  export const Tool: any;
  export const ChatOpenAI: any;
  export const OpenAIEmbeddings: any;
}

declare module 'langchain/prompts' {
  const _: any;
  export = _;
}

declare module '@langchain/core/prompts' {
  const _: any;
  export = _;
}
