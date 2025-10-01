export function formatDuration(ms: number) {
  const days = String(Math.floor(ms / (1000 * 60 * 60 * 24))).padStart(2, '0');
  const hours = String(Math.floor((ms / (1000 * 60 * 60)) % 24)).padStart(2, '0');
  const minutes = String(Math.floor((ms / (1000 * 60)) % 60)).padStart(2, '0');
  const seconds = String(Math.floor((ms / 1000) % 60)).padStart(2, '0');
  return `${days}:${hours}:${minutes}:${seconds}`;
}

export function toLocalInputString(ms: number): string {
  const d = new Date(ms);
  const pad = (n: number) => n.toString().padStart(2, "0");
  const YYYY = d.getFullYear();
  const MM   = pad(d.getMonth() + 1);
  const DD   = pad(d.getDate());
  const hh   = pad(d.getHours());   // local hours 0–23
  const mm   = pad(d.getMinutes());
  return `${YYYY}-${MM}-${DD}T${hh}:${mm}`;
}
