// src/project/pages/LandingPage.tsx

import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Outlet } from 'react-router-dom';
import SideBar from './navigations/computerNavigation';
import PhoneNav from './navigations/phoneNavigation';
import { RootState } from '../entities/store';
import { useAuth } from '../../apis/user/authentication/AuthContext';

function LandingPage() {
  const darkmode = useSelector((state: RootState) => state.theme.isDark);
  const { refreshToken } = useAuth();

  useEffect(() => {
    const interval = setInterval(() => {
      refreshToken();
    }, 4 * 60 * 1000);

    return () => clearInterval(interval);
  }, [refreshToken]);

  return (
    <div className={`${darkmode ? 'bg-dark text-light' : 'bg-light text-dark'} min-w-screen min-h-screen flex relative`}>
      
      <div
        className={`
          ${darkmode ? 'bg-dark_primary2' : 'bg-light_primary'}
          fixed top-0 bottom-0 left-0 hidden movetosmallscreenpermanently:block
          w-16 small:w-40 homecommunitybarscreen:w-[5%] homeleftbarscreen:w-[15%]
          flex flex-col items-center py-2
        `}
      >
        <div className="text-xl font-bold mb-2 flex justify-center items-center">Zvy</div>
        <SideBar />
      </div>

      <div
        className={`
          flex-1
          movetosmallscreenpermanently:ml-16 small:ml-40
          homecommunitybarscreen:ml-[5%] homeleftbarscreen:ml-[15%]
        `}
      >
        <Outlet />
      </div>

      <PhoneNav />
    </div>
  );
}

export default LandingPage;
