import { describe, it, expect } from "vitest";
import { inferLabels } from "./decompose";

describe("inferLabels", () => {
  it("matches a single frontend keyword", () => {
    expect(inferLabels("Build the login form component")).toContain("frontend");
  });

  it("matches auth keywords", () => {
    expect(inferLabels("Implement OAuth login flow")).toContain("auth");
  });

  it("matches multiple labels from different categories", () => {
    const labels = inferLabels("Build API endpoint with database migration");
    expect(labels).toContain("api");
    expect(labels).toContain("database");
  });

  it("caps results at 3 labels", () => {
    // Text that matches frontend, api, database, auth
    const labels = inferLabels("Build form component for API endpoint with database query and login auth");
    expect(labels.length).toBeLessThanOrEqual(3);
  });

  it("falls back to 'backend' when no keywords match", () => {
    const labels = inferLabels("Do the important thing");
    expect(labels).toEqual(["backend"]);
  });

  it("is case-insensitive", () => {
    expect(inferLabels("DEPLOY TO DOCKER KUBERNETES")).toContain("infra");
  });

  it("matches partial words (e.g. 'form' inside 'transform')", () => {
    // "form" is a frontend keyword — it matches inside "transform"
    const labels = inferLabels("Transform the data");
    expect(labels).toContain("frontend");
  });

  it("matches testing keywords", () => {
    expect(inferLabels("Write e2e spec for coverage")).toContain("testing");
  });

  it("matches design keywords", () => {
    expect(inferLabels("Create wireframe mockup in Figma")).toContain("design");
  });

  it("matches infra keywords", () => {
    expect(inferLabels("Set up CI pipeline with monitoring")).toContain("infra");
  });
});
