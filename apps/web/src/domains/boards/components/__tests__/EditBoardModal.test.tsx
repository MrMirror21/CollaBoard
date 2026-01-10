import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import type { ReactNode } from 'react';
import EditBoardModal from '@/domains/boards/components/EditBoardModal';
import apiClient from '@/lib/api/api-client';
import { BOARD_COLOR_PRESETS } from '@/domains/boards/constants/colors';

// react-router-dom의 useNavigate 모킹
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// apiClient 모킹
vi.mock('@/lib/api/api-client', () => ({
  default: {
    patch: vi.fn(),
  },
}));

const mockApiClient = vi.mocked(apiClient);

describe('EditBoardModal', () => {
  let queryClient: QueryClient;

  const createWrapper = () => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    return function Wrapper({ children }: { children: ReactNode }) {
      return (
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>{children}</MemoryRouter>
        </QueryClientProvider>
      );
    };
  };

  const mockBoard = {
    id: 'board-123',
    title: '기존 프로젝트',
    backgroundColor: '#0079BF',
    updatedAt: '2025-01-07T12:00:00.000Z',
    lastAccessedAt: '2025-01-10T12:00:00.000Z',
  };

  const createDefaultProps = () => ({
    isOpen: true,
    onClose: vi.fn(),
    onSuccess: vi.fn(),
    board: mockBoard,
  });

  const mockBoardResponse = {
    id: 'board-123',
    title: '수정된 프로젝트',
    backgroundColor: '#519839',
    createdAt: '2025-01-07T12:00:00.000Z',
    updatedAt: '2025-01-10T14:00:00.000Z',
    lastAccessedAt: '2025-01-10T14:00:00.000Z',
    listsCount: 3,
    cardsCount: 10,
    members: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    queryClient?.clear();
  });

  describe('렌더링', () => {
    it('모달이 열리면 "보드 수정하기" 제목이 표시된다', () => {
      // Given
      const props = createDefaultProps();
      const Wrapper = createWrapper();

      // When
      render(
        <Wrapper>
          <EditBoardModal {...props} />
        </Wrapper>,
      );

      // Then
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('보드 수정하기')).toBeInTheDocument();
    });

    it('isOpen이 false면 모달이 렌더링되지 않는다', () => {
      // Given
      const props = { ...createDefaultProps(), isOpen: false };
      const Wrapper = createWrapper();

      // When
      render(
        <Wrapper>
          <EditBoardModal {...props} />
        </Wrapper>,
      );

      // Then
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('취소 버튼과 수정하기 버튼이 표시된다', () => {
      // Given
      const props = createDefaultProps();
      const Wrapper = createWrapper();

      // When
      render(
        <Wrapper>
          <EditBoardModal {...props} />
        </Wrapper>,
      );

      // Then
      expect(screen.getByRole('button', { name: '취소' })).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: '수정하기' }),
      ).toBeInTheDocument();
    });

    it('닫기 버튼이 표시된다', () => {
      // Given
      const props = createDefaultProps();
      const Wrapper = createWrapper();

      // When
      render(
        <Wrapper>
          <EditBoardModal {...props} />
        </Wrapper>,
      );

      // Then
      expect(screen.getByRole('button', { name: '닫기' })).toBeInTheDocument();
    });

    it('6개의 색상 선택 버튼이 표시된다', () => {
      // Given
      const props = createDefaultProps();
      const Wrapper = createWrapper();

      // When
      render(
        <Wrapper>
          <EditBoardModal {...props} />
        </Wrapper>,
      );

      // Then
      const colorButtons = screen.getAllByRole('radio');
      expect(colorButtons).toHaveLength(BOARD_COLOR_PRESETS.length);
    });
  });

  describe('기존 데이터 바인딩', () => {
    it('모달 오픈 시 기존 보드 제목이 입력 필드에 표시된다', async () => {
      // Given
      const props = createDefaultProps();
      const Wrapper = createWrapper();

      // When
      render(
        <Wrapper>
          <EditBoardModal {...props} />
        </Wrapper>,
      );

      // Then
      await waitFor(() => {
        const input = screen.getByLabelText(/보드 제목/);
        expect(input).toHaveValue(mockBoard.title);
      });
    });

    it('기존 배경색이 선택된 상태로 표시된다', async () => {
      // Given
      const props = createDefaultProps();
      const Wrapper = createWrapper();

      // When
      render(
        <Wrapper>
          <EditBoardModal {...props} />
        </Wrapper>,
      );

      // Then
      await waitFor(() => {
        const blueColorButton = screen.getByRole('radio', { name: '파랑' });
        expect(blueColorButton).toHaveAttribute('aria-checked', 'true');
      });
    });

    it('미리보기에 기존 배경색이 적용된다', async () => {
      // Given
      const props = createDefaultProps();
      const Wrapper = createWrapper();

      // When
      render(
        <Wrapper>
          <EditBoardModal {...props} />
        </Wrapper>,
      );

      // Then
      await waitFor(() => {
        const preview = document.querySelector('div[style*="height: 80px"]');
        expect(preview).toBeInTheDocument();
        // 기본 색상 #0079BF = rgb(0, 121, 191)
        expect(preview).toHaveStyle({ backgroundColor: 'rgb(0, 121, 191)' });
      });
    });

    it('기존 제목의 글자 수가 카운터에 표시된다', async () => {
      // Given
      const props = createDefaultProps();
      const Wrapper = createWrapper();

      // When
      render(
        <Wrapper>
          <EditBoardModal {...props} />
        </Wrapper>,
      );

      // Then - '기존 프로젝트'는 7글자 (공백 포함)
      await waitFor(() => {
        expect(screen.getByText('7 / 100')).toBeInTheDocument();
      });
    });
  });

  describe('제목 수정', () => {
    it('제목을 수정할 수 있다', async () => {
      // Given
      const user = userEvent.setup();
      const props = createDefaultProps();
      const Wrapper = createWrapper();
      render(
        <Wrapper>
          <EditBoardModal {...props} />
        </Wrapper>,
      );

      // When
      const input = screen.getByLabelText(/보드 제목/);
      await user.clear(input);
      await user.type(input, '수정된 프로젝트');

      // Then
      expect(input).toHaveValue('수정된 프로젝트');
    });

    it('제목이 비어있으면 수정하기 버튼이 비활성화된다', async () => {
      // Given
      const user = userEvent.setup();
      const props = createDefaultProps();
      const Wrapper = createWrapper();
      render(
        <Wrapper>
          <EditBoardModal {...props} />
        </Wrapper>,
      );

      // When
      const input = screen.getByLabelText(/보드 제목/);
      await user.clear(input);

      // Then
      await waitFor(() => {
        const submitButton = screen.getByRole('button', { name: '수정하기' });
        expect(submitButton).toBeDisabled();
      });
    });

    it('100자 초과 시 에러 메시지가 표시된다', async () => {
      // Given
      const user = userEvent.setup();
      const props = createDefaultProps();
      const Wrapper = createWrapper();
      render(
        <Wrapper>
          <EditBoardModal {...props} />
        </Wrapper>,
      );

      // When
      const input = screen.getByLabelText(/보드 제목/);
      await user.clear(input);
      await user.type(input, 'a'.repeat(101));

      // Then
      await waitFor(() => {
        expect(
          screen.getByText('보드 제목은 100자 이하로 입력해주세요.'),
        ).toBeInTheDocument();
      });
    });

    it('실시간 글자 수 카운터가 표시된다', async () => {
      // Given
      const user = userEvent.setup();
      const props = createDefaultProps();
      const Wrapper = createWrapper();
      render(
        <Wrapper>
          <EditBoardModal {...props} />
        </Wrapper>,
      );

      // When
      const input = screen.getByLabelText(/보드 제목/);
      await user.clear(input);
      await user.type(input, '새로운 제목');

      // Then - '새로운 제목'은 6글자
      await waitFor(() => {
        expect(screen.getByText('6 / 100')).toBeInTheDocument();
      });
    });
  });

  describe('배경색 수정', () => {
    it('다른 배경색을 선택할 수 있다', async () => {
      // Given
      const user = userEvent.setup();
      const props = createDefaultProps();
      const Wrapper = createWrapper();
      render(
        <Wrapper>
          <EditBoardModal {...props} />
        </Wrapper>,
      );

      // When
      const greenColorButton = screen.getByRole('radio', { name: '초록' });
      await user.click(greenColorButton);

      // Then
      expect(greenColorButton).toHaveAttribute('aria-checked', 'true');
    });

    it('선택 시 미리보기가 즉시 업데이트된다', async () => {
      // Given
      const user = userEvent.setup();
      const props = createDefaultProps();
      const Wrapper = createWrapper();
      render(
        <Wrapper>
          <EditBoardModal {...props} />
        </Wrapper>,
      );

      // When
      const greenColorButton = screen.getByRole('radio', { name: '초록' });
      await user.click(greenColorButton);

      // Then
      await waitFor(() => {
        const preview = document.querySelector('div[style*="height: 80px"]');
        // 초록: #519839 = rgb(81, 152, 57)
        expect(preview).toHaveStyle({ backgroundColor: 'rgb(81, 152, 57)' });
      });
    });
  });

  describe('변경 사항 감지', () => {
    it('변경 사항이 없으면 수정하기 버튼이 비활성화된다', async () => {
      // Given
      const props = createDefaultProps();
      const Wrapper = createWrapper();

      // When
      render(
        <Wrapper>
          <EditBoardModal {...props} />
        </Wrapper>,
      );

      // Then - 초기 상태에서는 변경 없으므로 비활성화
      await waitFor(() => {
        const submitButton = screen.getByRole('button', { name: '수정하기' });
        expect(submitButton).toBeDisabled();
      });
    });

    it('제목만 변경해도 수정하기 버튼이 활성화된다', async () => {
      // Given
      const user = userEvent.setup();
      const props = createDefaultProps();
      const Wrapper = createWrapper();
      render(
        <Wrapper>
          <EditBoardModal {...props} />
        </Wrapper>,
      );

      // When
      const input = screen.getByLabelText(/보드 제목/);
      await user.type(input, ' 수정');

      // Then
      await waitFor(() => {
        const submitButton = screen.getByRole('button', { name: '수정하기' });
        expect(submitButton).not.toBeDisabled();
      });
    });

    it('배경색만 변경해도 수정하기 버튼이 활성화된다', async () => {
      // Given
      const user = userEvent.setup();
      const props = createDefaultProps();
      const Wrapper = createWrapper();
      render(
        <Wrapper>
          <EditBoardModal {...props} />
        </Wrapper>,
      );

      // When
      const greenColorButton = screen.getByRole('radio', { name: '초록' });
      await user.click(greenColorButton);

      // Then
      await waitFor(() => {
        const submitButton = screen.getByRole('button', { name: '수정하기' });
        expect(submitButton).not.toBeDisabled();
      });
    });
  });

  describe('모달 닫기', () => {
    it('닫기 버튼 클릭 시 onClose가 호출된다', async () => {
      // Given
      const user = userEvent.setup();
      const props = createDefaultProps();
      const Wrapper = createWrapper();
      render(
        <Wrapper>
          <EditBoardModal {...props} />
        </Wrapper>,
      );

      // When
      await user.click(screen.getByRole('button', { name: '닫기' }));

      // Then
      expect(props.onClose).toHaveBeenCalled();
    });

    it('취소 버튼 클릭 시 onClose가 호출된다', async () => {
      // Given
      const user = userEvent.setup();
      const props = createDefaultProps();
      const Wrapper = createWrapper();
      render(
        <Wrapper>
          <EditBoardModal {...props} />
        </Wrapper>,
      );

      // When
      await user.click(screen.getByRole('button', { name: '취소' }));

      // Then
      expect(props.onClose).toHaveBeenCalled();
    });

    it('ESC 키 입력 시 onClose가 호출된다', async () => {
      // Given
      const user = userEvent.setup();
      const props = createDefaultProps();
      const Wrapper = createWrapper();
      render(
        <Wrapper>
          <EditBoardModal {...props} />
        </Wrapper>,
      );

      // When
      await user.keyboard('{Escape}');

      // Then
      expect(props.onClose).toHaveBeenCalled();
    });
  });

  describe('저장 처리', () => {
    it('수정하기 버튼 클릭 시 API가 호출된다', async () => {
      // Given
      const user = userEvent.setup();
      const props = createDefaultProps();
      const Wrapper = createWrapper();

      mockApiClient.patch.mockResolvedValueOnce({
        data: {
          success: true,
          data: mockBoardResponse,
          timestamp: '2025-01-10T14:00:00.000Z',
        },
      });

      render(
        <Wrapper>
          <EditBoardModal {...props} />
        </Wrapper>,
      );

      // When - 제목 변경 후 저장
      const input = screen.getByLabelText(/보드 제목/);
      await user.type(input, ' 수정됨');
      await user.click(screen.getByRole('button', { name: '수정하기' }));

      // Then
      await waitFor(() => {
        expect(mockApiClient.patch).toHaveBeenCalledWith(
          `/boards/${mockBoard.id}`,
          expect.objectContaining({
            title: '기존 프로젝트 수정됨',
            backgroundColor: mockBoard.backgroundColor,
          }),
        );
      });
    });

    it('저장 중 로딩 상태가 표시된다', async () => {
      // Given
      const user = userEvent.setup();
      const props = createDefaultProps();
      const Wrapper = createWrapper();

      let resolvePromise: (value: any) => void;
      const pendingPromise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      mockApiClient.patch.mockReturnValueOnce(pendingPromise as any);

      render(
        <Wrapper>
          <EditBoardModal {...props} />
        </Wrapper>,
      );

      // When
      const input = screen.getByLabelText(/보드 제목/);
      await user.type(input, ' 수정됨');
      await user.click(screen.getByRole('button', { name: '수정하기' }));

      // Then
      await waitFor(() => {
        expect(screen.getByText('수정 중...')).toBeInTheDocument();
      });

      // Cleanup
      resolvePromise!({
        data: {
          success: true,
          data: mockBoardResponse,
          timestamp: '2025-01-10T14:00:00.000Z',
        },
      });
    });

    it('저장 성공 시 onClose와 onSuccess가 호출된다', async () => {
      // Given
      const user = userEvent.setup();
      const props = createDefaultProps();
      const Wrapper = createWrapper();

      mockApiClient.patch.mockResolvedValueOnce({
        data: {
          success: true,
          data: mockBoardResponse,
          timestamp: '2025-01-10T14:00:00.000Z',
        },
      });

      render(
        <Wrapper>
          <EditBoardModal {...props} />
        </Wrapper>,
      );

      // When
      const input = screen.getByLabelText(/보드 제목/);
      await user.type(input, ' 수정됨');
      await user.click(screen.getByRole('button', { name: '수정하기' }));

      // Then
      await waitFor(() => {
        expect(props.onClose).toHaveBeenCalled();
      });
      expect(props.onSuccess).toHaveBeenCalled();
    });

    it('저장 성공 시 해당 보드 페이지로 이동한다', async () => {
      // Given
      const user = userEvent.setup();
      const props = createDefaultProps();
      const Wrapper = createWrapper();

      mockApiClient.patch.mockResolvedValueOnce({
        data: {
          success: true,
          data: mockBoardResponse,
          timestamp: '2025-01-10T14:00:00.000Z',
        },
      });

      render(
        <Wrapper>
          <EditBoardModal {...props} />
        </Wrapper>,
      );

      // When
      const input = screen.getByLabelText(/보드 제목/);
      await user.type(input, ' 수정됨');
      await user.click(screen.getByRole('button', { name: '수정하기' }));

      // Then
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith(
          `/boards/${mockBoardResponse.id}`,
        );
      });
    });

    it('저장 중에는 모달을 닫을 수 없다', async () => {
      // Given
      const user = userEvent.setup();
      const props = createDefaultProps();
      const Wrapper = createWrapper();

      let resolvePromise: (value: any) => void;
      const pendingPromise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      mockApiClient.patch.mockReturnValueOnce(pendingPromise as any);

      render(
        <Wrapper>
          <EditBoardModal {...props} />
        </Wrapper>,
      );

      // When
      const input = screen.getByLabelText(/보드 제목/);
      await user.type(input, ' 수정됨');
      await user.click(screen.getByRole('button', { name: '수정하기' }));

      await waitFor(() => {
        expect(screen.getByText('수정 중...')).toBeInTheDocument();
      });

      // 닫기 버튼 클릭 시도
      await user.click(screen.getByRole('button', { name: '닫기' }));

      // Then
      expect(props.onClose).not.toHaveBeenCalled();

      // Cleanup
      resolvePromise!({
        data: {
          success: true,
          data: mockBoardResponse,
          timestamp: '2025-01-10T14:00:00.000Z',
        },
      });
    });

    it('저장 실패 시 에러 메시지가 표시된다', async () => {
      // Given
      const user = userEvent.setup();
      const props = createDefaultProps();
      const Wrapper = createWrapper();

      mockApiClient.patch.mockRejectedValueOnce(new Error('Network Error'));

      render(
        <Wrapper>
          <EditBoardModal {...props} />
        </Wrapper>,
      );

      // When
      const input = screen.getByLabelText(/보드 제목/);
      await user.type(input, ' 수정됨');
      await user.click(screen.getByRole('button', { name: '수정하기' }));

      // Then
      await waitFor(() => {
        expect(
          screen.getByText('보드 수정에 실패했습니다. 다시 시도해주세요.'),
        ).toBeInTheDocument();
      });
    });
  });

  describe('접근성', () => {
    it('모달에 role="dialog"가 설정된다', () => {
      // Given
      const props = createDefaultProps();
      const Wrapper = createWrapper();

      // When
      render(
        <Wrapper>
          <EditBoardModal {...props} />
        </Wrapper>,
      );

      // Then
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('제목 입력 필드에 aria-required가 설정된다', () => {
      // Given
      const props = createDefaultProps();
      const Wrapper = createWrapper();

      // When
      render(
        <Wrapper>
          <EditBoardModal {...props} />
        </Wrapper>,
      );

      // Then
      const input = screen.getByLabelText(/보드 제목/);
      expect(input).toHaveAttribute('aria-required', 'true');
    });

    it('에러 발생 시 aria-invalid가 true로 설정된다', async () => {
      // Given
      const user = userEvent.setup();
      const props = createDefaultProps();
      const Wrapper = createWrapper();
      render(
        <Wrapper>
          <EditBoardModal {...props} />
        </Wrapper>,
      );

      // When
      const input = screen.getByLabelText(/보드 제목/);
      await user.clear(input);
      await user.type(input, 'a'.repeat(101));

      // Then
      await waitFor(() => {
        expect(input).toHaveAttribute('aria-invalid', 'true');
      });
    });

    it('에러 메시지에 role="alert"가 설정된다', async () => {
      // Given
      const user = userEvent.setup();
      const props = createDefaultProps();
      const Wrapper = createWrapper();
      render(
        <Wrapper>
          <EditBoardModal {...props} />
        </Wrapper>,
      );

      // When
      const input = screen.getByLabelText(/보드 제목/);
      await user.clear(input);
      await user.type(input, 'a'.repeat(101));

      // Then
      await waitFor(() => {
        const errorMessage = screen.getByRole('alert');
        expect(errorMessage).toHaveTextContent(
          '보드 제목은 100자 이하로 입력해주세요.',
        );
      });
    });
  });
});
