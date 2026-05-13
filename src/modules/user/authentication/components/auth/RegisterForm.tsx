import React, { useState } from "react";
import { FormInput } from "../ui/FormInput";
import { LoadingOverlay } from "../ui/LoadingOverlay";
import type { RegisterFormData } from "../../types/auth";
import { useAuth } from "../../../../../apis/user/authentication/AuthContext";

export interface RegisterFormProps {
    onSuccess?: () => void;
}

const initialState: RegisterFormData = {
    username: "",
    email: "",
    password: "",
    password2: "",
};

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSuccess }) => {
    const [form, setForm] = useState<RegisterFormData>(initialState);
    const [errors, setErrors] = useState<Partial<RegisterFormData>>({});
    const { register, isRegistering } = useAuth();

    const validate = () => {
        const nextErrors: Partial<RegisterFormData> = {};
        if (!form.username) nextErrors.username = "Username is required.";
        if (!form.email) nextErrors.email = "Email is required.";
        else if (!/^\S+@\S+\.\S+$/.test(form.email)) nextErrors.email = "Enter a valid email.";
        if (!form.password) nextErrors.password = "Password is required.";
        else if (form.password.length < 8) nextErrors.password = "Password must be at least 8 characters.";
        if (!form.password2) nextErrors.password2 = "Please confirm your password.";
        else if (form.password2 !== form.password) nextErrors.password2 = "Passwords do not match.";
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
        await register(form); // ✅ Calls backend via AuthContext
        onSuccess?.();
        } catch (err) {
        // API errors will bubble up here
        setErrors((prev) => ({
            ...prev,
            email: "Registration failed. Email may already be in use.",
        }));
        }
    };

    return (
        <>
        <LoadingOverlay show={isRegistering} />
        <form onSubmit={handleSubmit} className="grid gap-4" noValidate>
            <FormInput
            label="Username"
            name="username"
            value={form.username}
            onChange={handleChange}
            autoComplete="username"
            placeholder="username"
            error={errors.username}
            />

            <FormInput
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            autoComplete="email"
            placeholder="you@company.com"
            error={errors.email}
            />

            <FormInput
            label="Password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            autoComplete="new-password"
            placeholder="Create a secure password"
            error={errors.password}
            hint="Minimum 8 characters."
            />

            <FormInput
            label="Confirm password"
            name="password2"
            type="password"
            value={form.password2}
            onChange={handleChange}
            autoComplete="new-password"
            placeholder="Re-enter your password"
            error={errors.password2}
            />

            <button
            type="submit"
            className="inline-flex items-center justify-center rounded-md bg-light_primary hover:bg-light_secondary2 disabled:opacity-50 text-dark text-sm font-medium h-10 px-4 transition-colors"
            aria-label="Create account"
            disabled={isRegistering}
            >
            Create account
            </button>
        </form>
        </>
    );
};
