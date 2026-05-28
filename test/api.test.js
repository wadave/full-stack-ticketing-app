const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

const { createServer } = require("../server");

async function withTestServer(t, seedTickets = []) {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "tickets-"));
  const dataFile = path.join(tempDir, "tickets.json");
  await fs.writeFile(dataFile, `${JSON.stringify(seedTickets, null, 2)}\n`);

  const server = createServer({ dataFile });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));

  t.after(async () => {
    await new Promise((resolve) => server.close(resolve));
  });

  const { port } = server.address();
  return `http://127.0.0.1:${port}`;
}

test("creates a support ticket", async (t) => {
  const baseUrl = await withTestServer(t);

  const response = await fetch(`${baseUrl}/api/tickets`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      title: "Login failure",
      description: "Customer cannot log in from Safari.",
      customerEmail: "casey@example.com",
      priority: "high"
    })
  });

  assert.equal(response.status, 201);

  const payload = await response.json();
  assert.equal(payload.ticket.title, "Login failure");
  assert.equal(payload.ticket.status, "open");
  assert.equal(payload.ticket.priority, "high");
});

test("rejects empty ticket titles", async (t) => {
  const baseUrl = await withTestServer(t);

  const response = await fetch(`${baseUrl}/api/tickets`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      title: "   ",
      description: "The title should be required.",
      customerEmail: "casey@example.com",
      priority: "medium"
    })
  });

  assert.equal(response.status, 400);

  const payload = await response.json();
  assert.equal(payload.error, "Title is required.");
});

test("filters tickets by status", async (t) => {
  const baseUrl = await withTestServer(t, [
    {
      id: "one",
      title: "Open issue",
      description: "Needs triage.",
      customerEmail: "one@example.com",
      priority: "medium",
      status: "open",
      createdAt: "2026-05-20T16:10:00.000Z",
      updatedAt: "2026-05-20T16:10:00.000Z"
    },
    {
      id: "two",
      title: "Closed issue",
      description: "Already resolved.",
      customerEmail: "two@example.com",
      priority: "low",
      status: "closed",
      createdAt: "2026-05-21T16:10:00.000Z",
      updatedAt: "2026-05-21T16:10:00.000Z"
    }
  ]);

  const response = await fetch(`${baseUrl}/api/tickets?status=closed`);
  const payload = await response.json();

  assert.equal(response.status, 200);
  assert.equal(payload.tickets.length, 1);
  assert.equal(payload.tickets[0].id, "two");
});

test("updates ticket status", async (t) => {
  const baseUrl = await withTestServer(t, [
    {
      id: "one",
      title: "Open issue",
      description: "Needs triage.",
      customerEmail: "one@example.com",
      priority: "medium",
      status: "open",
      createdAt: "2026-05-20T16:10:00.000Z",
      updatedAt: "2026-05-20T16:10:00.000Z"
    }
  ]);

  const response = await fetch(`${baseUrl}/api/tickets/one`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ status: "pending" })
  });
  const payload = await response.json();

  assert.equal(response.status, 200);
  assert.equal(payload.ticket.status, "pending");
});
