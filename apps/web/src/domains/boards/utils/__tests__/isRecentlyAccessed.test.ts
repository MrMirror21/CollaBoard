import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { isRecentlyAccessed } from '../isRecentlyAccessed';

describe('isRecentlyAccessed', () => {
  const DAY_MS = 1000 * 60 * 60 * 24;
  const BASE_TIME = new Date('2025-01-07T12:00:00.000Z');

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(BASE_TIME);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('null 또는 undefined 입력', () => {
    it('lastAccessedAt이 null이면 false를 반환한다', () => {
      // Given
      const lastAccessedAt = null;

      // When
      const result = isRecentlyAccessed(lastAccessedAt);

      // Then
      expect(result).toBe(false);
    });
  });

  describe('최근 7일 이내 접속', () => {
    it('방금 접속했으면 true를 반환한다', () => {
      // Given
      const lastAccessedAt = BASE_TIME.toISOString();

      // When
      const result = isRecentlyAccessed(lastAccessedAt);

      // Then
      expect(result).toBe(true);
    });

    it('1일 전에 접속했으면 true를 반환한다', () => {
      // Given
      const oneDayAgo = new Date(BASE_TIME.getTime() - DAY_MS).toISOString();

      // When
      const result = isRecentlyAccessed(oneDayAgo);

      // Then
      expect(result).toBe(true);
    });

    it('3일 전에 접속했으면 true를 반환한다', () => {
      // Given
      const threeDaysAgo = new Date(
        BASE_TIME.getTime() - 3 * DAY_MS,
      ).toISOString();

      // When
      const result = isRecentlyAccessed(threeDaysAgo);

      // Then
      expect(result).toBe(true);
    });

    it('7일 전에 접속했으면 true를 반환한다 (경계값)', () => {
      // Given
      const sevenDaysAgo = new Date(
        BASE_TIME.getTime() - 7 * DAY_MS,
      ).toISOString();

      // When
      const result = isRecentlyAccessed(sevenDaysAgo);

      // Then
      expect(result).toBe(true);
    });
  });

  describe('7일 초과 접속', () => {
    it('8일 전에 접속했으면 false를 반환한다', () => {
      // Given
      const eightDaysAgo = new Date(
        BASE_TIME.getTime() - 8 * DAY_MS,
      ).toISOString();

      // When
      const result = isRecentlyAccessed(eightDaysAgo);

      // Then
      expect(result).toBe(false);
    });

    it('30일 전에 접속했으면 false를 반환한다', () => {
      // Given
      const thirtyDaysAgo = new Date(
        BASE_TIME.getTime() - 30 * DAY_MS,
      ).toISOString();

      // When
      const result = isRecentlyAccessed(thirtyDaysAgo);

      // Then
      expect(result).toBe(false);
    });

    it('1년 전에 접속했으면 false를 반환한다', () => {
      // Given
      const oneYearAgo = new Date(
        BASE_TIME.getTime() - 365 * DAY_MS,
      ).toISOString();

      // When
      const result = isRecentlyAccessed(oneYearAgo);

      // Then
      expect(result).toBe(false);
    });
  });
});
