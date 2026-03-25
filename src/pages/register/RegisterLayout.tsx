import { Outlet } from "react-router-dom";

export default function RegisterLayout() {
	return (
		<div className="flex flex-col gap-4 max-w-2xl min-w-xl mx-auto px-4 py-8">
			<Outlet />
		</div>
	);
}
