export const maxDuration = 60;

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";
import { createAnthropicClient } from "@/server/anthropic";
import { mapDependencies } from "@/server/services/dependencies";
import { handleApiError, AppError } from "@/lib/errors";
import { API_KEY_HEADER } from "@/lib/constants";

const TicketSummarySchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string(),
});

const RequestBodySchema = z.object({
  tickets: z.array(TicketSummarySchema).min(1),
});

export async function POST(request: NextRequest) {
  try {
    // Extract and validate API key
    const apiKey = request.headers.get(API_KEY_HEADER);
    if (!apiKey || !apiKey.startsWith("sk-")) {
      throw new AppError("Missing or invalid API key", "INVALID_API_KEY", 401);
    }

    // Parse and validate request body
    const body = await request.json();
    const parsed = RequestBodySchema.safeParse(body);
    if (!parsed.success) {
      throw new AppError(
        `Invalid request body: ${parsed.error.issues.map((i) => i.message).join(", ")}`,
        "INVALID_REQUEST",
        400,
      );
    }

    // Call dependency mapping service
    const client = createAnthropicClient(apiKey);
    const result = await mapDependencies(client, parsed.data.tickets);

    return NextResponse.json({ data: result });
  } catch (error: unknown) {
    const { error: message, code, status } = handleApiError(error);
    return NextResponse.json({ error: message, code }, { status });
  }
}
