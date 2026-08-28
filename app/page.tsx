"use client";

import { CalendarDays, Clock3, ImageDown, Settings2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";

type Deadline = { name: string; short: string; date: string; color: string; note?: string; sourceStatus?: string; website?: string };
type ManagedConference = { id: number; name: string; deadline: string | null; deadline_status: string; source_name: string | null; source_url: string | null; website_url: string | null };

const deadlines: Deadline[] = [
  { name: "ICDCS 2026", short: "ICDCS", date: "2026-01-21", color: "#2563eb" },
  { name: "e-Energy 2026 — Winter", short: "e-Energy", date: "2026-01-29", color: "#65a30d" },
  { name: "BuildSys 2026", short: "BuildSys", date: "2026-01-29", color: "#64748b" },
  { name: "SIGCOMM 2026", short: "SIGCOMM", date: "2026-02-06", color: "#dc2626" },
  { name: "SC26", short: "SC26", date: "2026-04-08", color: "#8b5cf6" },
  { name: "ASPLOS 2027 — April", short: "ASPLOS Apr", date: "2026-04-15", color: "#0ea5e9" },
  { name: "NSDI 2027 — Spring", short: "NSDI Spring", date: "2026-04-23", color: "#059669" },
  { name: "SmartGridComm 2026", short: "SGComm", date: "2026-05-03", color: "#0891b2" },
  { name: "NeurIPS 2026", short: "NeurIPS", date: "2026-05-06", color: "#9333ea" },
  { name: "EuroSys 2027 — Spring", short: "EuroSys S", date: "2026-05-14", color: "#475569" },
  { name: "HotCarbon 2026", short: "HotCarbon", date: "2026-05-18", color: "#f97316" },
  { name: "ATC 2026", short: "ATC", date: "2026-06-10", color: "#7c3aed" },
  { name: "SoCC 2026 — Round 2", short: "SoCC R2", date: "2026-07-14", color: "#14b8a6" },
  { name: "HotNets 2026", short: "HotNets", date: "2026-07-16", color: "#ea580c" },
  { name: "HPCA 2027", short: "HPCA", date: "2026-07-31", color: "#4f46e5" },
  { name: "INFOCOM 2027", short: "INFOCOM", date: "2026-07-31", color: "#3b82f6" },
  { name: "ASPLOS 2027 — September", short: "ASPLOS Sep", date: "2026-09-09", color: "#06b6d4" },
  { name: "NSDI 2027 — Fall", short: "NSDI Fall", date: "2026-09-17", color: "#10b981" },
  { name: "e-Energy 2027 — Fall", short: "e-Energy", date: "2026-09-18", color: "#84cc16", note: "Estimated from previous official CFP" },
  { name: "EuroSys 2027 — Fall", short: "EuroSys F", date: "2026-09-24", color: "#64748b" },
  { name: "MLSys 2027", short: "MLSys", date: "2026-10-30", color: "#111827" },
  { name: "ISCA 2027", short: "ISCA", date: "2026-11-17", color: "#8b5cf6", note: "Estimated from previous official CFP" },
];

const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
const dynamicColors = ["#4f6b8f", "#6f628f", "#3f7481", "#4f7b69", "#94647a", "#9a704e", "#59658c"];
const conferenceSites: Record<string, string> = {
  "ICDCS 2026": "https://icdcs2026.icdcs.org/",
  "e-Energy 2026 — Winter": "https://energy.acm.org/conferences/eenergy/2026/",
  "e-Energy 2027 — Fall": "https://energy.acm.org/conferences/eenergy/",
  "BuildSys 2026": "https://buildsys.acm.org/2026/",
  "SIGCOMM 2026": "https://conferences.sigcomm.org/sigcomm/2026/",
  "SC26": "https://sc26.supercomputing.org/",
  "ASPLOS 2027 — April": "https://www.asplos-conference.org/asplos2027/",
  "ASPLOS 2027 — September": "https://www.asplos-conference.org/asplos2027/",
  "NSDI 2027 — Spring": "https://www.usenix.org/conference/nsdi27",
  "NSDI 2027 — Fall": "https://www.usenix.org/conference/nsdi27",
  "SmartGridComm 2026": "https://sgc2026.ieee-smartgridcomm.org/",
  "NeurIPS 2026": "https://neurips.cc/Conferences/2026",
  "EuroSys 2027 — Spring": "https://2027.eurosys.org/",
  "EuroSys 2027 — Fall": "https://2027.eurosys.org/",
  "HotCarbon 2026": "https://hotcarbon.org/",
  "ATC 2026": "https://www.usenix.org/conference/atc26",
  "HotNets 2026": "https://conferences.sigcomm.org/hotnets/2026/",
  "SoCC 2026 — Round 2": "https://acmsocc.org/2026/",
  "INFOCOM 2027": "https://infocom2027.ieee-infocom.org/",
  "HPCA 2027": "https://conf.researchr.org/home/hpca-2027",
  "MLSys 2027": "https://mlsys.org/",
  "ISCA 2027": "https://iscaconf.org/",
};

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
    return { ...item, website: item.website ?? conferenceSites[item.name], angle, marker, elbow, side: marker.x >= 300 ? "right" as const : "left" as const, labelY: elbow.y, lane: 0 };
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

function DeadlineDial({ year, now, items, svgRef }: { year: number; now: Date; items: Deadline[]; svgRef: React.RefObject<SVGSVGElement | null> }) {
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
      <svg ref={svgRef} className="dial" viewBox="-90 -30 780 660" role="img" xmlns="http://www.w3.org/2000/svg">
        <title>{year} conference deadline dial</title>
        <defs>
          <filter id="soft-shadow" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="#0f172a" floodOpacity="0.12" /></filter>
          <filter id="needle-glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="5" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
          <linearGradient id="needle-gradient" gradientUnits="userSpaceOnUse" x1="300" y1="300" x2={currentPoint.x} y2={currentPoint.y}><stop offset="0" stopColor="var(--needle-start)" /><stop offset="0.6" stopColor="var(--needle-mid)" /><stop offset="1" stopColor="var(--needle-end)" /></linearGradient>
          <radialGradient id="hub-gradient"><stop offset="0" stopColor="var(--hub-light)" /><stop offset="0.62" stopColor="var(--hub-mid)" /><stop offset="1" stopColor="var(--needle-end)" /></radialGradient>
        </defs>
        <circle cx="300" cy="300" r="235" fill="var(--dial-face)" stroke="var(--dial-stroke)" strokeWidth="2" filter="url(#soft-shadow)" />
        {months.map((month, i) => {
          const start = (i / 12) * 360, end = ((i + 1) / 12) * 360;
          const mid = point((start + end) / 2, 196), boundaryA = point(start, 156), boundaryB = point(start, 235);
          return <g key={month}>
            <path d={sectorPath(start, end, 156, 235)} fill={i % 2 ? "var(--dial-sector-alt)" : "var(--dial-sector)"} />
            <line x1={boundaryA.x} y1={boundaryA.y} x2={boundaryB.x} y2={boundaryB.y} stroke="var(--dial-grid)" strokeWidth="1.5" />
            <text x={mid.x} y={mid.y + 4} textAnchor="middle" className="month-label">{month}</text>
          </g>;
        })}
        <path className="export-hide" d={sectorPath(0, Math.max(nowAngle, 0.5), 84, 150)} fill="var(--needle-mid)" opacity="0.09" />
        <circle cx="300" cy="300" r="156" fill="var(--dial-inner)" stroke="var(--dial-stroke)" strokeWidth="2" />
        <circle cx="300" cy="300" r="83" fill="var(--dial-core)" stroke="var(--dial-stroke)" strokeWidth="1.5" />
        {Array.from({ length: 48 }, (_, i) => {
          const angle = (i / 48) * 360, a = point(angle, i % 4 === 0 ? 229 : 232), b = point(angle, 237);
          return <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="var(--dial-tick)" strokeWidth={i % 4 === 0 ? 1.6 : 0.8} />;
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
          return <a key={`${item.name}-${item.date}`} href={item.website} target="_blank" rel="noreferrer" className="deadline-link" aria-label={`Open ${item.name} conference website`}>
            <path d={`M ${item.marker.x} ${item.marker.y} L ${item.elbow.x} ${item.elbow.y} L ${lineEndX} ${item.labelY}`} fill="none" stroke={item.color} strokeWidth="1.15" strokeDasharray="2.5 2.5" opacity="0.62" />
            <circle className="deadline-marker" cx={item.marker.x} cy={item.marker.y} r="7" fill={item.color} stroke="var(--surface-solid)" strokeWidth="3" />
            <rect x={boxX} y={item.labelY - 10} width={textWidth + 16} height="20" rx="6" className="deadline-label-box" stroke={item.color} />
            <text x={labelX} y={item.labelY + 3.2} textAnchor={right ? "start" : "end"} className="deadline-label" fill={item.color}>{item.short}</text>
          </a>;
        })}
        <text x="300" y="254" textAnchor="middle" className="dial-year">{year}</text>
        <g className="export-hide">
          <line x1={needleTail.x} y1={needleTail.y} x2={currentPoint.x} y2={currentPoint.y} stroke="var(--needle-mid)" strokeWidth="11" strokeLinecap="round" opacity="0.12" filter="url(#needle-glow)" />
          <line x1={needleTail.x} y1={needleTail.y} x2={currentPoint.x} y2={currentPoint.y} stroke="url(#needle-gradient)" strokeWidth="5.5" strokeLinecap="round" />
          <line x1={needleTail.x} y1={needleTail.y} x2={currentPoint.x} y2={currentPoint.y} stroke="white" strokeWidth="1.1" strokeLinecap="round" opacity="0.72" />
          <polygon points={arrowPoints} fill="var(--needle-end)" stroke="var(--surface-solid)" strokeWidth="1.5" strokeLinejoin="round" />
          <circle cx={currentPoint.x} cy={currentPoint.y} r="12" fill="none" stroke="var(--needle-mid)" strokeWidth="2" opacity="0.25" className="needle-pulse" />
          <circle cx={currentPoint.x} cy={currentPoint.y} r="4.5" fill="var(--needle-end)" stroke="var(--surface-solid)" strokeWidth="2" />
          <circle cx="300" cy="300" r="14" fill="var(--hub-light)" stroke="var(--surface-solid)" strokeWidth="4" filter="url(#soft-shadow)" />
          <circle cx="300" cy="300" r="9" fill="url(#hub-gradient)" stroke="var(--needle-end)" strokeWidth="1.5" />
          <circle cx="300" cy="300" r="2.5" fill="white" />
        </g>
      </svg>
    </div>
  );
}

