import { BrowserRouter, Routes, Route } from "react-router-dom";

import LandingPage from "@/pages/Landing/LandingPage";
import { LoginPage, RegisterPage, ForgetPasswordPage } from "@/pages/auth";
import DashboardPage from "@/pages/dashboard/DashboardPage";
function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgetPasswordPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
