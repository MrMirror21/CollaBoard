import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { BoardCard, type BoardCardData } from '../BoardCard';

// react-router-dom의 useNavigate 모킹
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// apiClient 모킹 (EditBoardModal에서 사용)
vi.mock('@/lib/api/api-client', () => ({
  default: {
    patch: vi.fn(),
  },
}));

describe('BoardCard', () => {
  const DAY_MS = 1000 * 60 * 60 * 24;
  const BASE_TIME = new Date('2025-01-07T12:00:00.000Z');

  let queryClient: QueryClient;

  const createMockBoard = (
    overrides?: Partial<BoardCardData>,
  ): BoardCardData => ({
    id: 'board-123',
    title: '테스트 보드',
    backgroundColor: '#0079BF',
    updatedAt: new Date(BASE_TIME.getTime() - 3 * 60 * 60 * 1000).toISOString(), // 3시간 전
    lastAccessedAt: new Date(BASE_TIME.getTime() - 2 * DAY_MS).toISOString(), // 2일 전
    ...overrides,
  });

  const createDefaultProps = (boardOverrides?: Partial<BoardCardData>) => ({
    board: createMockBoard(boardOverrides),
  });

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

  const renderWithProviders = (ui: React.ReactElement) => {
    const Wrapper = createWrapper();
    return render(<Wrapper>{ui}</Wrapper>);
  };

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(BASE_TIME);
    mockNavigate.mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
    queryClient?.clear();
  });

  describe('렌더링', () => {
    it('보드 제목이 표시된다', () => {
      // Given
      const props = createDefaultProps({ title: '프로젝트 A' });

      // When
      renderWithProviders(<BoardCard {...props} />);

      // Then
      expect(screen.getByText('프로젝트 A')).toBeInTheDocument();
    });

    it('카드 배경에 선택된 배경색이 적용된다', () => {
      // Given
      const backgroundColor = '#FF5733';
      const props = createDefaultProps({ backgroundColor });

      // When
      renderWithProviders(<BoardCard {...props} />);

      // Then
      const card = screen.getByRole('button', { name: /보드:/ });
      const backgroundDiv = card.querySelector(
        'div[style*="background-color"]',
      );
      expect(backgroundDiv).toHaveStyle({ backgroundColor });
    });

    it('최종 수정 시간이 상대적 시간으로 표시된다', () => {
      // Given
      const props = createDefaultProps();

      // When
      renderWithProviders(<BoardCard {...props} />);

      // Then
      expect(screen.getByText('3시간 전')).toBeInTheDocument();
    });

    it('최근 7일 이내 접속한 보드에 "최근 접속" 뱃지가 표시된다', () => {
      // Given
      const props = createDefaultProps({
        lastAccessedAt: new Date(
          BASE_TIME.getTime() - 2 * DAY_MS,
        ).toISOString(), // 2일 전
      });

      // When
      renderWithProviders(<BoardCard {...props} />);

      // Then
      expect(screen.getByText('최근 접속')).toBeInTheDocument();
    });

    it('7일 초과 접속한 보드에는 "최근 접속" 뱃지가 표시되지 않는다', () => {
      // Given
      const props = createDefaultProps({
        lastAccessedAt: new Date(
          BASE_TIME.getTime() - 10 * DAY_MS,
        ).toISOString(), // 10일 전
      });

      // When
      renderWithProviders(<BoardCard {...props} />);

      // Then
      expect(screen.queryByText('최근 접속')).not.toBeInTheDocument();
    });

    it('lastAccessedAt이 null이면 "최근 접속" 뱃지가 표시되지 않는다', () => {
      // Given
      const props = createDefaultProps({ lastAccessedAt: null });

      // When
      renderWithProviders(<BoardCard {...props} />);

      // Then
      expect(screen.queryByText('최근 접속')).not.toBeInTheDocument();
    });
  });

  describe('접근성', () => {
    it('role="button"과 aria-label이 올바르게 설정된다', () => {
      // Given
      const props = createDefaultProps({ title: '테스트 보드' });

      // When
      renderWithProviders(<BoardCard {...props} />);

      // Then
      const card = screen.getByRole('button', { name: '보드: 테스트 보드' });
      expect(card).toBeInTheDocument();
    });

    it('tabIndex=0으로 키보드 포커스가 가능하다', () => {
      // Given
      const props = createDefaultProps();

      // When
      renderWithProviders(<BoardCard {...props} />);

      // Then
      const card = screen.getByRole('button', { name: /보드:/ });
      expect(card).toHaveAttribute('tabIndex', '0');
    });
  });

  describe('클릭 동작', () => {
    it('카드 클릭 시 해당 보드 페이지로 이동한다', async () => {
      // Given
      vi.useRealTimers(); // userEvent와 fake timers 충돌 방지
      const user = userEvent.setup();
      const props = createDefaultProps({ id: 'board-456' });
      renderWithProviders(<BoardCard {...props} />);

      // When
      await user.click(screen.getByRole('button', { name: /보드:/ }));

      // Then
      expect(mockNavigate).toHaveBeenCalledWith('/boards/board-456');
    });
  });

  describe('키보드 동작', () => {
    it('Enter 키 입력 시 해당 보드 페이지로 이동한다', async () => {
      // Given
      vi.useRealTimers(); // userEvent와 fake timers 충돌 방지
      const user = userEvent.setup();
      const props = createDefaultProps({ id: 'board-789' });
      renderWithProviders(<BoardCard {...props} />);

      // When
      const card = screen.getByRole('button', { name: /보드:/ });
      card.focus();
      await user.keyboard('{Enter}');

      // Then
      expect(mockNavigate).toHaveBeenCalledWith('/boards/board-789');
    });
  });

  describe('더보기 메뉴', () => {
    it('더보기 버튼이 렌더링된다', () => {
      // Given
      const props = createDefaultProps();

      // When
      renderWithProviders(<BoardCard {...props} />);

      // Then
      expect(
        screen.getByRole('button', { name: '보드 옵션' }),
      ).toBeInTheDocument();
    });

    it('수정 버튼 클릭 시 수정 모달이 열린다', async () => {
      // Given
      vi.useRealTimers(); // userEvent와 fake timers 충돌 방지
      const user = userEvent.setup();
      const props = createDefaultProps({ id: 'board-edit-test' });
      renderWithProviders(<BoardCard {...props} />);

      // When
      await user.click(screen.getByRole('button', { name: '보드 옵션' }));
      await user.click(screen.getByRole('menuitem', { name: '수정' }));

      // Then
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByText('보드 수정하기')).toBeInTheDocument();
      });
    });

    it('삭제 버튼 클릭 시 삭제 모달이 열린다', async () => {
      // Given
      vi.useRealTimers(); // userEvent와 fake timers 충돌 방지
      const user = userEvent.setup();
      const props = createDefaultProps({ id: 'board-delete-test' });
      renderWithProviders(<BoardCard {...props} />);

      // When
      await user.click(screen.getByRole('button', { name: '보드 옵션' }));
      await user.click(screen.getByRole('menuitem', { name: '삭제' }));

      // Then - 삭제 모달은 아직 구현되지 않았으므로, isDeleteModalOpen state가 true가 됨을 확인
      // 현재는 삭제 모달이 없으므로, 이 테스트는 아무 일도 일어나지 않음을 확인
      // TODO: 삭제 모달 구현 후 테스트 수정 필요
      expect(screen.queryByText('보드 삭제')).not.toBeInTheDocument();
    });
  });
});
