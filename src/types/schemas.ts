import { z } from "zod/v4";

// -- Enums --

export const TShirtSize = z.enum(["XS", "S", "M", "L", "XL"]);
export type TShirtSize = z.infer<typeof TShirtSize>;

export const TaskSize = z.enum(["XS", "S", "M", "L"]);
export type TaskSize = z.infer<typeof TaskSize>;

export const DependencyType = z.enum(["blocks", "related"]);
export type DependencyType = z.infer<typeof DependencyType>;

// -- Core entities --

export const AcceptanceCriterionSchema = z.object({
  given: z.string().min(1),
  when: z.string().min(1),
  then: z.string().min(1),
});
export type AcceptanceCriterion = z.infer<typeof AcceptanceCriterionSchema>;

export const TaskSchema = z.object({
  id: z.string().regex(/^TASK-\d{3}$/),
  title: z.string().min(5).max(120),
  description: z.string().max(500),
  estimate: TaskSize,
});
export type Task = z.infer<typeof TaskSchema>;

export const StorySchema = z.object({
  id: z.string().regex(/^STORY-\d{3}$/),
  title: z.string().min(5).max(120),
  acceptance_criteria: z.array(AcceptanceCriterionSchema).min(2).max(5),
  estimate: TShirtSize,
  labels: z.array(
    z.enum([
      "frontend",
      "backend",
      "api",
      "database",
      "infrastructure",
      "design",
      "testing",
      "documentation",
    ]),
  ),
  tasks: z.array(TaskSchema),
});
export type Story = z.infer<typeof StorySchema>;

export const EpicSchema = z.object({
  id: z.string().regex(/^EPIC-\d{3}$/),
  title: z.string().min(5).max(120),
  description: z.string().max(500),
  stories: z.array(StorySchema),
});
export type Epic = z.infer<typeof EpicSchema>;

// -- Ambiguity detection --

export const AmbiguitySeverity = z.enum(["blocking", "minor"]);
export type AmbiguitySeverity = z.infer<typeof AmbiguitySeverity>;

export const AmbiguitySchema = z.object({
  source: z.string().min(1),
  issue: z.string().min(1),
  question: z.string().min(1),
  affected_ticket_ids: z.array(z.string()),
  severity: AmbiguitySeverity,
});
export type Ambiguity = z.infer<typeof AmbiguitySchema>;

// -- LLM Call 1 output --

export const DecompositionResultSchema = z.object({
  epics: z.array(EpicSchema),
  ambiguities: z.array(AmbiguitySchema).optional().default([]),
});
export type DecompositionResult = z.infer<typeof DecompositionResultSchema>;

// -- LLM Call 2 output --

export const DependencySchema = z.object({
  from_id: z.string(),
  to_id: z.string(),
  type: DependencyType,
});
export type Dependency = z.infer<typeof DependencySchema>;

export const PhaseSchema = z.object({
  phase_number: z.number().int().positive(),
  name: z.string().min(1),
  ticket_ids: z.array(z.string()),
});
export type Phase = z.infer<typeof PhaseSchema>;

export const DependencyResultSchema = z.object({
  dependencies: z.array(DependencySchema),
  phases: z.array(PhaseSchema),
});
export type DependencyResult = z.infer<typeof DependencyResultSchema>;

// -- Parsed document structure --

export const SectionSchema = z.object({
  heading: z.string(),
  level: z.number().int().min(1).max(6),
  content: z.string(),
});
export type Section = z.infer<typeof SectionSchema>;

// -- Export format --

export const ExportMetadataSchema = z.object({
  total_epics: z.number().int().nonnegative(),
  total_stories: z.number().int().nonnegative(),
  total_tasks: z.number().int().nonnegative(),
  token_usage: z.object({
    input: z.number().int().nonnegative(),
    output: z.number().int().nonnegative(),
  }),
  estimated_cost_usd: z.number().nonnegative(),
});
export type ExportMetadata = z.infer<typeof ExportMetadataSchema>;

export const FullExportSchema = z.object({
  version: z.literal("1.0"),
  source: z.literal("spec-to-tickets"),
  generated_at: z.string(),
  document_title: z.string(),
  epics: z.array(EpicSchema),
  ambiguities: z.array(AmbiguitySchema).optional().default([]),
  dependencies: z.array(DependencySchema),
  phases: z.array(PhaseSchema),
  metadata: ExportMetadataSchema,
});
export type FullExport = z.infer<typeof FullExportSchema>;
