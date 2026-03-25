import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function HomePage() {
	const navigate = useNavigate();

	return (
		<div className="flex flex-col items-center justify-center min-h-screen gap-4">
			<h1 className="text-2xl font-semibold">Register Form</h1>
			<Button onClick={() => navigate("/register/step-1")}>Mulai Pendaftaran</Button>
		</div>
	);
}
