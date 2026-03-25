import { Outlet } from "react-router-dom";
import ProgressIndicator from "@/components/register/ProgressIndicator";

export default function RegisterLayout() {
  return (
    <div className="flex flex-col gap-4 max-w-md mx-auto px-4 py-8">
      <h1 className="text-sm font-semibold">Informasi Data Diri</h1>
      <ProgressIndicator />
      <Outlet />
    </div>
  );
}
