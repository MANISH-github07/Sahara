import { Link } from "react-router-dom";

import AuthLayout from "@/layouts/AuthLayout";

import InputField from "@/components/forms/InputField";
import PasswordField from "@/components/forms/PasswordField";
import CheckboxField from "@/components/forms/CheckboxField";

import PrimaryButton from "@/components/ui/PrimaryButton";

function RegisterPage() {
  return (
    <AuthLayout>
      <div className="space-y-6">
        {/* Heading */}
        <div>
          <h1 className="text-3xl font-bold text-white">Create Your Account</h1>

          <p className="mt-2 text-slate-400">
            Join SAHARA and begin your mental wellness journey.
          </p>
        </div>

        {/* Name */}
        <InputField label="Full Name" placeholder="Enter your full name" />

        {/* Email */}
        <InputField label="Email Address" placeholder="Enter your email" />

        {/* Password */}
        <PasswordField label="Password" placeholder="Create a password" />

        {/* Confirm Password */}
        <PasswordField
          label="Confirm Password"
          placeholder="Confirm your password"
        />

        {/* Terms */}
        <CheckboxField label="I agree to the Privacy Policy and Terms of Service" />

        {/* Button */}
        <PrimaryButton className="w-full">Create Account</PrimaryButton>

        {/* Divider */}
        <div className="flex items-center gap-4">
          <div className="h-px flex-1 bg-slate-700"></div>

          <span className="text-sm text-slate-500">OR</span>

          <div className="h-px flex-1 bg-slate-700"></div>
        </div>

        {/* Login */}
        <p className="text-center text-slate-400">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-medium text-cyan-400 hover:underline"
          >
            Login
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}

export default RegisterPage;
