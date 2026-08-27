export type ResolvedDeadline = {
  deadline: string | null;
  abstractDeadline: string | null;
  timezone: string | null;
  sourceName: string | null;
  sourceUrl: string | null;
  conferenceUrl: string | null;
  deadlineStatus: "sourced" | "estimated" | "pending";
  lastCheckedAt: string;
};

type CuratedDeadline = Omit<ResolvedDeadline, "lastCheckedAt"> & { calendarYear: number };

const official = (calendarYear: number, deadline: string, abstractDeadline: string | null, timezone: string, sourceUrl: string, conferenceUrl: string): CuratedDeadline => ({
  calendarYear, deadline, abstractDeadline, timezone, sourceName: "Official CFP", sourceUrl, conferenceUrl, deadlineStatus: "sourced",
});

const estimate = (deadline: string, abstractDeadline: string | null, sourceUrl: string, conferenceUrl: string): CuratedDeadline => ({
  calendarYear: 2026, deadline, abstractDeadline, timezone: "AoE", sourceName: "Previous official CFP (+1 year)", sourceUrl, conferenceUrl, deadlineStatus: "estimated",
});

// Audited 2026 deadline calendar. The primary date is always the full-paper
// submission deadline; registration/abstract dates remain separate metadata.
const CURATED: Record<string, CuratedDeadline> = {
  "icdcs 2026": official(2026, "2026-01-21", "2026-01-21", "AoE", "https://icdcs2026.icdcs.org/calls/call-for-papers/", "https://icdcs2026.icdcs.org/"),
  "e energy 2026 winter": official(2026, "2026-01-29", "2026-01-22", "AoE", "https://energy.acm.org/conferences/eenergy/2026/pages/cfp.php", "https://energy.acm.org/conferences/eenergy/2026/"),
  "buildsys 2026": official(2026, "2026-01-29", "2026-01-22", "AoE", "https://buildsys.acm.org/2026/cfp/", "https://buildsys.acm.org/2026/"),
  "sigcomm 2026": official(2026, "2026-02-06", "2026-01-30", "AoE", "https://conferences.sigcomm.org/sigcomm/2026/cfp/", "https://conferences.sigcomm.org/sigcomm/2026/"),
  "sc26": official(2026, "2026-04-08", "2026-04-01", "AoE", "https://sc26.supercomputing.org/program/papers/", "https://sc26.supercomputing.org/"),
  "asplos 2027 april": official(2026, "2026-04-15", null, "AoE", "https://www.asplos-conference.org/asplos2027/cfp/", "https://www.asplos-conference.org/asplos2027/"),
  "nsdi 2027 spring": official(2026, "2026-04-23", "2026-04-16", "US EDT", "https://www.usenix.org/conference/nsdi27/call-for-papers", "https://www.usenix.org/conference/nsdi27"),
  "smartgridcomm 2026": official(2026, "2026-05-03", null, "AoE", "https://sgc2026.ieee-smartgridcomm.org/", "https://sgc2026.ieee-smartgridcomm.org/"),
  "neurips 2026": official(2026, "2026-05-06", "2026-05-04", "AoE", "https://neurips.cc/Conferences/2026/CallForPapers", "https://neurips.cc/Conferences/2026"),
  "eurosys 2027 spring": official(2026, "2026-05-14", "2026-05-07", "AoE", "https://2027.eurosys.org/cfp.html", "https://2027.eurosys.org/"),
  "hotcarbon 2026": official(2026, "2026-05-18", "2026-05-11", "AoE", "https://hotcarbon.org/cfp", "https://hotcarbon.org/"),
  "atc 2026": official(2026, "2026-06-10", null, "AoE", "https://sigops.org/s/conferences/atc/2026/cfp.html", "https://www.usenix.org/conference/atc26"),
  "socc 2026 round 2": official(2026, "2026-07-14", "2026-07-07", "AoE", "https://acmsocc.org/2026/papers.html", "https://acmsocc.org/2026/"),
  "hotnets 2026": official(2026, "2026-07-16", null, "AoE", "https://conferences.sigcomm.org/hotnets/2026/", "https://conferences.sigcomm.org/hotnets/2026/"),
  "hpca 2027": official(2026, "2026-07-31", "2026-07-24", "AoE", "https://conf.researchr.org/track/hpca-2027/hpca-2027-main-conference", "https://conf.researchr.org/home/hpca-2027"),
  "infocom 2027": official(2026, "2026-07-31", "2026-07-24", "AoE", "https://infocom2027.ieee-infocom.org/call-papers", "https://infocom2027.ieee-infocom.org/"),
  "asplos 2027 september": official(2026, "2026-09-09", null, "AoE", "https://www.asplos-conference.org/asplos2027/cfp/", "https://www.asplos-conference.org/asplos2027/"),
  "nsdi 2027 fall": official(2026, "2026-09-17", "2026-09-10", "US EDT", "https://www.usenix.org/conference/nsdi27/call-for-papers", "https://www.usenix.org/conference/nsdi27"),
  "e energy 2027 fall": estimate("2026-09-18", "2026-09-11", "https://energy.acm.org/conferences/eenergy/2026/pages/cfp.php", "https://energy.acm.org/conferences/eenergy/"),
  "eurosys 2027 fall": official(2026, "2026-09-24", "2026-09-17", "AoE", "https://2027.eurosys.org/cfp.html", "https://2027.eurosys.org/"),
  "mlsys 2027": official(2026, "2026-10-30", null, "America/Los_Angeles", "https://mlsys.org/Conferences/2027/Dates", "https://mlsys.org/"),
  "isca 2027": estimate("2026-11-17", "2026-11-10", "https://iscaconf.org/isca2026/submit/callforpapers.php", "https://iscaconf.org/"),
};

