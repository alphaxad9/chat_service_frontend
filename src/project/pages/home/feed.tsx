// src/project/pages/home/feed.tsx (or wherever Feed.tsx is located)
import { NavLink } from "react-router-dom";
import { User } from "lucide-react";
import { useSelector } from 'react-redux';
import { RootState } from '../../entities/store';

const Feed = () => {
    const darkmode = useSelector((state: RootState) => state.theme.isDark);
    const baseClasses = "flex flex-row items-center cursor-pointer";
    const activeClasses = "text-myhover";

  return (
    <div className={`${darkmode ? 'bg-dark text-light' : 'bg-light text-dark'} flex w-full h-screen items-center justify-center relative`}>
     
      {/* Profile button in left-top corner */}
      <div className="absolute top-4 left-4">
        <NavLink to="/profile" className={({ isActive }) => `${baseClasses} ${isActive ? activeClasses : ""} bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 p-2 rounded-lg shadow-lg transition-all duration-300`}>
            <div className="rounded-full flex items-center justify-center">
              <User className="w-6 h-6" />
            </div>
            <span className="ml-3 hidden small:inline homecommunitybarscreen:hidden homeleftbarscreen:inline">Profile</span>
        </NavLink>
      </div>
    
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">
          Welcome to My Chat App
        </h1>
        <p>
          Connect and chat with others in real-time
        </p>
      </div>
    </div>
  );
};

export default Feed;