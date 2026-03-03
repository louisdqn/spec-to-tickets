# PRD: Personal Todo App

## Overview

A simple personal todo application that allows users to manage their daily tasks. The app should be lightweight, fast, and work entirely in the browser with local storage persistence.

## Target Users

Individual users who want a no-frills task management tool without account creation or cloud sync.

## Features

### Task Management

- Users can create a new task with a title and optional description
- Users can mark tasks as complete or incomplete (toggle)
- Users can delete tasks permanently
- Users can edit the title and description of existing tasks

### Organization

- Tasks should be sortable by creation date (newest/oldest)
- Users can filter tasks by status: All, Active, Completed
- A task counter shows the number of remaining active tasks

### Data Persistence

- All tasks are stored in the browser's localStorage
- Data survives page refreshes and browser restarts
- Users can clear all completed tasks with a single action

## Non-Functional Requirements

- Page load time under 1 second
- Works offline after initial load
- Responsive design for mobile and desktop
- Accessible: keyboard navigation and screen reader support
