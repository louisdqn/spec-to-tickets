"use client";

const STEPS = [
  { key: "decomposing", label: "Decomposing PRD", description: "Analyzing document and creating ticket hierarchy..." },
  { key: "mapping", label: "Mapping dependencies", description: "Identifying blocking relationships and execution phases..." },
] as const;

type StepKey = (typeof STEPS)[number]["key"];

export function ProcessingStatus({ currentStep }: { currentStep: StepKey }) {
  const currentIndex = STEPS.findIndex((s) => s.key === currentStep);

  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <div className="mb-8 flex items-center justify-center gap-3">
        {STEPS.map((step, index) => (
          <div key={step.key} className="flex items-center gap-3">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                index < currentIndex
                  ? "bg-primary text-primary-foreground"
                  : index === currentIndex
                    ? "border-2 border-primary bg-background text-primary"
                    : "border border-border bg-muted text-muted-foreground"
              }`}
            >
              {index < currentIndex ? "\u2713" : index + 1}
            </div>
            {index < STEPS.length - 1 && (
              <div
                className={`h-px w-12 ${
                  index < currentIndex ? "bg-primary" : "bg-border"
                }`}
              />
            )}
          </div>
        ))}
      </div>
      <div className="mb-2">
        <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-muted border-t-primary" />
      </div>
      <p className="text-sm font-medium">{STEPS[currentIndex].label}</p>
      <p className="mt-1 text-xs text-muted-foreground">{STEPS[currentIndex].description}</p>
    </div>
  );
}
