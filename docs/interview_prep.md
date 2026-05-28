# Codex Deployment Engineering Interview Prep

## Interview Shape

The exercise is a roleplay. The interviewer will act like an engineer who needs help getting up and running with Codex on a simple full-stack support ticket app.

Your job is not just to solve the coding task. Your job is to show that you can:

- Understand an unfamiliar codebase quickly.
- Use Codex safely and effectively.
- Explain your reasoning while you work.
- Make small, well-scoped changes.
- Validate the change with tests, local runs, or manual checks.
- Help another engineer feel oriented rather than overwhelmed.

Think of it as live enablement plus practical debugging.

## Strong Roleplay Flow

Use this pattern during the interview:

1. Clarify the task briefly.

   Example: "I’ll first reproduce or understand the issue, then trace the ticket flow through the frontend, API, and storage layer before changing code."

2. Inspect the repo.

   Good first commands:

   ```bash
   rg --files
   rg "ticket|support|status|priority|create"
   ```

   Then inspect likely files such as:

   - `README.md`
   - `package.json`
   - app routes
   - API routes
   - database or mock storage files
   - tests
   - `AGENTS.md`, if present

3. Narrate what you are learning.

   Example: "This looks like the ticket creation path starts in the form component, posts to this API route, and then the list view fetches from this endpoint."

4. Make the smallest useful change.

   Prefer existing app patterns over introducing new abstractions. Avoid broad refactors unless the ticket truly requires them.

5. Validate.

   Useful validation options:

   - run targeted tests
   - run the app locally
   - reproduce the workflow in the browser
   - inspect logs or network calls
   - test edge cases like empty fields, missing status, or invalid IDs

6. Summarize.

   Example: "I changed the API validation and updated the form error handling. I verified the empty-title case fails cleanly and valid tickets still submit."

## Mock Scenarios

### Scenario 1: Ticket Does Not Appear After Creation

Prompt:

> A user can submit a support ticket, but it never appears in the dashboard.

What to demonstrate:

- Trace frontend form submission.
- Check API route or server action.
- Check persistence layer.
- Check list fetch/render path.
- Reproduce the bug before fixing if possible.
- Verify by creating a ticket and seeing it in the list.

Likely root causes:

- API returns success but does not save.
- UI does not refresh after create.
- list endpoint filters out new tickets.
- ID/status/default field mismatch.
- async call is not awaited.

### Scenario 2: Add Ticket Priority

Prompt:

> Add a priority field to support tickets with Low, Medium, and High options.

What to demonstrate:

- Find the ticket model/type.
- Update create form.
- Update API validation.
- Update persistence shape.
- Update ticket list/detail display.
- Add or update tests.

Good judgment:

- Use existing form controls and styling.
- Default priority conservatively, such as `Medium`, if product requirements are not specific.
- Validate on the server, not only in the UI.

### Scenario 3: Empty Ticket Titles Are Accepted

Prompt:

> Users can submit tickets with an empty title. Please fix it.

What to demonstrate:

- Add server-side validation.
- Add client-side feedback if the app already has that pattern.
- Preserve valid ticket submission.
- Test empty string and whitespace-only string.

Strong explanation:

> I’m adding validation at the API boundary because the UI is not the only caller. If the existing UI has inline errors, I’ll mirror that there too.

### Scenario 4: Add Status Filtering

Prompt:

> Add a way to filter tickets by status: open, pending, or closed.

What to demonstrate:

- Locate status values and list fetching.
- Decide whether filtering belongs client-side or server-side based on existing data flow.
- Add a compact UI control, such as tabs or a select.
- Preserve "all tickets" behavior.
- Validate each filter state.

### Scenario 5: Create Ticket Button Fails

Prompt:

> The app loads, but clicking Create Ticket fails.

What to demonstrate:

- Reproduce the error.
- Check browser console, terminal logs, and network response.
- Trace the failing call.
- Fix the actual cause rather than guessing.
- Verify the full create flow.

Likely root causes:

- form event handler regression
- route path mismatch
- missing required request field
- server exception
- changed component prop name
- environment variable missing

### Scenario 6: Dependency Or Approval Needed

Prompt:

> We need to install a package or run something Codex cannot access in the sandbox.

What to demonstrate:

- Explain why approval is needed.
- Ask for permission clearly.
- Keep the approval scoped to the command.
- Do not work around the sandbox in unsafe ways.

Strong explanation:

> Codex is sandboxed, so network installs or commands outside the writable workspace may require explicit approval. I’ll request that approval only for the command we need.

## Mock Interview Questions

### How do you get oriented in a new codebase with Codex?

Strong answer:

