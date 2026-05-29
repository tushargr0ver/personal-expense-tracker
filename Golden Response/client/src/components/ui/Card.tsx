import type { ReactNode, HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hover?: boolean;
  glow?: boolean;
  className?: string;
}

export default function Card({
  children,
  hover = false,
  glow = false,
  className = '',
  ...props
}: CardProps) {
  return (
    <div
      className={`
        glass-card p-6
        ${hover ? 'hover-lift cursor-pointer' : ''}
        ${glow ? 'animate-pulse-glow' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}
