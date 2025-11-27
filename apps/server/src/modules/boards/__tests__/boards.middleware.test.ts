import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { FastifyRequest, FastifyReply } from 'fastify';
import {
  requireBoardAccess,
  requireBoardOwner,
  requireBoardAdmin,
} from '../boards.middleware.js';
import { BOARD_MEMBER_ROLE } from '../boards.constants.js';

// 모킹된 prisma import
import { prisma } from '../../../lib/prisma.js';

// Prisma 모킹
vi.mock('../../../lib/prisma.js', () => ({
  prisma: {
    board: {
      findUnique: vi.fn(),
    },
    boardMember: {
      findUnique: vi.fn(),
    },
  },
}));

const mockPrismaBoard = prisma.board as unknown as {
  findUnique: ReturnType<typeof vi.fn>;
};

const mockPrismaBoardMember = prisma.boardMember as unknown as {
  findUnique: ReturnType<typeof vi.fn>;
};

// FastifyRequest와 FastifyReply 모킹 헬퍼
function createMockRequest(params: { boardId: string }, userId: string) {
  return {
    params,
    user: { userId },
    boardAccess: undefined,
  } as unknown as FastifyRequest<{ Params: { boardId: string } }>;
}

function createMockReply() {
  const reply = {
    status: vi.fn().mockReturnThis(),
    send: vi.fn().mockResolvedValue(undefined),
  } as unknown as FastifyReply;
  return reply;
}

