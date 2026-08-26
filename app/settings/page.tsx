"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, FileUp, Link2, Plus, RefreshCw, Save, Trash2 } from "lucide-react";
import Link from "next/link";
import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";

type Conference = {
  id: number;
  name: string;
  field: string;
  deadline: string | null;
  abstract_deadline: string | null;
  source_name: string | null;
  source_url: string | null;
  deadline_status: "sourced" | "estimated" | "manual" | "pending";
  manually_overridden: number;
  last_checked_at: string | null;
};

function parseCsv(text: string) {
  const lines = text.replace(/^\uFEFF/, "").split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const rows = lines.map((line) => {
    const cells = line.match(/(?:^|,)("(?:[^"]|"")*"|[^,]*)/g)?.map((cell) => cell.replace(/^,/, "").trim().replace(/^"|"$/g, "").replace(/""/g, '"')) ?? [];
    return { name: cells[0]?.trim(), field: cells[1]?.trim() };
  });
  if (rows[0] && /^(name|conference)$/i.test(rows[0].name)) rows.shift();
  return rows.filter((row): row is { name: string; field: string } => Boolean(row.name && row.field));
}

export default function SettingsPage() {
  const [conferences, setConferences] = useState<Conference[]>([]);
  const [name, setName] = useState("");
  const [field, setField] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    const response = await fetch("/api/conferences", { cache: "no-store" });
    if (!response.ok) throw new Error("Could not load conferences.");
    const data = await response.json() as { conferences: Conference[] };
    setConferences(data.conferences);
  }, []);

  useEffect(() => {
    const storedAutoRefresh = localStorage.getItem("deadline-clock:auto-refresh") !== "false";
    queueMicrotask(() => setAutoRefresh(storedAutoRefresh));
    fetch("/api/conferences", { cache: "no-store" })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error("Could not load conferences.")))
      .then((data: { conferences: Conference[] }) => setConferences(data.conferences))
      .catch((error: Error) => setMessage(error.message));
  }, []);

  async function addItems(items: { name: string; field: string }[]) {
    setBusy(true); setMessage("Searching trusted deadline data…");
    try {
      const response = await fetch("/api/conferences", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ items }) });
      const data = await response.json() as { error?: string; added?: number };
      if (!response.ok) throw new Error(data.error ?? "Could not add conferences.");
      await load();
      setMessage(`${data.added ?? items.length} conference${items.length === 1 ? "" : "s"} added.`);
    } catch (error) { setMessage(error instanceof Error ? error.message : "Something went wrong."); }
    finally { setBusy(false); }
  }

  async function handleAdd(event: FormEvent) {
    event.preventDefault();
    if (!name.trim() || !field.trim()) return;
    await addItems([{ name: name.trim(), field: field.trim() }]);
    setName(""); setField("");
  }

  async function handleCsv(file?: File) {
    if (!file) return;
    const items = parseCsv(await file.text());
    if (!items.length) { setMessage("No valid rows found. Use: name,field"); return; }
    await addItems(items);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function refreshAll() {
    setBusy(true); setMessage("Refreshing unlocked deadlines…");
    try {
      const response = await fetch("/api/conferences/refresh", { method: "POST" });
      const data = await response.json() as { refreshed?: number; error?: string };
      if (!response.ok) throw new Error(data.error ?? "Refresh failed.");
      localStorage.setItem("deadline-clock:last-refresh", new Date().toISOString());
      await load(); setMessage(`${data.refreshed ?? 0} deadlines checked.`);
    } catch (error) { setMessage(error instanceof Error ? error.message : "Refresh failed."); }
    finally { setBusy(false); }
  }

  async function saveManual(item: Conference) {
    const editedName = (document.getElementById(`name-${item.id}`) as HTMLInputElement)?.value.trim();
    const editedField = (document.getElementById(`field-${item.id}`) as HTMLInputElement)?.value.trim();
    const deadline = (document.getElementById(`deadline-${item.id}`) as HTMLInputElement)?.value;
    if (!editedName || !editedField || !deadline) { setMessage("Name, research field, and deadline are required."); return; }
    setBusy(true);
    try {
      const response = await fetch(`/api/conferences/${item.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: editedName, field: editedField, deadline, abstractDeadline: item.abstract_deadline }) });
      if (!response.ok) throw new Error("Could not save the deadline.");
      await load(); setMessage(`${editedName} was updated and manually locked.`);
    } catch (error) { setMessage(error instanceof Error ? error.message : "Save failed."); }
    finally { setBusy(false); }
  }

  async function remove(item: Conference) {
    setBusy(true);
    try {
      await fetch(`/api/conferences/${item.id}`, { method: "DELETE" });
      await load(); setMessage(`${item.name} removed.`);
    } finally { setBusy(false); }
  }

  return <main className="settings-shell">
    <header className="settings-topbar">
      <div>
        <Link className="back-link" href="/"><ArrowLeft size={16} /> Back to clock</Link>
        <h1>Conference settings</h1>
        <p>Add only a name and research field. Deadline Clock searches and maintains the deadline metadata.</p>
      </div>
      <div className="settings-actions"><ThemeToggle /><Button onClick={refreshAll} disabled={busy}><RefreshCw className={busy ? "spin" : ""} /> Refresh deadlines</Button></div>
    </header>

    <section className="settings-grid">
      <article className="settings-card add-card">
        <div className="card-kicker">ADD ONE</div><h2>New conference</h2>
        <form onSubmit={handleAdd} className="add-form">
          <label><span>Conference name</span><Input value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. INFOCOM" required /></label>
          <label><span>Research field</span><Input value={field} onChange={(event) => setField(event.target.value)} placeholder="e.g. Computer Networks" required /></label>
          <Button type="submit" disabled={busy}><Plus /> Add & search</Button>
        </form>
      </article>

      <article className="settings-card import-card">
        <div className="card-kicker">BATCH</div><h2>Import CSV</h2>
        <p>Upload up to 100 rows. Required columns: <code>name,field</code>.</p>
        <input ref={fileRef} className="file-input" id="conference-csv" type="file" accept=".csv,text/csv" onChange={(event) => handleCsv(event.target.files?.[0])} />
        <Button variant="outline" asChild><label htmlFor="conference-csv"><FileUp /> Choose CSV</label></Button>
      </article>

      <article className="settings-card automation-card">
        <div><div className="card-kicker">AUTOMATION</div><h2>Keep deadlines fresh</h2><p>When enabled, the clock refreshes unlocked conferences at most once every 24 hours.</p></div>
        <Switch checked={autoRefresh} onCheckedChange={(checked) => { setAutoRefresh(checked); localStorage.setItem("deadline-clock:auto-refresh", String(checked)); }} aria-label="Automatically refresh deadlines" />
      </article>
    </section>

    {message && <div className="settings-message" role="status">{message}</div>}

    <section className="settings-card managed-card">
      <div className="managed-heading"><div><div className="card-kicker">MANAGED</div><h2>Conference library</h2></div><span>{conferences.length} conferences</span></div>
      <Table>
        <TableHeader><TableRow><TableHead>Conference</TableHead><TableHead>Field</TableHead><TableHead>Deadline</TableHead><TableHead>Source & status</TableHead><TableHead className="action-head">Actions</TableHead></TableRow></TableHeader>
        <TableBody>
          {conferences.map((item) => <TableRow key={item.id}>
            <TableCell><Input className="conference-input name-input" defaultValue={item.name} id={`name-${item.id}`} aria-label={`Conference name for ${item.name}`} /></TableCell>
            <TableCell className="field-cell"><Input className="conference-input field-input" defaultValue={item.field} id={`field-${item.id}`} aria-label={`Research field for ${item.name}`} /></TableCell>
            <TableCell><Input className="deadline-input" type="date" defaultValue={item.deadline ?? ""} id={`deadline-${item.id}`} /></TableCell>
            <TableCell>
              <span className={`source-status ${item.deadline_status}`}>{item.deadline_status}</span>
              {item.source_url ? <a className="source-link" href={item.source_url} target="_blank" rel="noreferrer"><Link2 size={12} /> {item.source_name}</a> : <small>{item.source_name ?? "No source found"}</small>}
              {item.last_checked_at && <small>Checked {new Date(item.last_checked_at).toLocaleDateString()}</small>}
            </TableCell>
            <TableCell><div className="row-actions">
              <Button size="icon-sm" variant="outline" title="Save conference changes" onClick={() => saveManual(item)} disabled={busy}><Save /></Button>
              <Button size="icon-sm" variant="ghost" title="Remove conference" onClick={() => remove(item)} disabled={busy}><Trash2 /></Button>
            </div></TableCell>
          </TableRow>)}
          {!conferences.length && <TableRow><TableCell colSpan={5}><div className="table-empty">No managed conferences yet. Add one above or import a CSV.</div></TableCell></TableRow>}
        </TableBody>
      </Table>
      <p className="managed-footnote">Sourced = current-year date found · Estimated = previous-year date shifted forward · Manual = protected from automatic refresh · Pending = no date found.</p>
    </section>
  </main>;
}
