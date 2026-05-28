# System Architecture

This app is a small full-stack support ticket system. The backend and frontend are split by responsibility, but they live in one simple Node project.

## Component Diagram

```mermaid
flowchart LR
  user["User in browser"]

  subgraph frontend["Frontend: public/"]
    html["index.html"]
    css["styles.css"]
    appjs["app.js"]
  end

  subgraph backend["Backend: server.js"]
    static["Static file server"]
    api["REST API routes"]
    validation["Ticket validation"]
    persistence["JSON persistence helpers"]
  end

  datastore[("data/tickets.json")]
  tests["API tests: test/api.test.js"]

  user --> html
  html --> css
  html --> appjs
  appjs -->|"fetch /api/tickets"| api
  api --> validation
  api --> persistence
  persistence <--> datastore
  static --> frontend
  tests --> api
```

## Request Flow

```mermaid
sequenceDiagram
  participant Browser
  participant Frontend as public/app.js
  participant API as server.js API
  participant Store as data/tickets.json

  Browser->>Frontend: Load ticket queue
  Frontend->>API: GET /api/tickets
  API->>Store: Read tickets
  Store-->>API: Ticket JSON
  API-->>Frontend: { tickets }
  Frontend-->>Browser: Render queue

  Browser->>Frontend: Submit create ticket form
  Frontend->>API: POST /api/tickets
  API->>API: Validate title, email, description, priority
  API->>Store: Append new ticket
  Store-->>API: Saved
  API-->>Frontend: { ticket }
  Frontend->>API: GET /api/tickets
  API->>Store: Read updated tickets
  API-->>Frontend: { tickets }
  Frontend-->>Browser: Refresh queue
```

## Responsibilities

- `server.js`: runs the HTTP server, serves static files, handles API routes, validates ticket input, and reads/writes ticket data.
- `public/index.html`: defines the page structure and ticket template.
- `public/app.js`: manages browser-side state, form submission, filtering, status updates, and rendering.
- `public/styles.css`: styles the responsive support desk interface.
- `data/tickets.json`: stores the current ticket records.
- `test/api.test.js`: verifies core API behavior with an isolated temporary data file.

## API Surface

- `GET /api/tickets`: list tickets, optionally filtered by `status` or search query `q`.
- `POST /api/tickets`: create a new ticket.
- `GET /api/tickets/:id`: fetch one ticket.
- `PATCH /api/tickets/:id`: update a ticket status.
