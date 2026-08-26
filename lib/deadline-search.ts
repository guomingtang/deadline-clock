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

const CATEGORIES = ["NW", "DS", "SE", "SC", "DB", "AI", "CT", "CG", "HI", "MX"];
const ALIASES: Record<string, string[]> = {
  "e energy": ["eenergy", "e-energy"],
  "smartgridcomm": ["smartgridcomm"],
  "hotcarbon": ["hotcarbon"],
  "hotnets": ["hotnets"],
  "buildsys": ["buildsys"],
  "infocom": ["infocom"],
  "sigcomm": ["sigcomm"],
  "icdcs": ["icdcs"],
  "asplos": ["asplos"],
  "nsdi": ["nsdi"],
  "eurosys": ["eurosys"],
  "neurips": ["neurips", "nips"],
  "mlsys": ["mlsys"],
  "hpca": ["hpca"],
  "isca": ["isca"],
  "socc": ["socc"],
  "atc": ["usenix-atc", "atc"],
  "sc": ["sc"],
};

function canonicalName(name: string) {
  return name
    .toLowerCase()
    .replace(/\b(?:acm|ieee|spring|fall|annual|conference|symposium)\b/g, " ")
    .replace(/\b20\d{2}\b/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function slugsFor(name: string) {
  const canonical = canonicalName(name);
  const variants = ALIASES[canonical] ?? [];
  return [...new Set([
    ...variants,
    canonical.replace(/\s+/g, "-"),
    canonical.replace(/\s+/g, ""),
  ].filter(Boolean))];
}

function preferredCategories(field: string) {
  const value = field.toLowerCase();
  const preferred: string[] = [];
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
  const shifted = new Date(Date.UTC(year + 1, month - 1, day));
  return shifted.toISOString().slice(0, 10);
}

function parseYaml(yaml: string, targetYear: number, sourceUrl: string): ResolvedDeadline | null {
  const deadlines = extractDates(yaml, "deadline");
  const abstracts = extractDates(yaml, "abstract_deadline");
  const timezone = yaml.match(/^\s*timezone:\s*["']?([^\n"']+)/im)?.[1]?.trim() ?? null;
  const conferenceUrl = [...yaml.matchAll(/^\s*link:\s*["']?(https?:\/\/[^\n"']+)/gim)].at(-1)?.[1]?.trim() ?? null;
  const exact = deadlines.filter((item) => Number(item.date.slice(0, 4)) === targetYear).at(-1);
  const exactAbstract = abstracts.filter((item) => Number(item.date.slice(0, 4)) === targetYear).at(-1);
  const checked = new Date().toISOString();

  if (exact) {
    return {
      deadline: exact.date,
      abstractDeadline: exactAbstract?.date ?? null,
      timezone,
      sourceName: "CCF-Deadlines",
      sourceUrl,
      conferenceUrl,
      deadlineStatus: "sourced",
      lastCheckedAt: checked,
    };
  }

  const previous = deadlines.filter((item) => Number(item.date.slice(0, 4)) === targetYear - 1).at(-1);
  const previousAbstract = abstracts.filter((item) => Number(item.date.slice(0, 4)) === targetYear - 1).at(-1);
  if (previous) {
    return {
      deadline: shiftOneYear(previous.date),
      abstractDeadline: previousAbstract ? shiftOneYear(previousAbstract.date) : null,
      timezone,
      sourceName: "CCF-Deadlines (previous year)",
      sourceUrl,
      conferenceUrl,
      deadlineStatus: "estimated",
      lastCheckedAt: checked,
    };
  }
  return null;
}

export async function resolveConferenceDeadline(name: string, field: string, targetYear = new Date().getFullYear()): Promise<ResolvedDeadline> {
  const checked = new Date().toISOString();
  for (const category of preferredCategories(field)) {
    for (const slug of slugsFor(name)) {
      const rawUrl = `https://raw.githubusercontent.com/ccfddl/ccf-deadlines/main/conference/${category}/${slug}.yml`;
      try {
        const response = await fetch(rawUrl, { headers: { "User-Agent": "deadline-clock" } });
        if (!response.ok) continue;
        const parsed = parseYaml(await response.text(), targetYear, `https://github.com/ccfddl/ccf-deadlines/blob/main/conference/${category}/${slug}.yml`);
        if (parsed) return parsed;
      } catch {
        // Try the next candidate; a failed source must not block adding a conference.
      }
    }
  }

  return {
    deadline: null,
    abstractDeadline: null,
    timezone: null,
    sourceName: null,
    sourceUrl: null,
    conferenceUrl: null,
    deadlineStatus: "pending",
    lastCheckedAt: checked,
  };
}
