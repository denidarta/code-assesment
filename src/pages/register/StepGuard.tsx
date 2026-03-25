import { Navigate } from "react-router-dom";
import { useRegisterStore } from "@/stores/registerStore";

type Props = {
  step: 1 | 2 | 3;           // which step this guard protects (1, 2, or 3)
  children: React.ReactNode;
};

/**
 * StepGuard — renders children only if the user is allowed to access `step`.
 * Otherwise redirects to `/register/step-{latestValidStep}`.
 */
export default function StepGuard({ step, children }: Props) {
  const completedSteps = useRegisterStore((s) => s.completedSteps);
  const latestValid = completedSteps.has(2) ? 3 : completedSteps.has(1) ? 2 : 1;

  if (step > latestValid) {
    return <Navigate to={`/register/step-${latestValid}`} replace />;
  }

  return <>{children}</>;
}
