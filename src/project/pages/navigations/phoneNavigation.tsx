import { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { Home, MessageSquare, Users, User, MoreVertical } from "lucide-react";
import { useSelector } from 'react-redux';
import { RootState } from "../../entities/store";
const PhoneNav = () => {
  const baseClasses = "flex flex-col items-center justify-center cursor-pointer";
  const activeClasses = "text-myhover font-semibold";
  const [showMore, setShowMore] = useState(false);
  const [autoHideTimer, setAutoHideTimer] = useState<NodeJS.Timeout | null>(null);
  const darkmode = useSelector((state: RootState) => state.theme.isDark);
  const navigate = useNavigate();
  const location = useLocation();

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (autoHideTimer) clearTimeout(autoHideTimer);
    };
  }, [autoHideTimer]);

  const handleMoreClick = () => {
    setShowMore((prev) => !prev);
  };

  const handleFakePageClick = (path: string) => {
    navigate(path);
    // popup will be auto-hidden by the location effect below
  };

  // Auto-hide popup whenever location changes
  useEffect(() => {
    if (showMore) {
      if (autoHideTimer) clearTimeout(autoHideTimer);
      const timer = setTimeout(() => {
        setShowMore(false);
      }, 3000);
      setAutoHideTimer(timer);
    }
  }, [location, showMore, autoHideTimer]);

  return (
    <>
      {/* Phone nav bar */}
      <div className={`${darkmode ? 'bg-dark_primary2 text-light' : 'bg-light_primary text-dark'}  fixed bottom-0 left-0 right-0   flex justify-around py-2 movetosmallscreenpermanently:hidden block`}>
        {/* Home */}
        <NavLink to="/" end className={({ isActive }) => `${baseClasses} ${isActive ? activeClasses : ""}`}>
          <div className="w-12 h-10 rounded-full  flex items-center justify-center">
            <Home className="w-6 h-6" />
          </div>
          <span className="hidden min-phone-small:block text-xs mt-1">Home</span>
        </NavLink>

        {/* Chat */}
        <NavLink to="/chat" className={({ isActive }) => `${baseClasses} ${isActive ? activeClasses : ""}`}>
          <div className="w-12 h-10 rounded-full  flex items-center justify-center">
            <MessageSquare className="w-6 h-6" />
          </div>
          <span className="hidden min-phone-small:block text-xs mt-1">Chat</span>
        </NavLink>

        {/* Community */}
        <NavLink to="/community" className={({ isActive }) => `${baseClasses} ${isActive ? activeClasses : ""}`}>
          <div className="w-12 h-10 rounded-full  flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <span className="hidden min-phone-small:block text-xs mt-1">Community</span>
        </NavLink>

        {/* Profile */}
        <NavLink to="/profile" className={({ isActive }) => `${baseClasses} ${isActive ? activeClasses : ""}`}>
          <div className="w-12 h-10 rounded-full  flex items-center justify-center">
            <User className="w-6 h-6" />
          </div>
          <span className="hidden min-phone-small:block text-xs mt-1">Profile</span>
        </NavLink>

        {/* More Button */}
        <button onClick={handleMoreClick} className={`${baseClasses}`}>
          <div className="w-12 h-10 rounded-full  flex items-center justify-center">
            <MoreVertical className="w-6 h-6" />
          </div>
          <span className="hidden min-phone-small:block text-xs mt-1">More</span>
        </button>
      </div>

      {/* More Popup */}
      {showMore && (
        <div className="absolute bottom-14 right-2 rounded-lg shadow-lg p-2 w-40">
          <button
            onClick={() => handleFakePageClick("/fake1")}
            className="block w-full text-left px-3 py-2 rounded"
          >
            Fake Page 1
          </button>
          <button
            onClick={() => handleFakePageClick("/fake2")}
            className="block w-full text-left px-3 py-2  rounded"
          >
            Fake Page 2
          </button>
          <button
            onClick={() => handleFakePageClick("/explore")}
            className="block w-full text-left px-3 py-2 rounded"
          >
            Search
          </button>
        </div>
      )}
    </>
  );
};

export default PhoneNav;