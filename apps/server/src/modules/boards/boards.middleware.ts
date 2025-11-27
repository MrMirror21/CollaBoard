/**
 * 보드 권한 체크 미들웨어
 *
 * 역할 체계:
 * - owner: 조회 ✅, 수정 ✅, 삭제 ✅
 * - admin: 조회 ✅, 수정 ✅, 삭제 ❌
 * - member: 조회 ✅, 수정 ❌, 삭제 ❌
 */

import type { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../../lib/prisma.js';
import { BOARD_MEMBER_ROLE, type BoardMemberRole } from './boards.constants.js';
import {
  BoardNotFoundError,
  BoardAccessDeniedError,
  BoardOwnerOnlyError,
  BoardAdminRequiredError,
} from './boards.errors.js';

interface BoardParams {
  boardId: string;
}

interface BoardAccessInfo {
  boardId: string;
  ownerId: string;
  role: BoardMemberRole | null;
  isOwner: boolean;
  isAdmin: boolean;
  isMember: boolean;
}

// Fastify request에 boardAccess 정보 추가를 위한 타입 확장
declare module 'fastify' {
  interface FastifyRequest {
    boardAccess?: BoardAccessInfo;
  }
}

/**
 * 보드에 대한 접근 권한 정보를 조회합니다.
 */
async function getBoardAccessInfo(
  boardId: string,
  userId: string,
): Promise<BoardAccessInfo> {
  // 보드 존재 여부 확인
  const board = await prisma.board.findUnique({
    where: { id: boardId },
    select: { id: true, ownerId: true },
  });

  if (!board) {
    throw new BoardNotFoundError(boardId);
  }

  // 멤버십 확인
  const membership = await prisma.boardMember.findUnique({
    where: {
      boardId_userId: {
        boardId,
        userId,
      },
    },
    select: { role: true },
  });

  const isOwner = board.ownerId === userId;
  const role = membership?.role as BoardMemberRole | null;
  const isAdmin = role === BOARD_MEMBER_ROLE.ADMIN || isOwner;
  const isMember = membership !== null;

  return {
    boardId: board.id,
    ownerId: board.ownerId,
    role,
    isOwner,
    isAdmin,
    isMember,
  };
}

/**
 * 보드 소유자 또는 멤버인지 확인하는 미들웨어
 * - 보드 조회 등에 사용
 * - owner, admin, member 모두 접근 가능
 */
export async function requireBoardAccess(
  request: FastifyRequest<{ Params: BoardParams }>,
  reply: FastifyReply,
): Promise<void> {
  try {
    const { boardId } = request.params;
    const { userId } = request.user;

    const accessInfo = await getBoardAccessInfo(boardId, userId);

    // 소유자이거나 멤버인 경우 접근 허용
    if (!accessInfo.isOwner && !accessInfo.isMember) {
      throw new BoardAccessDeniedError(boardId);
    }

    // request에 접근 정보 저장 (후속 핸들러에서 활용 가능)
    request.boardAccess = accessInfo;
  } catch (error) {
    if (error instanceof BoardNotFoundError) {
      await reply.status(404).send({
        success: false,
        error: '보드를 찾을 수 없습니다.',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    if (error instanceof BoardAccessDeniedError) {
      await reply.status(403).send({
        success: false,
        error: '보드에 접근할 권한이 없습니다.',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    throw error;
  }
}

/**
 * 보드 소유자인지 확인하는 미들웨어
 * - 보드 삭제 등에 사용
 * - owner만 접근 가능
 */
export async function requireBoardOwner(
  request: FastifyRequest<{ Params: BoardParams }>,
  reply: FastifyReply,
): Promise<void> {
  try {
    const { boardId } = request.params;
    const { userId } = request.user;

    const accessInfo = await getBoardAccessInfo(boardId, userId);

    if (!accessInfo.isOwner) {
      throw new BoardOwnerOnlyError(boardId);
    }

    request.boardAccess = accessInfo;
  } catch (error) {
    if (error instanceof BoardNotFoundError) {
      await reply.status(404).send({
        success: false,
        error: '보드를 찾을 수 없습니다.',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    if (error instanceof BoardOwnerOnlyError) {
      await reply.status(403).send({
        success: false,
        error: '보드 소유자만 수행할 수 있는 작업입니다.',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    throw error;
  }
}

/**
 * 보드 소유자 또는 admin 역할인지 확인하는 미들웨어
 * - 보드 수정 등에 사용
 * - owner, admin만 접근 가능
 */
export async function requireBoardAdmin(
  request: FastifyRequest<{ Params: BoardParams }>,
  reply: FastifyReply,
): Promise<void> {
  try {
    const { boardId } = request.params;
    const { userId } = request.user;

    const accessInfo = await getBoardAccessInfo(boardId, userId);

    // 소유자이거나 admin 역할인 경우 접근 허용
    if (!accessInfo.isAdmin) {
      throw new BoardAdminRequiredError(boardId);
    }

    request.boardAccess = accessInfo;
  } catch (error) {
    if (error instanceof BoardNotFoundError) {
      await reply.status(404).send({
        success: false,
        error: '보드를 찾을 수 없습니다.',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    if (error instanceof BoardAdminRequiredError) {
      await reply.status(403).send({
        success: false,
        error: '보드 수정 권한이 없습니다.',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    throw error;
  }
}
