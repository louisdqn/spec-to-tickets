# PRD: Team Dashboard

## Overview

An internal team dashboard that provides managers and team leads with a centralized view of team activity, project status, and key metrics. The dashboard aggregates data from multiple sources and presents it in a unified interface.

## Target Users

- **Engineering Managers** — need sprint velocity and team health metrics
- **Team Leads** — need project status overview and blockers visibility
- **Product Managers** — need feature progress tracking and delivery forecasts

## Features

### Authentication & Authorization

Users authenticate via SSO (SAML 2.0) through the company's identity provider. Three roles exist:

- **Admin** — full access, can manage teams and configure integrations
- **Manager** — can view all teams they manage, edit dashboards
- **Viewer** — read-only access to assigned team dashboards

Unauthorized access to a team's dashboard must return 403. Session expires after 8 hours of inactivity.

### Team Overview

The main dashboard view displays:

- Team member list with current status (available, in meeting, OOO, focused)
- Active sprint summary: total points, completed, remaining, burndown trend
- Top 3 blockers flagged in the last 24 hours (pulled from Jira/Linear)
- Upcoming deadlines within the next 2 weeks

Each team member card shows their avatar, name, role, and current task assignment.

### Project Tracking

A project board view with swimlanes by project:

- Each project shows: name, health status (on track / at risk / behind), owner, deadline
- Drill-down into a project reveals milestone timeline and completion percentage
- Health status is auto-calculated: behind if >20% of milestones are overdue, at risk if >10%
- Managers can override auto-calculated status with a manual assessment and note

### Analytics & Reporting

- **Sprint Velocity Chart** — bar chart of points completed per sprint (last 6 sprints)
- **Cycle Time Distribution** — histogram of ticket cycle times (commit to deploy)
- **Team Capacity** — stacked bar showing allocated vs. available capacity per member
- All charts support date range filtering and CSV export

Reports can be scheduled for weekly email delivery (PDF attachment).

### Integrations

The dashboard pulls data from:

- **Jira/Linear** — ticket status, sprint data, blockers
- **GitHub** — PR count, review turnaround time, deployment frequency
- **Slack** — team member status, OOO calendar
- **Google Calendar** — meeting load per team member

Each integration has a settings page where admins configure API keys and sync frequency. Data syncs every 15 minutes by default.

## Non-Functional Requirements

- Dashboard load time under 3 seconds for teams of up to 30 members
- Real-time updates for team status changes (WebSocket or SSE)
- Data retention: 12 months of historical metrics
- WCAG 2.1 AA compliance
- SOC 2 compatible: audit logging for all admin actions
