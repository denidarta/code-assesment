import { Outlet } from "react-router-dom";

export default function RegisterLayout() {
	return (
		<div className="flex flex-col gap-4 max-w-md mx-auto px-4 py-8">
			<h1 className="text-sm font-semibold">Informasi Data Diri</h1>
			<Outlet />
		</div>
	);
}
