import React from "react";
import styles from "./AuthLayout.module.css";

export interface AuthLayoutProps {
title: string;
subtitle?: string;
children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ title, subtitle, children }) => {
return (
<main
    className="min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-gray-100 flex items-center justify-center px-4"
    aria-label="Authentication area"
>
    <section
    className={`${styles.container} w-full bg-white dark:bg-dark_primary2 shadow-sm dark:shadow-none border border-gray-100 dark:border-gray-800 rounded-xl p-6 md:p-8`}
    aria-labelledby="auth-title"
    >
    <header className={`${styles.stack} mb-6`}>
        <h1 id="auth-title" className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">
        {title}
        </h1>
        {subtitle ? (
        <p className="text-sm text-gray-600 dark:text-gray-400">{subtitle}</p>
        ) : null}
    </header>
    {children}
    </section>
</main>
);
};
