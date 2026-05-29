import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import type { CategoryBreakdown, Category } from '../../types';
import { CATEGORY_COLORS } from '../../types';
import { PieChart as PieChartIcon } from 'lucide-react';

interface SpendingPieChartProps {
  data: CategoryBreakdown[];
}

interface TooltipPayloadItem {
  payload: CategoryBreakdown;
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
}) {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload;

  return (
    <div className="glass-card px-4 py-3 shadow-2xl">
      <p className="text-sm font-semibold text-dark-100">{item.category}</p>
      <p className="text-lg font-bold mt-1" style={{ color: CATEGORY_COLORS[item.category] }}>
        ${item.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
      </p>
      <p className="text-xs text-dark-400 mt-0.5">
        {item.percentage.toFixed(1)}% • {item.count} expense{item.count !== 1 ? 's' : ''}
      </p>
    </div>
  );
}

interface LegendPayloadItem {
  value: string;
  color: string;
}

function CustomLegend({ payload }: { payload?: LegendPayloadItem[] }) {
  if (!payload) return null;
  return (
    <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-4">
      {payload.map((entry) => (
        <div key={entry.value} className="flex items-center gap-1.5">
          <div
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-xs text-dark-400">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function SpendingPieChart({ data }: SpendingPieChartProps) {
  if (!data.length) {
    return (
      <div className="flex flex-col items-center justify-center h-[300px] text-dark-500">
        <PieChartIcon className="h-12 w-12 mb-3 opacity-30" />
        <p className="text-sm">No spending data yet</p>
        <p className="text-xs mt-1">Add expenses to see your breakdown</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={320}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="45%"
          innerRadius={65}
          outerRadius={110}
          paddingAngle={3}
          dataKey="total"
          nameKey="category"
          animationBegin={0}
          animationDuration={800}
          stroke="none"
        >
          {data.map((entry) => (
            <Cell
              key={entry.category}
              fill={CATEGORY_COLORS[entry.category as Category]}
            />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend content={<CustomLegend />} />
      </PieChart>
    </ResponsiveContainer>
  );
}
