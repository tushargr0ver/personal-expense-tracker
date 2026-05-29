import type { Category } from '../../types';
import { CATEGORY_COLORS } from '../../types';

interface BadgeProps {
  category: Category;
  size?: 'sm' | 'md';
}

export default function Badge({ category, size = 'md' }: BadgeProps) {
  const color = CATEGORY_COLORS[category];

  return (
    <span
      className={`
        inline-flex items-center font-medium rounded-full whitespace-nowrap
        ${size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-xs'}
      `}
      style={{
        backgroundColor: `${color}15`,
        color: color,
        border: `1px solid ${color}30`,
      }}
    >
      {category}
    </span>
  );
}
