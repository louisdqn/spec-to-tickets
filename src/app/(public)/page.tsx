import { Button } from "@/components/ui/button";
import {
  Building,
  Building2,
  Check,
  Clock,
  Home,
  Layers,
  MapPin,
  Maximize2,
  ShieldCheck,
  Trash2,
  TrendingDown,
} from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CatastroAudit — Stop Overpaying Your Spanish Property Tax",
  description:
    "Free cadastral audit for Costa Blanca homeowners. Our technical architects find €400–€1,500/year in property tax overpayments.",
};

const caseStudies = [
  {
    icon: Home,
    location: "Villa in Moraira",
    issue: "Open terrace miscounted as built area",
    saving: "€1,200",
  },
  {
    icon: Building2,
    location: "Apartment in Calpe",
    issue: "Demolished storage room still on file",
    saving: "€480",
  },
  {
    icon: Building,
    location: "Townhouse in Jávea",
    issue: "Basement classified as residential",
    saving: "€720",
  },
];

const cadastralErrors = [
  {
    icon: Maximize2,
    title: "Open Terraces",
    description: "Miscounted as built/covered living space",
    saving: "€300–€800/year",
  },
  {
    icon: Layers,
    title: "Storage & Basements",
    description: "Incorrectly classified as residential space",
    saving: "€200–€600/year",
  },
  {
    icon: Trash2,
    title: "Demolished Structures",
    description: "Paying for buildings removed years ago",
    saving: "€400–€1,200/year",
  },
];

const whyNowPoints = [
  {
    icon: TrendingDown,
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
    title: "Errors compound every year",
    text: "Spain\u2019s Directorate General of Catastro periodically updates cadastral values. If your registered square metres are wrong, every revaluation compounds the error \u2014 you pay more each year on an incorrect base.",
  },
  {
    icon: Check,
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
    title: "A correction now locks in savings",
    text: "Once your cadastral record is corrected, the savings apply to every future tax year. The sooner you fix it, the more you save over the life of your property.",
  },
  {
    icon: Clock,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    title: "Fast, hassle-free process",
    text: "Most corrections are processed within 30\u201360 days. We handle the technical report and the filing \u2014 you just answer a few questions about your property.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* ── Sticky Nav ── */}
      <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
          <Link
            href="/"
            className="text-xl font-bold tracking-tight text-blue-700 sm:text-2xl"
          >
            CatastroAudit
          </Link>
          <Button
            asChild
            className="bg-blue-600 text-sm font-semibold hover:bg-blue-700 sm:text-base"
          >
            <a href="#audit-form">Check My Savings</a>
          </Button>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="bg-gradient-to-b from-white via-white to-blue-50/60 px-4 pb-16 pt-16 sm:px-6 sm:pb-24 sm:pt-20 lg:pb-32 lg:pt-28">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
            Stop Overpaying Your
            <br className="hidden sm:block" /> Spanish Property Tax.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-600 sm:text-xl">
            Our audits find{" "}
            <span className="font-semibold text-slate-900">
              €400–€1,500/year
            </span>{" "}
            in overpayments for Costa Blanca homeowners.
          </p>
          <div className="mt-10">
            <Button
              asChild
              size="lg"
              className="h-14 rounded-xl bg-blue-600 px-10 text-lg font-semibold shadow-lg shadow-blue-600/25 hover:bg-blue-700 hover:shadow-blue-700/25"
            >
              <a href="#audit-form">Check My Property Savings</a>
            </Button>
          </div>
        </div>
      </section>

      {/* ── Social Proof ── */}
      <section className="bg-slate-50 px-4 py-16 sm:px-6 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Trusted by Costa Blanca Homeowners
            </h2>
            <div className="mt-8">
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-6 py-3">
                <MapPin className="h-5 w-5 text-blue-600" />
                <span className="text-lg font-semibold text-blue-900">
                  <span className="text-3xl font-extrabold">127</span>{" "}
                  properties audited on the Costa Blanca
                </span>
              </div>
            </div>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {caseStudies.map((study) => (
              <div
                key={study.location}
                className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100">
                    <study.icon className="h-5 w-5 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-slate-900">
                    {study.location}
                  </h3>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-slate-600">
                  {study.issue}
                </p>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-emerald-600">
                    {study.saving}
                  </span>
                  <span className="text-sm text-slate-500">/year saved</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Common Errors Gallery ── */}
      <section className="px-4 py-16 sm:px-6 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              The 3 Most Common Cadastral Errors
            </h2>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {cadastralErrors.map((error) => (
              <div
                key={error.title}
                className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
                  <error.icon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-slate-900">
                  {error.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {error.description}
                </p>
                <p className="mt-4 text-sm font-medium text-slate-500">
                  Typical saving:{" "}
                  <span className="font-bold text-emerald-600">
                    {error.saving}
                  </span>
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Lead Capture Form ── */}
      <section
        id="audit-form"
        className="bg-gradient-to-b from-blue-600 to-blue-700 px-4 py-16 sm:px-6 sm:py-20 lg:py-24"
      >
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Get Your Free Cadastral Audit
          </h2>
          <p className="mt-4 text-lg text-blue-100">
            Find out if you&apos;re overpaying in under 24 hours.
          </p>
          <div className="mt-10 rounded-2xl border border-blue-400/30 bg-white/10 p-8 backdrop-blur-sm sm:p-12">
            <p className="text-lg font-medium text-white/80">
              Form coming soon
            </p>
          </div>
        </div>
      </section>

      {/* ── Authority Block ── */}
      <section className="bg-slate-50 px-4 py-12 sm:px-6 sm:py-16">
        <div className="mx-auto flex max-w-3xl items-start gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:items-center sm:gap-5 sm:p-8">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-100">
            <ShieldCheck className="h-6 w-6 text-blue-700" />
          </div>
          <p className="text-sm leading-relaxed text-slate-600 sm:text-base">
            All technical reports and rectifications are processed by a{" "}
            <span className="font-semibold text-slate-900">
              Colegiado Aparejador
            </span>{" "}
            (Licensed Technical Architect), registered with the{" "}
            <span className="font-semibold text-slate-900">
              Colegio de Arquitectos T&eacute;cnicos
            </span>
            .
          </p>
        </div>
      </section>

      {/* ── Why Now ── */}
      <section className="px-4 py-16 sm:px-6 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-center text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Why Fix This Now?
          </h2>

          <div className="mt-10 space-y-6">
            {whyNowPoints.map((point) => (
              <div key={point.title} className="flex gap-4">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${point.iconBg}`}
                >
                  <point.icon className={`h-5 w-5 ${point.iconColor}`} />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">
                    {point.title}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">
                    {point.text}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Button
              asChild
              size="lg"
              className="h-14 rounded-xl bg-blue-600 px-10 text-lg font-semibold shadow-lg shadow-blue-600/25 hover:bg-blue-700 hover:shadow-blue-700/25"
            >
              <a href="#audit-form">Check My Property Savings</a>
            </Button>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-200 bg-slate-900 px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-6xl text-center">
          <span className="text-lg font-bold text-white">CatastroAudit</span>
          <p className="mt-2 text-sm text-slate-400">
            Helping Costa Blanca homeowners pay fair property tax.
          </p>
          <p className="mt-4 text-xs text-slate-500">
            &copy; 2025 CatastroAudit. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
