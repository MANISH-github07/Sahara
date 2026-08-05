import { Link } from "react-router-dom";

import AuthLayout from "@/layouts/AuthLayout";
import InputField from "@/components/forms/InputField";
import PrimaryButton from "@/components/ui/PrimaryButton";

function ForgetPasswordPage() {
  return (
    <AuthLayout>
      <div className="space-y-6">
        {/* Heading */}
        <div>
          <h1 className="text-3xl font-bold text-white">Reset Your Password</h1>

          <p className="mt-2 text-slate-400 leading-7">
            Enter your registered email address and we'll send you a password
            reset link.
          </p>
        </div>

        {/* Email */}
        <InputField label="Email Address" placeholder="Enter your email" />

        {/* Button */}
        <PrimaryButton className="w-full">Send Reset Link</PrimaryButton>

        {/* Back */}
        <p className="text-center text-slate-400">
          Remember your password?{" "}
          <Link
            to="/login"
            className="font-medium text-cyan-400 hover:underline"
          >
            Back to Login
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}

export default ForgetPasswordPage;
