import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import type { ReactNode } from 'react';
import { CreateBoardModal } from '@/domains/boards/components/CreateBoardModal';
import apiClient from '@/lib/api/api-client';
import {
  BOARD_COLOR_PRESETS,
  DEFAULT_BOARD_COLOR,
} from '@/domains/boards/constants/colors';

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
    post: vi.fn(),
  },
}));

const mockApiClient = vi.mocked(apiClient);

describe('CreateBoardModal', () => {
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

  const createDefaultProps = () => ({
    isOpen: true,
    onClose: vi.fn(),
    onSuccess: vi.fn(),
  });

  const mockBoardResponse = {
    id: 'board-123',
    title: '새 프로젝트',
    backgroundColor: '#0079BF',
    createdAt: '2025-01-07T12:00:00.000Z',
    updatedAt: '2025-01-07T12:00:00.000Z',
    lastAccessedAt: null,
    listsCount: 0,
    cardsCount: 0,
    members: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    queryClient?.clear();
  });

  describe('렌더링', () => {
    it('모달이 열리면 "새 보드 만들기" 제목이 표시된다', () => {
      // Given
      const props = createDefaultProps();
      const Wrapper = createWrapper();

      // When
      render(
        <Wrapper>
          <CreateBoardModal {...props} />
        </Wrapper>,
      );

      // Then
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('새 보드 만들기')).toBeInTheDocument();
    });

    it('isOpen이 false면 모달이 렌더링되지 않는다', () => {
      // Given
      const props = { ...createDefaultProps(), isOpen: false };
      const Wrapper = createWrapper();

      // When
      render(
        <Wrapper>
          <CreateBoardModal {...props} />
        </Wrapper>,
      );

      // Then
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('배경색 미리보기가 기본 색상으로 표시된다', async () => {
      // Given
      const props = createDefaultProps();
      const Wrapper = createWrapper();

      // When
      render(
        <Wrapper>
          <CreateBoardModal {...props} />
        </Wrapper>,
      );

      // Then - 미리보기는 높이 80px의 div 요소
      await waitFor(() => {
        const preview = document.querySelector('div[style*="height: 80px"]');
        expect(preview).toBeInTheDocument();
        // 기본 색상 #0079BF = rgb(0, 121, 191)
        expect(preview).toHaveStyle({ backgroundColor: 'rgb(0, 121, 191)' });
      });
    });

    it('6개의 색상 선택 버튼이 표시된다', () => {
      // Given
      const props = createDefaultProps();
      const Wrapper = createWrapper();

      // When
      render(
        <Wrapper>
          <CreateBoardModal {...props} />
        </Wrapper>,
      );

      // Then
      const colorButtons = screen.getAllByRole('radio');
      expect(colorButtons).toHaveLength(BOARD_COLOR_PRESETS.length);
    });

    it('취소 버튼과 만들기 버튼이 표시된다', () => {
      // Given
      const props = createDefaultProps();
      const Wrapper = createWrapper();

      // When
      render(
        <Wrapper>
          <CreateBoardModal {...props} />
        </Wrapper>,
      );

      // Then
      expect(screen.getByRole('button', { name: '취소' })).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: '만들기' }),
      ).toBeInTheDocument();
    });

    it('닫기 버튼이 표시된다', () => {
      // Given
      const props = createDefaultProps();
      const Wrapper = createWrapper();

      // When
      render(
        <Wrapper>
          <CreateBoardModal {...props} />
        </Wrapper>,
      );

      // Then
      expect(screen.getByRole('button', { name: '닫기' })).toBeInTheDocument();
    });
  });

  describe('제목 입력', () => {
    it('제목 입력 필드가 표시된다', () => {
      // Given
      const props = createDefaultProps();
      const Wrapper = createWrapper();

      // When
      render(
        <Wrapper>
          <CreateBoardModal {...props} />
        </Wrapper>,
      );

      // Then
      expect(screen.getByLabelText(/보드 제목/)).toBeInTheDocument();
    });

    it('제목을 입력할 수 있다', async () => {
      // Given
      const user = userEvent.setup();
      const props = createDefaultProps();
      const Wrapper = createWrapper();
      render(
        <Wrapper>
          <CreateBoardModal {...props} />
        </Wrapper>,
      );

      // When
      const input = screen.getByLabelText(/보드 제목/);
      await user.type(input, '새 프로젝트');

      // Then
      expect(input).toHaveValue('새 프로젝트');
    });

    it('글자 수 카운터가 표시된다', async () => {
      // Given
      const user = userEvent.setup();
      const props = createDefaultProps();
      const Wrapper = createWrapper();
      render(
        <Wrapper>
          <CreateBoardModal {...props} />
        </Wrapper>,
      );

      // When
      const input = screen.getByLabelText(/보드 제목/);
      await user.type(input, '테스트');

      // Then
      expect(screen.getByText('3 / 100')).toBeInTheDocument();
    });

    it('제목이 비어있으면 만들기 버튼이 비활성화된다', () => {
      // Given
      const props = createDefaultProps();
      const Wrapper = createWrapper();

      // When
      render(
        <Wrapper>
          <CreateBoardModal {...props} />
        </Wrapper>,
      );

      // Then
      const submitButton = screen.getByRole('button', { name: '만들기' });
      expect(submitButton).toBeDisabled();
    });

    it('제목 입력 시 만들기 버튼이 활성화된다', async () => {
      // Given
      const user = userEvent.setup();
      const props = createDefaultProps();
      const Wrapper = createWrapper();
      render(
        <Wrapper>
          <CreateBoardModal {...props} />
        </Wrapper>,
      );

      // When
      const input = screen.getByLabelText(/보드 제목/);
      await user.type(input, '새 프로젝트');

      // Then
      const submitButton = screen.getByRole('button', { name: '만들기' });
      expect(submitButton).not.toBeDisabled();
    });

    it('100자 초과 입력 시 에러 메시지가 표시된다', async () => {
      // Given
      const user = userEvent.setup();
      const props = createDefaultProps();
      const Wrapper = createWrapper();
      render(
        <Wrapper>
          <CreateBoardModal {...props} />
        </Wrapper>,
      );

      // When
      const input = screen.getByLabelText(/보드 제목/);
      await user.type(input, 'a'.repeat(101));

      // Then
      await waitFor(() => {
        expect(
          screen.getByText('보드 제목은 100자 이하로 입력해주세요.'),
        ).toBeInTheDocument();
      });
    });
  });

  describe('배경색 선택', () => {
    it('색상 버튼 클릭 시 미리보기 색상이 변경된다', async () => {
      // Given
      const user = userEvent.setup();
      const props = createDefaultProps();
      const Wrapper = createWrapper();
      render(
        <Wrapper>
          <CreateBoardModal {...props} />
        </Wrapper>,
      );

      // When
      const greenColorButton = screen.getByRole('radio', { name: '초록' });
      await user.click(greenColorButton);

      // Then - 미리보기는 높이 80px의 div 요소
      await waitFor(() => {
        const preview = document.querySelector('div[style*="height: 80px"]');
        // 초록: #519839 = rgb(81, 152, 57)
        expect(preview).toHaveStyle({ backgroundColor: 'rgb(81, 152, 57)' });
      });
    });

    it('선택된 색상에 체크 아이콘이 표시된다', async () => {
      // Given
      const user = userEvent.setup();
      const props = createDefaultProps();
      const Wrapper = createWrapper();
      render(
        <Wrapper>
          <CreateBoardModal {...props} />
        </Wrapper>,
      );

      // When
      const orangeColorButton = screen.getByRole('radio', { name: '주황' });
      await user.click(orangeColorButton);

      // Then
      expect(orangeColorButton).toHaveAttribute('aria-checked', 'true');
      const checkIcon = orangeColorButton.querySelector('svg');
      expect(checkIcon).toBeInTheDocument();
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
          <CreateBoardModal {...props} />
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
          <CreateBoardModal {...props} />
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
          <CreateBoardModal {...props} />
        </Wrapper>,
      );

      // When
      await user.keyboard('{Escape}');

      // Then
      expect(props.onClose).toHaveBeenCalled();
    });
  });

  describe('보드 생성', () => {
    it('폼 제출 시 API가 호출된다', async () => {
      // Given
      const user = userEvent.setup();
      const props = createDefaultProps();
      const Wrapper = createWrapper();

      mockApiClient.post.mockResolvedValueOnce({
        data: {
          success: true,
          data: mockBoardResponse,
          timestamp: '2025-01-07T12:00:00.000Z',
        },
      });

      render(
        <Wrapper>
          <CreateBoardModal {...props} />
        </Wrapper>,
      );

      // When
      const input = screen.getByLabelText(/보드 제목/);
      await user.type(input, '새 프로젝트');
      await user.click(screen.getByRole('button', { name: '만들기' }));

      // Then
      await waitFor(() => {
        expect(mockApiClient.post).toHaveBeenCalledWith('/boards', {
          title: '새 프로젝트',
          backgroundColor: DEFAULT_BOARD_COLOR,
        });
      });
    });

    it('생성 성공 시 onClose와 onSuccess가 호출된다', async () => {
      // Given
      const user = userEvent.setup();
      const props = createDefaultProps();
      const Wrapper = createWrapper();

      mockApiClient.post.mockResolvedValueOnce({
        data: {
          success: true,
          data: mockBoardResponse,
          timestamp: '2025-01-07T12:00:00.000Z',
        },
      });

      render(
        <Wrapper>
          <CreateBoardModal {...props} />
        </Wrapper>,
      );

      // When
      const input = screen.getByLabelText(/보드 제목/);
      await user.type(input, '새 프로젝트');
      await user.click(screen.getByRole('button', { name: '만들기' }));

      // Then
      await waitFor(() => {
        expect(props.onClose).toHaveBeenCalled();
      });
      expect(props.onSuccess).toHaveBeenCalledWith(mockBoardResponse.id);
    });

    it('생성 성공 시 해당 보드 페이지로 이동한다', async () => {
      // Given
      const user = userEvent.setup();
      const props = createDefaultProps();
      const Wrapper = createWrapper();

      mockApiClient.post.mockResolvedValueOnce({
        data: {
          success: true,
          data: mockBoardResponse,
          timestamp: '2025-01-07T12:00:00.000Z',
        },
      });

      render(
        <Wrapper>
          <CreateBoardModal {...props} />
        </Wrapper>,
      );

      // When
      const input = screen.getByLabelText(/보드 제목/);
      await user.type(input, '새 프로젝트');
      await user.click(screen.getByRole('button', { name: '만들기' }));

      // Then
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith(
          `/boards/${mockBoardResponse.id}`,
        );
      });
    });

    it('생성 중 로딩 상태가 표시된다', async () => {
      // Given
      const user = userEvent.setup();
      const props = createDefaultProps();
      const Wrapper = createWrapper();

      let resolvePromise: (value: any) => void;
      const pendingPromise = new Promise((resolve) => {
        resolvePromise = resolve;
      });
      mockApiClient.post.mockReturnValueOnce(pendingPromise as any);

      render(
        <Wrapper>
          <CreateBoardModal {...props} />
        </Wrapper>,
      );

      // When
      const input = screen.getByLabelText(/보드 제목/);
      await user.type(input, '새 프로젝트');
      await user.click(screen.getByRole('button', { name: '만들기' }));

      // Then
      await waitFor(() => {
        expect(screen.getByText('생성 중...')).toBeInTheDocument();
      });

      // Cleanup
      resolvePromise!({
        data: {
          success: true,
          data: mockBoardResponse,
          timestamp: '2025-01-07T12:00:00.000Z',
        },
      });
    });

    it('생성 중에는 모달을 닫을 수 없다', async () => {
      // Given
      const user = userEvent.setup();
      const props = createDefaultProps();
      const Wrapper = createWrapper();

      let resolvePromise: (value: any) => void;
      const pendingPromise = new Promise((resolve) => {
        resolvePromise = resolve;
      });
      mockApiClient.post.mockReturnValueOnce(pendingPromise as any);

      render(
        <Wrapper>
          <CreateBoardModal {...props} />
        </Wrapper>,
      );

      // When
      const input = screen.getByLabelText(/보드 제목/);
      await user.type(input, '새 프로젝트');
      await user.click(screen.getByRole('button', { name: '만들기' }));

      await waitFor(() => {
        expect(screen.getByText('생성 중...')).toBeInTheDocument();
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
          timestamp: '2025-01-07T12:00:00.000Z',
        },
      });
    });

    it('생성 실패 시 에러 메시지가 표시된다', async () => {
      // Given
      const user = userEvent.setup();
      const props = createDefaultProps();
      const Wrapper = createWrapper();

      mockApiClient.post.mockRejectedValueOnce(new Error('Network Error'));

      render(
        <Wrapper>
          <CreateBoardModal {...props} />
        </Wrapper>,
      );

      // When
      const input = screen.getByLabelText(/보드 제목/);
      await user.type(input, '새 프로젝트');
      await user.click(screen.getByRole('button', { name: '만들기' }));

      // Then
      await waitFor(() => {
        expect(
          screen.getByText('보드 생성에 실패했습니다. 다시 시도해주세요.'),
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
          <CreateBoardModal {...props} />
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
          <CreateBoardModal {...props} />
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
          <CreateBoardModal {...props} />
        </Wrapper>,
      );

      // When
      const input = screen.getByLabelText(/보드 제목/);
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
          <CreateBoardModal {...props} />
        </Wrapper>,
      );

      // When
      const input = screen.getByLabelText(/보드 제목/);
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

  describe('폼 초기화', () => {
    it('모달이 다시 열릴 때 폼이 초기화된다', async () => {
      // Given
      const user = userEvent.setup();
      const props = createDefaultProps();
      const Wrapper = createWrapper();
      const { rerender } = render(
        <Wrapper>
          <CreateBoardModal {...props} />
        </Wrapper>,
      );

      // 제목 입력
      const input = screen.getByLabelText(/보드 제목/);
      await user.type(input, '테스트 보드');
      expect(input).toHaveValue('테스트 보드');

      // 모달 닫기
      rerender(
        <Wrapper>
          <CreateBoardModal {...props} isOpen={false} />
        </Wrapper>,
      );

      // When - 모달 다시 열기
      rerender(
        <Wrapper>
          <CreateBoardModal {...props} isOpen />
        </Wrapper>,
      );

      // Then
      const resetInput = screen.getByLabelText(/보드 제목/);
      expect(resetInput).toHaveValue('');
    });
  });
});
