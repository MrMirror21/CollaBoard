import { prisma } from '../../lib/prisma.js';
import type {
  BoardListItem,
  Pagination,
  CreateBoardRequest,
  CreatedBoard,
  BoardDetail,
  BoardDetailMember,
  BoardDetailList,
  UpdateBoardRequest,
  UpdatedBoard,
} from './boards.types.js';
import {
  DEFAULT_BACKGROUND_COLOR,
  BOARD_MEMBER_ROLE,
} from './boards.constants.js';
import { BoardNotFoundError } from './boards.errors.js';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

interface GetBoardsParams {
  userId: string;
  page?: number;
  limit?: number;
}

interface GetBoardsResult {
  items: BoardListItem[];
  pagination: Pagination;
}

/**
 * 사용자가 소유하거나 멤버로 참여 중인 보드 목록을 조회합니다.
 * - 페이지네이션 지원
 * - updatedAt 기준 내림차순 정렬
 * - 각 보드의 listsCount, cardsCount, members 포함
 */
export async function getBoards({
  userId,
  page = DEFAULT_PAGE,
  limit = DEFAULT_LIMIT,
}: GetBoardsParams): Promise<GetBoardsResult> {
  const skip = (page - 1) * limit;

  // 사용자가 소유하거나 멤버인 보드 ID 조회
  const boardIdsQuery = await prisma.boardMember.findMany({
    where: { userId },
    select: { boardId: true, lastAccessedAt: true },
  });

  const boardIds = boardIdsQuery.map((bm) => bm.boardId);
  const lastAccessedMap = new Map(
    boardIdsQuery.map((bm) => [bm.boardId, bm.lastAccessedAt]),
  );

  // 소유한 보드 ID도 포함 (멤버가 아닌 경우도 있을 수 있음)
  const ownedBoards = await prisma.board.findMany({
    where: { ownerId: userId },
    select: { id: true },
  });

  const allBoardIds = [
    ...new Set([...boardIds, ...ownedBoards.map((b) => b.id)]),
  ];

  // 전체 개수 조회
  const total = allBoardIds.length;
  const totalPages = Math.ceil(total / limit);

  // 보드 목록 조회 (페이지네이션, 정렬 적용)
  const boards = await prisma.board.findMany({
    where: {
      id: { in: allBoardIds },
    },
    orderBy: { updatedAt: 'desc' },
    skip,
    take: limit,
    include: {
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
      },
      lists: {
        select: {
          id: true,
          _count: {
            select: { cards: true },
          },
        },
      },
    },
  });

  // 응답 형식으로 변환
  const items: BoardListItem[] = boards.map((board) => {
    const listsCount = board.lists.length;
    const cardsCount = board.lists.reduce(
      (sum, list) => sum + list._count.cards,
      0,
    );
    const members = board.members.map((member) => ({
      id: member.user.id,
      name: member.user.name,
      avatar: member.user.avatar,
    }));

    // 현재 사용자의 lastAccessedAt 조회
    const lastAccessedAt = lastAccessedMap.get(board.id) ?? null;

    return {
      id: board.id,
      title: board.title,
      backgroundColor: board.backgroundColor,
      createdAt: board.createdAt,
      updatedAt: board.updatedAt,
      lastAccessedAt,
      listsCount,
      cardsCount,
      members,
    };
  });

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  };
}

interface CreateBoardParams {
  userId: string;
  data: CreateBoardRequest;
}

/**
 * 새로운 보드를 생성합니다.
 * - 생성자를 owner로 설정
 * - BoardMember에 owner 역할로 자동 추가
 */
export async function createBoard({
  userId,
  data,
}: CreateBoardParams): Promise<CreatedBoard> {
  const { title, backgroundColor = DEFAULT_BACKGROUND_COLOR } = data;

  // 트랜잭션으로 보드 생성과 멤버 추가를 원자적으로 처리
  const board = await prisma.$transaction(async (tx) => {
    // 보드 생성
    const createdBoard = await tx.board.create({
      data: {
        title,
        backgroundColor,
        ownerId: userId,
      },
    });

    // 생성자를 owner 역할로 BoardMember에 추가
    await tx.boardMember.create({
      data: {
        boardId: createdBoard.id,
        userId,
        role: BOARD_MEMBER_ROLE.OWNER,
      },
    });

    return createdBoard;
  });

  return {
    id: board.id,
    title: board.title,
    backgroundColor: board.backgroundColor,
    createdAt: board.createdAt,
    updatedAt: board.updatedAt,
    ownerId: board.ownerId,
  };
}

interface GetBoardByIdParams {
  boardId: string;
  userId: string;
}

/**
 * 보드 상세 정보를 조회합니다.
 * - 권한 체크는 미들웨어에서 처리 (requireBoardAccess)
 * - 리스트 목록 (position 순 정렬), 멤버 목록 포함
 * - lastAccessedAt 업데이트
 */
export async function getBoardById({
  boardId,
  userId,
}: GetBoardByIdParams): Promise<BoardDetail> {
  // 보드 조회
  const board = await prisma.board.findUnique({
    where: { id: boardId },
    include: {
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
      },
      lists: {
        orderBy: { position: 'asc' },
        include: {
          _count: {
            select: { cards: true },
          },
        },
      },
    },
  });

  if (!board) {
    throw new BoardNotFoundError(boardId);
  }

  // lastAccessedAt 업데이트
  await prisma.boardMember.updateMany({
    where: {
      boardId,
      userId,
    },
    data: {
      lastAccessedAt: new Date(),
    },
  });

  // 응답 형식으로 변환
  const members: BoardDetailMember[] = board.members.map((member) => ({
    id: member.user.id,
    name: member.user.name,
    avatar: member.user.avatar,
    role: member.role,
  }));

  const lists: BoardDetailList[] = board.lists.map((list) => ({
    id: list.id,
    title: list.title,
    position: list.position,
    cardsCount: list._count.cards,
  }));

  return {
    id: board.id,
    title: board.title,
    backgroundColor: board.backgroundColor,
    createdAt: board.createdAt,
    updatedAt: board.updatedAt,
    ownerId: board.ownerId,
    members,
    lists,
  };
}

interface UpdateBoardParams {
  boardId: string;
  data: UpdateBoardRequest;
}

/**
 * 보드를 수정합니다.
 * - 권한 체크는 미들웨어에서 처리 (requireBoardAdmin)
 * - title, backgroundColor 중 원하는 필드만 부분 업데이트 가능
 */
export async function updateBoard({
  boardId,
  data,
}: UpdateBoardParams): Promise<UpdatedBoard> {
  // 보드 존재 여부 확인
  const existingBoard = await prisma.board.findUnique({
    where: { id: boardId },
    select: { id: true },
  });

  if (!existingBoard) {
    throw new BoardNotFoundError(boardId);
  }

  // 업데이트할 데이터 구성 (제공된 필드만 업데이트)
  const updateData: { title?: string; backgroundColor?: string } = {};

  if (data.title !== undefined) {
    updateData.title = data.title;
  }

  if (data.backgroundColor !== undefined) {
    updateData.backgroundColor = data.backgroundColor;
  }

  // 보드 업데이트
  const updatedBoard = await prisma.board.update({
    where: { id: boardId },
    data: updateData,
  });

  return {
    id: updatedBoard.id,
    title: updatedBoard.title,
    backgroundColor: updatedBoard.backgroundColor,
    updatedAt: updatedBoard.updatedAt,
  };
}
