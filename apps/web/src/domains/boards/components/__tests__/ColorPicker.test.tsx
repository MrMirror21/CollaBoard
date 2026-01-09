import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ColorPicker } from '@/domains/boards/components/ColorPicker';
import { BOARD_COLOR_PRESETS } from '@/domains/boards/constants/colors';

describe('ColorPicker', () => {
  const createDefaultProps = () => ({
    selectedColor: BOARD_COLOR_PRESETS[0].value,
    onSelect: vi.fn(),
  });

  describe('렌더링', () => {
    it('모든 색상 프리셋이 렌더링된다', () => {
      // Given
      const props = createDefaultProps();

      // When
      render(<ColorPicker {...props} />);

      // Then
      BOARD_COLOR_PRESETS.forEach((color) => {
        expect(
          screen.getByRole('radio', { name: color.label }),
        ).toBeInTheDocument();
      });
    });

    it('6개의 색상 버튼이 표시된다', () => {
      // Given
      const props = createDefaultProps();

      // When
      render(<ColorPicker {...props} />);

      // Then
      const radioButtons = screen.getAllByRole('radio');
      expect(radioButtons).toHaveLength(6);
    });

    it('각 버튼에 올바른 배경색이 적용된다', () => {
      // Given
      const props = createDefaultProps();

      // When
      render(<ColorPicker {...props} />);

      // Then
      BOARD_COLOR_PRESETS.forEach((color) => {
        const button = screen.getByRole('radio', { name: color.label });
        expect(button).toHaveStyle({ backgroundColor: color.value });
      });
    });

    it('버튼 크기가 32x32px이다', () => {
      // Given
      const props = createDefaultProps();

      // When
      render(<ColorPicker {...props} />);

      // Then
      const firstButton = screen.getByRole('radio', {
        name: BOARD_COLOR_PRESETS[0].label,
      });
      expect(firstButton).toHaveStyle({ width: '32px', height: '32px' });
    });
  });

  describe('선택 상태', () => {
    it('선택된 색상에 aria-checked="true"가 설정된다', () => {
      // Given
      const selectedColor = BOARD_COLOR_PRESETS[2].value; // 초록
      const props = { ...createDefaultProps(), selectedColor };

      // When
      render(<ColorPicker {...props} />);

      // Then
      const selectedButton = screen.getByRole('radio', { name: '초록' });
      expect(selectedButton).toHaveAttribute('aria-checked', 'true');
    });

    it('선택되지 않은 색상에 aria-checked="false"가 설정된다', () => {
      // Given
      const selectedColor = BOARD_COLOR_PRESETS[0].value; // 파랑
      const props = { ...createDefaultProps(), selectedColor };

      // When
      render(<ColorPicker {...props} />);

      // Then
      const unselectedButton = screen.getByRole('radio', { name: '초록' });
      expect(unselectedButton).toHaveAttribute('aria-checked', 'false');
    });

    it('선택된 색상에만 체크 아이콘이 표시된다', () => {
      // Given
      const selectedColor = BOARD_COLOR_PRESETS[1].value; // 주황
      const props = { ...createDefaultProps(), selectedColor };

      // When
      render(<ColorPicker {...props} />);

      // Then
      const selectedButton = screen.getByRole('radio', { name: '주황' });
      const checkIcon = selectedButton.querySelector('svg');
      expect(checkIcon).toBeInTheDocument();

      // 다른 버튼에는 체크 아이콘이 없어야 함
      const unselectedButton = screen.getByRole('radio', { name: '파랑' });
      const noCheckIcon = unselectedButton.querySelector('svg');
      expect(noCheckIcon).not.toBeInTheDocument();
    });
  });

  describe('클릭 동작', () => {
    it('색상 버튼 클릭 시 onSelect가 해당 색상 값과 함께 호출된다', async () => {
      // Given
      const user = userEvent.setup();
      const props = createDefaultProps();
      render(<ColorPicker {...props} />);

      // When
      await user.click(screen.getByRole('radio', { name: '초록' }));

      // Then
      expect(props.onSelect).toHaveBeenCalledWith(BOARD_COLOR_PRESETS[2].value);
    });

    it('다른 색상을 클릭할 때마다 onSelect가 호출된다', async () => {
      // Given
      const user = userEvent.setup();
      const props = createDefaultProps();
      render(<ColorPicker {...props} />);

      // When
      await user.click(screen.getByRole('radio', { name: '빨강' }));
      await user.click(screen.getByRole('radio', { name: '보라' }));
      await user.click(screen.getByRole('radio', { name: '분홍' }));

      // Then
      expect(props.onSelect).toHaveBeenCalledTimes(3);
      expect(props.onSelect).toHaveBeenNthCalledWith(
        1,
        BOARD_COLOR_PRESETS[3].value,
      ); // 빨강
      expect(props.onSelect).toHaveBeenNthCalledWith(
        2,
        BOARD_COLOR_PRESETS[4].value,
      ); // 보라
      expect(props.onSelect).toHaveBeenNthCalledWith(
        3,
        BOARD_COLOR_PRESETS[5].value,
      ); // 분홍
    });
  });

  describe('접근성', () => {
    it('radiogroup role이 설정된다', () => {
      // Given
      const props = createDefaultProps();

      // When
      render(<ColorPicker {...props} />);

      // Then
      expect(screen.getByRole('radiogroup')).toBeInTheDocument();
    });

    it('radiogroup에 aria-label이 설정된다', () => {
      // Given
      const props = createDefaultProps();

      // When
      render(<ColorPicker {...props} />);

      // Then
      expect(screen.getByRole('radiogroup')).toHaveAttribute(
        'aria-label',
        '배경색 선택',
      );
    });

    it('각 버튼에 radio role이 설정된다', () => {
      // Given
      const props = createDefaultProps();

      // When
      render(<ColorPicker {...props} />);

      // Then
      const radioButtons = screen.getAllByRole('radio');
      expect(radioButtons).toHaveLength(BOARD_COLOR_PRESETS.length);
    });

    it('키보드로 색상을 선택할 수 있다', async () => {
      // Given
      const user = userEvent.setup();
      const props = createDefaultProps();
      render(<ColorPicker {...props} />);

      // When
      const firstButton = screen.getByRole('radio', { name: '파랑' });
      firstButton.focus();
      await user.keyboard('{Tab}');
      await user.keyboard('{Enter}');

      // Then
      expect(props.onSelect).toHaveBeenCalled();
    });
  });

  describe('커스텀 색상 프리셋', () => {
    it('커스텀 색상 프리셋을 전달할 수 있다', () => {
      // Given
      const customColors = [
        { id: 'custom1', value: '#111111', label: '커스텀1' },
        { id: 'custom2', value: '#222222', label: '커스텀2' },
      ] as const;
      const props = {
        selectedColor: '#111111',
        onSelect: vi.fn(),
        colors: customColors,
      };

      // When
      render(<ColorPicker {...props} />);

      // Then
      expect(
        screen.getByRole('radio', { name: '커스텀1' }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('radio', { name: '커스텀2' }),
      ).toBeInTheDocument();
      expect(screen.getAllByRole('radio')).toHaveLength(2);
    });
  });
});
