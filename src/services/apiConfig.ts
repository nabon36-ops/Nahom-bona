export function getBackendBaseUrl(): string {
  const configured =
    (import.meta as unknown as { env?: Record<string, string | undefined> }).env
      ?.VITE_BACKEND_URL || "";
  return configured.replace(/\/+$/, "");
}

export function apiUrl(path: string): string {
  const base = getBackendBaseUrl();
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return base ? `${base}${normalized}` : normalized;
}

export function liveWsUrl(language: string): string {
  const base = getBackendBaseUrl();
  if (base) {
    const wsBase = base.replace(/^http:/i, "ws:").replace(/^https:/i, "wss:");
    return `${wsBase}/ws/live?language=${encodeURIComponent(language)}`;
  }
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  return `${protocol}//${window.location.host}/ws/live?language=${encodeURIComponent(language)}`;
}
