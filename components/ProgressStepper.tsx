"use client";

const STEPS = [
  { n: 1, label: "Markten scannen" },
  { n: 2, label: "Koersdata ophalen" },
  { n: 3, label: "Screener" },
  { n: 4, label: "Debat ronde 1" },
  { n: 5, label: "Debat ronde 2" },
  { n: 6, label: "Board verdict" },
];

interface Props {
  activeStep: number;
}

export default function ProgressStepper({ activeStep }: Props) {
  return (
    <div className="w-full overflow-x-auto">
      <div className="flex items-center gap-1 min-w-max mx-auto px-4">
        {STEPS.map((s, i) => {
          const done = activeStep > s.n;
          const active = activeStep === s.n;
          return (
            <div key={s.n} className="flex items-center">
              <div className="flex flex-col items-center gap-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-mono font-bold transition-all duration-300 ${
                    done
                      ? "bg-[#22c55e] text-black"
                      : active
                      ? "bg-white text-black animate-pulse"
                      : "bg-[#222] text-gray-600 border border-[#333]"
                  }`}
                >
                  {s.n}
                </div>
                <span
                  className={`text-xs font-mono whitespace-nowrap transition-colors duration-300 ${
                    done ? "text-[#22c55e]" : active ? "text-white" : "text-gray-600"
                  }`}
                >
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`w-8 h-px mx-1 mb-5 transition-colors duration-300 ${
                    activeStep > s.n ? "bg-[#22c55e]" : "bg-[#333]"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
