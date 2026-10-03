import { cn } from "@/lib/utils";

const SHAPES: Record<number, string> = {
  4: "50,8 94,88 6,88",
  6: "14,14 86,14 86,86 14,86",
  8: "50,4 94,50 50,96 6,50",
  10: "50,4 92,42 50,96 8,42",
  12: "50,4 95,37 78,92 22,92 5,37",
  20: "50,3 92,27 92,73 50,97 8,73 8,27",
};

export const DIE_COLOR: Record<number, string> = {
  4: "text-die-4",
  6: "text-die-6",
  8: "text-die-8",
  10: "text-die-10",
  12: "text-die-12",
  20: "text-die-20",
  100: "text-die-100",
};

interface DieProps {
  sides: number;
  value?: number | string;
  rolling?: boolean;
  size?: number;
  className?: string;
}

export function DieShape({ sides, value, rolling, size = 56, className }: DieProps) {
  return (
    <span
      className={cn("relative inline-flex items-center justify-center", DIE_COLOR[sides], rolling && "animate-die-tumble", className)}
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full drop-shadow-[0_0_6px_currentColor]">
        {sides === 100 ? (
          <>
            <circle cx="50" cy="50" r="44" fill="currentColor" fillOpacity="0.14" stroke="currentColor" strokeWidth="4" />
            <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeOpacity="0.4" strokeWidth="2" />
          </>
        ) : (
          <polygon points={SHAPES[sides]} fill="currentColor" fillOpacity="0.14" stroke="currentColor" strokeWidth="4" strokeLinejoin="round" />
        )}
      </svg>
      <span className={cn("relative font-display font-bold text-foreground", sides === 4 && "mt-3")} style={{ fontSize: size * 0.3 }}>
        {value ?? `d${sides}`}
      </span>
    </span>
  );
}
