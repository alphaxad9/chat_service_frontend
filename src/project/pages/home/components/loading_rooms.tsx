import { NavLink } from "react-router-dom";
import { User } from "lucide-react";
import { RootState } from "../../../entities/store";
import { useSelector } from "react-redux";

const LoadingRooms = () => {
    const darkmode = useSelector((state: RootState) => state.theme.isDark);
    const baseClasses = "flex flex-row items-center cursor-pointer";
    const activeClasses = "text-myhover";
    return (
            <div className={`${darkmode ? 'bg-dark text-light' : 'bg-light text-dark'} min-w-screen min-h-screen flex items-center justify-center relative`}>
                <div className="absolute top-4 left-4">
                    <NavLink 
                        to="/profile" 
                        className={({ isActive }) => 
                            `${baseClasses} ${isActive ? activeClasses : ""} bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 p-2 rounded-lg shadow-lg transition-all duration-300`
                        }
                    >
                        <div className="rounded-full flex items-center justify-center">
                            <User className="w-6 h-6" />
                        </div>
                        <span className="ml-3 hidden small:inline homecommunitybarscreen:hidden homeleftbarscreen:inline">Profile</span>
                    </NavLink>
                </div>
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
                    <p className="text-gray-500 dark:text-gray-400">Loading conversations...</p>
                </div>
            </div>
        );
}
export default LoadingRooms;