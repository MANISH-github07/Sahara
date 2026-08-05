import { Link } from "react-router-dom";

import AuthLayout from "@/layouts/AuthLayout";
import InputField from "@/components/forms/InputField";
import PasswordField from "@/components/forms/PasswordField";
import CheckboxField from "@/components/forms/CheckboxField";
import PrimaryButton from "@/components/ui/PrimaryButton";

function LoginPage() {
  return (
    <AuthLayout>
      <div className="space-y-6">
        {/* Heading */}
        <div>
          <h1 className="text-3xl font-bold text-white">Welcome Back</h1>

          <p className="mt-2 text-slate-400">
            Sign in to continue your mental wellness journey.
          </p>
        </div>

        {/* Email */}
        <InputField label="Email Address" placeholder="Enter your email" />

        {/* Password */}
        <PasswordField label="Password" placeholder="Enter your password" />

        {/* Remember + Forgot */}
        <div className="flex items-center justify-between">
          <CheckboxField label="Remember Me" />

          <Link
            to="/forgot-password"
            className="text-sm text-cyan-400 hover:underline"
          >
            Forgot Password?
          </Link>
        </div>

        {/* Login Button */}
        <PrimaryButton className="w-full">Login</PrimaryButton>

        {/* Divider */}
        <div className="flex items-center gap-4">
          <div className="h-px flex-1 bg-slate-700"></div>

          <span className="text-sm text-slate-500">OR</span>

          <div className="h-px flex-1 bg-slate-700"></div>
        </div>

        {/* Register */}
        <p className="text-center text-slate-400">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="font-medium text-cyan-400 hover:underline"
          >
            Create Account
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}

export default LoginPage;
