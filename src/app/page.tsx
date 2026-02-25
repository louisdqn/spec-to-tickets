import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  FileText,
  GitBranch,
  CheckSquare,
  Download,
  Upload,
  Eye,
  Bot,
  FileDown,
} from "lucide-react";

const features = [
  {
    icon: FileText,
    title: "Structured Decomposition",
    description:
      "Breaks any PRD into a clean Epic → Story → Task hierarchy with IDs, estimates, and labels.",
  },
  {
    icon: GitBranch,
    title: "Dependency Mapping",
    description:
      "Automatically identifies blocking relationships and organizes tickets into execution phases.",
  },
  {
    icon: CheckSquare,
    title: "Acceptance Criteria",
    description:
      "Every story gets Given/When/Then acceptance criteria ready for your QA process.",
  },
  {
    icon: Download,
    title: "Export to Linear & CSV",
    description:
      "One-click export to JSON (Linear-compatible) or CSV. Ready to import into your project tracker.",
  },
];

const steps = [
  {
    icon: Upload,
    step: "1",
    title: "Upload your PRD",
    description: "Paste Markdown or upload a PDF document.",
  },
  {
    icon: Eye,
    step: "2",
    title: "Preview sections",
    description: "Verify the parsed structure before processing.",
  },
  {
    icon: Bot,
    step: "3",
    title: "AI decomposes",
    description: "Claude breaks it into epics, stories, and tasks.",
  },
  {
    icon: FileDown,
    step: "4",
    title: "Export tickets",
    description: "Download JSON or CSV, import into Linear or Jira.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="border-b border-border">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
          <span className="text-lg font-semibold tracking-tight">
            spec-to-tickets
          </span>
          <Button asChild variant="ghost" size="sm">
            <a
              href="https://github.com/louisdqn/spec-to-tickets"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
          </Button>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-4 pb-16 pt-20 sm:px-6 sm:pb-24 sm:pt-28">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center rounded-full border border-border bg-muted/50 px-3 py-1 text-xs text-muted-foreground">
            Open source &middot; Bring your own API key
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            spec-to-tickets
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground sm:text-xl">
            Transform PRDs into structured, dependency-mapped engineering
            tickets in seconds.
          </p>
          <div className="mt-10">
            <Button asChild size="lg" className="h-12 px-8 text-base">
              <Link href="/tool">
                Start Decomposing
                <ArrowRight className="ml-1 size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-border bg-muted/30 px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">
            What you get
          </h2>
          <div className="mt-12 grid gap-8 sm:grid-cols-2">
            {features.map((feature) => (
              <div key={feature.title} className="flex gap-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-border bg-background">
                  <feature.icon className="size-5 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold">{feature.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">
            How it works
          </h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s) => (
              <div
                key={s.step}
                className="rounded-lg border border-border bg-background p-5"
              >
                <div className="flex items-center gap-3">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    {s.step}
                  </span>
                  <s.icon className="size-4 text-muted-foreground" />
                </div>
                <h3 className="mt-3 font-semibold">{s.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {s.description}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Button asChild variant="outline" size="lg">
              <Link href="/tool">
                Try it now
                <ArrowRight className="ml-1 size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-5xl text-center text-sm text-muted-foreground">
          <p>
            Built with Next.js, Claude API, and Mermaid.js
          </p>
          <p className="mt-2">
            <a
              href="https://github.com/louisdqn/spec-to-tickets"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4 hover:text-foreground"
            >
              View on GitHub
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
