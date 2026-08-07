import { PALETTE } from "@/lib/palette";

export function MeasureBar({ value }: { value: number }) {
  const v = Math.max(0, Math.min(100, value || 0));
  const ticks = Array.from({ length: 11 }, (_, i) => i * 10);
  const color = v >= 100 ? PALETTE.emerald : v > 0 ? PALETTE.gold : PALETTE.gray;

  return (
    <div className="w-full">
      <div className="relative h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: "#EFE9DE" }}>
        <div
          className="absolute left-0 top-0 bottom-0 transition-[width]"
          style={{ width: v + "%", backgroundColor: color }}
        />
        <div className="absolute inset-0 flex justify-between items-center px-px">
          {ticks.map((t) => (
            <div
              key={t}
              style={{ width: 1, height: t % 50 === 0 ? 10 : 6, backgroundColor: "rgba(36,27,46,0.18)" }}
            />
          ))}
        </div>
      </div>
      <span className="text-xs text-slate">{v}%</span>
    </div>
  );
}
