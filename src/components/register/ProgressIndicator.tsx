import { useLocation } from "react-router-dom";
import { useRegisterStore } from "@/stores/registerStore";
import { cn } from "@/lib/utils";

const STEPS = [
  { num: 1, label: "Informasi Dasar" },
  { num: 2, label: "Informasi Lanjutan" },
  { num: 3, label: "Alamat Pribadi" },
];

export default function ProgressIndicator() {
  const location = useLocation();
  const completedSteps = useRegisterStore((s) => s.completedSteps);

  // Extract current step number from URL: /register/step-2 → 2
  const match = location.pathname.match(/step-(\d+)/);
  const currentStep = match ? Number(match[1]) : 1;

  return (
    <nav aria-label="Progres pendaftaran" className="flex items-start w-full">
      {STEPS.map((step, idx) => {
        const isCompleted = completedSteps.has(step.num);
        const isActive = step.num === currentStep;

        return (
          <div key={step.num} className="flex-1 flex flex-col items-center">
            {/* Line + circle row */}
            <div className="flex items-center w-full">
              {/* Left connector line */}
              <div
                className={cn(
                  "flex-1 h-0.5",
                  idx === 0 ? "invisible" : isCompleted ? "bg-primary" : "bg-muted"
                )}
              />
              {/* Circle */}
              <div
                className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold border-2 shrink-0",
                  isCompleted
                    ? "bg-primary border-primary text-primary-foreground"
                    : isActive
                    ? "bg-background border-primary text-primary"
                    : "bg-background border-muted text-muted-foreground"
                )}
              >
                {isCompleted ? "✓" : step.num}
              </div>
              {/* Right connector line */}
              <div
                className={cn(
                  "flex-1 h-0.5",
                  idx === STEPS.length - 1
                    ? "invisible"
                    : isCompleted
                    ? "bg-primary"
                    : "bg-muted"
                )}
              />
            </div>
            {/* Label */}
            <span
              className={cn(
                "text-xs mt-1 text-center",
                isActive ? "text-primary font-medium" : "text-muted-foreground"
              )}
            >
              {step.label}
            </span>
          </div>
        );
      })}
    </nav>
  );
}
