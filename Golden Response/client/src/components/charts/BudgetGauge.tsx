import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts';

interface BudgetGaugeProps {
  spent: number;
  budget: number;
  percentage: number;
}

function getGaugeColor(pct: number): string {
  if (pct >= 90) return '#ef4444';
  if (pct >= 70) return '#f59e0b';
  return '#10b981';
}

export default function BudgetGauge({
  spent,
  budget,
  percentage,
}: BudgetGaugeProps) {
  const clampedPct = Math.min(percentage, 100);
  const color = getGaugeColor(percentage);
  const remaining = budget - spent;

  const data = [
    {
      name: 'Budget',
      value: clampedPct,
      fill: color,
    },
  ];

  return (
    <div className="relative flex flex-col items-center">
      <ResponsiveContainer width="100%" height={220}>
        <RadialBarChart
          cx="50%"
          cy="50%"
          innerRadius="70%"
          outerRadius="90%"
          barSize={14}
          data={data}
          startAngle={180}
          endAngle={0}
        >
          <RadialBar
            dataKey="value"
            cornerRadius={10}
            background={{ fill: 'rgba(255,255,255,0.05)' }}
            animationDuration={1200}
          />
        </RadialBarChart>
      </ResponsiveContainer>

      {/* Center text overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
        <span
          className="text-3xl font-bold"
          style={{ color }}
        >
          {percentage.toFixed(0)}%
        </span>
        <span className="text-xs text-dark-400 mt-1">
          {remaining >= 0
            ? `$${remaining.toLocaleString('en-US', { minimumFractionDigits: 2 })} left`
            : `$${Math.abs(remaining).toLocaleString('en-US', { minimumFractionDigits: 2 })} over`}
        </span>
      </div>
    </div>
  );
}
