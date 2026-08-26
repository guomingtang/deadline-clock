"use client";

import { CalendarDays, Clock3 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type Deadline = { name: string; short: string; date: string; color: string; note?: string };

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
  { name: "INFOCOM", short: "INFOCOM", date: "2027-07-31", color: "#3b82f6" },
  { name: "HPCA", short: "HPCA", date: "2025-08-01", color: "#4f46e5" },
  { name: "ASPLOS Fall", short: "ASPLOS F", date: "2026-09-09", color: "#06b6d4" },
  { name: "e-Energy Fall", short: "e-Energy", date: "2025-09-18", color: "#84cc16" },
  { name: "NSDI Fall", short: "NSDI F", date: "2026-09-18", color: "#10b981" },
  { name: "EuroSys Fall", short: "EuroSys F", date: "2026-09-25", color: "#64748b" },
  { name: "MLSys", short: "MLSys", date: "2025-10-30", color: "#111827" },
  { name: "ISCA", short: "ISCA", date: "2024-11-22", color: "#8b5cf6" },
];

const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

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

function DeadlineDial({ year, now, items }: { year: number; now: Date; items: Deadline[] }) {
  const total = daysInYear(year);
  const nowAngle = now.getFullYear() === year ? (dayOfYear(now) / total) * 360 : now.getFullYear() > year ? 360 : 0;
  const currentPoint = point(nowAngle, 198);
  const positioned = items.map((item, index) => {
    const date = new Date(`${item.date}T12:00:00`);
    const angle = (dayOfYear(date) / total) * 360;
    return { ...item, marker: point(angle, 230), elbow: point(angle, 255 + (index % 3) * 9), label: point(angle, 274 + (index % 3) * 13) };
  });

  return (
    <div className="dial-wrap" aria-label={`Deadline clock for ${year}`}>
      <svg className="dial" viewBox="0 0 600 600" role="img">
        <title>{year} conference deadline dial</title>
        <defs><filter id="soft-shadow" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="#0f172a" floodOpacity="0.12" /></filter></defs>
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
          const right = item.label.x >= 300, endX = item.label.x + (right ? 10 : -10);
          return <g key={`${item.name}-${item.date}`}>
            <path d={`M ${item.marker.x} ${item.marker.y} L ${item.elbow.x} ${item.elbow.y} L ${endX} ${item.label.y}`} fill="none" stroke={item.color} strokeWidth="1.15" strokeDasharray="2.5 2.5" opacity="0.7" />
            <circle cx={item.marker.x} cy={item.marker.y} r="7" fill={item.color} stroke="white" strokeWidth="3" />
            <text x={item.label.x} y={item.label.y + 3} textAnchor={right ? "start" : "end"} className="deadline-label" fill={item.color}>{item.short}</text>
          </g>;
        })}
        <line x1="300" y1="300" x2={currentPoint.x} y2={currentPoint.y} stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx={currentPoint.x} cy={currentPoint.y} r="5" fill="#ef4444" stroke="white" strokeWidth="2" />
        <circle cx="300" cy="300" r="6" fill="#ef4444" stroke="white" strokeWidth="3" />
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
  useEffect(() => { const timer = window.setInterval(() => setNow(new Date()), 1000); return () => window.clearInterval(timer); }, []);
  const yearItems = useMemo(() => deadlines.filter((item) => Number(item.date.slice(0, 4)) === year), [year]);
  const sorted = useMemo(() => [...yearItems].sort((a, b) => a.date.localeCompare(b.date)), [yearItems]);

  return <main className="app-shell">
    <header className="topbar">
      <div><div className="eyebrow"><span className="live-dot" /> RESEARCH PLANNER</div><h1>Deadline Clock</h1><p>Conference deadlines, mapped across the year.</p></div>
      <div className="toolbar">
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
