/**
 * 보드 로딩 스피너 컴포넌트
 *
 * 데이터 로딩 중 사용자에게 시각적 피드백을 제공하는 애니메이션 스피너 컴포넌트입니다.
 * 다양한 크기와 스타일을 지원하며, 다크모드와 접근성(a11y)을 고려하여 설계되었습니다.
 *
 * @example
 * // 기본 사용
 * <BoardLoadingSpinner />
 *
 * @example
 * // 크기와 레이블 지정
 * <BoardLoadingSpinner size="lg" label="보드를 불러오는 중..." />
 *
 * @example
 * // 전체 화면 중앙 정렬
 * <BoardLoadingSpinner fullScreen label="데이터 로딩 중..." />
 *
 * @example
 * // TanStack Query와 함께 사용
 * function BoardGrid() {
 *   const { data, isLoading } = useGetBoards();
 *
 *   if (isLoading) {
 *     return <BoardLoadingSpinner label="보드 목록을 불러오는 중..." />;
 *   }
 *
 *   return <div>{/* 보드 그리드 렌더링 *\/}</div>;
 * }
 */

import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils/cn';

const spinnerVariants = cva('animate-spin rounded-full border-solid', {
  variants: {
    size: {
      sm: 'h-4 w-4 border-2',
      md: 'h-8 w-8 border-2',
      lg: 'h-12 w-12 border-[3px]',
      xl: 'h-16 w-16 border-4',
    },
    variant: {
      default:
        'border-slate-200 border-t-slate-900 dark:border-slate-800 dark:border-t-slate-50',
      primary:
        'border-blue-200 border-t-blue-600 dark:border-blue-900 dark:border-t-blue-400',
    },
  },
  defaultVariants: {
    size: 'md',
    variant: 'default',
  },
});

interface BoardLoadingSpinnerProps
  extends VariantProps<typeof spinnerVariants> {
  /** 스피너 아래에 표시할 로딩 메시지 (선택) */
  label?: string;
  /** 추가 CSS 클래스명 (선택) */
  className?: string;
  /** true일 경우 화면 전체를 차지하며 중앙 정렬됩니다 (기본값: false) */
  fullScreen?: boolean;
}

export function BoardLoadingSpinner({
  size,
  variant,
  label,
  className,
  fullScreen = false,
}: BoardLoadingSpinnerProps) {
  const spinner = (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3',
        className,
      )}
    >
      <div
        className={cn(spinnerVariants({ size, variant }))}
        role="status"
        aria-label="로딩 중"
      >
        <span className="sr-only">로딩 중...</span>
      </div>
      {label && (
        <p className="text-sm text-slate-600 dark:text-slate-400">{label}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        {spinner}
      </div>
    );
  }

  return spinner;
}