> I start by reading the repo structure, package scripts, README, and any `AGENTS.md` instructions. Then I search for domain terms related to the task, identify the main request/data flow, and inspect the smallest set of files that explain the behavior. I try to form a concrete hypothesis before editing.

### How do you decide what to change?

Strong answer:

> I look for the narrowest change that matches the existing architecture. I prefer local patterns over new abstractions, and I avoid refactors during a support-ticket fix unless the current structure makes the change unsafe or unclear.

### How do you validate a Codex change?

Strong answer:

> First I try to reproduce or understand the failing behavior. After changing code, I run the most targeted test or build command available, and for user-facing flows I also validate manually in the running app. I call out exactly what I verified and what I did not.

### What makes Codex different from an autocomplete tool?

Strong answer:

> Codex can operate across the repo: inspect files, edit code, run commands, read test output, and iterate. That makes it useful for debugging, migration, test writing, and onboarding. The tradeoff is that you still need strong engineering judgment: keep scope clear, review changes, and validate results.

### How do you handle Codex security, sandboxing, and approvals?

Strong answer:

> I treat the sandbox as a safety boundary. I let Codex read and edit within the allowed workspace, but when a command needs network access, writes outside the workspace, or performs something potentially sensitive, I ask for approval with a clear reason. I also avoid destructive commands unless the user explicitly requests them.

### What is `AGENTS.md` for?

Strong answer:

> `AGENTS.md` gives repo-specific instructions to coding agents. It can define project conventions, commands to run, style rules, test expectations, or areas to avoid. I check it early because those instructions may matter more than generic habits.

### How would you guide an engineer who is new to Codex?

Strong answer:

> I would show them a simple loop: give Codex a clear goal, let it inspect the repo, ask it to explain its plan, have it make a small change, then verify with tests or the app. I would also teach them when to pause: broad refactors, unclear requirements, approval prompts, or surprising diffs.

### What are good use cases for coding agents?

Strong answer:

> Coding agents are strong at repo exploration, bug fixing, test generation, mechanical migrations, documentation updates, dependency upgrade investigation, and repetitive code changes where validation can be run. They are especially useful when they can inspect the codebase and execute feedback loops.

### What are weaker use cases or risks?

Strong answer:

> Agents can struggle when requirements are ambiguous, validation is unavailable, or the task requires product judgment outside the code. They can also make overbroad changes if the scope is loose. I manage that by narrowing the goal, asking for clarification when consequences are non-obvious, and verifying behavior.

### What would you do if Codex makes a wrong assumption?

Strong answer:

> I would stop and re-ground in evidence: inspect the relevant files, run the failing command, or reproduce the behavior. Then I would correct the plan and make the smallest change consistent with what the code actually shows.

### How do you explain your work during the roleplay?

Strong answer:

> I narrate decisions, not every keystroke. I say what I am looking for, what I found, what hypothesis I have, what I am changing, and how I am validating it. That keeps the engineer included without drowning them in details.

## Things To Say During The Exercise

Useful phrases:

- "I’m going to inspect the existing structure before changing anything."
- "I’m searching for the domain language from the ticket so we can find the real implementation path."
- "This looks like the request flows from the form to this API route and then into this storage helper."
- "I’m choosing the smaller change because it fits the current pattern."
- "Now I want to validate both the failing case and the happy path."
- "This command needs approval because it reaches outside the current sandbox."
- "Here is what changed, here is what I verified, and here is the remaining risk."

## Things To Avoid

- Jumping into edits before inspecting the code.
- Making large refactors during a small support-ticket task.
- Being silent for long stretches.
- Treating Codex output as automatically correct.
- Ignoring `AGENTS.md`.
- Ignoring approval prompts or sandbox boundaries.
- Saying something is fixed without running any validation.
- Overexplaining every command instead of explaining the engineering reason behind it.

## Quick Practice Drill

Use this 30-minute rehearsal:

1. Spend 5 minutes reading the prompt and inspecting the repo.
2. Spend 5 minutes tracing the relevant data flow aloud.
3. Spend 10 minutes making a small fix or feature change.
4. Spend 5 minutes validating it.
5. Spend 5 minutes summarizing the change, verification, and risks.

Practice prompt:

> A user reports that they can submit a support ticket, but it does not appear in the ticket list. Use Codex to investigate, explain your reasoning, fix the issue, and validate the result.

## Final Mental Model

The interviewers are probably not looking for a perfect memorized answer. They are looking for calm, practical engineering behavior with Codex in the loop.

Your north star:

> Inspect first, reason clearly, change narrowly, validate honestly, and keep the engineer oriented.
