import { Navigate } from "react-router-dom";
import { useRegisterStore } from "@/stores/registerStore";

type Props = {
	step: 1 | 2 | 3;
	children: React.ReactNode;
};

export default function StepGuard({ step, children }: Props) {
	const completedSteps = useRegisterStore((s) => s.completedSteps);
	const latestValid = completedSteps.has(2) ? 3 : completedSteps.has(1) ? 2 : 1;

	if (step > latestValid) {
		return <Navigate to={`/register/step-${latestValid}`} replace />;
	}

	return <>{children}</>;
}