const LEGACY_NAMES: Record<string, string> = {
  icdcs: "icdcs 2026", "e energy spring": "e energy 2026 winter", buildsys: "buildsys 2026", sc: "sc26",
  "asplos spring": "asplos 2027 april", "nsdi spring": "nsdi 2027 spring", smartgridcomm: "smartgridcomm 2026",
  neurips: "neurips 2026", "eurosys spring": "eurosys 2027 spring", hotcarbon: "hotcarbon 2026", atc: "atc 2026",
  socc: "socc 2026 round 2", hotnets: "hotnets 2026", hpca: "hpca 2027", "asplos fall": "asplos 2027 september",
  "e energy fall": "e energy 2027 fall", "nsdi fall": "nsdi 2027 fall", "eurosys fall": "eurosys 2027 fall",
  mlsys: "mlsys 2027", isca: "isca 2027",
};

const CATEGORIES = ["NW", "DS", "SE", "SC", "DB", "AI", "CT", "CG", "HI", "MX"];
const ALIASES: Record<string, string[]> = {
  "e energy": ["eenergy", "e-energy"], smartgridcomm: ["smartgridcomm"], hotcarbon: ["hotcarbon"], hotnets: ["hotnets"],
  buildsys: ["buildsys"], infocom: ["infocom"], sigcomm: ["sigcomm"], icdcs: ["icdcs"], asplos: ["asplos"], nsdi: ["nsdi"],
  eurosys: ["eurosys"], neurips: ["neurips", "nips"], mlsys: ["mlsys"], hpca: ["hpca"], isca: ["isca"], socc: ["socc"],
  atc: ["usenix-atc", "atc"], sc: ["sc"],
};

