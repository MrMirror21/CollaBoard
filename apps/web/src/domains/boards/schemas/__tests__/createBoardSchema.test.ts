import { describe, it, expect } from 'vitest';
import { createBoardSchema } from '../createBoardSchema';

describe('createBoardSchema', () => {
  describe('title 필드', () => {
    it('유효한 제목으로 검증을 통과한다', () => {
      // Given
      const validData = {
        title: '프로젝트 보드',
        backgroundColor: '#0079BF',
      };

      // When
      const result = createBoardSchema.safeParse(validData);

      // Then
      expect(result.success).toBe(true);
    });

    it('빈 문자열은 검증에 실패한다', () => {
      // Given
      const invalidData = {
        title: '',
        backgroundColor: '#0079BF',
      };

      // When
      const result = createBoardSchema.safeParse(invalidData);

      // Then
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          '보드 제목을 입력해주세요.',
        );
      }
    });

    it('100자 이하 제목은 검증을 통과한다', () => {
      // Given
      const validData = {
        title: 'a'.repeat(100),
        backgroundColor: '#0079BF',
      };

      // When
      const result = createBoardSchema.safeParse(validData);

      // Then
      expect(result.success).toBe(true);
    });

    it('100자 초과 제목은 검증에 실패한다', () => {
      // Given
      const invalidData = {
        title: 'a'.repeat(101),
        backgroundColor: '#0079BF',
      };

      // When
      const result = createBoardSchema.safeParse(invalidData);

      // Then
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          '보드 제목은 100자 이하로 입력해주세요.',
        );
      }
    });

    it('공백만 있는 제목도 유효한 것으로 처리된다 (trim 없음)', () => {
      // Given
      const data = {
        title: '   ',
        backgroundColor: '#0079BF',
      };

      // When
      const result = createBoardSchema.safeParse(data);

      // Then
      expect(result.success).toBe(true);
    });
  });

  describe('backgroundColor 필드', () => {
    it('HEX 색상 값으로 검증을 통과한다', () => {
      // Given
      const validData = {
        title: '테스트 보드',
        backgroundColor: '#FF5733',
      };

      // When
      const result = createBoardSchema.safeParse(validData);

      // Then
      expect(result.success).toBe(true);
    });

    it('임의의 문자열도 검증을 통과한다 (string 타입만 검사)', () => {
      // Given
      const data = {
        title: '테스트 보드',
        backgroundColor: 'not-a-color',
      };

      // When
      const result = createBoardSchema.safeParse(data);

      // Then
      expect(result.success).toBe(true);
    });

    it('빈 문자열도 검증을 통과한다', () => {
      // Given
      const data = {
        title: '테스트 보드',
        backgroundColor: '',
      };

      // When
      const result = createBoardSchema.safeParse(data);

      // Then
      expect(result.success).toBe(true);
    });
  });

  describe('필수 필드 검증', () => {
    it('title이 누락되면 검증에 실패한다', () => {
      // Given
      const invalidData = {
        backgroundColor: '#0079BF',
      };

      // When
      const result = createBoardSchema.safeParse(invalidData);

      // Then
      expect(result.success).toBe(false);
    });

    it('backgroundColor가 누락되면 검증에 실패한다', () => {
      // Given
      const invalidData = {
        title: '테스트 보드',
      };

      // When
      const result = createBoardSchema.safeParse(invalidData);

      // Then
      expect(result.success).toBe(false);
    });
  });
});
