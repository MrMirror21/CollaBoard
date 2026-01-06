import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import calculateInitialLimit from '../calculateInitialLimit';

describe('calculateInitialLimit', () => {
  const originalWindow = global.window;

  afterEach(() => {
    vi.restoreAllMocks();
    global.window = originalWindow;
  });

  describe('SSR 환경 (window가 undefined)', () => {
    it('기본값 10을 반환한다', () => {
      // Given
      // @ts-expect-error window를 undefined로 설정 (SSR 시뮬레이션)
      global.window = undefined;

      // When
      const result = calculateInitialLimit();

      // Then
      expect(result).toBe(10);
    });
  });

  describe('브라우저 환경', () => {
    beforeEach(() => {
      global.window = originalWindow;
    });

    it('뷰포트 높이가 600px 미만이면 8을 반환한다', () => {
      // Given
      vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(599);

      // When
      const result = calculateInitialLimit();

      // Then
      expect(result).toBe(8);
    });

    it('뷰포트 높이가 600px이면 12를 반환한다', () => {
      // Given
      vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(600);

      // When
      const result = calculateInitialLimit();

      // Then
      expect(result).toBe(12);
    });

    it('뷰포트 높이가 600px 이상 900px 미만이면 12를 반환한다', () => {
      // Given
      vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(899);

      // When
      const result = calculateInitialLimit();

      // Then
      expect(result).toBe(12);
    });

    it('뷰포트 높이가 900px이면 16을 반환한다', () => {
      // Given
      vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(900);

      // When
      const result = calculateInitialLimit();

      // Then
      expect(result).toBe(16);
    });

    it('뷰포트 높이가 900px 이상 1200px 미만이면 16을 반환한다', () => {
      // Given
      vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(1199);

      // When
      const result = calculateInitialLimit();

      // Then
      expect(result).toBe(16);
    });

    it('뷰포트 높이가 1200px이면 20을 반환한다', () => {
      // Given
      vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(1200);

      // When
      const result = calculateInitialLimit();

      // Then
      expect(result).toBe(20);
    });

    it('뷰포트 높이가 1200px 이상이면 20을 반환한다', () => {
      // Given
      vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(1440);

      // When
      const result = calculateInitialLimit();

      // Then
      expect(result).toBe(20);
    });
  });
});
