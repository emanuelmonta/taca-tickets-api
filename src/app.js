import express from "express";
import {
readTickets,
writeTickets
} from "./data/fileStore.js";
import {
createTicketId,
priorities,
statuses
} from "./domain/ticketRules.js";
export const app = express();
app.use(express.json());
app.get("/health", (req, res) => {
res.status(200).json({
status: "ok",
service: "taca-tickets-api"
});
});
app.get("/api/tickets", async (req, res, next) => {
try {
const tickets = await readTickets();
res.status(200).json({
data: tickets,
count: tickets.length
});
} catch (error) {
next(error);
}
});
app.get("/api/tickets/:id", async (req, res, next) => {
try {
const tickets = await readTickets();
const ticket = tickets.find(
(item) => item.id === req.params.id
);
if (!ticket) {
return res.status(404).json({
error: {
code: "TICKET_NOT_FOUND",
message: "Ticket no encontrado"
}
});
}
res.status(200).json({
data: ticket
});
} catch (error) {
next(error);
}
});
app.post("/api/tickets", async (req, res, next) => {
try {
const {
title,
description,
priority,
requester
} = req.body ?? {};
if (
!title ||
!description ||
!priority ||
!requester ||
!priorities.includes(priority)
) {
return res.status(400).json({
error: {
code: "INVALID_INPUT",
message: "Datos de entrada incompletos o inválidos"
}
});
}
const tickets = await readTickets();
const ticket = {
id: createTicketId(tickets),
title,
description,
priority,
status: "open",
requester
};
tickets.push(ticket);
await writeTickets(tickets);
res
.location(`/api/tickets/${ticket.id}`)
.status(201)
.json({
data: ticket
});
} catch (error) {
next(error);
}
});
app.patch("/api/tickets/:id", async (req, res, next) => {
try {
const tickets = await readTickets();
const index = tickets.findIndex(
(item) => item.id === req.params.id
);
if (index < 0) {
return res.status(404).json({
error: {
code: "TICKET_NOT_FOUND",
message: "Ticket no encontrado"
}
});
}
const patch = req.body ?? {};
if (
patch.priority !== undefined &&
!priorities.includes(patch.priority)
) {
return res.status(400).json({
error: {
code: "INVALID_PRIORITY",
message: "Prioridad inválida"
}
});
}
if (
patch.status !== undefined &&
!statuses.includes(patch.status)
) {
return res.status(400).json({
error: {
code: "INVALID_STATUS",
message: "Estado inválido"
}
});
}
const allowed = [
"title",
"description",
"priority",
"status"
];
const changes = Object.fromEntries(
Object.entries(patch).filter(([key]) =>
allowed.includes(key)
)
);
if (Object.keys(changes).length === 0) {
return res.status(400).json({
error: {
code: "EMPTY_PATCH",
message: "No hay campos permitidos para actualizar"
}
});
}
tickets[index] = {
...tickets[index],
...changes
};
await writeTickets(tickets);
res.status(200).json({
data: tickets[index]
});
} catch (error) {
next(error);
}
});
app.delete("/api/tickets/:id", async (req, res, next) => {
try {
const tickets = await readTickets();
const index = tickets.findIndex(
(item) => item.id === req.params.id
);
if (index < 0) {
return res.status(404).json({
error: {
code: "TICKET_NOT_FOUND",
message: "Ticket no encontrado"
}
});
}
tickets.splice(index, 1);
await writeTickets(tickets);
res.status(204).end();
} catch (error) {
next(error);
}
});
app.use((req, res) => {
res.status(404).json({
error: {
code: "NOT_FOUND",
message: "Ruta no encontrada"
}
});
});
app.use((err, req, res, next) => {
console.error(err);
res.status(500).json({
error: {
code: "INTERNAL_ERROR",
message: "Error interno del servidor"
}
});
});