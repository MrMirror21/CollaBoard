// 보드 멤버 정보
export interface BoardMemberInfo {
  id: string;
  name: string;
  avatar: string | null;
}

// 보드 목록 아이템
export interface BoardListItem {
  id: string;
  title: string;
  backgroundColor: string;
  createdAt: Date;
  updatedAt: Date;
  lastAccessedAt: Date | null;
  listsCount: number;
  cardsCount: number;
  members: BoardMemberInfo[];
}

// 페이지네이션 정보
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// 보드 목록 조회 요청 쿼리
export interface GetBoardsQuery {
  page?: number;
  limit?: number;
}

// 보드 목록 조회 응답
export interface GetBoardsResponse {
  success: boolean;
  data: {
    items: BoardListItem[];
    pagination: Pagination;
  };
  timestamp: string;
}

// 보드 생성 요청
export interface CreateBoardRequest {
  title: string;
  backgroundColor?: string;
}

// 생성된 보드 정보
export interface CreatedBoard {
  id: string;
  title: string;
  backgroundColor: string;
  createdAt: Date;
  updatedAt: Date;
  ownerId: string;
}

// 보드 생성 응답
export interface CreateBoardResponse {
  success: boolean;
  data: CreatedBoard;
  timestamp: string;
}
