import { unified } from "unified";
import remarkParse from "remark-parse";
import type { Root, Heading, RootContent } from "mdast";
import type { Section } from "@/types";

/**
 * Parse a Markdown document into a flat array of sections.
 * Each section corresponds to a heading and includes the text content
 * between it and the next heading of equal or higher level.
 *
 * @param markdown - Raw Markdown string
 * @returns Array of sections with heading, level, and content
 */
export function parseMarkdown(markdown: string): Section[] {
  const tree = unified().use(remarkParse).parse(markdown) as Root;
  const sections: Section[] = [];
  const children = tree.children;

  for (let i = 0; i < children.length; i++) {
    const node = children[i];
    if (node.type !== "heading") continue;

    const heading = node as Heading;
    const headingText = extractText(heading);
    const level = heading.depth;

    // Collect content nodes until the next heading (any level)
    const contentParts: string[] = [];
    for (let j = i + 1; j < children.length; j++) {
      const next = children[j];
      if (next.type === "heading") break;
      const text = extractNodeText(next);
      if (text) contentParts.push(text);
    }

    sections.push({
      heading: headingText,
      level,
      content: contentParts.join("\n").trim(),
    });
  }

  // If no headings found, return the entire document as a single section
  if (sections.length === 0 && markdown.trim().length > 0) {
    sections.push({
      heading: "Document",
      level: 1,
      content: markdown.trim().slice(0, 500),
    });
  }

  return sections;
}

/**
 * Extract plain text from a heading node.
 */
function extractText(heading: Heading): string {
  return heading.children
    .map((child) => {
      if ("value" in child) return child.value;
      if ("children" in child) return (child.children as Array<{ value?: string }>).map((c) => c.value ?? "").join("");
      return "";
    })
    .join("");
}

/**
 * Extract plain text from any mdast node (paragraphs, lists, etc).
 */
function extractNodeText(node: RootContent): string {
  if ("value" in node) return node.value as string;
  if ("children" in node) {
    return (node.children as RootContent[]).map(extractNodeText).join(" ");
  }
  return "";
}
