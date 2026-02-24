import { NextResponse } from "next/server";
import { PDFParse } from "pdf-parse";
import { parsePdfText } from "@/lib/pdf-parser";

const MAX_PDF_SIZE = 10 * 1024 * 1024; // 10 MB

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "No PDF file provided", code: "MISSING_FILE" },
        { status: 400 },
      );
    }

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json(
        { error: "File must be a PDF", code: "INVALID_FILE_TYPE" },
        { status: 400 },
      );
    }

    if (file.size > MAX_PDF_SIZE) {
      return NextResponse.json(
        { error: "PDF file too large (max 10 MB)", code: "FILE_TOO_LARGE" },
        { status: 400 },
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const parser = new PDFParse({ data: arrayBuffer });
    let extractedText: string;
    try {
      const result = await parser.getText();
      extractedText = result.text;
    } finally {
      await parser.destroy();
    }

    if (!extractedText || extractedText.trim().length === 0) {
      return NextResponse.json(
        { error: "Could not extract text from PDF. The file may be image-based or empty.", code: "EMPTY_PDF" },
        { status: 422 },
      );
    }

    const sections = parsePdfText(extractedText);

    return NextResponse.json({
      data: { text: extractedText, sections },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to parse PDF";
    return NextResponse.json(
      { error: message, code: "PDF_PARSE_ERROR" },
      { status: 500 },
    );
  }
}
