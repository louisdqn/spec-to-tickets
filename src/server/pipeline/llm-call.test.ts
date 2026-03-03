import { describe, it, expect, vi, beforeEach } from "vitest";
import { z } from "zod/v4";
import { callWithRetry } from "./llm-call";
import type { LlmCallParams, ToolDefinition } from "./llm-call";
import { AppError } from "@/lib/errors";
import { LLM_MODEL_CONTEXT_WINDOW } from "@/lib/constants";

// -- Test schema --

const TestSchema = z.object({
  name: z.string().min(1),
  count: z.number().int().positive(),
});

// -- Mock helpers --

const TOOL: ToolDefinition = {
  name: "test_tool",
  description: "A test tool",
  input_schema: { type: "object" as const, properties: {} },
};

function makeResponse(input: unknown, inputTokens = 100, outputTokens = 50) {
  return {
    content: [{ type: "tool_use" as const, id: "tu_1", name: TOOL.name, input }],
    usage: { input_tokens: inputTokens, output_tokens: outputTokens },
  };
}

function makeTextResponse(inputTokens = 100, outputTokens = 50) {
  return {
    content: [{ type: "text" as const, text: "No tool call" }],
    usage: { input_tokens: inputTokens, output_tokens: outputTokens },
  };
}

function makeMockClient(responses: ReturnType<typeof makeResponse>[]) {
  let callIndex = 0;
  const streamFn = vi.fn(() => {
    const response = responses[callIndex];
    if (!response) throw new Error("No more mock responses");
    callIndex++;
    return { finalMessage: async () => response };
  });
  return {
    messages: {
      stream: streamFn,
      // Keep create as alias so test assertions using client.messages.create still work
      get create() {
        return streamFn;
      },
    },
  } as unknown as LlmCallParams["client"];
}

function makeParams(client: LlmCallParams["client"]): LlmCallParams {
  return {
    client,
    systemPrompt: "You are a test assistant.",
    userMessage: "Do the thing.",
    tool: TOOL,
    maxTokens: 1024,
  };
}

// -- Tests --

