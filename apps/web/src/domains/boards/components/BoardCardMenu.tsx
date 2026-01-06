import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { MoreVertical, Pencil, Trash2 } from 'lucide-react';

import { cn } from '@/lib/utils/cn';

interface BoardCardMenuProps {
  onEdit: () => void;
  onDelete: () => void;
  className?: string;
}

export function BoardCardMenu({
  onEdit,
  onDelete,
  className,
}: BoardCardMenuProps) {
  return (
    <Menu as="div" className={cn('relative', className)}>
      <MenuButton
        className={cn(
          'p-1.5 rounded-md transition-colors',
          'text-white/80 hover:text-white hover:bg-black/20',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50',
        )}
        aria-label="보드 옵션"
        onClick={(e) => e.stopPropagation()}
      >
        <MoreVertical className="w-4 h-4" />
      </MenuButton>

      <MenuItems
        className={cn(
          'absolute right-0 mt-1 w-36 z-50',
          'bg-white rounded-lg shadow-lg ring-1 ring-black/5',
          'dark:bg-slate-800 dark:ring-white/10',
          'focus:outline-none',
          'origin-top-right',
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="py-1">
          <MenuItem>
            {({ focus }) => (
              <button
                type="button"
                className={cn(
                  'flex items-center gap-2 w-full px-3 py-2 text-sm text-left',
                  'transition-colors',
                  focus
                    ? 'bg-slate-100 text-slate-900 dark:bg-slate-700 dark:text-white'
                    : 'text-slate-700 dark:text-slate-200',
                )}
                onClick={onEdit}
              >
                <Pencil className="w-4 h-4" />
                수정
              </button>
            )}
          </MenuItem>
          <MenuItem>
            {({ focus }) => (
              <button
                type="button"
                className={cn(
                  'flex items-center gap-2 w-full px-3 py-2 text-sm text-left',
                  'transition-colors',
                  focus
                    ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'
                    : 'text-red-600 dark:text-red-400',
                )}
                onClick={onDelete}
              >
                <Trash2 className="w-4 h-4" />
                삭제
              </button>
            )}
          </MenuItem>
        </div>
      </MenuItems>
    </Menu>
  );
}
