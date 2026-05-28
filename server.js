const http = require("node:http");
const fs = require("node:fs/promises");
const path = require("node:path");
const crypto = require("node:crypto");

const PUBLIC_DIR = path.join(__dirname, "public");
const DEFAULT_DATA_FILE = path.join(__dirname, "data", "tickets.json");
const VALID_STATUSES = new Set(["open", "pending", "closed"]);
const VALID_PRIORITIES = new Set(["low", "medium", "high"]);

function getDataFile(dataFile) {
  return dataFile || process.env.TICKETS_FILE || DEFAULT_DATA_FILE;
}

async function readTickets(dataFile) {
  const raw = await fs.readFile(getDataFile(dataFile), "utf8");
  return JSON.parse(raw);
}

async function writeTickets(tickets, dataFile) {
  const targetFile = getDataFile(dataFile);
  await fs.mkdir(path.dirname(targetFile), { recursive: true });
  await fs.writeFile(targetFile, `${JSON.stringify(tickets, null, 2)}\n`);
}

function sendJson(res, statusCode, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, {
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(body)
  });
  res.end(body);
}

function sendNoContent(res) {
  res.writeHead(204);
  res.end();
}

function sendNotFound(res) {
  sendJson(res, 404, { error: "Not found" });
}

function parseRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk;

      if (body.length > 1_000_000) {
        req.destroy();
        reject(new Error("Request body is too large"));
      }
    });

    req.on("end", () => {
      if (!body) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(body));
      } catch {
        reject(new Error("Request body must be valid JSON"));
      }
    });

    req.on("error", reject);
  });
}

function normalizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function validateNewTicket(input) {
  const title = normalizeText(input.title);
  const description = normalizeText(input.description);
  const customerEmail = normalizeText(input.customerEmail).toLowerCase();
  const priority = normalizeText(input.priority || "medium").toLowerCase();

  if (!title) {
    return { error: "Title is required." };
  }

  if (!description) {
    return { error: "Description is required." };
  }

  if (!customerEmail || !customerEmail.includes("@")) {
    return { error: "A valid customer email is required." };
  }

  if (!VALID_PRIORITIES.has(priority)) {
    return { error: "Priority must be low, medium, or high." };
  }

  return {
    value: {
      title,
      description,
      customerEmail,
      priority
    }
  };
}

function filterTickets(tickets, url) {
  const status = normalizeText(url.searchParams.get("status")).toLowerCase();
  const query = normalizeText(url.searchParams.get("q")).toLowerCase();

  return tickets.filter((ticket) => {
    const matchesStatus = !status || ticket.status === status;
    const searchable = [
      ticket.title,
      ticket.description,
      ticket.customerEmail,
      ticket.priority,
      ticket.status
    ]
      .join(" ")
      .toLowerCase();
    const matchesQuery = !query || searchable.includes(query);

    return matchesStatus && matchesQuery;
  });
}

function sortTickets(tickets) {
  return [...tickets].sort((a, b) => {
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });
}

function createTicket(input) {
  const now = new Date().toISOString();

  return {
    id: crypto.randomUUID(),
    title: input.title,
    description: input.description,
    customerEmail: input.customerEmail,
    priority: input.priority,
    status: "open",
    createdAt: now,
    updatedAt: now
  };
}

async function handleApi(req, res, url, dataFile) {
  if (req.method === "GET" && url.pathname === "/api/tickets") {
    const tickets = await readTickets(dataFile);
    sendJson(res, 200, { tickets: sortTickets(filterTickets(tickets, url)) });
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/tickets") {
    const body = await parseRequestBody(req);
    const result = validateNewTicket(body);

    if (result.error) {
      sendJson(res, 400, { error: result.error });
      return;
    }

    const tickets = await readTickets(dataFile);
    const ticket = createTicket(result.value);
    tickets.push(ticket);
    await writeTickets(tickets, dataFile);
    sendJson(res, 201, { ticket });
    return;
  }

  const ticketMatch = url.pathname.match(/^\/api\/tickets\/([^/]+)$/);

  if (ticketMatch && req.method === "GET") {
    const tickets = await readTickets(dataFile);
    const ticket = tickets.find((item) => item.id === ticketMatch[1]);

    if (!ticket) {
      sendNotFound(res);
      return;
    }

    sendJson(res, 200, { ticket });
    return;
  }

  if (ticketMatch && req.method === "PATCH") {
    const body = await parseRequestBody(req);
    const nextStatus = normalizeText(body.status).toLowerCase();

    if (!VALID_STATUSES.has(nextStatus)) {
      sendJson(res, 400, { error: "Status must be open, pending, or closed." });
      return;
    }

    const tickets = await readTickets(dataFile);
    const ticket = tickets.find((item) => item.id === ticketMatch[1]);

    if (!ticket) {
      sendNotFound(res);
      return;
    }

    ticket.status = nextStatus;
    ticket.updatedAt = new Date().toISOString();
    await writeTickets(tickets, dataFile);
    sendJson(res, 200, { ticket });
    return;
  }

  if (req.method === "OPTIONS") {
    sendNoContent(res);
    return;
  }

  sendNotFound(res);
}

function getContentType(filePath) {
  const extension = path.extname(filePath);

  switch (extension) {
    case ".css":
      return "text/css";
    case ".js":
      return "text/javascript";
    case ".json":
      return "application/json";
    case ".svg":
      return "image/svg+xml";
    default:
      return "text/html";
  }
}

async function serveStatic(req, res, url) {
  const requestedPath = url.pathname === "/" ? "/index.html" : url.pathname;
  const safePath = path.normalize(requestedPath).replace(/^(\.\.[/\\])+/, "");
  const filePath = path.join(PUBLIC_DIR, safePath);

  if (!filePath.startsWith(PUBLIC_DIR)) {
    sendNotFound(res);
    return;
  }

  try {
    const file = await fs.readFile(filePath);
    res.writeHead(200, {
      "Content-Type": getContentType(filePath),
      "Content-Length": file.length
    });
    res.end(file);
  } catch (error) {
    if (error.code === "ENOENT") {
      sendNotFound(res);
      return;
    }

    throw error;
  }
}

function createServer(options = {}) {
  return http.createServer(async (req, res) => {
    const url = new URL(req.url, "http://localhost");

    try {
      if (url.pathname.startsWith("/api/")) {
        await handleApi(req, res, url, options.dataFile);
        return;
      }

      await serveStatic(req, res, url);
    } catch (error) {
      sendJson(res, 500, { error: error.message || "Internal server error" });
    }
  });
}

if (require.main === module) {
  const port = Number(process.env.PORT || 3000);
  const host = process.env.HOST || "127.0.0.1";
  const app = createServer();

  app.listen(port, host, () => {
    console.log(`Support ticket app running at http://${host}:${port}`);
  });
}

module.exports = {
  createServer,
  createTicket,
  filterTickets,
  readTickets,
  validateNewTicket,
  writeTickets
};
