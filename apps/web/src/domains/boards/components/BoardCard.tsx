/* eslint-disable jsx-a11y/no-noninteractive-element-to-interactive-role */
import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { cn } from '@/lib/utils/cn';
import { BoardCardMenu } from '@/domains/boards/components/BoardCardMenu';
import { RecentAccessBadge } from '@/domains/boards/components/RecentAccessBadge';
import { formatRelativeTime } from '@/domains/boards/utils/formatRelativeTime';
import { isRecentlyAccessed } from '@/domains/boards/utils/isRecentlyAccessed';
import EditBoardModal from './EditBoardModal';

export interface BoardCardData {
  id: string;
  title: string;
  backgroundColor: string;
  updatedAt: string;
  lastAccessedAt: string | null;
}

interface BoardCardProps {
  board: BoardCardData;
}

const BACKGROUND_HEIGHT_PX = 100;
const INFO_HEIGHT_PX = 60;

export function BoardCard({ board }: BoardCardProps) {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const showRecentBadge = isRecentlyAccessed(board.lastAccessedAt);
  const relativeTime = formatRelativeTime(board.updatedAt);

  const handleCardClick = useCallback(() => {
    navigate(`/boards/${board.id}`);
  }, [navigate, board.id]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handleCardClick();
      }
    },
    [handleCardClick],
  );

  const handleEdit = useCallback(() => {
    setIsEditModalOpen(true);
  }, []);

  const handleDelete = useCallback(() => {
    setIsDeleteModalOpen(true);
  }, []);

  return (
    <>
      <article
        role="button"
        aria-label={`보드: ${board.title}`}
        tabIndex={0}
        className={cn(
          'rounded-lg overflow-hidden cursor-pointer',
          'shadow-md hover:shadow-lg',
          'transition-all duration-150 ease-out',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
          (isHovered || isFocused) && 'transform -translate-y-0.5 scale-[1.02]',
        )}
        onClick={handleCardClick}
        onKeyDown={handleKeyDown}
        onPointerEnter={() => setIsHovered(true)}
        onPointerLeave={() => setIsHovered(false)}
        onFocus={() => setIsFocused(true)}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node)) {
            setIsFocused(false);
          }
        }}
      >
        {/* 배경색 영역 */}
        <div
          className="relative"
          style={{
            backgroundColor: board.backgroundColor,
            height: `${BACKGROUND_HEIGHT_PX}px`,
          }}
        >
          {/* 더보기 버튼 - 호버 시에만 표시 */}
          <div
            className={cn(
              'absolute top-2 right-2 transition-opacity duration-150',
              isHovered || isFocused ? 'opacity-100' : 'opacity-0',
            )}
          >
            <BoardCardMenu onEdit={handleEdit} onDelete={handleDelete} />
          </div>
        </div>

        {/* 정보 영역 */}
        <div
          className={cn(
            'bg-white dark:bg-slate-800 px-4 py-3',
            'flex flex-col justify-center',
          )}
          style={{ height: `${INFO_HEIGHT_PX}px` }}
        >
          <div className="flex items-center justify-between gap-2">
            <h3
              className={cn(
                'text-sm font-semibold truncate',
                'text-gray-900 dark:text-gray-100',
              )}
            >
              {board.title}
            </h3>
            {showRecentBadge && <RecentAccessBadge />}
          </div>
          <p className="text-right text-xs text-gray-500 dark:text-gray-400 mt-1">
            {relativeTime}
          </p>
        </div>
      </article>
      <EditBoardModal
        board={board}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={() => {
          setIsEditModalOpen(false);
        }}
      />
    </>
  );
}
