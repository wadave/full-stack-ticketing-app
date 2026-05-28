# Mock Interview Plan

Use this plan to rehearse a Codex Deployment Engineering roleplay on the support ticket app.

## Goal

Help an engineer get productive with Codex while solving a realistic full-stack support ticket task.

Show that you can:

- inspect an unfamiliar repo
- explain your reasoning clearly
- make a small, focused change
- validate the result
- summarize tradeoffs and remaining risk

## 30-Minute Runbook

### 1. Orient: 5 minutes

Say:

> I’ll start by reading the repo structure and the local instructions so we can understand the app before changing code.

Do:

```bash
rg --files
sed -n '1,220p' AGENTS.md
sed -n '1,220p' README.md
```

Look for:

- app entry point
- frontend files
- API routes
- data store
- tests
- project-specific instructions

### 2. Trace The Flow: 5 minutes

Say:

> I’m tracing the ticket path from the browser form to the API and then into persistence.

Inspect:

```bash
sed -n '1,260p' server.js
sed -n '1,260p' public/app.js
sed -n '1,220p' test/api.test.js
```

Explain:

- `public/app.js` owns browser state and `fetch` calls.
- `server.js` owns routes, validation, and file persistence.
- `data/tickets.json` stores ticket records.
- `test/api.test.js` validates API behavior using temporary data.

### 3. Reproduce Or Define The Task: 5 minutes

For a bug:

- run the app
- reproduce the issue in the browser
- check the relevant API response
- identify the likely failing layer

For a feature:

- identify affected data shape
- identify affected API route
- identify affected UI rendering
- identify test coverage needed

Useful commands:

```bash
npm start
curl -s http://127.0.0.1:3000/api/tickets
```

### 4. Implement: 10 minutes

Say:

> I’m going to make the smallest change that follows the existing structure.

Good practice tasks:

- add a `category` field
- add an `assignee` field
- reject whitespace-only descriptions
- add a status filter
- fix a broken create flow
- add a focused API test

Change order:

1. Update backend validation or route behavior.
2. Update frontend form or rendering.
3. Update tests.
4. Update docs only if behavior changed enough to matter.

### 5. Validate: 3 minutes

Say:

> Now I’ll verify the failing case and the happy path.

Run:

```bash
npm test
```

For UI changes, also check:

- create ticket
- filter or search
- update ticket status
- API response shape

### 6. Summarize: 2 minutes

Use this format:

> I changed X so that Y now works. I verified it with Z. The main remaining risk is A, and the next thing I would check is B.

Example:

> I added server-side validation for whitespace-only descriptions and surfaced the API error in the form. I verified the API test for invalid descriptions and manually confirmed valid tickets still submit. The main remaining risk is that we do not have browser automation for the form flow yet.

## Mock Prompts

Use one prompt per rehearsal.

1. A user can submit a ticket, but it does not appear in the queue.
2. Users can submit tickets with whitespace-only descriptions.
3. Add a `category` field with values `Billing`, `Login`, and `Product`.
4. Add an `assignee` field and show it in the ticket card.
5. Add a way to filter tickets by priority.
6. Updating a ticket status appears to work, but the change is lost after refresh.
7. The search box matches title only; make it also match email and description.
8. Add an API test for invalid priority values.

## Strong Narration Checklist

- State what you are inspecting and why.
- Name the request path clearly.
- Explain the smallest change you are making.
- Mention validation before claiming success.
- Call out any unverified risk honestly.

## Stop Conditions

Pause and realign if:

- the task requires a product decision that is not obvious
- the change would require a broad refactor
- a command needs sandbox approval
- test output contradicts your hypothesis
- generated changes touch unrelated files
