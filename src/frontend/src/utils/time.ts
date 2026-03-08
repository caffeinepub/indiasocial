/**
 * Convert bigint nanosecond timestamp to relative time string
 */
export function relativeTime(timestampNs: bigint): string {
  const nowMs = Date.now();
  const tsMs = Number(timestampNs / BigInt(1_000_000));
  const diffMs = nowMs - tsMs;

  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);

  if (seconds < 60) return "अभी";
  if (minutes < 60) return `${minutes}म पहले`;
  if (hours < 24) return `${hours}घ पहले`;
  if (days < 7) return `${days}द पहले`;
  if (weeks < 4) return `${weeks}स पहले`;
  if (months < 12) return `${months}मह पहले`;
  return `${Math.floor(months / 12)}व पहले`;
}

export function relativeTimeEn(timestampNs: bigint): string {
  const nowMs = Date.now();
  const tsMs = Number(timestampNs / BigInt(1_000_000));
  const diffMs = nowMs - tsMs;

  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);

  if (seconds < 60) return "just now";
  if (minutes < 60) return `${minutes}m`;
  if (hours < 24) return `${hours}h`;
  if (days < 7) return `${days}d`;
  if (weeks < 4) return `${weeks}w`;
  return `${Math.floor(days / 30)}mo`;
}

export function isWithin24Hours(timestampNs: bigint): boolean {
  const nowMs = Date.now();
  const tsMs = Number(timestampNs / BigInt(1_000_000));
  return nowMs - tsMs < 24 * 60 * 60 * 1000;
}
