/**
 * 보드 배경색 프리셋
 * 보드 생성/수정 시 선택 가능한 색상 목록
 */
export const BOARD_COLOR_PRESETS = [
  { id: 'blue', value: '#0079BF', label: '파랑' },
  { id: 'orange', value: '#D29034', label: '주황' },
  { id: 'green', value: '#519839', label: '초록' },
  { id: 'red', value: '#B04632', label: '빨강' },
  { id: 'purple', value: '#89609E', label: '보라' },
  { id: 'pink', value: '#CD5A91', label: '분홍' },
] as const;

export type BoardColorPreset = (typeof BOARD_COLOR_PRESETS)[number];
export type BoardColorId = BoardColorPreset['id'];
export type BoardColorValue = BoardColorPreset['value'];

/** 기본 선택 색상 (첫 번째 색상) */
export const DEFAULT_BOARD_COLOR = BOARD_COLOR_PRESETS[0].value;
