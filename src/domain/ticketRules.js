export const priorities = ["low", "medium", "high"];
export const statuses  = ["open", "in_progress", "closed"];
export function createTicketId(tickets) {
const max = tickets.reduce((acc, ticket) => {
const numericPart = Number(ticket.id.split("-")[1]) || 0;
return Math.max(acc, numericPart);
}, 0);
return `TCK-${String(max + 1).padStart(3, "0")}`;
}