describe("callWithRetry", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("returns validated data on first attempt", async () => {
    const client = makeMockClient([makeResponse({ name: "hello", count: 3 })]);

    const result = await callWithRetry(makeParams(client), TestSchema);

    expect(result.data).toEqual({ name: "hello", count: 3 });
    expect(result.retries).toBe(0);
    expect(client.messages.create).toHaveBeenCalledTimes(1);
  });

  it("accumulates token usage on first attempt", async () => {
    const client = makeMockClient([makeResponse({ name: "hello", count: 1 }, 200, 80)]);

    const result = await callWithRetry(makeParams(client), TestSchema);

    expect(result.usage).toEqual({ input: 200, output: 80 });
  });

  it("retries on validation failure and succeeds", async () => {
    const client = makeMockClient([
      makeResponse({ name: "", count: 3 }), // fails: name too short
      makeResponse({ name: "fixed", count: 3 }), // succeeds
    ]);

    const result = await callWithRetry(makeParams(client), TestSchema);

    expect(result.data).toEqual({ name: "fixed", count: 3 });
    expect(result.retries).toBe(1);
    expect(client.messages.create).toHaveBeenCalledTimes(2);
  });

  it("accumulates token usage across retries", async () => {
    const client = makeMockClient([
      makeResponse({ name: "", count: 1 }, 100, 50), // fail
      makeResponse({ name: "ok", count: 1 }, 120, 60), // succeed
    ]);

    const result = await callWithRetry(makeParams(client), TestSchema);

    expect(result.usage).toEqual({ input: 220, output: 110 });
  });

  it("sends validation errors in retry messages", async () => {
    const client = makeMockClient([
      makeResponse({ name: "", count: -1 }), // two validation errors
      makeResponse({ name: "ok", count: 1 }),
    ]);

    await callWithRetry(makeParams(client), TestSchema);

    const secondCall = (client.messages.create as ReturnType<typeof vi.fn>).mock.calls[1][0];
    // Retry should have 3 messages: original, assistant ack, error feedback
    expect(secondCall.messages).toHaveLength(3);
    expect(secondCall.messages[0].role).toBe("user");
    expect(secondCall.messages[1].role).toBe("assistant");
    expect(secondCall.messages[2].role).toBe("user");
    expect(secondCall.messages[2].content).toContain("validation errors");
  });

  it("throws LLM_NO_TOOL_USE when model returns no tool block", async () => {
    const client = makeMockClient([
      makeTextResponse() as unknown as ReturnType<typeof makeResponse>,
    ]);

    await expect(callWithRetry(makeParams(client), TestSchema)).rejects.toThrow(AppError);
    await expect(
      callWithRetry(
        makeParams(
          makeMockClient([makeTextResponse() as unknown as ReturnType<typeof makeResponse>]),
        ),
        TestSchema,
      ),
    ).rejects.toMatchObject({
      code: "LLM_NO_TOOL_USE",
    });
  });

  it("throws LLM_VALIDATION_FAILED after all retries exhausted", async () => {
    // LLM_MAX_RETRIES = 2, so 3 total attempts
    const client = makeMockClient([
      makeResponse({ name: "", count: 1 }), // fail
      makeResponse({ name: "", count: 1 }), // fail
      makeResponse({ name: "", count: 1 }), // fail
    ]);

    await expect(callWithRetry(makeParams(client), TestSchema)).rejects.toThrow(AppError);
    await expect(
      callWithRetry(
        makeParams(
          makeMockClient([
            makeResponse({ name: "", count: 1 }),
            makeResponse({ name: "", count: 1 }),
            makeResponse({ name: "", count: 1 }),
          ]),
        ),
        TestSchema,
      ),
    ).rejects.toMatchObject({
      code: "LLM_VALIDATION_FAILED",
    });
  });

  it("makes exactly MAX_RETRIES + 1 attempts before failing", async () => {
    const client = makeMockClient([
      makeResponse({ name: "", count: 1 }),
      makeResponse({ name: "", count: 1 }),
      makeResponse({ name: "", count: 1 }),
    ]);

    await expect(callWithRetry(makeParams(client), TestSchema)).rejects.toThrow();
    expect(client.messages.create).toHaveBeenCalledTimes(3);
  });

  it("succeeds on the last retry attempt", async () => {
    const client = makeMockClient([
      makeResponse({ name: "", count: 1 }), // fail
      makeResponse({ name: "", count: 1 }), // fail
      makeResponse({ name: "saved", count: 1 }), // succeed on last try
    ]);

    const result = await callWithRetry(makeParams(client), TestSchema);

    expect(result.data).toEqual({ name: "saved", count: 1 });
    expect(result.retries).toBe(2);
    expect(client.messages.create).toHaveBeenCalledTimes(3);
  });

  it("wraps network errors as LLM_API_ERROR", async () => {
    const client = {
      messages: {
        stream: vi.fn(() => {
          throw new Error("fetch failed");
        }),
      },
    } as unknown as LlmCallParams["client"];

    await expect(callWithRetry(makeParams(client), TestSchema)).rejects.toThrow(AppError);
    await expect(
      callWithRetry(
        makeParams({
          messages: {
            stream: vi.fn(() => {
              throw new Error("fetch failed");
            }),
          },
        } as unknown as LlmCallParams["client"]),
        TestSchema,
      ),
    ).rejects.toMatchObject({
      code: "LLM_API_ERROR",
      message: expect.stringContaining("fetch failed"),
    });
  });

  it("preserves status code from Anthropic SDK errors", async () => {
    const sdkError = Object.assign(new Error("Invalid API key"), { status: 401 });
    const client = {
      messages: {
        stream: vi.fn(() => {
          throw sdkError;
        }),
      },
    } as unknown as LlmCallParams["client"];

    await expect(callWithRetry(makeParams(client), TestSchema)).rejects.toMatchObject({
      code: "LLM_API_ERROR",
      statusCode: 401,
      message: expect.stringContaining("Invalid API key"),
    });
  });

  it("throws INPUT_TOO_LARGE when input exhausts context window", async () => {
    const client = makeMockClient([makeResponse({ name: "ok", count: 1 })]);
    // Create a system prompt large enough to exhaust the context window.
    // Budget check: estimatedInput = ceil((prompt + user) / 4) + ceil(schema / 4)
    // We need headroom < maxTokens * 0.5 to trigger the hard error.
    const hugePrompt = "x".repeat(LLM_MODEL_CONTEXT_WINDOW * 4);
    const params: LlmCallParams = {
      ...makeParams(client),
      systemPrompt: hugePrompt,
      maxTokens: 32768,
    };

    await expect(callWithRetry(params, TestSchema)).rejects.toMatchObject({
      code: "INPUT_TOO_LARGE",
      statusCode: 422,
    });
    // Should NOT have called the API
    expect(client.messages.create).not.toHaveBeenCalled();
  });

  it("allows calls when input is within budget", async () => {
    const client = makeMockClient([makeResponse({ name: "ok", count: 1 })]);
    const params = makeParams(client);

    // Default test params have tiny prompts — should pass budget check
    const result = await callWithRetry(params, TestSchema);
    expect(result.data).toEqual({ name: "ok", count: 1 });
  });

  it("passes correct parameters to Anthropic SDK", async () => {
    const client = makeMockClient([makeResponse({ name: "ok", count: 1 })]);
    const params = makeParams(client);

    await callWithRetry(params, TestSchema);

    expect(client.messages.create).toHaveBeenCalledWith(
      expect.objectContaining({
        system: params.systemPrompt,
        max_tokens: params.maxTokens,
        temperature: 0,
        tool_choice: { type: "tool", name: TOOL.name },
      }),
    );
  });
});
