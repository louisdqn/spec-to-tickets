import { describe, it, expect } from "vitest";
import { escapeCsvField, buildCsvExport } from "./export";
import type { Epic, Dependency } from "@/types";

describe("escapeCsvField", () => {
  it("returns plain text unchanged", () => {
    expect(escapeCsvField("hello")).toBe("hello");
  });

  it("wraps field containing commas in quotes", () => {
    expect(escapeCsvField("a,b")).toBe('"a,b"');
  });

  it("wraps field containing newlines in quotes", () => {
    expect(escapeCsvField("line1\nline2")).toBe('"line1\nline2"');
  });

  it("escapes double quotes by doubling them", () => {
    expect(escapeCsvField('say "hello"')).toBe('"say ""hello"""');
  });

  it("handles field with commas and quotes together", () => {
    expect(escapeCsvField('a "b", c')).toBe('"a ""b"", c"');
  });

  it("returns empty string unchanged", () => {
    expect(escapeCsvField("")).toBe("");
  });
});

describe("buildCsvExport", () => {
  const epics: Epic[] = [
    {
      id: "EPIC-001",
      title: "Auth System",
      description: "User authentication",
      stories: [
        {
          id: "STORY-001",
          title: "Login page",
          acceptance_criteria: [
            { given: "a user", when: "they log in", then: "they see dashboard" },
            { given: "wrong password", when: "submit", then: "error shown" },
          ],
          estimate: "M",
          labels: ["frontend", "auth"],
          tasks: [
            { id: "TASK-001", title: "Build form", description: "Login form", estimate: "S", labels: ["frontend"] },
            { id: "TASK-002", title: "Add validation", description: "Validate inputs", estimate: "XS", labels: ["frontend"] },
          ],
        },
      ],
    },
  ];

  const dependencies: Dependency[] = [
    { from_id: "STORY-001", to_id: "TASK-002", type: "blocks" },
  ];

  it("produces correct header row", () => {
    const csv = buildCsvExport({ epics, dependencies });
    const header = csv.split("\n")[0];
    expect(header).toBe("type,id,title,parent_id,description,acceptance_criteria,estimate,labels,dependencies");
  });

  it("flattens hierarchy in correct order: epic → story → tasks", () => {
    const csv = buildCsvExport({ epics, dependencies });
    const rows = csv.split("\n").slice(1);
    expect(rows).toHaveLength(4);
    expect(rows[0]).toMatch(/^epic,EPIC-001/);
    expect(rows[1]).toMatch(/^story,STORY-001/);
    expect(rows[2]).toMatch(/^task,TASK-001/);
    expect(rows[3]).toMatch(/^task,TASK-002/);
  });

  it("sets parent_id correctly", () => {
    const csv = buildCsvExport({ epics, dependencies });
    const rows = csv.split("\n").slice(1);
    // Epic has no parent
    expect(rows[0].split(",")[3]).toBe("");
    // Story parent is epic
    expect(rows[1].split(",")[3]).toBe("EPIC-001");
    // Task parent is story
    expect(rows[2].split(",")[3]).toBe("STORY-001");
  });

  it("joins acceptance criteria with pipe separator", () => {
    const csv = buildCsvExport({ epics, dependencies });
    const storyRow = csv.split("\n")[2];
    expect(storyRow).toContain("Given a user, When they log in, Then they see dashboard | Given wrong password, When submit, Then error shown");
  });

  it("includes dependencies as comma-separated IDs", () => {
    const csv = buildCsvExport({ epics, dependencies });
    const taskRow = csv.split("\n")[4]; // TASK-002
    expect(taskRow).toContain("STORY-001");
  });

  it("joins labels with commas", () => {
    const csv = buildCsvExport({ epics, dependencies });
    const storyRow = csv.split("\n")[2];
    expect(storyRow).toContain("frontend,auth");
  });

  it("escapes fields containing commas", () => {
    const epicsWithComma: Epic[] = [
      {
        id: "EPIC-001",
        title: "Auth, Login, and More",
        description: "Handles auth",
        stories: [],
      },
    ];
    const csv = buildCsvExport({ epics: epicsWithComma, dependencies: [] });
    const epicRow = csv.split("\n")[1];
    expect(epicRow).toContain('"Auth, Login, and More"');
  });

  it("escapes fields containing double quotes", () => {
    const epicsWithQuotes: Epic[] = [
      {
        id: "EPIC-001",
        title: 'The "Big" Feature',
        description: "Handles auth",
        stories: [],
      },
    ];
    const csv = buildCsvExport({ epics: epicsWithQuotes, dependencies: [] });
    const epicRow = csv.split("\n")[1];
    expect(epicRow).toContain('"The ""Big"" Feature"');
  });

  it("handles empty epics array", () => {
    const csv = buildCsvExport({ epics: [], dependencies: [] });
    expect(csv).toBe("type,id,title,parent_id,description,acceptance_criteria,estimate,labels,dependencies\n");
  });
});
