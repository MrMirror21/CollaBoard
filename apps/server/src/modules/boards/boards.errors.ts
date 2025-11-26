/**
 * 보드 관련 에러 클래스
 *
 * 도메인별 관련 에러들을 하나의 파일에 모아 관리합니다.
 */

/* eslint-disable max-classes-per-file */

export class BoardNotFoundError extends Error {
  constructor(boardId: string) {
    super(`보드를 찾을 수 없습니다: ${boardId}`);
    this.name = 'BoardNotFoundError';
  }
}

export class BoardAccessDeniedError extends Error {
  constructor(boardId: string) {
    super(`보드에 접근할 권한이 없습니다: ${boardId}`);
    this.name = 'BoardAccessDeniedError';
  }
}
