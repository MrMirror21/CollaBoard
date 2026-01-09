import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BoardPreview } from '../BoardPreview';

describe('BoardPreview', () => {
  describe('렌더링', () => {
    it('배경색이 적용된다', () => {
      // Given
      const backgroundColor = '#0079BF';

      // When
      const { container } = render(
        <BoardPreview backgroundColor={backgroundColor} />,
      );

      // Then
      const previewDiv = container.firstChild as HTMLElement;
      expect(previewDiv).toHaveStyle({ backgroundColor });
    });

    it('높이가 80px로 설정된다', () => {
      // Given
      const backgroundColor = '#0079BF';

      // When
      const { container } = render(
        <BoardPreview backgroundColor={backgroundColor} />,
      );

      // Then
      const previewDiv = container.firstChild as HTMLElement;
      expect(previewDiv).toHaveStyle({ height: '80px' });
    });

    it('추가 className이 적용된다', () => {
      // Given
      const backgroundColor = '#0079BF';
      const className = 'custom-class';

      // When
      const { container } = render(
        <BoardPreview
          backgroundColor={backgroundColor}
          className={className}
        />,
      );

      // Then
      const previewDiv = container.firstChild as HTMLElement;
      expect(previewDiv).toHaveClass('custom-class');
    });
  });

  describe('접근성', () => {
    it('aria-hidden="true"가 설정된다', () => {
      // Given
      const backgroundColor = '#0079BF';

      // When
      const { container } = render(
        <BoardPreview backgroundColor={backgroundColor} />,
      );

      // Then
      const previewDiv = container.firstChild as HTMLElement;
      expect(previewDiv).toHaveAttribute('aria-hidden', 'true');
    });

    it('스크린 리더에서 숨겨진다', () => {
      // Given
      const backgroundColor = '#0079BF';

      // When
      render(<BoardPreview backgroundColor={backgroundColor} />);

      // Then
      // aria-hidden 요소는 접근성 트리에서 제외됨
      expect(screen.queryByRole('img')).not.toBeInTheDocument();
    });
  });

  describe('다양한 색상', () => {
    const testColors = [
      { id: 'blue', value: '#0079BF' },
      { id: 'orange', value: '#D29034' },
      { id: 'green', value: '#519839' },
      { id: 'red', value: '#B04632' },
      { id: 'purple', value: '#89609E' },
      { id: 'pink', value: '#CD5A91' },
    ];

    it.each(testColors)('$id 색상($value)이 올바르게 적용된다', ({ value }) => {
      // When
      const { container } = render(<BoardPreview backgroundColor={value} />);

      // Then
      const previewDiv = container.firstChild as HTMLElement;
      expect(previewDiv).toHaveStyle({ backgroundColor: value });
    });
  });
});
