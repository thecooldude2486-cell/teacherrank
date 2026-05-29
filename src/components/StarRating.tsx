import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

type StarRatingProps = {
  /** Numeric rating 0–5. Values are clamped. */
  value: number;
  /** Pixel size of each star icon. */
  size?: number;
  /** Show the numeric label, e.g. "4.7 / 5". Defaults to false. */
  showValue?: boolean;
  className?: string;
};

/**
 * Renders exactly 5 stars representing `value` (0–5).
 * Each star can be filled proportionally (e.g. 4.7 -> 4 full + 1 70% filled).
 */
export function StarRating({ value, size = 16, showValue = false, className }: StarRatingProps) {
  const clamped = Math.max(0, Math.min(5, Number.isFinite(value) ? value : 0));

  return (
    <div className={cn("inline-flex items-center gap-1.5", className)}>
      <div className="inline-flex items-center gap-0.5" aria-label={`Rating ${clamped.toFixed(1)} out of 5`}>
        {Array.from({ length: 5 }).map((_, i) => {
          // Fill fraction for this star (0–1)
          const fill = Math.max(0, Math.min(1, clamped - i));
          return (
            <span key={i} className="relative inline-block" style={{ width: size, height: size }}>
              <Star
                width={size} height={size} strokeWidth={1.5}
                className="absolute inset-0 text-muted-foreground/30"
              />
              {fill > 0 && (
                <span
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: size * fill }}
                  aria-hidden="true"
                >
                  <Star
                    width={size} height={size} strokeWidth={1.5}
                    className="fill-sunny text-sunny"
                  />
                </span>
              )}
            </span>
          );
        })}
      </div>
      {showValue && (
        <span className="text-sm font-semibold tabular-nums text-foreground/80">
          {clamped.toFixed(1)} / 5
        </span>
      )}
    </div>
  );
}

/**
 * Precise star input. Click any star to set whole/half values quickly,
 * or use the number input / slider for fine decimals (e.g. 4.7).
 */
export function StarInput({
  value, onChange, name, size = 28, step = 0.1,
}: { value: number; onChange: (v: number) => void; name?: string; size?: number; step?: number }) {
  const clamped = Math.max(0, Math.min(5, Number.isFinite(value) ? value : 0));

  const setFromInput = (raw: string) => {
    if (raw === "") { onChange(0); return; }
    const n = parseFloat(raw);
    if (!Number.isFinite(n)) return;
    onChange(Math.max(0, Math.min(5, Math.round(n * 10) / 10)));
  };

  return (
    <div className="flex flex-col gap-2" aria-label={name}>
      <div className="inline-flex items-center gap-1">
        {[1, 2, 3, 4, 5].map(n => {
          const fill = Math.max(0, Math.min(1, clamped - (n - 1)));
          return (
            <span
              key={n}
              className="relative inline-block"
              style={{ width: size, height: size }}
            >
              <Star
                width={size} height={size} strokeWidth={1.5}
                className="absolute inset-0 text-muted-foreground/40"
              />
              {fill > 0 && (
                <span
                  className="absolute inset-0 overflow-hidden pointer-events-none"
                  style={{ width: size * fill }}
                  aria-hidden="true"
                >
                  <Star
                    width={size} height={size} strokeWidth={1.5}
                    className="fill-sunny text-sunny"
                  />
                </span>
              )}
              {/* Click zones: left = n - 0.5, right = n */}
              <button
                type="button"
                onClick={() => onChange(n - 0.5)}
                className="absolute inset-y-0 left-0 w-1/2 cursor-pointer"
                aria-label={`${n - 0.5} stars`}
              />
              <button
                type="button"
                onClick={() => onChange(n)}
                className="absolute inset-y-0 right-0 w-1/2 cursor-pointer"
                aria-label={`${n} star${n > 1 ? "s" : ""}`}
              />
            </span>
          );
        })}
        <input
          type="number"
          min={0}
          max={5}
          step={step}
          value={clamped ? clamped.toFixed(1) : ""}
          onChange={(e) => setFromInput(e.target.value)}
          placeholder="0.0"
          className="ml-2 w-16 h-8 px-2 rounded-md border border-input bg-background text-sm tabular-nums text-center focus:outline-none focus:ring-2 focus:ring-ring"
          aria-label="Precise rating value"
        />
        <span className="text-sm text-muted-foreground">/ 5</span>
        {clamped > 0 && (
          <button
            type="button"
            onClick={() => onChange(0)}
            className="ml-1 text-xs text-muted-foreground hover:text-foreground underline-offset-2 hover:underline"
          >
            clear
          </button>
        )}
      </div>
      <input
        type="range"
        min={0}
        max={5}
        step={step}
        value={clamped}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full max-w-xs accent-sunny cursor-pointer"
        aria-label="Fine rating slider"
      />
    </div>
  );
}
