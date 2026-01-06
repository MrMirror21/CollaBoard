import { cn } from '@/lib/utils/cn';

const BACKGROUND_HEIGHT_PX = 100;
const INFO_HEIGHT_PX = 60;

interface BoardCardSkeletonProps {
  className?: string;
}

export function BoardCardSkeleton({ className }: BoardCardSkeletonProps) {
  return (
    <div
      className={cn(
        'rounded-lg overflow-hidden shadow-md',
        'animate-pulse',
        className,
      )}
    >
      {/* 배경색 영역 스켈레톤 */}
      <div
        className="bg-gray-200 dark:bg-gray-700"
        style={{ height: `${BACKGROUND_HEIGHT_PX}px` }}
      />

      {/* 정보 영역 스켈레톤 */}
      <div
        className={cn(
          'bg-white dark:bg-slate-800 px-4 py-3',
          'flex flex-col justify-center',
        )}
        style={{ height: `${INFO_HEIGHT_PX}px` }}
      >
        <div className="flex items-center justify-between gap-2">
          {/* 제목 스켈레톤 */}
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/5" />
          {/* 뱃지 스켈레톤 */}
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-full w-16" />
        </div>
        {/* 시간 스켈레톤 */}
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mt-2" />
      </div>
    </div>
  );
}
