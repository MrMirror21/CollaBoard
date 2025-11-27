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

// 보드 상세 조회 - 멤버 정보 (역할 포함)
export interface BoardDetailMember {
  id: string;
  name: string;
  avatar: string | null;
  role: string;
}

// 보드 상세 조회 - 리스트 정보
export interface BoardDetailList {
  id: string;
  title: string;
  position: number;
  cardsCount: number;
}

// 보드 상세 정보
export interface BoardDetail {
  id: string;
  title: string;
  backgroundColor: string;
  createdAt: Date;
  updatedAt: Date;
  ownerId: string;
  members: BoardDetailMember[];
  lists: BoardDetailList[];
}

// 보드 상세 조회 요청 파라미터
export interface GetBoardByIdParams {
  boardId: string;
}

// 보드 상세 조회 응답
export interface GetBoardByIdResponse {
  success: boolean;
  data: BoardDetail;
  timestamp: string;
}

// 보드 수정 요청
export interface UpdateBoardRequest {
  title?: string;
  backgroundColor?: string;
}

// 보드 수정 요청 파라미터
export interface UpdateBoardParams {
  boardId: string;
}

// 수정된 보드 정보
export interface UpdatedBoard {
  id: string;
  title: string;
  backgroundColor: string;
  updatedAt: Date;
}

// 보드 수정 응답
export interface UpdateBoardResponse {
  success: boolean;
  data: UpdatedBoard;
  timestamp: string;
}

// 에러 응답
export interface ErrorResponse {
  success: boolean;
  error: string;
  timestamp: string;
}
