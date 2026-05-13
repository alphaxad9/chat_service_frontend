import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthLayout } from "../components/auth/AuthLayout";
import { LoginForm } from "../components/auth/LoginForm";

export const LoginPage: React.FC = () => {
const navigate = useNavigate();

return (
<AuthLayout title="Welcome back" subtitle="Sign in to your account">
    <LoginForm onSuccess={() => navigate("/")} />
    <div className="mt-6 text-sm text-gray-600 dark:text-gray-400">
    Don’t have an account?{" "}
    <Link to="/register" className="text-blue-600 dark:text-light hover:underline font-bold">
        Register
    </Link>
    </div>
</AuthLayout>
);
};
