import type {
  DecompositionResult,
  Dependency,
  Phase,
  Section,
} from "./schemas";

// -- API request types --

export interface DecomposeRequest {
  document: string;
  sections: Section[];
}

export interface DependenciesRequest {
  tickets: {
    id: string;
    title: string;
    description: string;
  }[];
}

// -- API response types --

export interface TokenUsage {
  input: number;
  output: number;
}

export interface ApiMetadata {
  token_usage: TokenUsage;
  estimated_cost_usd: number;
  retries: number;
}

export interface DecomposeResponse {
  data: DecompositionResult & { metadata: ApiMetadata };
}

export interface DependenciesResponse {
  data: {
    dependencies: Dependency[];
    phases: Phase[];
    has_cycles: boolean;
    cycle_details: string[] | null;
    metadata: ApiMetadata;
  };
}

export interface ApiErrorResponse {
  error: string;
  code: string;
}

// -- API response union --

export type ApiResponse<T> = { data: T } | ApiErrorResponse;
