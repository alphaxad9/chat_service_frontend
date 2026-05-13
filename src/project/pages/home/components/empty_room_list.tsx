import { NavLink } from "react-router-dom";
import { User, MessageCircle} from "lucide-react";
import { RootState } from "../../../entities/store";
import { useSelector } from "react-redux";
const EmptyRoomsList = () => {
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
                    <div className="text-center max-w-md mx-auto px-4">
                        <div className="bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 rounded-full p-6 w-32 h-32 mx-auto mb-6 flex items-center justify-center">
                            <MessageCircle className="w-16 h-16 text-purple-500" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">No conversations yet</h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            Start a new conversation by finding friends or creating a group chat
                        </p>
                        <NavLink 
                            to="/explore" 
                            className="inline-block px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg"
                        >
                            Find Friends
                        </NavLink>
                    </div>
                </div>
            );
}

export default EmptyRoomsList;