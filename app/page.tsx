"use client";

import { CalendarDays, Clock3, Settings2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Deadline = { name: string; short: string; date: string; color: string; note?: string; sourceStatus?: string };
type ManagedConference = { id: number; name: string; deadline: string | null; deadline_status: string; source_name: string | null };

const deadlines: Deadline[] = [
  { name: "ICDCS", short: "ICDCS", date: "2026-01-14", color: "#2563eb" },
  { name: "e-Energy Spring", short: "e-Energy", date: "2026-01-29", color: "#65a30d" },
  { name: "BuildSys", short: "BuildSys", date: "2026-01-29", color: "#64748b" },
  { name: "SIGCOMM 2026", short: "SIGCOMM", date: "2026-02-06", color: "#dc2626" },
  { name: "SC", short: "SC", date: "2025-04-14", color: "#8b5cf6" },
  { name: "ASPLOS Spring", short: "ASPLOS S", date: "2026-04-15", color: "#0ea5e9" },
  { name: "NSDI Spring", short: "NSDI S", date: "2026-04-24", color: "#059669" },
  { name: "SmartGridComm", short: "SGComm", date: "2026-04-26", color: "#0891b2" },
  { name: "NeurIPS", short: "NeurIPS", date: "2026-05-06", color: "#9333ea" },
  { name: "EuroSys Spring", short: "EuroSys S", date: "2026-05-15", color: "#475569" },
  { name: "HotCarbon", short: "HotCarbon", date: "2026-05-18", color: "#f97316" },
  { name: "ATC", short: "ATC", date: "2026-06-10", color: "#7c3aed" },
  { name: "HotNets", short: "HotNets", date: "2025-07-01", color: "#ea580c" },
  { name: "SoCC", short: "SoCC", date: "2026-07-07", color: "#14b8a6", note: "Round 1; alternative date: Jul 14" },
  { name: "INFOCOM 2027", short: "INFOCOM", date: "2026-07-31", color: "#3b82f6" },
  { name: "HPCA", short: "HPCA", date: "2025-08-01", color: "#4f46e5" },
  { name: "ASPLOS Fall", short: "ASPLOS F", date: "2026-09-09", color: "#06b6d4" },
  { name: "e-Energy Fall", short: "e-Energy", date: "2025-09-18", color: "#84cc16" },
  { name: "NSDI Fall", short: "NSDI F", date: "2026-09-18", color: "#10b981" },
  { name: "EuroSys Fall", short: "EuroSys F", date: "2026-09-25", color: "#64748b" },
  { name: "MLSys", short: "MLSys", date: "2025-10-30", color: "#111827" },
  { name: "ISCA", short: "ISCA", date: "2024-11-22", color: "#8b5cf6" },
];

const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
const dynamicColors = ["#2563eb", "#7c3aed", "#0891b2", "#059669", "#db2777", "#ea580c", "#4f46e5"];

function shortName(name: string) {
  const compact = name.replace(/\b20\d{2}\b/g, "").trim();
  return compact.length > 12 ? `${compact.slice(0, 11)}…` : compact;
}

function daysInYear(year: number) { return new Date(year, 1, 29).getMonth() === 1 ? 366 : 365; }
function dayOfYear(date: Date) {
  const start = new Date(date.getFullYear(), 0, 0);
  return Math.floor((date.getTime() - start.getTime()) / 86400000);
}
function point(angle: number, radius: number) {
  const rad = ((angle - 90) * Math.PI) / 180;
  return { x: 300 + radius * Math.cos(rad), y: 300 + radius * Math.sin(rad) };
}
function sectorPath(startAngle: number, endAngle: number, inner: number, outer: number) {
  const a = point(startAngle, outer), b = point(endAngle, outer), c = point(endAngle, inner), d = point(startAngle, inner);
  const large = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${a.x} ${a.y} A ${outer} ${outer} 0 ${large} 1 ${b.x} ${b.y} L ${c.x} ${c.y} A ${inner} ${inner} 0 ${large} 0 ${d.x} ${d.y} Z`;
}
function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-CA", { year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
}

function layoutDeadlineLabels(items: Deadline[], total: number) {
  const raw = items.map((item) => {
    const date = new Date(`${item.date}T12:00:00`);
    const angle = (dayOfYear(date) / total) * 360;
    const marker = point(angle, 230);
    const elbow = point(angle, 252);
    return { ...item, angle, marker, elbow, side: marker.x >= 300 ? "right" as const : "left" as const, labelY: elbow.y, lane: 0 };
  });

  const arrange = (side: "left" | "right") => {
    const group = raw.filter((item) => item.side === side).sort((a, b) => a.labelY - b.labelY);
    const minY = 38;
    const maxY = 562;
    const gap = group.length > 1 ? Math.min(25, (maxY - minY) / (group.length - 1)) : 0;
    group.forEach((item, index) => {
      const desired = Math.max(minY, Math.min(maxY, item.labelY));
      item.labelY = index === 0 ? desired : Math.max(desired, group[index - 1].labelY + gap);
    });
    if (group.length && group[group.length - 1].labelY > maxY) {
      const overflow = group[group.length - 1].labelY - maxY;
      group.forEach((item) => { item.labelY -= overflow; });
    }
    if (group.length && group[0].labelY < minY) {
      const shift = minY - group[0].labelY;
      group.forEach((item) => { item.labelY += shift; });
    }
    group.forEach((item, index) => { item.lane = index % 2; });
    return group;
  };

  return [...arrange("left"), ...arrange("right")];
}

function DeadlineDial({ year, now, items }: { year: number; now: Date; items: Deadline[] }) {
  const total = daysInYear(year);
  const nowAngle = now.getFullYear() === year ? (dayOfYear(now) / total) * 360 : now.getFullYear() > year ? 360 : 0;
  const currentPoint = point(nowAngle, 214);
  const needleTail = point(nowAngle + 180, 27);
  const ux = (currentPoint.x - 300) / 214;
  const uy = (currentPoint.y - 300) / 214;
  const headBase = { x: currentPoint.x - ux * 20, y: currentPoint.y - uy * 20 };
  const arrowPoints = `${currentPoint.x},${currentPoint.y} ${headBase.x - uy * 8},${headBase.y + ux * 8} ${headBase.x + uy * 8},${headBase.y - ux * 8}`;
  const positioned = layoutDeadlineLabels(items, total);

  return (
    <div className="dial-wrap" aria-label={`Deadline clock for ${year}`}>
      <svg className="dial" viewBox="-90 -30 780 660" role="img">
        <title>{year} conference deadline dial</title>
        <defs>
          <filter id="soft-shadow" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="#0f172a" floodOpacity="0.12" /></filter>
          <filter id="needle-glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="5" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
          <linearGradient id="needle-gradient" gradientUnits="userSpaceOnUse" x1="300" y1="300" x2={currentPoint.x} y2={currentPoint.y}><stop offset="0" stopColor="#fb7185" /><stop offset="0.55" stopColor="#ef4444" /><stop offset="1" stopColor="#be123c" /></linearGradient>
          <radialGradient id="hub-gradient"><stop offset="0" stopColor="#ffffff" /><stop offset="0.55" stopColor="#fecdd3" /><stop offset="1" stopColor="#e11d48" /></radialGradient>
        </defs>
        <circle cx="300" cy="300" r="235" fill="#f8fafc" stroke="#dbe5f1" strokeWidth="2" filter="url(#soft-shadow)" />
        {months.map((month, i) => {
          const start = (i / 12) * 360, end = ((i + 1) / 12) * 360;
          const mid = point((start + end) / 2, 196), boundaryA = point(start, 156), boundaryB = point(start, 235);
          return <g key={month}>
            <path d={sectorPath(start, end, 156, 235)} fill={i % 2 ? "#fbfdff" : "#f5f8fc"} />
            <line x1={boundaryA.x} y1={boundaryA.y} x2={boundaryB.x} y2={boundaryB.y} stroke="#cbd8e8" strokeWidth="1.5" />
            <text x={mid.x} y={mid.y + 4} textAnchor="middle" className="month-label">{month}</text>
          </g>;
        })}
        <path d={sectorPath(0, Math.max(nowAngle, 0.5), 84, 150)} fill="#ef4444" opacity="0.12" />
        <circle cx="300" cy="300" r="156" fill="white" stroke="#d4deea" strokeWidth="2" />
        <circle cx="300" cy="300" r="83" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1.5" />
        {Array.from({ length: 48 }, (_, i) => {
          const angle = (i / 48) * 360, a = point(angle, i % 4 === 0 ? 229 : 232), b = point(angle, 237);
          return <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#9fb1c7" strokeWidth={i % 4 === 0 ? 1.6 : 0.8} />;
        })}
        {positioned.map((item) => {
          const right = item.side === "right";
          const radialY = item.labelY - 300;
          const contourX = Math.sqrt(Math.max(0, 266 * 266 - radialY * radialY));
          const outwardOffset = 18 + item.lane * 13;
          const labelX = right ? 300 + contourX + outwardOffset : 300 - contourX - outwardOffset;
          const lineEndX = right ? labelX - 11 : labelX + 11;
          const textWidth = item.short.length * 6.1;
          const boxX = right ? labelX - 8 : labelX - textWidth - 8;
          return <g key={`${item.name}-${item.date}`}>
            <path d={`M ${item.marker.x} ${item.marker.y} L ${item.elbow.x} ${item.elbow.y} L ${lineEndX} ${item.labelY}`} fill="none" stroke={item.color} strokeWidth="1.15" strokeDasharray="2.5 2.5" opacity="0.62" />
            <circle cx={item.marker.x} cy={item.marker.y} r="7" fill={item.color} stroke="white" strokeWidth="3" />
            <rect x={boxX} y={item.labelY - 10} width={textWidth + 16} height="20" rx="6" className="deadline-label-box" stroke={item.color} />
            <text x={labelX} y={item.labelY + 3.2} textAnchor={right ? "start" : "end"} className="deadline-label" fill={item.color}>{item.short}</text>
          </g>;
        })}
        <line x1={needleTail.x} y1={needleTail.y} x2={currentPoint.x} y2={currentPoint.y} stroke="#fb7185" strokeWidth="13" strokeLinecap="round" opacity="0.16" filter="url(#needle-glow)" />
        <line x1={needleTail.x} y1={needleTail.y} x2={currentPoint.x} y2={currentPoint.y} stroke="url(#needle-gradient)" strokeWidth="5.5" strokeLinecap="round" />
        <line x1={needleTail.x} y1={needleTail.y} x2={currentPoint.x} y2={currentPoint.y} stroke="white" strokeWidth="1.1" strokeLinecap="round" opacity="0.72" />
        <polygon points={arrowPoints} fill="#be123c" stroke="white" strokeWidth="1.5" strokeLinejoin="round" />
        <circle cx={currentPoint.x} cy={currentPoint.y} r="12" fill="none" stroke="#fb7185" strokeWidth="2" opacity="0.32" className="needle-pulse" />
        <circle cx={currentPoint.x} cy={currentPoint.y} r="4.5" fill="#be123c" stroke="white" strokeWidth="2" />
        <circle cx="300" cy="300" r="14" fill="#fff1f2" stroke="white" strokeWidth="4" filter="url(#soft-shadow)" />
        <circle cx="300" cy="300" r="9" fill="url(#hub-gradient)" stroke="#be123c" strokeWidth="1.5" />
        <circle cx="300" cy="300" r="2.5" fill="white" />
        <text x="300" y="268" textAnchor="middle" className="today-kicker">TODAY</text>
        <text x="300" y="300" textAnchor="middle" className="today-date">{formatDate(now)}</text>
        <text x="300" y="325" textAnchor="middle" className="today-time">{now.toLocaleTimeString("en-GB")}</text>
        <text x="300" y="346" textAnchor="middle" className="today-meta">{items.length} DEADLINES · {year}</text>
      </svg>
    </div>
  );
}

export default function Home() {
  const [now, setNow] = useState(() => new Date());
  const [year, setYear] = useState(2026);
  const [managed, setManaged] = useState<ManagedConference[]>([]);
  useEffect(() => { const timer = window.setInterval(() => setNow(new Date()), 1000); return () => window.clearInterval(timer); }, []);
  useEffect(() => {
    async function load() {
      const autoRefresh = localStorage.getItem("deadline-clock:auto-refresh") !== "false";
      const lastRefresh = Date.parse(localStorage.getItem("deadline-clock:last-refresh") ?? "");
      if (autoRefresh && (!Number.isFinite(lastRefresh) || Date.now() - lastRefresh > 86400000)) {
        await fetch("/api/conferences/refresh", { method: "POST" }).catch(() => null);
        localStorage.setItem("deadline-clock:last-refresh", new Date().toISOString());
      }
      const response = await fetch("/api/conferences", { cache: "no-store" });
      if (response.ok) setManaged(((await response.json()) as { conferences: ManagedConference[] }).conferences);
    }
    load().catch(() => null);
  }, []);
  const allDeadlines = useMemo(() => {
    const custom = managed.filter((item) => item.deadline).map((item, index) => ({
      name: item.name,
      short: shortName(item.name),
      date: item.deadline as string,
      color: dynamicColors[index % dynamicColors.length],
      note: item.deadline_status === "estimated" ? "Estimated from previous year" : item.deadline_status === "manual" ? "Manual override" : item.source_name ?? undefined,
      sourceStatus: item.deadline_status,
    }));
    const keys = new Set(custom.map((item) => `${item.name.toLowerCase()}-${item.date}`));
    return [...deadlines.filter((item) => !keys.has(`${item.name.toLowerCase()}-${item.date}`)), ...custom];
  }, [managed]);
  const yearItems = useMemo(() => allDeadlines.filter((item) => Number(item.date.slice(0, 4)) === year), [allDeadlines, year]);
  const sorted = useMemo(() => [...yearItems].sort((a, b) => a.date.localeCompare(b.date)), [yearItems]);

  return <main className="app-shell">
    <header className="topbar">
      <div><div className="eyebrow"><span className="live-dot" /> RESEARCH PLANNER</div><h1>Deadline Clock</h1><p>Conference deadlines, mapped across the year.</p></div>
      <div className="toolbar">
        <Link className="settings-link" href="/settings"><Settings2 size={17} /> Manage</Link>
        <div className="live-time"><Clock3 size={17} /> {now.toLocaleTimeString("en-GB")} <span /> {formatDate(now)}</div>
        <label className="year-select"><span>YEAR</span><select value={year} onChange={(e) => setYear(Number(e.target.value))} aria-label="Select year">{[2024, 2025, 2026, 2027].map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
      </div>
    </header>
    <section className="workspace">
      <div className="dial-panel">
        <div className="panel-heading"><div><span className="section-number">01</span><h2>{year} year dial</h2></div><p>The red hand advances in real time</p></div>
        <DeadlineDial year={year} now={now} items={yearItems} />
        <div className="legend"><span><i className="red" /> Today</span><span><i className="blue" /> Submission deadline</span></div>
      </div>
      <aside className="deadline-panel">
        <div className="panel-heading list-heading"><div><span className="section-number">02</span><h2>Deadline list</h2></div><span className="count-badge">{sorted.length}</span></div>
        <div className="deadline-list">
          {sorted.length ? sorted.map((item) => {
            const date = new Date(`${item.date}T23:59:59`), days = Math.ceil((date.getTime() - now.getTime()) / 86400000);
            const status = year === now.getFullYear() ? (days < 0 ? "PAST" : `${days}D`) : item.date.slice(5);
            return <article className="deadline-row" key={`${item.name}-${item.date}`}>
              <div className="date-tile" style={{ "--accent": item.color } as React.CSSProperties}><span>{date.toLocaleDateString("en-US", { month: "short" }).toUpperCase()}</span><strong>{date.getDate()}</strong></div>
              <div className="deadline-copy"><h3>{item.name}</h3><p>{item.date}{item.note ? ` · ${item.note}` : ""}</p></div>
              <span className={`status ${status === "PAST" ? "past" : ""}`}>{status}</span>
            </article>;
          }) : <div className="empty-state"><CalendarDays size={30} /><strong>No deadlines</strong><span>Select another year.</span></div>}
        </div>
        <p className="source-note">Dates transcribed from the supplied reference. Verify dates with the official calls for papers before submission.</p>
      </aside>
    </section>
  </main>;
}
