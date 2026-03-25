import { createBrowserRouter, Navigate } from "react-router-dom";
import StepGuard from "@/pages/register/StepGuard";
import RegisterStep1 from "@/components/register/RegisterStep1";
import RegisterStep2 from "@/components/register/RegisterStep2";
import RegisterStep3 from "@/components/register/RegisterStep3";
import RegisterLayout from "@/pages/register/RegisterLayout";
import HomePage from "@/pages/HomePage";
import ThankYouPage from "@/pages/ThankYouPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: "/register",
    element: <RegisterLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/register/step-1" replace />,
      },
      {
        path: "step-1",
        element: (
          <StepGuard step={1}>
            <RegisterStep1 />
          </StepGuard>
        ),
      },
      {
        path: "step-2",
        element: (
          <StepGuard step={2}>
            <RegisterStep2 />
          </StepGuard>
        ),
      },
      {
        path: "step-3",
        element: (
          <StepGuard step={3}>
            <RegisterStep3 />
          </StepGuard>
        ),
      },
      {
        path: "*",
        element: <Navigate to="/register/step-1" replace />,
      },
    ],
  },
  {
    path: "/register/thank-you",
    element: <ThankYouPage />,
  },
]);
