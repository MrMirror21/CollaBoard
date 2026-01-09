import { Check } from 'lucide-react';

import { cn } from '@/lib/utils/cn';
import {
  BOARD_COLOR_PRESETS,
  type BoardColorPreset,
} from '@/domains/boards/constants/colors';

const COLOR_BUTTON_SIZE_PX = 32;

interface ColorPickerProps {
  /** 선택된 색상 값 */
  selectedColor: string;
  /** 색상 선택 콜백 */
  onSelect: (color: string) => void;
  /** 색상 프리셋 (기본값: BOARD_COLOR_PRESETS) */
  colors?: readonly BoardColorPreset[];
}

/**
 * 색상 선택기 컴포넌트
 * 보드 배경색을 선택할 수 있는 라디오 버튼 그룹
 */
export function ColorPicker({
  selectedColor,
  onSelect,
  colors = BOARD_COLOR_PRESETS,
}: ColorPickerProps) {
  return (
    <div
      role="radiogroup"
      aria-label="배경색 선택"
      className="flex flex-wrap gap-3"
    >
      {colors.map((color) => {
        const isSelected = selectedColor === color.value;

        return (
          <button
            key={color.id}
            type="button"
            role="radio"
            aria-checked={isSelected}
            aria-label={color.label}
            onClick={() => onSelect(color.value)}
            className={cn(
              'rounded-full transition-all duration-150',
              'flex items-center justify-center',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500',
              'hover:ring-2 hover:ring-offset-2 hover:ring-gray-300',
              isSelected && 'ring-2 ring-offset-2 ring-blue-500',
            )}
            style={{
              backgroundColor: color.value,
              width: `${COLOR_BUTTON_SIZE_PX}px`,
              height: `${COLOR_BUTTON_SIZE_PX}px`,
            }}
          >
            {isSelected && (
              <Check
                className="text-white drop-shadow-sm"
                size={18}
                strokeWidth={3}
                aria-hidden="true"
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
