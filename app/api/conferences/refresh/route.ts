import { env } from "cloudflare:workers";
import { resolveConferenceDeadline } from "@/lib/deadline-search";

type Row = { id: number; name: string; field: string };

export async function POST() {
  const result = await env.DB.prepare("SELECT id, name, field FROM conferences WHERE manually_overridden = 0 ORDER BY id").all<Row>();
  const resolved = await Promise.all(result.results.map(async (row) => ({ ...row, ...(await resolveConferenceDeadline(row.name, row.field)) })));
  if (resolved.length) {
    await env.DB.batch(resolved.map((item) => env.DB.prepare(
      "UPDATE conferences SET deadline = ?, abstract_deadline = ?, timezone = ?, source_name = ?, source_url = ?, website_url = COALESCE(?, website_url), deadline_status = ?, last_checked_at = ? WHERE id = ? AND manually_overridden = 0"
    ).bind(item.deadline, item.abstractDeadline, item.timezone, item.sourceName, item.sourceUrl, item.conferenceUrl, item.deadlineStatus, item.lastCheckedAt, item.id)));
  }
  return Response.json({ refreshed: resolved.length });
}
