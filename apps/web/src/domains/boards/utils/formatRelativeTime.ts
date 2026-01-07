const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;
const WEEK_MS = 7 * DAY_MS;
const MONTH_MS = 30 * DAY_MS;

interface TimeUnit {
  threshold: number;
  unit: string;
  divisor: number;
}

const TIME_UNITS: TimeUnit[] = [
  { threshold: MINUTE_MS, unit: '방금 전', divisor: 0 },
  { threshold: HOUR_MS, unit: '분 전', divisor: MINUTE_MS },
  { threshold: DAY_MS, unit: '시간 전', divisor: HOUR_MS },
  { threshold: WEEK_MS, unit: '일 전', divisor: DAY_MS },
  { threshold: MONTH_MS, unit: '주 전', divisor: WEEK_MS },
];

/**
 * 주어진 날짜를 현재 시간 기준 상대적 시간 문자열로 변환합니다.
 * 예: "방금 전", "5분 전", "3시간 전", "2일 전", "1주 전"
 */
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();

  if (diffMs < 0) {
    return '방금 전';
  }

  const matchedUnit = TIME_UNITS.find(({ threshold }) => diffMs < threshold);

  if (matchedUnit) {
    const { unit, divisor } = matchedUnit;
    if (divisor === 0) {
      return unit;
    }
    const value = Math.floor(diffMs / divisor);
    return `${value}${unit}`;
  }

  const months = Math.floor(diffMs / MONTH_MS);
  if (months < 12) {
    return `${months}개월 전`;
  }

  const years = Math.floor(months / 12);
  return `${years}년 전`;
}
