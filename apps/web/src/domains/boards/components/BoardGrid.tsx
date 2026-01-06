import { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';

import { type BoardSummary } from '@/domains/boards/hooks/useBoards';
import { BoardLoadingSpinner } from '@/domains/boards/components/BoardLoadingSpinner';
import { useInfiniteBoards } from '@/domains/boards/hooks/useInfiniteBoards';

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
  }, [inView, hasNextPage, fetchNextPage, isLoading, error]);

  if (isLoading)
    // eslint-disable-next-line @stylistic/nonblock-statement-body-position
    return (
      <div className="flex justify-center items-center h-full">
        <BoardLoadingSpinner label="보드를 불러오는 중..." />
      </div>
    );
  if (error) return <div>Error: {error.message}</div>;

  const boards: BoardSummary[] =
    data?.pages
      .filter((page) => page.success)
      .flatMap((page) => (page.success ? page.data.items : [])) ?? [];

  if (boards.length === 0) {
    return <div>No boards found</div>;
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {boards.map((board: BoardSummary) => (
          <div key={board.id} className="col-span-1">
            <div className="bg-white rounded-lg shadow-md p-4">
              <h3 className="text-lg font-medium">{board.title}</h3>
            </div>
          </div>
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
