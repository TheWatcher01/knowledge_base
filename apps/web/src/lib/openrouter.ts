const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY ?? "";
const OPENROUTER_BASE_URL = process.env.OPENROUTER_API_URL ?? "https://openrouter.ai/api/v1";
const OPENROUTER_SITE_URL = process.env.OPENROUTER_SITE_URL ?? process.env.NEXTAUTH_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3001";
const OPENROUTER_APP_NAME = process.env.OPENROUTER_APP_NAME ?? "Knowledge Base";

export type OpenRouterConfig = {
  enabled: boolean;
  apiKey: string;
  baseUrl: string;
  referer: string;
  appName: string;
};

export function getOpenRouterConfig(): OpenRouterConfig {
  const apiKey = OPENROUTER_API_KEY.trim();
  return {
    enabled: apiKey.length > 0,
    apiKey,
    baseUrl: OPENROUTER_BASE_URL.replace(/\/+$/, ""),
    referer: OPENROUTER_SITE_URL,
    appName: OPENROUTER_APP_NAME,
  };
}

export type FlagshipModel = {
  id: string;
  label: string;
  provider: string;
  description?: string;
};

export function getOpenRouterFlagshipModels(): FlagshipModel[] {
  return [
    {
      id: "openai/gpt-5",
      provider: "OpenAI",
      label: "GPT-5 (OpenAI)",
      description:
        "Dernière génération GPT avec un focus sur le raisonnement avancé, le code et la réduction des hallucinations.",
    },
    {
      id: "anthropic/claude-sonnet-4.5",
      provider: "Anthropic",
      label: "Claude 4.5 Sonnet (Anthropic)",
      description: "Version Sonnet la plus récente, optimisée pour les agents et les workflows de développement.",
    },
    {
      id: "google/gemini-2.5-pro",
      provider: "Google",
      label: "Gemini 2.5 Pro (Google)",
      description: "Modèle phare Gemini 2.5 orienté raisonnement et contexte étendu (1M tokens).",
    },
    {
      id: "x-ai/grok-4",
      provider: "xAI",
      label: "Grok 4 (xAI)",
      description: "Modèle 256k tokens avec support du tool calling et un focus raisonnement/agent.",
    },
    {
      id: "qwen/qwen3-max",
      provider: "Qwen",
      label: "Qwen3 Max (Qwen)",
      description: "Modèle multilingue optimisé pour RAG, longue mémoire et cas d'usage généralistes.",
    },
    {
      id: "deepseek/deepseek-chat-v3.1",
      provider: "DeepSeek",
      label: "DeepSeek V3.1 (DeepSeek)",
      description: "Modèle hybride reasoning/coding avec contrôle du mode reasoning.",
    },
  ];
}

export type RerankModel = {
  id: string;
  label: string;
  provider: string;
  description?: string;
};

export function getOpenRouterRerankModels(): RerankModel[] {
  return [
    {
      id: "cohere/rerank-english-v3.0",
      provider: "Cohere",
      label: "Cohere Rerank v3 (English)",
      description:
        "Classement contextuel haute qualité pour les contenus anglophones, recommandé par défaut.",
    },
  ];
}