describe('boards.middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('requireBoardAccess', () => {
    const mockBoardId = 'board-123';
    const mockUserId = 'user-456';

    it('보드 소유자가 접근 시 성공한다', async () => {
      // Given
      const request = createMockRequest({ boardId: mockBoardId }, mockUserId);
      const reply = createMockReply();

      mockPrismaBoard.findUnique.mockResolvedValue({
        id: mockBoardId,
        ownerId: mockUserId,
      });
      mockPrismaBoardMember.findUnique.mockResolvedValue({
        role: BOARD_MEMBER_ROLE.OWNER,
      });

      // When
      await requireBoardAccess(request, reply);

      // Then
      expect(reply.status).not.toHaveBeenCalled();
      expect(request.boardAccess).toBeDefined();
      expect(request.boardAccess?.isOwner).toBe(true);
    });

    it('admin 역할 멤버가 접근 시 성공한다', async () => {
      // Given
      const adminId = 'admin-user';
      const request = createMockRequest({ boardId: mockBoardId }, adminId);
      const reply = createMockReply();

      mockPrismaBoard.findUnique.mockResolvedValue({
        id: mockBoardId,
        ownerId: mockUserId, // 다른 사용자가 소유자
      });
      mockPrismaBoardMember.findUnique.mockResolvedValue({
        role: BOARD_MEMBER_ROLE.ADMIN,
      });

      // When
      await requireBoardAccess(request, reply);

      // Then
      expect(reply.status).not.toHaveBeenCalled();
      expect(request.boardAccess).toBeDefined();
      expect(request.boardAccess?.isAdmin).toBe(true);
      expect(request.boardAccess?.isMember).toBe(true);
    });

    it('member 역할 멤버가 접근 시 성공한다', async () => {
      // Given
      const memberId = 'member-user';
      const request = createMockRequest({ boardId: mockBoardId }, memberId);
      const reply = createMockReply();

      mockPrismaBoard.findUnique.mockResolvedValue({
        id: mockBoardId,
        ownerId: mockUserId, // 다른 사용자가 소유자
      });
      mockPrismaBoardMember.findUnique.mockResolvedValue({
        role: BOARD_MEMBER_ROLE.MEMBER,
      });

      // When
      await requireBoardAccess(request, reply);

      // Then
      expect(reply.status).not.toHaveBeenCalled();
      expect(request.boardAccess).toBeDefined();
      expect(request.boardAccess?.isMember).toBe(true);
      expect(request.boardAccess?.isAdmin).toBe(false);
    });

    it('비멤버 접근 시 403 반환한다', async () => {
      // Given
      const nonMemberId = 'non-member-user';
      const request = createMockRequest({ boardId: mockBoardId }, nonMemberId);
      const reply = createMockReply();

      mockPrismaBoard.findUnique.mockResolvedValue({
        id: mockBoardId,
        ownerId: mockUserId, // 다른 사용자가 소유자
      });
      mockPrismaBoardMember.findUnique.mockResolvedValue(null); // 멤버십 없음

      // When
      await requireBoardAccess(request, reply);

      // Then
      expect(reply.status).toHaveBeenCalledWith(403);
      expect(reply.send).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: '보드에 접근할 권한이 없습니다.',
        }),
      );
    });

    it('존재하지 않는 보드 접근 시 404 반환한다', async () => {
      // Given
      const request = createMockRequest(
        { boardId: 'non-existent-board' },
        mockUserId,
      );
      const reply = createMockReply();

      mockPrismaBoard.findUnique.mockResolvedValue(null);

      // When
      await requireBoardAccess(request, reply);

      // Then
      expect(reply.status).toHaveBeenCalledWith(404);
      expect(reply.send).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: '보드를 찾을 수 없습니다.',
        }),
      );
    });
  });

  describe('requireBoardOwner', () => {
    const mockBoardId = 'board-123';
    const mockUserId = 'user-456';

    it('보드 소유자가 접근 시 성공한다', async () => {
      // Given
      const request = createMockRequest({ boardId: mockBoardId }, mockUserId);
      const reply = createMockReply();

      mockPrismaBoard.findUnique.mockResolvedValue({
        id: mockBoardId,
        ownerId: mockUserId,
      });
      mockPrismaBoardMember.findUnique.mockResolvedValue({
        role: BOARD_MEMBER_ROLE.OWNER,
      });

      // When
      await requireBoardOwner(request, reply);

      // Then
      expect(reply.status).not.toHaveBeenCalled();
      expect(request.boardAccess).toBeDefined();
      expect(request.boardAccess?.isOwner).toBe(true);
    });

    it('admin이 삭제 시도 시 403 반환한다', async () => {
      // Given
      const adminId = 'admin-user';
      const request = createMockRequest({ boardId: mockBoardId }, adminId);
      const reply = createMockReply();

      mockPrismaBoard.findUnique.mockResolvedValue({
        id: mockBoardId,
        ownerId: mockUserId, // 다른 사용자가 소유자
      });
      mockPrismaBoardMember.findUnique.mockResolvedValue({
        role: BOARD_MEMBER_ROLE.ADMIN,
      });

      // When
      await requireBoardOwner(request, reply);

      // Then
      expect(reply.status).toHaveBeenCalledWith(403);
      expect(reply.send).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: '보드 소유자만 수행할 수 있는 작업입니다.',
        }),
      );
    });

    it('member가 삭제 시도 시 403 반환한다', async () => {
      // Given
      const memberId = 'member-user';
      const request = createMockRequest({ boardId: mockBoardId }, memberId);
      const reply = createMockReply();

      mockPrismaBoard.findUnique.mockResolvedValue({
        id: mockBoardId,
        ownerId: mockUserId, // 다른 사용자가 소유자
      });
      mockPrismaBoardMember.findUnique.mockResolvedValue({
        role: BOARD_MEMBER_ROLE.MEMBER,
      });

      // When
      await requireBoardOwner(request, reply);

      // Then
      expect(reply.status).toHaveBeenCalledWith(403);
      expect(reply.send).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: '보드 소유자만 수행할 수 있는 작업입니다.',
        }),
      );
    });

    it('권한 없는 사용자 삭제 시도 시 403 반환한다', async () => {
      // Given
      const nonMemberId = 'non-member-user';
      const request = createMockRequest({ boardId: mockBoardId }, nonMemberId);
      const reply = createMockReply();

      mockPrismaBoard.findUnique.mockResolvedValue({
        id: mockBoardId,
        ownerId: mockUserId,
      });
      mockPrismaBoardMember.findUnique.mockResolvedValue(null);

      // When
      await requireBoardOwner(request, reply);

      // Then
      expect(reply.status).toHaveBeenCalledWith(403);
    });

    it('존재하지 않는 보드 삭제 시도 시 404 반환한다', async () => {
      // Given
      const request = createMockRequest(
        { boardId: 'non-existent-board' },
        mockUserId,
      );
      const reply = createMockReply();

      mockPrismaBoard.findUnique.mockResolvedValue(null);

      // When
      await requireBoardOwner(request, reply);

      // Then
      expect(reply.status).toHaveBeenCalledWith(404);
      expect(reply.send).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: '보드를 찾을 수 없습니다.',
        }),
      );
    });
  });

  describe('requireBoardAdmin', () => {
    const mockBoardId = 'board-123';
    const mockUserId = 'user-456';

    it('보드 소유자가 수정 시 성공한다', async () => {
      // Given
      const request = createMockRequest({ boardId: mockBoardId }, mockUserId);
      const reply = createMockReply();

      mockPrismaBoard.findUnique.mockResolvedValue({
        id: mockBoardId,
        ownerId: mockUserId,
      });
      mockPrismaBoardMember.findUnique.mockResolvedValue({
        role: BOARD_MEMBER_ROLE.OWNER,
      });

      // When
      await requireBoardAdmin(request, reply);

      // Then
      expect(reply.status).not.toHaveBeenCalled();
      expect(request.boardAccess).toBeDefined();
      expect(request.boardAccess?.isAdmin).toBe(true);
    });

    it('admin이 수정 시 성공한다', async () => {
      // Given
      const adminId = 'admin-user';
      const request = createMockRequest({ boardId: mockBoardId }, adminId);
      const reply = createMockReply();

      mockPrismaBoard.findUnique.mockResolvedValue({
        id: mockBoardId,
        ownerId: mockUserId, // 다른 사용자가 소유자
      });
      mockPrismaBoardMember.findUnique.mockResolvedValue({
        role: BOARD_MEMBER_ROLE.ADMIN,
      });

      // When
      await requireBoardAdmin(request, reply);

      // Then
      expect(reply.status).not.toHaveBeenCalled();
      expect(request.boardAccess).toBeDefined();
      expect(request.boardAccess?.isAdmin).toBe(true);
    });

    it('member가 수정 시도 시 403 반환한다', async () => {
      // Given
      const memberId = 'member-user';
      const request = createMockRequest({ boardId: mockBoardId }, memberId);
      const reply = createMockReply();

      mockPrismaBoard.findUnique.mockResolvedValue({
        id: mockBoardId,
        ownerId: mockUserId, // 다른 사용자가 소유자
      });
      mockPrismaBoardMember.findUnique.mockResolvedValue({
        role: BOARD_MEMBER_ROLE.MEMBER,
      });

      // When
      await requireBoardAdmin(request, reply);

      // Then
      expect(reply.status).toHaveBeenCalledWith(403);
      expect(reply.send).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: '보드 수정 권한이 없습니다.',
        }),
      );
    });

    it('권한 없는 사용자 수정 시도 시 403 반환한다', async () => {
      // Given
      const nonMemberId = 'non-member-user';
      const request = createMockRequest({ boardId: mockBoardId }, nonMemberId);
      const reply = createMockReply();

      mockPrismaBoard.findUnique.mockResolvedValue({
        id: mockBoardId,
        ownerId: mockUserId,
      });
      mockPrismaBoardMember.findUnique.mockResolvedValue(null);

      // When
      await requireBoardAdmin(request, reply);

      // Then
      expect(reply.status).toHaveBeenCalledWith(403);
    });

    it('존재하지 않는 보드 수정 시도 시 404 반환한다', async () => {
      // Given
      const request = createMockRequest(
        { boardId: 'non-existent-board' },
        mockUserId,
      );
      const reply = createMockReply();

      mockPrismaBoard.findUnique.mockResolvedValue(null);

      // When
      await requireBoardAdmin(request, reply);

      // Then
      expect(reply.status).toHaveBeenCalledWith(404);
      expect(reply.send).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: '보드를 찾을 수 없습니다.',
        }),
      );
    });
  });

  describe('역할 체계 검증', () => {
    const mockBoardId = 'board-123';
    const ownerId = 'owner-user';

    /**
     * 역할 체계 테이블:
     * | 역할   | 조회 | 수정 | 삭제 |
     * |--------|------|------|------|
     * | owner  | ✅   | ✅   | ✅   |
     * | admin  | ✅   | ✅   | ❌   |
     * | member | ✅   | ❌   | ❌   |
     */

    it('owner는 조회/수정/삭제 모두 가능하다', async () => {
      // Given
      mockPrismaBoard.findUnique.mockResolvedValue({
        id: mockBoardId,
        ownerId,
      });
      mockPrismaBoardMember.findUnique.mockResolvedValue({
        role: BOARD_MEMBER_ROLE.OWNER,
      });

      const accessRequest = createMockRequest(
        { boardId: mockBoardId },
        ownerId,
      );
      const adminRequest = createMockRequest({ boardId: mockBoardId }, ownerId);
      const ownerRequest = createMockRequest({ boardId: mockBoardId }, ownerId);

      const accessReply = createMockReply();
      const adminReply = createMockReply();
      const ownerReply = createMockReply();

      // When & Then
      await requireBoardAccess(accessRequest, accessReply);
      expect(accessReply.status).not.toHaveBeenCalled();

      await requireBoardAdmin(adminRequest, adminReply);
      expect(adminReply.status).not.toHaveBeenCalled();

      await requireBoardOwner(ownerRequest, ownerReply);
      expect(ownerReply.status).not.toHaveBeenCalled();
    });

    it('admin은 조회/수정 가능, 삭제 불가능하다', async () => {
      // Given
      const adminId = 'admin-user';
      mockPrismaBoard.findUnique.mockResolvedValue({
        id: mockBoardId,
        ownerId, // 다른 사용자가 소유자
      });
      mockPrismaBoardMember.findUnique.mockResolvedValue({
        role: BOARD_MEMBER_ROLE.ADMIN,
      });

      const accessRequest = createMockRequest(
        { boardId: mockBoardId },
        adminId,
      );
      const adminRequest = createMockRequest({ boardId: mockBoardId }, adminId);
      const ownerRequest = createMockRequest({ boardId: mockBoardId }, adminId);

      const accessReply = createMockReply();
      const adminReply = createMockReply();
      const ownerReply = createMockReply();

      // When & Then
      await requireBoardAccess(accessRequest, accessReply);
      expect(accessReply.status).not.toHaveBeenCalled(); // 조회 가능

      await requireBoardAdmin(adminRequest, adminReply);
      expect(adminReply.status).not.toHaveBeenCalled(); // 수정 가능

      await requireBoardOwner(ownerRequest, ownerReply);
      expect(ownerReply.status).toHaveBeenCalledWith(403); // 삭제 불가
    });

    it('member는 조회만 가능, 수정/삭제 불가능하다', async () => {
      // Given
      const memberId = 'member-user';
      mockPrismaBoard.findUnique.mockResolvedValue({
        id: mockBoardId,
        ownerId, // 다른 사용자가 소유자
      });
      mockPrismaBoardMember.findUnique.mockResolvedValue({
        role: BOARD_MEMBER_ROLE.MEMBER,
      });

      const accessRequest = createMockRequest(
        { boardId: mockBoardId },
        memberId,
      );
      const adminRequest = createMockRequest(
        { boardId: mockBoardId },
        memberId,
      );
      const ownerRequest = createMockRequest(
        { boardId: mockBoardId },
        memberId,
      );

      const accessReply = createMockReply();
      const adminReply = createMockReply();
      const ownerReply = createMockReply();

      // When & Then
      await requireBoardAccess(accessRequest, accessReply);
      expect(accessReply.status).not.toHaveBeenCalled(); // 조회 가능

      await requireBoardAdmin(adminRequest, adminReply);
      expect(adminReply.status).toHaveBeenCalledWith(403); // 수정 불가

      await requireBoardOwner(ownerRequest, ownerReply);
      expect(ownerReply.status).toHaveBeenCalledWith(403); // 삭제 불가
    });
  });
});
