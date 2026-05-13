import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthLayout } from "../components/auth/AuthLayout";
import { RegisterForm } from "../components/auth/RegisterForm";

export const RegisterPage: React.FC = () => {
const navigate = useNavigate();

return (
<AuthLayout title="Create your account" subtitle="Join us in a few simple steps">
    <RegisterForm onSuccess={() => navigate("/")} />
    <div className="mt-6 text-sm text-gray-600 dark:text-gray-400">
    Already have an account?{" "}
    <Link to="/login" className="text-blue-600 dark:text-light font-bold hover:underline">
        Sign in
    </Link>
    </div>
</AuthLayout>
);
};
