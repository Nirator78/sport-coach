interface ProgressRingProps {
  progress: number; // 0 to 1
  size?: number;
  strokeWidth?: number;
  color?: string;
  trackColor?: string;
  pulsing?: boolean;
  children?: React.ReactNode;
}

export function ProgressRing({
  progress,
  size = 200,
  strokeWidth = 8,
  color = '#10b981',
  trackColor = '#334155',
  pulsing = false,
  children,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.min(1, Math.max(0, progress)));

  return (
    <div
      className={`relative inline-flex items-center justify-center ${pulsing ? 'animate-pulse' : ''}`}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-linear"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">{children}</div>
    </div>
  );
}

/** Get timer color based on remaining time ratio */
export function getTimerColor(remaining: number, total: number): { color: string; pulsing: boolean } {
  if (total <= 0) return { color: '#10b981', pulsing: false };
  const ratio = remaining / total;
  if (ratio > 0.5) return { color: '#34d399', pulsing: false };       // emerald-400
  if (ratio > 0.2 && remaining > 5) return { color: '#fbbf24', pulsing: false }; // amber-400
  return { color: '#ef4444', pulsing: true };                          // red-500
}
