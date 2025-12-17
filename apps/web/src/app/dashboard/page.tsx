import CreateBoardButton from '@/domains/boards/CreateBoardButton';
import { DashboardHeader } from '@/domains/boards/components/DashboardHeader';

function DashboardPage() {
  return (
    <>
      <DashboardHeader title="내 보드" actions={<CreateBoardButton />} />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" />
    </>
  );
}

export default DashboardPage;
