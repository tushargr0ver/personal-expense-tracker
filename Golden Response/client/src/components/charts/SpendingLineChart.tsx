import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { MonthlyTrend } from '../../types';
import { TrendingUp } from 'lucide-react';

interface SpendingLineChartProps {
  data: MonthlyTrend[];
}

interface TooltipPayloadItem {
  value: number;
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="glass-card px-4 py-3 shadow-2xl">
      <p className="text-sm font-medium text-dark-300">{label}</p>
      <p className="text-lg font-bold text-dark-100 mt-1">
        ${payload[0].value.toLocaleString('en-US', { minimumFractionDigits: 2 })}
      </p>
    </div>
  );
}

export default function SpendingLineChart({ data }: SpendingLineChartProps) {
  if (!data.length) {
    return (
      <div className="flex flex-col items-center justify-center h-[300px] text-dark-500">
        <TrendingUp className="h-12 w-12 mb-3 opacity-30" />
        <p className="text-sm">No trend data yet</p>
        <p className="text-xs mt-1">Spend across months to see trends</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={320}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="spendingGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="rgba(255,255,255,0.05)"
          vertical={false}
        />
        <XAxis
          dataKey="label"
          axisLine={false}
          tickLine={false}
          tick={{ fill: '#64748b', fontSize: 12 }}
          dy={10}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fill: '#64748b', fontSize: 12 }}
          tickFormatter={(value: number) => `$${value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value}`}
          dx={-10}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="total"
          stroke="#8b5cf6"
          strokeWidth={2.5}
          fill="url(#spendingGradient)"
          animationDuration={1200}
          dot={{ fill: '#8b5cf6', strokeWidth: 0, r: 4 }}
          activeDot={{
            fill: '#8b5cf6',
            strokeWidth: 2,
            stroke: '#1e293b',
            r: 6,
          }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
