import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";
import { createAnthropicClient } from "@/server/anthropic";
import { decompose } from "@/server/services/decompose";
import { checkRateLimit } from "@/lib/rate-limit";
import { handleApiError, AppError } from "@/lib/errors";
import { SectionSchema } from "@/types/schemas";
import { API_KEY_HEADER, MAX_DOCUMENT_LENGTH } from "@/lib/constants";

const RequestBodySchema = z.object({
  document: z.string().min(1).max(MAX_DOCUMENT_LENGTH),
  sections: z.array(SectionSchema).min(1),
});

export async function POST(request: NextRequest) {
  try {
    // Extract and validate API key
    const apiKey = request.headers.get(API_KEY_HEADER);
    if (!apiKey || !apiKey.startsWith("sk-")) {
      throw new AppError("Missing or invalid API key", "INVALID_API_KEY", 401);
    }

    // Rate limiting
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const rateLimit = checkRateLimit(ip);
    if (!rateLimit.allowed) {
      const res = NextResponse.json(
        { error: "Rate limit exceeded. Try again later.", code: "RATE_LIMITED" },
        { status: 429 },
      );
      res.headers.set("X-RateLimit-Remaining", "0");
      res.headers.set("X-RateLimit-Reset", new Date(rateLimit.resetAt).toISOString());
      return res;
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

    // Call decomposition service
    const client = createAnthropicClient(apiKey);
    const result = await decompose(client, parsed.data.document, parsed.data.sections);

    const res = NextResponse.json({ data: result });
    res.headers.set("X-RateLimit-Remaining", String(rateLimit.remaining));
    return res;
  } catch (error: unknown) {
    const { error: message, code, status } = handleApiError(error);
    return NextResponse.json({ error: message, code }, { status });
  }
}