export default function Home() {
  const [now, setNow] = useState(() => new Date());
  const [year, setYear] = useState(2026);
  const [managed, setManaged] = useState<ManagedConference[]>([]);
  const [exporting, setExporting] = useState(false);
  const dialRef = useRef<SVGSVGElement>(null);
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
      website: item.website_url ?? item.source_url ?? conferenceSites[item.name],
    }));
    return managed.length ? custom : deadlines.map((item, index) => ({ ...item, color: dynamicColors[index % dynamicColors.length], website: conferenceSites[item.name] }));
  }, [managed]);
  const yearItems = useMemo(() => allDeadlines.filter((item) => Number(item.date.slice(0, 4)) === year), [allDeadlines, year]);
  const sorted = useMemo(() => [...yearItems].sort((a, b) => a.date.localeCompare(b.date)), [yearItems]);

  async function saveClockImage() {
    if (!dialRef.current || exporting) return;
    setExporting(true);
    try {
      const source = dialRef.current;
      const clone = source.cloneNode(true) as SVGSVGElement;
      clone.querySelectorAll(".export-hide").forEach((node) => node.remove());
      clone.removeAttribute("class");
      clone.setAttribute("width", "3120");
      clone.setAttribute("height", "2640");

      const yearLabel = clone.querySelector(".dial-year");
      yearLabel?.setAttribute("y", "316");
      yearLabel?.setAttribute("style", "font-size:42px;font-weight:850;letter-spacing:-0.045em");

      const rootStyles = getComputedStyle(document.documentElement);
      const variables = ["paper", "ink", "dial-face", "dial-sector", "dial-sector-alt", "dial-inner", "dial-core", "dial-stroke", "dial-grid", "dial-tick", "surface-solid"];
      const cssVariables = variables.map((name) => `--${name}:${rootStyles.getPropertyValue(`--${name}`).trim()};`).join("");
      const style = document.createElementNS("http://www.w3.org/2000/svg", "style");
      style.textContent = `svg{${cssVariables}}.month-label{font:800 10px Inter,Arial,sans-serif;fill:#64748b;letter-spacing:.09em}.deadline-label-box{fill:var(--surface-solid);stroke-width:1px}.deadline-label{font:850 9px Inter,Arial,sans-serif;letter-spacing:.025em}.dial-year{font-family:Inter,Arial,sans-serif;fill:var(--ink)}`;
      clone.insertBefore(style, clone.firstChild);

      const background = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      background.setAttribute("x", "-90");
      background.setAttribute("y", "-30");
      background.setAttribute("width", "780");
      background.setAttribute("height", "660");
      background.setAttribute("fill", rootStyles.getPropertyValue("--paper").trim());
      clone.insertBefore(background, style.nextSibling);

      const serialized = new XMLSerializer().serializeToString(clone);
      const svgUrl = URL.createObjectURL(new Blob([serialized], { type: "image/svg+xml;charset=utf-8" }));
      const image = new Image();
      await new Promise<void>((resolve, reject) => { image.onload = () => resolve(); image.onerror = () => reject(new Error("Could not render the clock image.")); image.src = svgUrl; });
      const canvas = document.createElement("canvas");
      canvas.width = 3120;
      canvas.height = 2640;
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Canvas is unavailable.");
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(svgUrl);
      const png = await new Promise<Blob>((resolve, reject) => canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("Could not create the PNG.")), "image/png"));
      const pngUrl = URL.createObjectURL(png);
      const link = document.createElement("a");
      link.href = pngUrl;
      link.download = `deadline-clock-${year}.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(pngUrl), 0);
    } catch (error) {
      console.error(error);
      window.alert("The clock image could not be saved. Please try again.");
    } finally {
      setExporting(false);
    }
  }

  return <main className="app-shell">
    <header className="topbar">
      <div><div className="eyebrow"><span className="live-dot" /> RESEARCH PLANNER</div><h1>Deadline Clock</h1><p>Conference deadlines, mapped across the year.</p></div>
      <div className="toolbar">
        <ThemeToggle />
        <Link className="settings-link" href="/settings"><Settings2 size={17} /> Manage</Link>
        <div className="live-time"><Clock3 size={17} /> {now.toLocaleTimeString("en-GB")} <span /> {formatDate(now)}</div>
        <label className="year-select"><span>YEAR</span><select value={year} onChange={(e) => setYear(Number(e.target.value))} aria-label="Select year">{[2024, 2025, 2026, 2027].map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
      </div>
    </header>
    <section className="workspace">
      <div className="dial-panel">
        <div className="panel-heading"><div><span className="section-number">01</span><h2>{year} year dial</h2></div><button className="export-button" type="button" onClick={saveClockImage} disabled={exporting}><ImageDown size={16} />{exporting ? "Saving…" : `Save ${year} PNG`}</button></div>
        <DeadlineDial year={year} now={now} items={yearItems} svgRef={dialRef} />
        <div className="legend"><span><i className="hand" /> Today</span><span><i className="blue" /> Submission deadline</span></div>
      </div>
      <aside className="deadline-panel">
        <div className="panel-heading list-heading"><div><span className="section-number">02</span><h2>Deadline list</h2></div><span className="count-badge">{sorted.length}</span></div>
        <div className="deadline-list">
          {sorted.length ? sorted.map((item) => {
            const date = new Date(`${item.date}T23:59:59`), days = Math.ceil((date.getTime() - now.getTime()) / 86400000);
            const status = year === now.getFullYear() ? (days < 0 ? "PAST" : `${days}D`) : item.date.slice(5);
            return <article className="deadline-row" key={`${item.name}-${item.date}`}>
              <div className="date-tile" style={{ "--accent": item.color } as React.CSSProperties}><span>{date.toLocaleDateString("en-US", { month: "short" }).toUpperCase()}</span><strong>{date.getDate()}</strong></div>
              <div className="deadline-copy"><h3>{item.website ? <a href={item.website} target="_blank" rel="noreferrer">{item.name}</a> : item.name}</h3><p>{item.date}{item.note ? ` · ${item.note}` : ""}</p></div>
              <span className={`status ${status === "PAST" ? "past" : ""}`}>{status}</span>
            </article>;
          }) : <div className="empty-state"><CalendarDays size={30} /><strong>No deadlines</strong><span>Select another year.</span></div>}
        </div>
        <p className="source-note">The dial uses full-paper deadlines. Abstract/registration dates are stored separately. Estimated entries are shifted from the previous official CFP and should be rechecked before submission.</p>
      </aside>
    </section>
  </main>;
}
