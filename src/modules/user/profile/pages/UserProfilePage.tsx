// src/modules/user/profile/pages/UserProfilePage.tsx
import React, {  useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../../../store/store";
import { useAuth } from "../../../../apis/user/authentication/AuthContext";
import { Avatar } from "../../../../shared/components/user/Avatar";


export const UserProfilePage: React.FC = () => {
  const darkMode = useSelector((s: RootState) => s.theme.darkMode);
  const { profile } = useAuth();



  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className={`${darkMode ? "bg-black text-light" : "bg-light text-dark"} min-h-screen`}>
      {/* Top bar */}
      <header className="h-16 shadow flex items-center px-4 sm:px-6">
        <Link to="/" className="text-sm hover:underline">← Back to Home</Link>
        <div className="ml-auto flex items-center gap-2">
          <Link to="/" className="text-sm hover:underline hidden sm:inline">Home</Link>
          <Avatar
            src={profile?.profilePicture || null}
            alt={profile?.username || "User"}
            size={32}
          />
        </div>
      </header>

      {/* Cover / Header */}
      <section className="relative">
        <div className="h-40 sm:h-48 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
        <div className="px-4 sm:px-6">
          <div className="-mt-10 sm:-mt-12 flex items-end gap-3">
            <Avatar src={profile?.profilePicture || null} alt={profile?.username || "User"} size={88} />
            <div className="pb-2">
              <h1 className="text-xl sm:text-2xl font-semibold">
                {profile?.first_name || profile?.last_name
                  ? `${profile?.first_name ?? ""} ${profile?.last_name ?? ""}`.trim()
                  : profile?.username}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">@{profile?.username}</p>
            </div>

            {/* Profile actions */}
            <div className="ml-auto pb-2 relative">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="rounded-md border px-3 h-9 text-sm hover:bg-gray-50 dark:hover:bg-dark_secondary"
              >
                •••
              </button>
              {menuOpen && (
                <div
                  className="absolute right-0 mt-2 w-48 rounded-md border bg-white dark:bg-dark_tertialy shadow-lg z-10"
                  onMouseLeave={() => setMenuOpen(false)}
                >
                  <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-dark_secondary">Edit profile</button>
                  <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-dark_secondary">Account settings</button>
                  <button
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-dark_secondary"
                    onClick={async () => { try { await navigator.clipboard.writeText(`${window.location.origin}/profile`);} catch {} }}
                  >
                    Copy profile link
                  </button>
                  <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-dark_secondary">Report</button>
                </div>
              )}
            </div>
          </div>

          {/* Quick info */}
          <div className="mt-3 flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
            {profile?.email && <span>{profile.email}</span>}

          </div>
        </div>
      </section>

   
    </div>
  );
};
