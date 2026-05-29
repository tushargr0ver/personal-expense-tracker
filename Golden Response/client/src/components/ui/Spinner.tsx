interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap: Record<string, string> = {
  sm: 'h-5 w-5 border-2',
  md: 'h-8 w-8 border-2',
  lg: 'h-12 w-12 border-3',
};

export default function Spinner({ size = 'md' }: SpinnerProps) {
  return (
    <div className="flex items-center justify-center" role="status">
      <div
        className={`
          rounded-full border-accent-start border-t-transparent animate-spin
          ${sizeMap[size]}
        `}
      />
      <span className="sr-only">Loading…</span>
    </div>
  );
}
