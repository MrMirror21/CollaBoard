import { useState, useCallback } from 'react';

import { Button } from '@/components/ui/Button';
import { CreateBoardModal } from '@/domains/boards/components/CreateBoardModal';

interface CreateBoardButtonProps {
  onSuccess?: (boardId: string) => void;
}

/**
 * 새 보드 만들기 버튼 컴포넌트
 * 클릭 시 보드 생성 모달을 엽니다.
 */
function CreateBoardButton({ onSuccess }: CreateBoardButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpen = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  return (
    <>
      <Button onClick={handleOpen}>새 보드 만들기</Button>
      <CreateBoardModal
        isOpen={isModalOpen}
        onClose={handleClose}
        onSuccess={onSuccess}
      />
    </>
  );
}

export default CreateBoardButton;
