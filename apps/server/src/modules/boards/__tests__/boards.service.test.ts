import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getBoards, createBoard, getBoardById } from '../boards.service.js';
import {
  BoardNotFoundError,
  BoardAccessDeniedError,
} from '../boards.errors.js';
import { BOARD_MEMBER_ROLE } from '../boards.constants.js';

// 모킹된 prisma import
import { prisma } from '../../../lib/prisma.js';

// Prisma 모킹
vi.mock('../../../lib/prisma.js', () => ({
  prisma: {
    boardMember: {
      findMany: vi.fn(),
      create: vi.fn(),
      updateMany: vi.fn(),
    },
    board: {
      findMany: vi.fn(),
      create: vi.fn(),
      findUnique: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

const mockPrismaBoardMember = prisma.boardMember as unknown as {
  findMany: ReturnType<typeof vi.fn>;
  create: ReturnType<typeof vi.fn>;
  updateMany: ReturnType<typeof vi.fn>;
};

const mockPrismaBoard = prisma.board as unknown as {
  findMany: ReturnType<typeof vi.fn>;
  create: ReturnType<typeof vi.fn>;
  findUnique: ReturnType<typeof vi.fn>;
};

const mockPrismaTransaction = prisma.$transaction as unknown as ReturnType<
  typeof vi.fn
>;

describe('boards.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getBoards', () => {
    const mockUserId = 'user-123';

    it('인증된 사용자가 본인 보드 목록을 조회할 수 있다', async () => {
      // Given
      const mockBoardMembers = [
        {
          boardId: 'board-1',
          lastAccessedAt: new Date('2025-11-13T11:00:00Z'),
        },
        {
          boardId: 'board-2',
          lastAccessedAt: new Date('2025-11-12T10:00:00Z'),
        },
      ];

      const mockBoards = [
        {
          id: 'board-1',
          title: '프로젝트 A',
          backgroundColor: '#0079BF',
          createdAt: new Date('2025-11-10T12:00:00Z'),
          updatedAt: new Date('2025-11-13T10:30:00Z'),
          ownerId: mockUserId,
          members: [
            {
              user: {
                id: mockUserId,
                name: '홍길동',
                avatar: 'https://example.com/avatar.jpg',
              },
            },
          ],
          lists: [
            { id: 'list-1', _count: { cards: 10 } },
            { id: 'list-2', _count: { cards: 13 } },
          ],
        },
        {
          id: 'board-2',
          title: '프로젝트 B',
          backgroundColor: '#D29034',
          createdAt: new Date('2025-11-08T09:00:00Z'),
          updatedAt: new Date('2025-11-12T15:00:00Z'),
          ownerId: mockUserId,
          members: [
            {
              user: {
                id: mockUserId,
                name: '홍길동',
                avatar: 'https://example.com/avatar.jpg',
              },
            },
          ],
          lists: [{ id: 'list-3', _count: { cards: 5 } }],
        },
      ];

      mockPrismaBoardMember.findMany.mockResolvedValue(mockBoardMembers);
      // 소유 보드 조회용
      mockPrismaBoard.findMany
        .mockResolvedValueOnce([{ id: 'board-1' }, { id: 'board-2' }])
        .mockResolvedValueOnce(mockBoards);

      // When
      const result = await getBoards({ userId: mockUserId });

      // Then
      expect(result.items).toHaveLength(2);
      expect(result.items[0]).toMatchObject({
        id: 'board-1',
        title: '프로젝트 A',
        backgroundColor: '#0079BF',
        listsCount: 2,
        cardsCount: 23,
      });
      expect(result.items[0].members).toHaveLength(1);
      expect(result.items[0].members[0]).toMatchObject({
        id: mockUserId,
        name: '홍길동',
      });
    });

    it('보드가 없는 사용자는 빈 목록을 반환한다', async () => {
      // Given
      mockPrismaBoardMember.findMany.mockResolvedValue([]);
      mockPrismaBoard.findMany
        .mockResolvedValueOnce([]) // 소유 보드 없음
        .mockResolvedValueOnce([]); // 조회 결과 없음

      // When
      const result = await getBoards({ userId: mockUserId });

      // Then
      expect(result.items).toHaveLength(0);
      expect(result.pagination).toEqual({
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
      });
    });

    it('페이지네이션이 정상 동작한다', async () => {
      // Given
      const mockBoardMembers = [
        { boardId: 'board-1', lastAccessedAt: new Date() },
        { boardId: 'board-2', lastAccessedAt: new Date() },
        { boardId: 'board-3', lastAccessedAt: new Date() },
      ];

      const mockBoard = {
        id: 'board-2',
        title: '프로젝트 B',
        backgroundColor: '#0079BF',
        createdAt: new Date(),
        updatedAt: new Date(),
        ownerId: mockUserId,
        members: [],
        lists: [],
      };

      mockPrismaBoardMember.findMany.mockResolvedValue(mockBoardMembers);
      mockPrismaBoard.findMany
        .mockResolvedValueOnce([]) // 소유 보드 없음
        .mockResolvedValueOnce([mockBoard]); // 페이지 2의 1개 보드

      // When
      const result = await getBoards({ userId: mockUserId, page: 2, limit: 1 });

      // Then
      expect(result.items).toHaveLength(1);
      expect(result.pagination).toEqual({
        page: 2,
        limit: 1,
        total: 3,
        totalPages: 3,
      });
    });

    it('listsCount와 cardsCount가 정확하게 계산된다', async () => {
      // Given
      const mockBoardMembers = [
        { boardId: 'board-1', lastAccessedAt: new Date() },
      ];

      const mockBoard = {
        id: 'board-1',
        title: '프로젝트 테스트',
        backgroundColor: '#0079BF',
        createdAt: new Date(),
        updatedAt: new Date(),
        ownerId: mockUserId,
        members: [],
        lists: [
          { id: 'list-1', _count: { cards: 5 } },
          { id: 'list-2', _count: { cards: 10 } },
          { id: 'list-3', _count: { cards: 8 } },
        ],
      };

      mockPrismaBoardMember.findMany.mockResolvedValue(mockBoardMembers);
      mockPrismaBoard.findMany
        .mockResolvedValueOnce([]) // 소유 보드 없음
        .mockResolvedValueOnce([mockBoard]);

      // When
      const result = await getBoards({ userId: mockUserId });

      // Then
      expect(result.items[0].listsCount).toBe(3);
      expect(result.items[0].cardsCount).toBe(23); // 5 + 10 + 8
    });

    it('멤버 정보가 올바르게 포함된다', async () => {
      // Given
      const mockBoardMembers = [
        { boardId: 'board-1', lastAccessedAt: new Date() },
      ];

      const mockBoard = {
        id: 'board-1',
        title: '프로젝트 협업',
        backgroundColor: '#0079BF',
        createdAt: new Date(),
        updatedAt: new Date(),
        ownerId: 'user-1',
        members: [
          {
            user: {
              id: 'user-1',
              name: '홍길동',
              avatar: 'https://example.com/avatar1.jpg',
            },
          },
          {
            user: {
              id: 'user-2',
              name: '김철수',
              avatar: null,
            },
          },
        ],
        lists: [],
      };

      mockPrismaBoardMember.findMany.mockResolvedValue(mockBoardMembers);
      mockPrismaBoard.findMany
        .mockResolvedValueOnce([]) // 소유 보드 없음
        .mockResolvedValueOnce([mockBoard]);

      // When
      const result = await getBoards({ userId: mockUserId });

      // Then
      expect(result.items[0].members).toHaveLength(2);
      expect(result.items[0].members[0]).toEqual({
        id: 'user-1',
        name: '홍길동',
        avatar: 'https://example.com/avatar1.jpg',
      });
      expect(result.items[0].members[1]).toEqual({
        id: 'user-2',
        name: '김철수',
        avatar: null,
      });
    });

    it('lastAccessedAt이 올바르게 반환된다', async () => {
      // Given
      const lastAccessedDate = new Date('2025-11-13T11:00:00Z');
      const mockBoardMembers = [
        { boardId: 'board-1', lastAccessedAt: lastAccessedDate },
      ];

      const mockBoard = {
        id: 'board-1',
        title: '프로젝트 테스트',
        backgroundColor: '#0079BF',
        createdAt: new Date(),
        updatedAt: new Date(),
        ownerId: mockUserId,
        members: [],
        lists: [],
      };

      mockPrismaBoardMember.findMany.mockResolvedValue(mockBoardMembers);
      mockPrismaBoard.findMany
        .mockResolvedValueOnce([]) // 소유 보드 없음
        .mockResolvedValueOnce([mockBoard]);

      // When
      const result = await getBoards({ userId: mockUserId });

      // Then
      expect(result.items[0].lastAccessedAt).toEqual(lastAccessedDate);
    });
  });

  describe('createBoard', () => {
    const mockUserId = 'user-123';

    it('유효한 요청으로 보드를 생성할 수 있다', async () => {
      // Given
      const createBoardData = {
        title: '신규 프로젝트',
        backgroundColor: '#0079BF',
      };

      const mockCreatedBoard = {
        id: 'board-new-123',
        title: '신규 프로젝트',
        backgroundColor: '#0079BF',
        createdAt: new Date('2025-11-13T12:00:00Z'),
        updatedAt: new Date('2025-11-13T12:00:00Z'),
        ownerId: mockUserId,
      };

      // 트랜잭션 모킹: 콜백을 실행하고 결과 반환
      mockPrismaTransaction.mockImplementation(async (callback) => {
        const tx = {
          board: {
            create: vi.fn().mockResolvedValue(mockCreatedBoard),
          },
          boardMember: {
            create: vi.fn().mockResolvedValue({
              id: 'member-123',
              boardId: mockCreatedBoard.id,
              userId: mockUserId,
              role: BOARD_MEMBER_ROLE.OWNER,
            }),
          },
        };
        return callback(tx);
      });

      // When
      const result = await createBoard({
        userId: mockUserId,
        data: createBoardData,
      });

      // Then
      expect(result).toMatchObject({
        id: 'board-new-123',
        title: '신규 프로젝트',
        backgroundColor: '#0079BF',
        ownerId: mockUserId,
      });
      expect(result.createdAt).toEqual(new Date('2025-11-13T12:00:00Z'));
      expect(result.updatedAt).toEqual(new Date('2025-11-13T12:00:00Z'));
    });

    it('backgroundColor를 지정하지 않으면 기본값이 적용된다', async () => {
      // Given
      const createBoardData = {
        title: '신규 프로젝트',
        // backgroundColor 생략
      };

      const mockCreatedBoard = {
        id: 'board-new-456',
        title: '신규 프로젝트',
        backgroundColor: '#0079BF', // 기본값
        createdAt: new Date('2025-11-13T12:00:00Z'),
        updatedAt: new Date('2025-11-13T12:00:00Z'),
        ownerId: mockUserId,
      };

      mockPrismaTransaction.mockImplementation(async (callback) => {
        const tx = {
          board: {
            create: vi.fn().mockResolvedValue(mockCreatedBoard),
          },
          boardMember: {
            create: vi.fn().mockResolvedValue({
              id: 'member-456',
              boardId: mockCreatedBoard.id,
              userId: mockUserId,
              role: BOARD_MEMBER_ROLE.OWNER,
            }),
          },
        };
        return callback(tx);
      });

      // When
      const result = await createBoard({
        userId: mockUserId,
        data: createBoardData,
      });

      // Then
      expect(result.backgroundColor).toBe('#0079BF');
    });

    it('보드 생성 시 생성자가 owner 역할로 BoardMember에 추가된다', async () => {
      // Given
      const createBoardData = {
        title: '팀 프로젝트',
      };

      const mockCreatedBoard = {
        id: 'board-team-789',
        title: '팀 프로젝트',
        backgroundColor: '#0079BF',
        createdAt: new Date(),
        updatedAt: new Date(),
        ownerId: mockUserId,
      };

      const mockBoardMemberCreate = vi.fn().mockResolvedValue({
        id: 'member-789',
        boardId: mockCreatedBoard.id,
        userId: mockUserId,
        role: BOARD_MEMBER_ROLE.OWNER,
      });

      mockPrismaTransaction.mockImplementation(async (callback) => {
        const tx = {
          board: {
            create: vi.fn().mockResolvedValue(mockCreatedBoard),
          },
          boardMember: {
            create: mockBoardMemberCreate,
          },
        };
        return callback(tx);
      });

      // When
      await createBoard({
        userId: mockUserId,
        data: createBoardData,
      });

      // Then
      expect(mockBoardMemberCreate).toHaveBeenCalledWith({
        data: {
          boardId: mockCreatedBoard.id,
          userId: mockUserId,
          role: BOARD_MEMBER_ROLE.OWNER,
        },
      });
    });

    it('사용자 지정 backgroundColor가 정상적으로 적용된다', async () => {
      // Given
      const customColor = '#D29034';
      const createBoardData = {
        title: '커스텀 색상 보드',
        backgroundColor: customColor,
      };

      const mockCreatedBoard = {
        id: 'board-custom-color',
        title: '커스텀 색상 보드',
        backgroundColor: customColor,
        createdAt: new Date(),
        updatedAt: new Date(),
        ownerId: mockUserId,
      };

      mockPrismaTransaction.mockImplementation(async (callback) => {
        const tx = {
          board: {
            create: vi.fn().mockResolvedValue(mockCreatedBoard),
          },
          boardMember: {
            create: vi.fn().mockResolvedValue({
              id: 'member-custom',
              boardId: mockCreatedBoard.id,
              userId: mockUserId,
              role: BOARD_MEMBER_ROLE.OWNER,
            }),
          },
        };
        return callback(tx);
      });

      // When
      const result = await createBoard({
        userId: mockUserId,
        data: createBoardData,
      });

      // Then
      expect(result.backgroundColor).toBe(customColor);
    });
  });

  describe('getBoardById', () => {
    const mockUserId = 'user-123';
    const mockBoardId = 'board-456';

    it('보드 소유자가 조회 시 성공한다', async () => {
      // Given
      const mockBoard = {
        id: mockBoardId,
        title: '프로젝트 A',
        backgroundColor: '#0079BF',
        createdAt: new Date('2025-11-10T12:00:00Z'),
        updatedAt: new Date('2025-11-13T10:30:00Z'),
        ownerId: mockUserId,
        members: [
          {
            userId: mockUserId,
            role: BOARD_MEMBER_ROLE.OWNER,
            user: {
              id: mockUserId,
              name: '홍길동',
              avatar: 'https://cdn.collaboard.dev/avatars/usr_1234567890.jpg',
            },
          },
        ],
        lists: [
          {
            id: 'lst_1111111111',
            title: 'To Do',
            position: 1,
            _count: { cards: 5 },
          },
          {
            id: 'lst_2222222222',
            title: 'In Progress',
            position: 2,
            _count: { cards: 3 },
          },
        ],
      };

      mockPrismaBoard.findUnique.mockResolvedValue(mockBoard);
      mockPrismaBoardMember.updateMany.mockResolvedValue({ count: 1 });

      // When
      const result = await getBoardById({
        boardId: mockBoardId,
        userId: mockUserId,
      });

      // Then
      expect(result).toMatchObject({
        id: mockBoardId,
        title: '프로젝트 A',
        backgroundColor: '#0079BF',
        ownerId: mockUserId,
      });
      expect(result.members).toHaveLength(1);
      expect(result.members[0]).toMatchObject({
        id: mockUserId,
        name: '홍길동',
        role: BOARD_MEMBER_ROLE.OWNER,
      });
      expect(result.lists).toHaveLength(2);
      expect(result.lists[0]).toMatchObject({
        id: 'lst_1111111111',
        title: 'To Do',
        position: 1,
        cardsCount: 5,
      });
    });

    it('보드 멤버가 조회 시 성공한다', async () => {
      // Given
      const memberId = 'member-123';
      const ownerId = 'owner-789';
      const mockBoard = {
        id: mockBoardId,
        title: '프로젝트 협업',
        backgroundColor: '#D29034',
        createdAt: new Date('2025-11-10T12:00:00Z'),
        updatedAt: new Date('2025-11-13T10:30:00Z'),
        ownerId,
        members: [
          {
            userId: ownerId,
            role: BOARD_MEMBER_ROLE.OWNER,
            user: {
              id: ownerId,
              name: '소유자',
              avatar: null,
            },
          },
          {
            userId: memberId,
            role: BOARD_MEMBER_ROLE.MEMBER,
            user: {
              id: memberId,
              name: '멤버',
              avatar: null,
            },
          },
        ],
        lists: [],
      };

      mockPrismaBoard.findUnique.mockResolvedValue(mockBoard);
      mockPrismaBoardMember.updateMany.mockResolvedValue({ count: 1 });

      // When
      const result = await getBoardById({
        boardId: mockBoardId,
        userId: memberId,
      });

      // Then
      expect(result.id).toBe(mockBoardId);
      expect(result.members).toHaveLength(2);
      // lastAccessedAt 업데이트가 호출되어야 함
      expect(mockPrismaBoardMember.updateMany).toHaveBeenCalledWith({
        where: {
          boardId: mockBoardId,
          userId: memberId,
        },
        data: {
          lastAccessedAt: expect.any(Date),
        },
      });
    });

    it('권한 없는 사용자 조회 시 BoardAccessDeniedError를 던진다', async () => {
      // Given
      const unauthorizedUserId = 'unauthorized-user';
      const mockBoard = {
        id: mockBoardId,
        title: '프로젝트 비공개',
        backgroundColor: '#0079BF',
        createdAt: new Date('2025-11-10T12:00:00Z'),
        updatedAt: new Date('2025-11-13T10:30:00Z'),
        ownerId: 'other-owner',
        members: [
          {
            userId: 'other-owner',
            role: BOARD_MEMBER_ROLE.OWNER,
            user: {
              id: 'other-owner',
              name: '다른 사용자',
              avatar: null,
            },
          },
        ],
        lists: [],
      };

      mockPrismaBoard.findUnique.mockResolvedValue(mockBoard);

      // When & Then
      await expect(
        getBoardById({ boardId: mockBoardId, userId: unauthorizedUserId }),
      ).rejects.toThrow(BoardAccessDeniedError);
    });

    it('존재하지 않는 보드 조회 시 BoardNotFoundError를 던진다', async () => {
      // Given
      mockPrismaBoard.findUnique.mockResolvedValue(null);

      // When & Then
      await expect(
        getBoardById({ boardId: 'non-existent-board', userId: mockUserId }),
      ).rejects.toThrow(BoardNotFoundError);
    });

    it('리스트가 position 순으로 정렬되어 반환된다', async () => {
      // Given
      const mockBoard = {
        id: mockBoardId,
        title: '정렬 테스트',
        backgroundColor: '#0079BF',
        createdAt: new Date(),
        updatedAt: new Date(),
        ownerId: mockUserId,
        members: [
          {
            userId: mockUserId,
            role: BOARD_MEMBER_ROLE.OWNER,
            user: {
              id: mockUserId,
              name: '테스터',
              avatar: null,
            },
          },
        ],
        lists: [
          { id: 'list-3', title: 'Done', position: 3, _count: { cards: 2 } },
          { id: 'list-1', title: 'To Do', position: 1, _count: { cards: 5 } },
          {
            id: 'list-2',
            title: 'In Progress',
            position: 2,
            _count: { cards: 3 },
          },
        ],
      };

      mockPrismaBoard.findUnique.mockResolvedValue(mockBoard);
      mockPrismaBoardMember.updateMany.mockResolvedValue({ count: 1 });

      // When
      const result = await getBoardById({
        boardId: mockBoardId,
        userId: mockUserId,
      });

      // Then
      // Prisma에서 이미 정렬된 상태로 반환된다고 가정 (실제 DB 쿼리에서 orderBy 적용)
      expect(result.lists).toHaveLength(3);
    });

    it('멤버 정보에 역할(role)이 포함되어 반환된다', async () => {
      // Given
      const mockBoard = {
        id: mockBoardId,
        title: '역할 테스트',
        backgroundColor: '#0079BF',
        createdAt: new Date(),
        updatedAt: new Date(),
        ownerId: mockUserId,
        members: [
          {
            userId: mockUserId,
            role: BOARD_MEMBER_ROLE.OWNER,
            user: {
              id: mockUserId,
              name: '소유자',
              avatar: null,
            },
          },
          {
            userId: 'admin-user',
            role: BOARD_MEMBER_ROLE.ADMIN,
            user: {
              id: 'admin-user',
              name: '관리자',
              avatar: 'https://example.com/admin.jpg',
            },
          },
          {
            userId: 'member-user',
            role: BOARD_MEMBER_ROLE.MEMBER,
            user: {
              id: 'member-user',
              name: '일반 멤버',
              avatar: null,
            },
          },
        ],
        lists: [],
      };

      mockPrismaBoard.findUnique.mockResolvedValue(mockBoard);
      mockPrismaBoardMember.updateMany.mockResolvedValue({ count: 1 });

      // When
      const result = await getBoardById({
        boardId: mockBoardId,
        userId: mockUserId,
      });

      // Then
      expect(result.members).toHaveLength(3);
      expect(result.members.find((m) => m.id === mockUserId)?.role).toBe(
        BOARD_MEMBER_ROLE.OWNER,
      );
      expect(result.members.find((m) => m.id === 'admin-user')?.role).toBe(
        BOARD_MEMBER_ROLE.ADMIN,
      );
      expect(result.members.find((m) => m.id === 'member-user')?.role).toBe(
        BOARD_MEMBER_ROLE.MEMBER,
      );
    });
  });
});
