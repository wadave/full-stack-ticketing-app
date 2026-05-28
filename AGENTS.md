# AGENTS.md

## Project Overview

This repository is a small full-stack support ticket practice app for Codex interview rehearsal.

The app intentionally stays simple:

- `server.js` is the backend entry point.
- `public/` contains the browser frontend.
- `data/tickets.json` is the local JSON data store.
- `test/` contains API tests.
- `docs/` contains architecture notes.

## Common Commands

Run the app:

```bash
npm start
```

Run tests:

```bash
npm test
```

The app listens on:

```text
http://127.0.0.1:3000
```

## Architecture Notes

- Keep the app dependency-free unless a task clearly requires adding a package.
- Keep the backend/frontend split lightweight.
- Use `server.js` for API routes, validation, persistence helpers, and static serving.
- Use `public/app.js` for browser-side state, API calls, rendering, and event handling.
- Use `data/tickets.json` for simple local persistence.
- See `docs/system_architecture.md` for Mermaid diagrams and request flow.

## Coding Guidelines

- Prefer small, targeted changes that match the current style.
- Use CommonJS in backend files because the project currently uses `require`.
- Use plain browser JavaScript in `public/app.js`; avoid introducing a frontend framework.
- Keep UI copy concise and suitable for an internal support desk.
- Validate ticket input on the server, even if client-side validation also exists.
- Preserve the current REST API shape unless the task asks for an API change.

## Data Guidelines

- Treat `data/tickets.json` as mutable local app data.
- Do not remove user-created tickets unless the user explicitly asks to reset seed data.
- If tests need data isolation, use temporary files as `test/api.test.js` already does.

## Testing And Validation

For backend or API changes:

- Run `npm test`.
- If sandbox permissions block localhost binding, request approval to run the test command.

For frontend behavior changes:

- Start the app with `npm start`.
- Open `http://127.0.0.1:3000`.
- Verify the relevant browser flow manually, such as creating a ticket, filtering by status, searching, or updating status.

For documentation-only changes:

- No automated test is required.
- Read the changed Markdown to check formatting and links.

## Interview Practice Goals

When using this repo for mock interview practice, prefer tasks that exercise the full request path:

- frontend form
- `fetch` call
- API route
- validation
- JSON persistence
- rendered ticket list

Good practice tasks include:

- add a new ticket field
- fix validation
- add filtering
- debug a broken create flow
- improve status updates
- add focused API tests
