// src/modules/user/authentication/pages/HomePage.tsx
import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../../../apis/user/authentication/AuthContext";
import { LoadingOverlay } from "../components/ui/LoadingOverlay";

import { Avatar } from "../../../../shared/components/user/Avatar";

export const HomePage: React.FC = () => {
  const { profile, isProfileLoading, logout, refreshToken } = useAuth();


  useEffect(() => {
    const interval = setInterval(() => {
      refreshToken();
    }, 4 * 60 * 1000);
    return () => clearInterval(interval);
  }, [refreshToken]);

  if (isProfileLoading) {
    return <LoadingOverlay show label="ZedVye" />;
  }

  const isAuthenticated = !!profile;

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center px-4">
        <section className="text-center max-w-lg">
          <h1 className="text-4xl text-light font-bold">ZedVye</h1>
          <p className="mt-3 text-gray-600 dark:text-gray-400">
            Sign in or create an account to start connecting with people.
          </p>
          <div className="mt-6 flex justify-center gap-4">
            <Link
              to="/login"
              className="rounded-md bg-dark_secondary hover:bg-dark_tertialy text-white text-sm font-medium h-10 px-6 flex items-center justify-center transition-colors"
            >
              Sign in
            </Link>
            <Link
              to="/register"
              className="rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-dark_tertialy hover:bg-gray-50 dark:hover:bg-dark_secondary text-gray-900 dark:text-gray-100 text-sm font-medium h-10 px-6 flex items-center justify-center transition-colors"
            >
              Create account
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <div className={`bg-black min-h-screen flex flex-col text-white`}>
      {/* Top Navbar */}
      <header className="h-16 shadow flex items-center px-6">
        <h2 className="text-lg font-semibold">ZedVye</h2>

        {/* ⬇️ Profile icon (links to /profile) */}
        <div className="ml-auto">
          <Link to="/profile" className="flex items-center gap-2">
            <Avatar
              src={profile?.profilePicture || null}
              alt={profile?.username || "User"}
              size={32}
            />
            <span className="hidden sm:inline text-sm">@{profile?.username}</span>
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <aside className="hidden lg:block w-64 border-gray-200 p-4">
          <p>Sidebar</p>
        </aside>

        {/* Center Feed Area */}
        <section className="flex-1 overflow-y-auto p-4">
          






        
        </section>

        {/* Right Sidebar (Logout moved here) */}
        <aside className="hidden xl:block w-80 border-gray-200 p-4">
          <div className="sticky top-4 space-y-4">
            <p className="font-semibold">Quick actions</p>
            <button
              onClick={logout}
              className="w-full h-10 rounded-md bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors"
            >
              Log out
            </button>
            
          </div>
        </aside>
      </main>
    </div>
  );
};
