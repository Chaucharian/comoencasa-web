import { band, type Show } from "@/lib/data";

const LINKTREE_URL = band.linktreeUrl;
const SECTION = "PRÓXIMA FECHA";

const MONTHS = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
] as const;

const CITY_ALIASES: Record<string, { city: string; country: string }> = {
  caba: { city: "Buenos Aires", country: "AR" },
  "c.a.b.a.": { city: "Buenos Aires", country: "AR" },
  "bs as": { city: "Buenos Aires", country: "AR" },
  "bs.as.": { city: "Buenos Aires", country: "AR" },
  "buenos aires": { city: "Buenos Aires", country: "AR" },
  montevideo: { city: "Montevideo", country: "UY" },
  santiago: { city: "Santiago", country: "CL" },
};

type LinktreeLink = {
  id: number;
  type: string;
  title: string;
  url?: string;
  position?: number;
  parent?: { id: number } | null;
};

type LinktreeAccount = {
  links?: LinktreeLink[];
};

function formatDate(day: number, month: number, year: number) {
  return `${String(day).padStart(2, "0")} ${MONTHS[month - 1]} ${year}`;
}

function resolveYear(day: number, month: number, explicitYear?: number) {
  if (explicitYear) return explicitYear >= 100 ? explicitYear : 2000 + explicitYear;
  const now = new Date();
  const year = now.getFullYear();
  const candidate = new Date(year, month - 1, day);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return candidate < today ? year + 1 : year;
}

function foldTitle(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase();
}

function placeFromCity(raw: string) {
  const key = raw.trim().toLowerCase();
  return CITY_ALIASES[key] ?? { city: raw.trim(), country: "AR" };
}

export function parseShowTitle(title: string, url: string): Show | null {
  const parts = title
    .split(/\s+[–—-]\s+/)
    .map((part) => part.trim())
    .filter(Boolean);
  if (parts.length < 2) return null;

  const datePart = parts[parts.length - 1];
  const dateMatch = datePart.match(/^(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?$/);
  if (!dateMatch) return null;

  const day = Number(dateMatch[1]);
  const month = Number(dateMatch[2]);
  const year = resolveYear(day, month, dateMatch[3] ? Number(dateMatch[3]) : undefined);
  const { city, country } = placeFromCity(parts[0]);
  const venue = parts.slice(1, -1).join(" · ") || parts[0];

  return {
    date: formatDate(day, month, year),
    city,
    country,
    venue,
    status: url ? "on sale" : "soon",
    href: url || band.linktreeUrl,
  };
}

function extractAccount(html: string): LinktreeAccount | null {
  const start = html.indexOf('{"props":{"pageProps":{"account"');
  if (start < 0) return null;
  const end = html.indexOf("</script>", start);
  if (end < 0) return null;

  try {
    const payload = JSON.parse(html.slice(start, end)) as {
      props?: { pageProps?: { account?: LinktreeAccount } };
    };
    return payload.props?.pageProps?.account ?? null;
  } catch {
    return null;
  }
}

export async function getUpcomingShows(): Promise<Show[]> {
  const response = await fetch(LINKTREE_URL, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; CisneElocuente/1.0; +https://cisne.band)",
      Accept: "text/html,application/xhtml+xml",
    },
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    throw new Error(`Linktree ${response.status}`);
  }

  const account = extractAccount(await response.text());
  const links = account?.links ?? [];
  const section = links.find(
    (link) => link.type === "GROUP" && foldTitle(link.title) === foldTitle(SECTION),
  );

  if (!section) return [];

  return links
    .filter((link) => link.parent?.id === section.id && link.title)
    .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
    .map((link) => parseShowTitle(link.title, link.url ?? ""))
    .filter((show): show is Show => Boolean(show));
}
