import type Anthropic from "@anthropic-ai/sdk";
import type { z } from "zod/v4";
import { AppError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { LLM_MODEL, LLM_TEMPERATURE, LLM_MAX_RETRIES } from "@/lib/constants";
import type { TokenUsage } from "@/types";

/** Tool definition for the Anthropic API. */
export interface ToolDefinition {
  name: string;
  description: string;
  input_schema: Anthropic.Tool["input_schema"];
}

/** Parameters for a single LLM call with structured output. */
export interface LlmCallParams {
  client: Anthropic;
  systemPrompt: string;
  userMessage: string;
  tool: ToolDefinition;
  maxTokens: number;
}

/** Result of a successful LLM call. */
export interface LlmCallResult<T> {
  data: T;
  usage: TokenUsage;
  retries: number;
}

/**
 * Make an Anthropic tool_use call and validate the output with a Zod schema.
 * Retries up to LLM_MAX_RETRIES times on validation failure, feeding
 * error details back into the prompt on each retry.
 *
 * @param params - LLM call configuration (client, prompts, tool, limits)
 * @param schema - Zod schema to validate the tool output against
 * @returns Validated data, cumulative token usage, and retry count
 * @throws AppError with code LLM_NO_TOOL_USE if model doesn't call the tool
 * @throws AppError with code LLM_VALIDATION_FAILED after all retries exhausted
 */
export async function callWithRetry<T>(
  params: LlmCallParams,
  schema: z.ZodType<T>,
): Promise<LlmCallResult<T>> {
  const { client, systemPrompt, userMessage, tool, maxTokens } = params;
  let validationErrors: string[] = [];
  const totalUsage: TokenUsage = { input: 0, output: 0 };

  for (let attempt = 0; attempt <= LLM_MAX_RETRIES; attempt++) {
    const messages = buildMessages(userMessage, validationErrors, attempt);

    let response: Awaited<ReturnType<typeof client.messages.create>>;
    try {
      response = await client.messages.create({
        model: LLM_MODEL,
        max_tokens: maxTokens,
        temperature: LLM_TEMPERATURE,
        system: systemPrompt,
        tools: [{ ...tool, type: "custom" as const }],
        tool_choice: { type: "tool" as const, name: tool.name },
        messages,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown API error";
      const statusCode = (err as { status?: number }).status ?? 502;
      throw new AppError(`Anthropic API error: ${message}`, "LLM_API_ERROR", statusCode);
    }

    totalUsage.input += response.usage.input_tokens;
    totalUsage.output += response.usage.output_tokens;

    logger.info("LLM call", {
      call: tool.name,
      attempt,
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
      stopReason: response.stop_reason,
    });

    // Detect truncation — output hit max_tokens before completing
    if (response.stop_reason === "max_tokens") {
      throw new AppError(
        `LLM output was truncated (hit ${maxTokens} token limit). The PRD may be too large or complex for the current token budget.`,
        "LLM_TRUNCATED",
        422,
      );
    }

    // Extract tool_use block
    const toolUseBlock = response.content.find(
      (block): block is Anthropic.ToolUseBlock => block.type === "tool_use",
    );

    if (!toolUseBlock) {
      throw new AppError(
        `Model did not produce tool output for ${tool.name}`,
        "LLM_NO_TOOL_USE",
        502,
      );
    }

    // Validate with Zod
    const result = schema.safeParse(toolUseBlock.input);

    if (result.success) {
      if (attempt > 0) {
        logger.info("LLM validation succeeded on retry", {
          call: tool.name,
          attempt,
        });
      }
      return { data: result.data, usage: totalUsage, retries: attempt };
    }

    // Collect errors for retry prompt
    validationErrors = result.error.issues.map(
      (issue) => `${issue.path.join(".")}: ${issue.message}`,
    );

    logger.warn("LLM output validation failed", {
      call: tool.name,
      attempt,
      errors: validationErrors,
    });
  }

  throw new AppError(
    `LLM output failed schema validation after ${LLM_MAX_RETRIES + 1} attempts. Errors: ${validationErrors.join("; ")}`,
    "LLM_VALIDATION_FAILED",
    422,
  );
}

/**
 * Build the messages array for an LLM call, optionally including
 * validation error feedback from a previous attempt.
 */
function buildMessages(
  userMessage: string,
  validationErrors: string[],
  attempt: number,
): Anthropic.MessageParam[] {
  if (attempt === 0 || validationErrors.length === 0) {
    return [{ role: "user" as const, content: userMessage }];
  }

  const errorFeedback = [
    "Your previous output had schema validation errors. Please fix these issues and try again:\n",
    ...validationErrors.map((e) => `- ${e}`),
    "\nRegenerate the complete output, fixing all validation errors above.",
  ].join("\n");

  return [
    { role: "user" as const, content: userMessage },
    {
      role: "assistant" as const,
      content: "I'll analyze this and produce the structured output.",
    },
    { role: "user" as const, content: errorFeedback },
  ];
}
