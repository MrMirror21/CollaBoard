import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { BoardCardSkeleton } from '../BoardCardSkeleton';

describe('BoardCardSkeleton', () => {
  describe('렌더링', () => {
    it('스켈레톤 컨테이너가 렌더링된다', () => {
      // When
      const { container } = render(<BoardCardSkeleton />);

      // Then
      expect(container.firstChild).toBeInTheDocument();
    });

    it('카드와 동일한 높이 구조를 가진다 (배경 100px + 정보 60px)', () => {
      // When
      const { container } = render(<BoardCardSkeleton />);

      // Then
      const backgroundDiv = container.querySelector(
        'div[style*="height: 100px"]',
      );
      const infoDiv = container.querySelector('div[style*="height: 60px"]');

      expect(backgroundDiv).toBeInTheDocument();
      expect(infoDiv).toBeInTheDocument();
    });
  });

  describe('스타일', () => {
    it('펄스 애니메이션 클래스가 적용된다', () => {
      // When
      const { container } = render(<BoardCardSkeleton />);

      // Then
      expect(container.firstChild).toHaveClass('animate-pulse');
    });

    it('둥근 모서리 클래스가 적용된다', () => {
      // When
      const { container } = render(<BoardCardSkeleton />);

      // Then
      expect(container.firstChild).toHaveClass('rounded-lg');
    });

    it('그림자 클래스가 적용된다', () => {
      // When
      const { container } = render(<BoardCardSkeleton />);

      // Then
      expect(container.firstChild).toHaveClass('shadow-md');
    });

    it('className prop으로 추가 스타일을 적용할 수 있다', () => {
      // Given
      const customClass = 'custom-skeleton-class';

      // When
      const { container } = render(
        <BoardCardSkeleton className={customClass} />,
      );

      // Then
      expect(container.firstChild).toHaveClass(customClass);
    });
  });

  describe('스켈레톤 요소', () => {
    it('배경 영역 스켈레톤이 표시된다', () => {
      // When
      const { container } = render(<BoardCardSkeleton />);

      // Then
      const backgroundSkeleton = container.querySelector('.bg-gray-200');
      expect(backgroundSkeleton).toBeInTheDocument();
    });

    it('제목 스켈레톤이 표시된다', () => {
      // When
      const { container } = render(<BoardCardSkeleton />);

      // Then
      const titleSkeleton = container.querySelector('.w-3\\/5');
      expect(titleSkeleton).toBeInTheDocument();
      expect(titleSkeleton).toHaveClass('h-4');
      expect(titleSkeleton).toHaveClass('rounded');
    });

    it('뱃지 스켈레톤이 표시된다', () => {
      // When
      const { container } = render(<BoardCardSkeleton />);

      // Then
      const badgeSkeleton = container.querySelector('.w-16');
      expect(badgeSkeleton).toBeInTheDocument();
      expect(badgeSkeleton).toHaveClass('rounded-full');
    });

    it('시간 스켈레톤이 표시된다', () => {
      // When
      const { container } = render(<BoardCardSkeleton />);

      // Then
      const timeSkeleton = container.querySelector('.w-1\\/4');
      expect(timeSkeleton).toBeInTheDocument();
      expect(timeSkeleton).toHaveClass('h-3');
    });
  });
});
