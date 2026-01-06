const RECENT_ACCESS_THRESHOLD_DAYS = 7;
const DAY_MS = 1000 * 60 * 60 * 24;

/**
 * 주어진 마지막 접속 시간이 최근 7일 이내인지 확인합니다.
 */
export function isRecentlyAccessed(lastAccessedAt: string | null): boolean {
  if (!lastAccessedAt) {
    return false;
  }

  const accessDate = new Date(lastAccessedAt);
  const now = new Date();
  const diffInDays = (now.getTime() - accessDate.getTime()) / DAY_MS;

  return diffInDays <= RECENT_ACCESS_THRESHOLD_DAYS;
}
