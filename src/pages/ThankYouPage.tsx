import { useNavigate } from "react-router-dom";
import { useRegisterStore } from "@/stores/registerStore";
import { Button } from "@/components/ui/button";

export default function ThankYouPage() {
	const navigate = useNavigate();
	const reset = useRegisterStore((s) => s.reset);

	const handleReset = () => {
		reset();
		navigate("/register/step-1");
	};

	return (
		<div className="flex flex-col items-center justify-center min-h-screen gap-6 text-center px-6">
			<h1 className="text-2xl font-semibold">Pendaftaran Berhasil!</h1>
			<p className="text-muted-foreground text-sm">
				Data kamu telah berhasil disimpan. Terima kasih telah mendaftar.
			</p>
			<Button onClick={handleReset}>Isi Data Kembali</Button>
		</div>
	);
}
