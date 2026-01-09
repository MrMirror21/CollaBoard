import { cn } from '@/lib/utils/cn';

const PREVIEW_HEIGHT_PX = 80;

interface BoardPreviewProps {
  /** 배경색 HEX 값 */
  backgroundColor: string;
  /** 추가 CSS 클래스 */
  className?: string;
}

/**
 * 보드 배경색 미리보기 컴포넌트
 * 선택된 배경색을 시각적으로 미리 보여줍니다.
 */
export function BoardPreview({
  backgroundColor,
  className,
}: BoardPreviewProps) {
  return (
    <div
      className={cn(
        'w-full rounded-lg transition-colors duration-200',
        className,
      )}
      style={{
        backgroundColor,
        height: `${PREVIEW_HEIGHT_PX}px`,
      }}
      aria-hidden="true"
    />
  );
}
