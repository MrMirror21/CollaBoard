import { useCallback, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';

import { type BoardSummary } from '@/domains/boards/hooks/useBoards';
import { BoardLoadingSpinner } from '@/domains/boards/components/BoardLoadingSpinner';
import { BoardCard } from '@/domains/boards/components/BoardCard';
import { BoardCardSkeleton } from '@/domains/boards/components/BoardCardSkeleton';
import { useInfiniteBoards } from '@/domains/boards/hooks/useInfiniteBoards';

const SKELETON_IDS = [
  'skeleton-1',
  'skeleton-2',
  'skeleton-3',
  'skeleton-4',
  'skeleton-5',
  'skeleton-6',
  'skeleton-7',
  'skeleton-8',
] as const;

function BoardGrid() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = useInfiniteBoards();

  const { ref: sentinelRef, inView } = useInView({
    threshold: 0.5,
    rootMargin: '200px',
  });

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  const handleEditBoard = useCallback((_boardId: string) => {
    // TODO: 보드 수정 모달 열기
  }, []);

  const handleDeleteBoard = useCallback((_boardId: string) => {
    // TODO: 보드 삭제 확인 모달 열기
  }, []);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {SKELETON_IDS.map((id) => (
          <BoardCardSkeleton key={id} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 font-medium">
            오류가 발생했습니다
          </p>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            {error.message}
          </p>
        </div>
      </div>
    );
  }

  const boards: BoardSummary[] =
    data?.pages
      .filter((page) => page.success)
      .flatMap((page) => (page.success ? page.data.items : [])) ?? [];

  if (boards.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500 dark:text-gray-400">
          보드가 없습니다. 새 보드를 만들어보세요!
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {boards.map((board: BoardSummary) => (
          <BoardCard
            key={board.id}
            board={board}
            onEdit={handleEditBoard}
            onDelete={handleDeleteBoard}
          />
        ))}
      </div>
      <div ref={sentinelRef} />
      {isFetchingNextPage && (
        <div className="flex justify-center items-center py-8">
          <BoardLoadingSpinner label="더 많은 보드를 불러오는 중..." />
        </div>
      )}
    </>
  );
}

export default BoardGrid;
