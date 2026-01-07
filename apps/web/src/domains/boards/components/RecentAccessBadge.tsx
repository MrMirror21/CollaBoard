import { cn } from '@/lib/utils/cn';

interface RecentAccessBadgeProps {
  className?: string;
}

export function RecentAccessBadge({ className }: RecentAccessBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center ml-2 py-0.5 text-xs text-right font-medium',
        'text-blue-700',
        'dark:bg-blue-900/30 dark:text-blue-300',
        className,
      )}
    >
      최근 접속
    </span>
  );
}
