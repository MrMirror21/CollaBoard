import CreateBoardButton from '@/domains/boards/CreateBoardButton';
import BoardGrid from '@/domains/boards/components/BoardGrid';
import { DashboardHeader } from '@/domains/boards/components/DashboardHeader';

function DashboardPage() {
  return (
    <>
      <DashboardHeader title="내 보드" actions={<CreateBoardButton />} />
      <BoardGrid />
    </>
  );
}

export default DashboardPage;
