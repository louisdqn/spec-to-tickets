import { describe, it, expect } from "vitest";
import { DECOMPOSE_TOOL } from "./decompose";
import { DEPENDENCIES_TOOL } from "./dependencies";
import {
  EpicSchema,
  StorySchema,
  TaskSchema,
  AmbiguitySchema,
  DecompositionResultSchema,
  DependencySchema,
  PhaseSchema,
  DependencyResultSchema,
  TicketLabel,
  TShirtSize,
  TaskSize,
  DependencyType,
  AmbiguitySeverity,
} from "@/types/schemas";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type JsonSchema = Record<string, any>;

/** Extract sorted property names from a JSON Schema object. */
function jsonSchemaKeys(schema: JsonSchema): string[] {
  return Object.keys(schema.properties ?? {}).sort();
}

/** Extract sorted property names from a Zod object schema. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function zodSchemaKeys(schema: { shape: Record<string, any> }): string[] {
  return Object.keys(schema.shape).sort();
}

describe("Decompose tool ↔ Zod schema sync", () => {
  const root = DECOMPOSE_TOOL.input_schema as JsonSchema;
  const epicJsonSchema = root.properties.epics.items as JsonSchema;
  const storyJsonSchema = epicJsonSchema.properties.stories.items as JsonSchema;
  const taskJsonSchema = storyJsonSchema.properties.tasks.items as JsonSchema;
  const ambiguityJsonSchema = root.properties.ambiguities.items as JsonSchema;

  it("top-level properties match DecompositionResultSchema", () => {
    expect(jsonSchemaKeys(root)).toEqual(zodSchemaKeys(DecompositionResultSchema));
  });

  it("epic properties match EpicSchema", () => {
    expect(jsonSchemaKeys(epicJsonSchema)).toEqual(zodSchemaKeys(EpicSchema));
  });

  it("story properties match StorySchema", () => {
    expect(jsonSchemaKeys(storyJsonSchema)).toEqual(zodSchemaKeys(StorySchema));
  });

  it("task properties match TaskSchema", () => {
    expect(jsonSchemaKeys(taskJsonSchema)).toEqual(zodSchemaKeys(TaskSchema));
  });

  it("ambiguity properties match AmbiguitySchema", () => {
    expect(jsonSchemaKeys(ambiguityJsonSchema)).toEqual(zodSchemaKeys(AmbiguitySchema));
  });

  it("story estimate enum matches TShirtSize values", () => {
    const jsonEnum = [...storyJsonSchema.properties.estimate.enum].sort();
    const zodEnum = [...TShirtSize.options].sort();
    expect(jsonEnum).toEqual(zodEnum);
  });

  it("task estimate enum matches TaskSize values", () => {
    const jsonEnum = [...taskJsonSchema.properties.estimate.enum].sort();
    const zodEnum = [...TaskSize.options].sort();
    expect(jsonEnum).toEqual(zodEnum);
  });

  it("story label enum matches TicketLabel values", () => {
    const jsonEnum = [...storyJsonSchema.properties.labels.items.enum].sort();
    const zodEnum = [...TicketLabel.options].sort();
    expect(jsonEnum).toEqual(zodEnum);
  });

  it("task label enum matches TicketLabel values", () => {
    const jsonEnum = [...taskJsonSchema.properties.labels.items.enum].sort();
    const zodEnum = [...TicketLabel.options].sort();
    expect(jsonEnum).toEqual(zodEnum);
  });

  it("ambiguity severity enum matches AmbiguitySeverity values", () => {
    const jsonEnum = [...ambiguityJsonSchema.properties.severity.enum].sort();
    const zodEnum = [...AmbiguitySeverity.options].sort();
    expect(jsonEnum).toEqual(zodEnum);
  });
});

describe("Dependencies tool ↔ Zod schema sync", () => {
  const root = DEPENDENCIES_TOOL.input_schema as JsonSchema;
  const depJsonSchema = root.properties.dependencies.items as JsonSchema;
  const phaseJsonSchema = root.properties.phases.items as JsonSchema;

  it("top-level properties match DependencyResultSchema", () => {
    expect(jsonSchemaKeys(root)).toEqual(zodSchemaKeys(DependencyResultSchema));
  });

  it("dependency properties match DependencySchema", () => {
    expect(jsonSchemaKeys(depJsonSchema)).toEqual(zodSchemaKeys(DependencySchema));
  });

  it("phase properties match PhaseSchema", () => {
    expect(jsonSchemaKeys(phaseJsonSchema)).toEqual(zodSchemaKeys(PhaseSchema));
  });

  it("dependency type enum matches DependencyType values", () => {
    const jsonEnum = [...depJsonSchema.properties.type.enum].sort();
    const zodEnum = [...DependencyType.options].sort();
    expect(jsonEnum).toEqual(zodEnum);
  });
});
