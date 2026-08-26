import { env } from "cloudflare:workers";
import { resolveConferenceDeadline } from "@/lib/deadline-search";

type NewConference = { name?: unknown; field?: unknown };

function cleanItem(item: NewConference) {
  const name = typeof item.name === "string" ? item.name.trim().slice(0, 120) : "";
  const field = typeof item.field === "string" ? item.field.trim().slice(0, 120) : "";
  return name && field ? { name, field } : null;
}

export async function GET() {
  const result = await env.DB.prepare("SELECT * FROM conferences ORDER BY created_at DESC, id DESC").all();
  return Response.json({ conferences: result.results });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as { items?: NewConference[] } | null;
  const items = (body?.items ?? []).map(cleanItem).filter((item): item is { name: string; field: string } => Boolean(item));
  if (!items.length) return Response.json({ error: "Provide at least one conference name and research field." }, { status: 400 });
  if (items.length > 100) return Response.json({ error: "A batch can contain at most 100 conferences." }, { status: 400 });

  const resolved = await Promise.all(items.map(async (item) => ({ ...item, ...(await resolveConferenceDeadline(item.name, item.field)) })));
  await env.DB.batch(resolved.map((item) => env.DB.prepare(
    "INSERT INTO conferences (name, field, deadline, abstract_deadline, timezone, source_name, source_url, deadline_status, manually_overridden, last_checked_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?)"
  ).bind(item.name, item.field, item.deadline, item.abstractDeadline, item.timezone, item.sourceName, item.sourceUrl, item.deadlineStatus, item.lastCheckedAt)));

  const result = await env.DB.prepare("SELECT * FROM conferences ORDER BY created_at DESC, id DESC").all();
  return Response.json({ conferences: result.results, added: items.length }, { status: 201 });
}
