# F8b · Tasks, reminders, overdue follow-ups
Owner: B (John) · Days 12–12 · Release 2 · Tracker: F8.3, F8.4, F8.5 · PRD: [F8](../PRD.md#f8)

## Goal
Follow-ups become tasks with due dates, reminders fire on time, and overdue work is visible.

## Acceptance criteria
- [ ] Tasks: create from a lead, assignee, due date, done; "My tasks" list.
- [ ] Reminders at due time via bell + email; overdue tasks feed the agency view (F13).

## Data model / API / job changes
- tasks CRUD (`task.manage`); `task.reminder` delayed job at due_at → `notify(task_due, email)`.
- Overdue query exported for F13a.

## Files touched
- B (John): src/modules/tasks/*, src/app/[locale]/(app)/(tasks, lead drawer section)/*, messages/en/tasks.json

## Dependencies
F8a, F1d.

## Edge cases
- Due date edited → old reminder cancelled, new one scheduled.
- Task done before due → no reminder.
- Due date shown and evaluated in the client's time zone.
- Assignee loses access to the project → task shows unassigned.

## Out of scope
Recurring tasks, calendar sync, calling.

## Test plan
- Reminder job fires once at due time (fake clock); reschedule and cancel cases.
- "My tasks" shows only the viewer's tasks across their projects.
