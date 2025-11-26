/**
 * 보드 관련 상수
 */

// 보드 기본 배경색
export const DEFAULT_BACKGROUND_COLOR = '#0079BF';

// 보드 멤버 역할
export const BOARD_MEMBER_ROLE = {
  OWNER: 'owner',
  ADMIN: 'admin',
  MEMBER: 'member',
} as const;

export type BoardMemberRole =
  (typeof BOARD_MEMBER_ROLE)[keyof typeof BOARD_MEMBER_ROLE];
