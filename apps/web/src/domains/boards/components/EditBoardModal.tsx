import { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  DialogBackdrop,
} from '@headlessui/react';
import { X, Loader2 } from 'lucide-react';

import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { BoardPreview } from '@/domains/boards/components/BoardPreview';
import { ColorPicker } from '@/domains/boards/components/ColorPicker';
import type { BoardCardData } from '@/domains/boards/components/BoardCard';
import { useEditBoard } from '@/domains/boards/hooks/useEditBoard';
import {
  editBoardSchema,
  type EditBoardFormData,
} from '@/domains/boards/schemas/createBoardSchema';
import { TITLE_MAX_LENGTH } from './CreateBoardModal';

interface EditBoardModalProps {
  board: BoardCardData;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

function EditBoardModal({
  board,
  isOpen,
  onClose,
  onSuccess,
}: EditBoardModalProps) {
  const navigate = useNavigate();
  const titleInputRef = useRef<HTMLInputElement>(null);
  const editBoardMutation = useEditBoard();
  const {
    reset: resetMutation,
    mutateAsync: mutateAsyncMutation,
    isPending: isPendingMutation,
    isError: isErrorMutation,
  } = editBoardMutation;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isValid },
  } = useForm<EditBoardFormData>({
    resolver: zodResolver(editBoardSchema),
    defaultValues: {
      boardId: '',
      title: '',
      backgroundColor: '',
    },
    mode: 'onChange',
  });

  const title = watch('title');
  const backgroundColor = watch('backgroundColor');
  const titleLength = title.length;

  useEffect(() => {
    if (isOpen) {
      reset({
        boardId: board.id,
        title: board.title,
        backgroundColor: board.backgroundColor,
      });
      // 모달 수정 실패 후 에러 상태 초기화 (API 호출 후 에러 상태 초기화)
      resetMutation();
      // 다음 틱에서 포커스 (Dialog 애니메이션 완료 후)
      setTimeout(() => {
        titleInputRef.current?.focus();
      }, 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, reset, resetMutation]);

  const handleColorSelect = (color: string) => {
    setValue('backgroundColor', color, { shouldValidate: true });
  };

  const onSubmit = async (data: EditBoardFormData) => {
    try {
      const newBoard = await mutateAsyncMutation(data);
      onClose();
      onSuccess?.();
      navigate(`/boards/${newBoard.id}`);
    } catch {
      // 에러는 mutation의 error 상태로 처리
    }
  };

  const handleClose = () => {
    if (!isPendingMutation) {
      onClose();
    }
  };

  const { ref: registerRef, ...titleRegisterProps } = register('title');

  return (
    <Dialog open={isOpen} onClose={handleClose} className="relative z-50">
      <DialogBackdrop
        transition
        className={cn(
          'fixed inset-0 bg-black/50 backdrop-blur-sm',
          'transition-opacity duration-200',
          'data-closed:opacity-0',
        )}
      />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel
          transition
          className={cn(
            'w-full max-w-md rounded-xl bg-white p-6 shadow-xl',
            'dark:bg-slate-900',
            'transition-all duration-200',
            'data-closed:scale-95 data-closed:opacity-0',
          )}
        >
          {/* 헤더 */}
          <div className="flex items-center justify-between mb-6">
            <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              보드 수정하기
            </DialogTitle>
            <button
              type="button"
              onClick={handleClose}
              disabled={isPendingMutation}
              className={cn(
                'rounded-lg p-1.5 text-gray-400 transition-colors',
                'hover:bg-gray-100 hover:text-gray-600',
                'dark:hover:bg-slate-800 dark:hover:text-gray-300',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
                'disabled:opacity-50 disabled:cursor-not-allowed',
              )}
              aria-label="닫기"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            {/* 미리보기 */}
            <BoardPreview backgroundColor={backgroundColor} className="mb-6" />

            {/* 제목 입력 */}
            <div className="mb-6">
              <label
                htmlFor="board-title"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                보드 제목 <span className="text-red-500">*</span>
              </label>
              <Input
                id="board-title"
                type="text"
                placeholder="프로젝트 이름을 입력하세요"
                aria-required="true"
                aria-invalid={!!errors.title}
                aria-describedby={errors.title ? 'title-error' : undefined}
                {...titleRegisterProps}
                ref={(e) => {
                  registerRef(e);
                  (
                    titleInputRef as React.MutableRefObject<HTMLInputElement | null>
                  ).current = e;
                }}
                className={cn(
                  'h-11',
                  errors.title && 'border-red-500 focus-visible:ring-red-500',
                )}
              />
              <div className="flex justify-between mt-1.5">
                {errors.title ? (
                  <p
                    id="title-error"
                    role="alert"
                    className="text-sm text-red-500"
                  >
                    {errors.title.message}
                  </p>
                ) : (
                  <span />
                )}
                <span
                  className={cn(
                    'text-sm',
                    titleLength > TITLE_MAX_LENGTH
                      ? 'text-red-500'
                      : 'text-gray-400',
                  )}
                >
                  {titleLength} / {TITLE_MAX_LENGTH}
                </span>
              </div>
            </div>

            {/* 배경색 선택 */}
            <div className="mb-6">
              <span className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                배경색
              </span>
              <ColorPicker
                selectedColor={backgroundColor}
                onSelect={handleColorSelect}
              />
            </div>

            {/* 에러 메시지 */}
            {isErrorMutation && (
              <div
                role="alert"
                className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-sm text-red-600 dark:text-red-400"
              >
                보드 수정에 실패했습니다. 다시 시도해주세요.
              </div>
            )}

            {/* 버튼 */}
            <div className="flex gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={handleClose}
                disabled={isPendingMutation}
                className="flex-1"
              >
                취소
              </Button>
              <Button
                type="submit"
                disabled={!isValid || isPendingMutation}
                className={cn(
                  'flex-1 bg-blue-600 text-white',
                  'hover:bg-blue-700',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                )}
              >
                {isPendingMutation ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="animate-spin" size={16} />
                    수정 중...
                  </span>
                ) : (
                  '수정하기'
                )}
              </Button>
            </div>
          </form>
        </DialogPanel>
      </div>
    </Dialog>
  );
}

export default EditBoardModal;
