import { NavLink } from "react-router-dom";
import { Home, Search, Users, MessageSquare, User } from "lucide-react";

const SideBar = () => {

    const baseClasses = "flex flex-row items-center cursor-pointer";
    const activeClasses = "text-myhover";

    return (
        <div className={`flex flex-col items-center w-full px-1 h-[94%] justify-between py-1`}>
        {/* Top Navigation Items */}
        <div className="flex flex-col items-center space-y-1 w-full">
            {/* Feed */}
            <NavLink to="/" end className={({ isActive }) => `${baseClasses} ${isActive ? activeClasses : ""} w-full`}>
            <div className="w-12 h-12 rounded-full flex items-center justify-center">
                <Home className="w-6 h-6" />
            </div>
            <span className="ml-3 hidden small:inline homecommunitybarscreen:hidden homeleftbarscreen:inline">Feed</span>
            </NavLink>

            {/* Explore */}
            <NavLink to="/explore" className={({ isActive }) => `${baseClasses} ${isActive ? activeClasses : ""} w-full`}>
            <div className="w-12 h-12 rounded-full flex items-center justify-center">
                <Search className="w-6 h-6" />
            </div>
            <span className="ml-3 hidden small:inline homecommunitybarscreen:hidden homeleftbarscreen:inline">Explore</span>
            </NavLink>

            {/* Community */}
            <NavLink to="/community" className={({ isActive }) => `${baseClasses} ${isActive ? activeClasses : ""} w-full`}>
            <div className="w-12 h-12 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6" />
            </div>
            <span className="ml-3 hidden small:inline homecommunitybarscreen:hidden homeleftbarscreen:inline">Community</span>
            </NavLink>

            {/* Chat */}
            <NavLink to="/chat" className={({ isActive }) => `${baseClasses} ${isActive ? activeClasses : ""} w-full`}>
            <div className="w-12 h-12 rounded-full flex items-center justify-center">
                <MessageSquare className="w-6 h-6" />
            </div>
            <span className="ml-3 hidden small:inline homecommunitybarscreen:hidden homeleftbarscreen:inline">Chat</span>
            </NavLink>
        </div>

        {/* Profile - pinned to bottom */}
        <NavLink to="/profile" className={({ isActive }) => `${baseClasses} ${isActive ? activeClasses : ""} w-full`}>
            <div className="w-12 h-12 rounded-full flex items-center justify-center">
            <User className="w-6 h-6" />
            </div>
            <span className="ml-3 hidden small:inline homecommunitybarscreen:hidden homeleftbarscreen:inline">Profile</span>
        </NavLink>
        </div>
    );
    };

export default SideBar;