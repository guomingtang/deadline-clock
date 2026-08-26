import { env } from "cloudflare:workers";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const body = await request.json().catch(() => null) as { deadline?: unknown; abstractDeadline?: unknown } | null;
  const deadline = typeof body?.deadline === "string" && /^\d{4}-\d{2}-\d{2}$/.test(body.deadline) ? body.deadline : null;
  const abstractDeadline = typeof body?.abstractDeadline === "string" && /^\d{4}-\d{2}-\d{2}$/.test(body.abstractDeadline) ? body.abstractDeadline : null;
  if (!/^\d+$/.test(id) || !deadline) return Response.json({ error: "A valid conference id and deadline are required." }, { status: 400 });

  await env.DB.prepare("UPDATE conferences SET deadline = ?, abstract_deadline = ?, deadline_status = 'manual', manually_overridden = 1, source_name = 'Manual override', source_url = NULL, last_checked_at = ? WHERE id = ?")
    .bind(deadline, abstractDeadline, new Date().toISOString(), Number(id)).run();
  return Response.json({ ok: true });
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  if (!/^\d+$/.test(id)) return Response.json({ error: "Invalid conference id." }, { status: 400 });
  await env.DB.prepare("DELETE FROM conferences WHERE id = ?").bind(Number(id)).run();
  return Response.json({ ok: true });
}
