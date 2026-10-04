export const SITE_BASE = import.meta.env?.BASE_URL ?? "/";

export const sitePath = (path) => path.startsWith("/") && !path.startsWith("//")
  ? `${SITE_BASE}${path.slice(1)}`
  : path;
