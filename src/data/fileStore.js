import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
const dataUrl = new URL("../../data/tickets.json", import.meta.url);
const dataPath = fileURLToPath(dataUrl);
export async function readTickets() {
const raw = await readFile(dataPath, "utf8");
return JSON.parse(raw);
}
export async function writeTickets(tickets) {
const json = JSON.stringify(tickets, null, 2) + "\n";
await writeFile(dataPath, json, "utf8");
}