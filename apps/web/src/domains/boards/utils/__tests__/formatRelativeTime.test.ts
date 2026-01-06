import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { formatRelativeTime } from '../formatRelativeTime';

describe('formatRelativeTime', () => {
  const MINUTE_MS = 60 * 1000;
  const HOUR_MS = 60 * MINUTE_MS;
  const DAY_MS = 24 * HOUR_MS;
  const WEEK_MS = 7 * DAY_MS;
  const MONTH_MS = 30 * DAY_MS;

  const BASE_TIME = new Date('2025-01-07T12:00:00.000Z');

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(BASE_TIME);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('미래 시간', () => {
    it('미래 시간이 주어지면 "방금 전"을 반환한다', () => {
      // Given
      const futureDate = new Date(BASE_TIME.getTime() + HOUR_MS).toISOString();

      // When
      const result = formatRelativeTime(futureDate);

      // Then
      expect(result).toBe('방금 전');
    });
  });

  describe('1분 미만', () => {
    it('0초 전이면 "방금 전"을 반환한다', () => {
      // Given
      const now = BASE_TIME.toISOString();

      // When
      const result = formatRelativeTime(now);

      // Then
      expect(result).toBe('방금 전');
    });

    it('30초 전이면 "방금 전"을 반환한다', () => {
      // Given
      const thirtySecondsAgo = new Date(
        BASE_TIME.getTime() - 30 * 1000,
      ).toISOString();

      // When
      const result = formatRelativeTime(thirtySecondsAgo);

      // Then
      expect(result).toBe('방금 전');
    });

    it('59초 전이면 "방금 전"을 반환한다', () => {
      // Given
      const fiftyNineSecondsAgo = new Date(
        BASE_TIME.getTime() - 59 * 1000,
      ).toISOString();

      // When
      const result = formatRelativeTime(fiftyNineSecondsAgo);

      // Then
      expect(result).toBe('방금 전');
    });
  });

  describe('분 단위 (1분 ~ 1시간 미만)', () => {
    it('1분 전이면 "1분 전"을 반환한다', () => {
      // Given
      const oneMinuteAgo = new Date(
        BASE_TIME.getTime() - MINUTE_MS,
      ).toISOString();

      // When
      const result = formatRelativeTime(oneMinuteAgo);

      // Then
      expect(result).toBe('1분 전');
    });

    it('30분 전이면 "30분 전"을 반환한다', () => {
      // Given
      const thirtyMinutesAgo = new Date(
        BASE_TIME.getTime() - 30 * MINUTE_MS,
      ).toISOString();

      // When
      const result = formatRelativeTime(thirtyMinutesAgo);

      // Then
      expect(result).toBe('30분 전');
    });

    it('59분 전이면 "59분 전"을 반환한다', () => {
      // Given
      const fiftyNineMinutesAgo = new Date(
        BASE_TIME.getTime() - 59 * MINUTE_MS,
      ).toISOString();

      // When
      const result = formatRelativeTime(fiftyNineMinutesAgo);

      // Then
      expect(result).toBe('59분 전');
    });
  });

  describe('시간 단위 (1시간 ~ 1일 미만)', () => {
    it('1시간 전이면 "1시간 전"을 반환한다', () => {
      // Given
      const oneHourAgo = new Date(BASE_TIME.getTime() - HOUR_MS).toISOString();

      // When
      const result = formatRelativeTime(oneHourAgo);

      // Then
      expect(result).toBe('1시간 전');
    });

    it('3시간 전이면 "3시간 전"을 반환한다', () => {
      // Given
      const threeHoursAgo = new Date(
        BASE_TIME.getTime() - 3 * HOUR_MS,
      ).toISOString();

      // When
      const result = formatRelativeTime(threeHoursAgo);

      // Then
      expect(result).toBe('3시간 전');
    });

    it('23시간 전이면 "23시간 전"을 반환한다', () => {
      // Given
      const twentyThreeHoursAgo = new Date(
        BASE_TIME.getTime() - 23 * HOUR_MS,
      ).toISOString();

      // When
      const result = formatRelativeTime(twentyThreeHoursAgo);

      // Then
      expect(result).toBe('23시간 전');
    });
  });

  describe('일 단위 (1일 ~ 1주 미만)', () => {
    it('1일 전이면 "1일 전"을 반환한다', () => {
      // Given
      const oneDayAgo = new Date(BASE_TIME.getTime() - DAY_MS).toISOString();

      // When
      const result = formatRelativeTime(oneDayAgo);

      // Then
      expect(result).toBe('1일 전');
    });

    it('2일 전이면 "2일 전"을 반환한다', () => {
      // Given
      const twoDaysAgo = new Date(
        BASE_TIME.getTime() - 2 * DAY_MS,
      ).toISOString();

      // When
      const result = formatRelativeTime(twoDaysAgo);

      // Then
      expect(result).toBe('2일 전');
    });

    it('6일 전이면 "6일 전"을 반환한다', () => {
      // Given
      const sixDaysAgo = new Date(
        BASE_TIME.getTime() - 6 * DAY_MS,
      ).toISOString();

      // When
      const result = formatRelativeTime(sixDaysAgo);

      // Then
      expect(result).toBe('6일 전');
    });
  });

  describe('주 단위 (1주 ~ 1개월 미만)', () => {
    it('1주 전이면 "1주 전"을 반환한다', () => {
      // Given
      const oneWeekAgo = new Date(BASE_TIME.getTime() - WEEK_MS).toISOString();

      // When
      const result = formatRelativeTime(oneWeekAgo);

      // Then
      expect(result).toBe('1주 전');
    });

    it('2주 전이면 "2주 전"을 반환한다', () => {
      // Given
      const twoWeeksAgo = new Date(
        BASE_TIME.getTime() - 2 * WEEK_MS,
      ).toISOString();

      // When
      const result = formatRelativeTime(twoWeeksAgo);

      // Then
      expect(result).toBe('2주 전');
    });

    it('3주 전이면 "3주 전"을 반환한다', () => {
      // Given
      const threeWeeksAgo = new Date(
        BASE_TIME.getTime() - 3 * WEEK_MS,
      ).toISOString();

      // When
      const result = formatRelativeTime(threeWeeksAgo);

      // Then
      expect(result).toBe('3주 전');
    });
  });

  describe('월 단위 (1개월 ~ 1년 미만)', () => {
    it('1개월 전이면 "1개월 전"을 반환한다', () => {
      // Given
      const oneMonthAgo = new Date(
        BASE_TIME.getTime() - MONTH_MS,
      ).toISOString();

      // When
      const result = formatRelativeTime(oneMonthAgo);

      // Then
      expect(result).toBe('1개월 전');
    });

    it('6개월 전이면 "6개월 전"을 반환한다', () => {
      // Given
      const sixMonthsAgo = new Date(
        BASE_TIME.getTime() - 6 * MONTH_MS,
      ).toISOString();

      // When
      const result = formatRelativeTime(sixMonthsAgo);

      // Then
      expect(result).toBe('6개월 전');
    });

    it('11개월 전이면 "11개월 전"을 반환한다', () => {
      // Given
      const elevenMonthsAgo = new Date(
        BASE_TIME.getTime() - 11 * MONTH_MS,
      ).toISOString();

      // When
      const result = formatRelativeTime(elevenMonthsAgo);

      // Then
      expect(result).toBe('11개월 전');
    });
  });

  describe('년 단위 (1년 이상)', () => {
    it('1년 전이면 "1년 전"을 반환한다', () => {
      // Given
      const oneYearAgo = new Date(
        BASE_TIME.getTime() - 12 * MONTH_MS,
      ).toISOString();

      // When
      const result = formatRelativeTime(oneYearAgo);

      // Then
      expect(result).toBe('1년 전');
    });

    it('2년 전이면 "2년 전"을 반환한다', () => {
      // Given
      const twoYearsAgo = new Date(
        BASE_TIME.getTime() - 24 * MONTH_MS,
      ).toISOString();

      // When
      const result = formatRelativeTime(twoYearsAgo);

      // Then
      expect(result).toBe('2년 전');
    });
  });
});
