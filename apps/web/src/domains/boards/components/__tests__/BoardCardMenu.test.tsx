import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BoardCardMenu } from '../BoardCardMenu';

describe('BoardCardMenu', () => {
  const createDefaultProps = () => ({
    onEdit: vi.fn(),
    onDelete: vi.fn(),
  });

  describe('렌더링', () => {
    it('더보기 버튼이 렌더링된다', () => {
      // Given
      const props = createDefaultProps();

      // When
      render(<BoardCardMenu {...props} />);

      // Then
      expect(
        screen.getByRole('button', { name: '보드 옵션' }),
      ).toBeInTheDocument();
    });

    it('더보기 버튼에 올바른 aria-label이 설정된다', () => {
      // Given
      const props = createDefaultProps();

      // When
      render(<BoardCardMenu {...props} />);

      // Then
      const button = screen.getByRole('button', { name: '보드 옵션' });
      expect(button).toHaveAttribute('aria-label', '보드 옵션');
    });
  });

  describe('드롭다운 메뉴', () => {
    it('버튼 클릭 시 드롭다운 메뉴가 열린다', async () => {
      // Given
      const user = userEvent.setup();
      const props = createDefaultProps();
      render(<BoardCardMenu {...props} />);

      // When
      await user.click(screen.getByRole('button', { name: '보드 옵션' }));

      // Then
      expect(screen.getByRole('menu')).toBeInTheDocument();
    });

    it('드롭다운 메뉴에 수정 버튼이 표시된다', async () => {
      // Given
      const user = userEvent.setup();
      const props = createDefaultProps();
      render(<BoardCardMenu {...props} />);

      // When
      await user.click(screen.getByRole('button', { name: '보드 옵션' }));

      // Then
      expect(
        screen.getByRole('menuitem', { name: '수정' }),
      ).toBeInTheDocument();
    });

    it('드롭다운 메뉴에 삭제 버튼이 표시된다', async () => {
      // Given
      const user = userEvent.setup();
      const props = createDefaultProps();
      render(<BoardCardMenu {...props} />);

      // When
      await user.click(screen.getByRole('button', { name: '보드 옵션' }));

      // Then
      expect(
        screen.getByRole('menuitem', { name: '삭제' }),
      ).toBeInTheDocument();
    });
  });

  describe('콜백 함수 호출', () => {
    it('수정 버튼 클릭 시 onEdit 콜백이 호출된다', async () => {
      // Given
      const user = userEvent.setup();
      const props = createDefaultProps();
      render(<BoardCardMenu {...props} />);

      // When
      await user.click(screen.getByRole('button', { name: '보드 옵션' }));
      await user.click(screen.getByRole('menuitem', { name: '수정' }));

      // Then
      expect(props.onEdit).toHaveBeenCalledTimes(1);
    });

    it('삭제 버튼 클릭 시 onDelete 콜백이 호출된다', async () => {
      // Given
      const user = userEvent.setup();
      const props = createDefaultProps();
      render(<BoardCardMenu {...props} />);

      // When
      await user.click(screen.getByRole('button', { name: '보드 옵션' }));
      await user.click(screen.getByRole('menuitem', { name: '삭제' }));

      // Then
      expect(props.onDelete).toHaveBeenCalledTimes(1);
    });
  });

  describe('이벤트 전파 방지', () => {
    it('버튼 클릭 시 이벤트 전파가 중단된다', async () => {
      // Given
      const user = userEvent.setup();
      const parentClickHandler = vi.fn();
      const props = createDefaultProps();

      render(
        <button type="button" onClick={parentClickHandler}>
          <BoardCardMenu {...props} />
        </button>,
      );

      // When
      await user.click(screen.getByRole('button', { name: '보드 옵션' }));

      // Then
      expect(parentClickHandler).not.toHaveBeenCalled();
    });
  });

  describe('스타일', () => {
    it('className prop으로 추가 스타일을 적용할 수 있다', () => {
      // Given
      const props = createDefaultProps();
      const customClass = 'custom-menu-class';

      // When
      const { container } = render(
        <BoardCardMenu {...props} className={customClass} />,
      );

      // Then
      expect(container.firstChild).toHaveClass(customClass);
    });
  });
});