function normalizedName(name: string) { return name.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim(); }
function canonicalName(name: string) {
  return normalizedName(name).replace(/\b(?:acm|ieee|spring|fall|winter|summer|april|september|round|annual|conference|symposium)\b/g, " ").replace(/\b20\d{2}\b/g, " ").replace(/\s+/g, " ").trim();
}
function slugsFor(name: string) {
  const canonical = canonicalName(name);
  return [...new Set([...(ALIASES[canonical] ?? []), canonical.replace(/\s+/g, "-"), canonical.replace(/\s+/g, "")].filter(Boolean))];
}
function preferredCategories(field: string) {
  const value = field.toLowerCase(), preferred: string[] = [];
  if (/network|communication|wireless|mobile/.test(value)) preferred.push("NW");
  if (/security|privacy|crypt/.test(value)) preferred.push("SC");
  if (/database|data mining|information retrieval/.test(value)) preferred.push("DB");
  if (/artificial|machine learning|\bai\b|vision|nlp/.test(value)) preferred.push("AI");
  if (/architecture|high performance|hpc|storage/.test(value)) preferred.push("DS");
  if (/system|software|operating|distributed|cloud/.test(value)) preferred.push("SE", "DS");
  if (/human|interaction|hci/.test(value)) preferred.push("HI");
  if (/theory|algorithm/.test(value)) preferred.push("CT");
  if (/graphic|visual/.test(value)) preferred.push("CG");
  if (/energy|sustainab|emerging/.test(value)) preferred.push("MX", "DS");
  return [...new Set([...preferred, ...CATEGORIES])];
}
function extractDates(yaml: string, key: "deadline" | "abstract_deadline") {
  const expression = new RegExp(`^\\s*${key}:\\s*["']?(\\d{4}-\\d{2}-\\d{2})(?:[ T](\\d{2}:\\d{2}(?::\\d{2})?))?`, "gim");
  return [...yaml.matchAll(expression)].map((match) => ({ date: match[1], time: match[2] ?? null }));
}
function shiftOneYear(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(Date.UTC(year + 1, month - 1, day)).toISOString().slice(0, 10);
}
function chooseCycle<T extends { date: string }>(items: T[], name: string) {
  const ordered = [...items].sort((a, b) => a.date.localeCompare(b.date));
  return /\b(fall|september|summer|round 2)\b/i.test(name) ? ordered.at(-1) : ordered[0];
}
function parseYaml(yaml: string, name: string, targetYear: number, sourceUrl: string): ResolvedDeadline | null {
  const deadlines = extractDates(yaml, "deadline"), abstracts = extractDates(yaml, "abstract_deadline");
  const timezone = yaml.match(/^\s*timezone:\s*["']?([^\n"']+)/im)?.[1]?.trim() ?? null;
  const conferenceUrl = [...yaml.matchAll(/^\s*link:\s*["']?(https?:\/\/[^\n"']+)/gim)].at(-1)?.[1]?.trim() ?? null;
  const exact = chooseCycle(deadlines.filter((item) => Number(item.date.slice(0, 4)) === targetYear), name);
  const exactAbstract = chooseCycle(abstracts.filter((item) => Number(item.date.slice(0, 4)) === targetYear), name);
  const checked = new Date().toISOString();
  if (exact) return { deadline: exact.date, abstractDeadline: exactAbstract?.date ?? null, timezone, sourceName: "CCF-Deadlines", sourceUrl, conferenceUrl, deadlineStatus: "sourced", lastCheckedAt: checked };
  const previous = chooseCycle(deadlines.filter((item) => Number(item.date.slice(0, 4)) === targetYear - 1), name);
  const previousAbstract = chooseCycle(abstracts.filter((item) => Number(item.date.slice(0, 4)) === targetYear - 1), name);
  if (previous) return { deadline: shiftOneYear(previous.date), abstractDeadline: previousAbstract ? shiftOneYear(previousAbstract.date) : null, timezone, sourceName: "CCF-Deadlines (previous year)", sourceUrl, conferenceUrl, deadlineStatus: "estimated", lastCheckedAt: checked };
  return null;
}

export async function resolveConferenceDeadline(name: string, field: string, targetYear = new Date().getFullYear()): Promise<ResolvedDeadline> {
  const checked = new Date().toISOString();
  const normalized = normalizedName(name);
  const curated = CURATED[normalized] ?? CURATED[LEGACY_NAMES[normalized]];
  if (curated?.calendarYear === targetYear) return { ...curated, lastCheckedAt: checked };
  for (const category of preferredCategories(field)) {
    for (const slug of slugsFor(name)) {
      const rawUrl = `https://raw.githubusercontent.com/ccfddl/ccf-deadlines/main/conference/${category}/${slug}.yml`;
      try {
        const response = await fetch(rawUrl, { headers: { "User-Agent": "deadline-clock" } });
        if (!response.ok) continue;
        const parsed = parseYaml(await response.text(), name, targetYear, `https://github.com/ccfddl/ccf-deadlines/blob/main/conference/${category}/${slug}.yml`);
        if (parsed) return parsed;
      } catch { /* Continue through trusted candidates. */ }
    }
  }
  return { deadline: null, abstractDeadline: null, timezone: null, sourceName: null, sourceUrl: null, conferenceUrl: null, deadlineStatus: "pending", lastCheckedAt: checked };
}
