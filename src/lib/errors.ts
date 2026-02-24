export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number = 500,
  ) {
    super(message);
    this.name = "AppError";
  }

  toJSON() {
    return {
      error: this.message,
      code: this.code,
    };
  }
}

export function handleApiError(error: unknown): { error: string; code: string; status: number } {
  if (error instanceof AppError) {
    return {
      error: error.message,
      code: error.code,
      status: error.statusCode,
    };
  }

  console.error("Unexpected error:", error);
  return {
    error: "An unexpected error occurred",
    code: "INTERNAL_ERROR",
    status: 500,
  };
}
