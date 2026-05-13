import React, { useState } from "react";
import { FormInput } from "../ui/FormInput";
import { LoadingOverlay } from "../ui/LoadingOverlay";
import type { LoginFormData } from "../../types/auth";
import { useAuth } from "../../../../../apis/user/authentication/AuthContext";

export interface LoginFormProps {
  onSuccess?: () => void;
}

const initialState: LoginFormData = { identifier: "", password: "" };

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess }) => {
  const [form, setForm] = useState<LoginFormData>(initialState);
  const [errors, setErrors] = useState<Partial<LoginFormData>>({});
  const { login, isLoggingIn } = useAuth();

  const validate = () => {
    const nextErrors: Partial<LoginFormData> = {};
    if (!form.identifier) nextErrors.identifier = "Email or Username is required.";
    if (!form.password) nextErrors.password = "Password is required.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await login(form); // Calls backend via AuthContext
      onSuccess?.();
    } catch (err) {
      // Handle API error shape as needed
      setErrors((prev) => ({ ...prev, password: "Invalid email or password." }));
    }
  };

  return (
    <>
      <LoadingOverlay show={isLoggingIn} />
      <form onSubmit={handleSubmit} className="grid gap-4" noValidate>
        <FormInput
    label="Email or Username"
    name="identifier" // ✅ was email
    type="email"
    value={form.identifier}
    onChange={handleChange}
    autoComplete="email"
    placeholder="you@company.com or username"
    error={errors.identifier}
    />
        <FormInput
          label="Password"
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          autoComplete="current-password"
          placeholder="••••••••"
          error={errors.password}
        />
        <button
          type="submit"
          className="inline-flex items-center justify-center rounded-md bg-light_primary hover:bg-light_secondary2 disabled:opacity-50 text-dark text-sm font-medium h-10 px-4 transition-colors"
          aria-label="Sign in"
          disabled={isLoggingIn}
        >
          Sign in
        </button>
      </form>
    </>
  );
};