# Support Ticket Practice App

A small full-stack support ticket app for practicing Codex interview roleplay. It uses a dependency-free Node.js server, a REST API, a static frontend, and JSON file persistence.

## Run

```bash
npm start
```

Open:

```text
http://localhost:3000
```

## Test

```bash
npm test
```

## App Flow

- The browser loads `public/index.html`, `public/styles.css`, and `public/app.js`.
- The frontend calls `GET /api/tickets` to render the queue.
- Creating a ticket sends `POST /api/tickets`.
- Updating status sends `PATCH /api/tickets/:id`.
- Ticket data is stored in `data/tickets.json`.

## Practice Tickets

Use this app to rehearse common Codex interview moves:

- Trace a form submission through frontend code, API handling, and persistence.
- Add a new ticket field, such as `category` or `assignee`.
- Fix validation, such as rejecting whitespace-only titles.
- Add filtering or search behavior.
- Break a route intentionally and practice debugging from the browser and terminal.

## Useful Files

- `server.js`: HTTP server, API routes, validation, static file serving.
- `public/app.js`: frontend state, API calls, rendering, form handling.
- `public/index.html`: app markup and ticket template.
- `public/styles.css`: responsive interface styling.
- `data/tickets.json`: seed ticket data.
- `test/api.test.js`: API tests with a temporary data file.
