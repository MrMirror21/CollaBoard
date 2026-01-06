import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RecentAccessBadge } from '../RecentAccessBadge';

describe('RecentAccessBadge', () => {
  describe('렌더링', () => {
    it('"최근 접속" 텍스트가 표시된다', () => {
      // When
      render(<RecentAccessBadge />);

      // Then
      expect(screen.getByText('최근 접속')).toBeInTheDocument();
    });

    it('span 요소로 렌더링된다', () => {
      // When
      render(<RecentAccessBadge />);

      // Then
      const badge = screen.getByText('최근 접속');
      expect(badge.tagName).toBe('SPAN');
    });
  });

  describe('스타일', () => {
    it('기본 스타일 클래스가 적용된다', () => {
      // When
      render(<RecentAccessBadge />);

      // Then
      const badge = screen.getByText('최근 접속');
      expect(badge).toHaveClass('inline-flex');
      expect(badge).toHaveClass('rounded-full');
      expect(badge).toHaveClass('text-xs');
      expect(badge).toHaveClass('font-medium');
    });

    it('파란색 테마 클래스가 적용된다', () => {
      // When
      render(<RecentAccessBadge />);

      // Then
      const badge = screen.getByText('최근 접속');
      expect(badge).toHaveClass('bg-blue-100');
      expect(badge).toHaveClass('text-blue-700');
    });

    it('className prop으로 추가 스타일을 적용할 수 있다', () => {
      // Given
      const customClass = 'custom-test-class';

      // When
      render(<RecentAccessBadge className={customClass} />);

      // Then
      const badge = screen.getByText('최근 접속');
      expect(badge).toHaveClass(customClass);
    });
  });
});
