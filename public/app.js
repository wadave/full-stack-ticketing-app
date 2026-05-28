const state = {
  status: "",
  query: "",
  tickets: []
};

const ticketForm = document.querySelector("#ticketForm");
const ticketList = document.querySelector("#ticketList");
const ticketTemplate = document.querySelector("#ticketTemplate");
const formStatus = document.querySelector("#formStatus");
const searchInput = document.querySelector("#searchInput");
const refreshButton = document.querySelector("#refreshButton");
const totalCount = document.querySelector("#totalCount");
const openCount = document.querySelector("#openCount");
const tabs = [...document.querySelectorAll(".tab")];

function formatDate(value) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(value));
}

function setFormStatus(message, isError = false) {
  formStatus.textContent = message;
  formStatus.classList.toggle("is-error", isError);
}

function getTicketParams() {
  const params = new URLSearchParams();

  if (state.status) {
    params.set("status", state.status);
  }

  if (state.query) {
    params.set("q", state.query);
  }

  const queryString = params.toString();
  return queryString ? `?${queryString}` : "";
}

async function fetchJson(url, options) {
  const response = await fetch(url, options);
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.error || "Request failed");
  }

  return payload;
}

function renderTickets() {
  ticketList.innerHTML = "";
  totalCount.textContent = String(state.tickets.length);
  openCount.textContent = String(state.tickets.filter((ticket) => ticket.status === "open").length);

  if (!state.tickets.length) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = "No tickets match the current view.";
    ticketList.append(empty);
    return;
  }

  state.tickets.forEach((ticket) => {
    const card = ticketTemplate.content.firstElementChild.cloneNode(true);
    const priorityPill = card.querySelector(".priority-pill");
    const statusSelect = card.querySelector('[data-field="status"]');

    card.querySelector("h3").textContent = ticket.title;
    card.querySelector(".ticket-card__description").textContent = ticket.description;
    card.querySelector('[data-field="customerEmail"]').textContent = ticket.customerEmail;
    card.querySelector('[data-field="updatedAt"]').textContent = formatDate(ticket.updatedAt);
    priorityPill.textContent = ticket.priority;
    priorityPill.classList.add(`is-${ticket.priority}`);
    statusSelect.value = ticket.status;
    statusSelect.addEventListener("change", () => updateTicketStatus(ticket.id, statusSelect.value));

    ticketList.append(card);
  });
}

async function loadTickets() {
  const payload = await fetchJson(`/api/tickets${getTicketParams()}`);
  state.tickets = payload.tickets;
  renderTickets();
}

async function updateTicketStatus(id, status) {
  try {
    await fetchJson(`/api/tickets/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ status })
    });
    await loadTickets();
  } catch (error) {
    setFormStatus(error.message, true);
  }
}

ticketForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  setFormStatus("Creating...");

  const formData = new FormData(ticketForm);
  const payload = Object.fromEntries(formData.entries());

  try {
    await fetchJson("/api/tickets", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });
    ticketForm.reset();
    ticketForm.priority.value = "medium";
    setFormStatus("Created");
    await loadTickets();
  } catch (error) {
    setFormStatus(error.message, true);
  }
});

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    state.status = tab.dataset.status;
    tabs.forEach((item) => item.classList.toggle("is-active", item === tab));
    loadTickets();
  });
});

searchInput.addEventListener("input", () => {
  state.query = searchInput.value.trim();
  loadTickets();
});

refreshButton.addEventListener("click", () => {
  loadTickets();
});

loadTickets().catch((error) => {
  ticketList.innerHTML = `<p class="empty-state">${error.message}</p>`;
});
