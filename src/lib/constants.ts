// Rate limiting
export const RATE_LIMIT_MAX_REQUESTS = 5;
export const RATE_LIMIT_WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours

// LLM configuration
export const LLM_MODEL = "claude-sonnet-4-6-20250514";
export const LLM_TEMPERATURE = 0;
export const LLM_MAX_TOKENS_DECOMPOSE = 8192;
export const LLM_MAX_TOKENS_DEPENDENCIES = 4096;
export const LLM_MAX_RETRIES = 2;

// Cost per token (Sonnet 4 pricing)
export const COST_PER_INPUT_TOKEN = 3 / 1_000_000; // $3 per 1M tokens
export const COST_PER_OUTPUT_TOKEN = 15 / 1_000_000; // $15 per 1M tokens

// Input limits
export const MAX_DOCUMENT_LENGTH = 50_000; // characters
export const MAX_DOCUMENT_TOKENS_WARNING = 5_000; // warn user above this

// API key
export const API_KEY_STORAGE_KEY = "spec-to-tickets-api-key";
export const API_KEY_HEADER = "x-api-key";
