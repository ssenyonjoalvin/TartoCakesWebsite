/** Constants shared by the quote server action and the forms that call it. */

export const OTHER_OCCASION = "__other__";
export const CUSTOM_CAKE = "Custom Cake";
/** Visually hidden input that only bots fill in. */
export const HONEYPOT_FIELD = "tarto_hp";

/** Use the bakery's calendar day, regardless of browser/server time zone. */
export function todayInKampala(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Kampala", year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(now);
  const part = (type: string) => parts.find((item) => item.type === type)!.value;
  return `${part("year")}-${part("month")}-${part("day")}`;
}

export function parseEventDate(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T12:00:00Z`);
  return Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value ? null : date;
}
