import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../../entities/store';// Adjust path to your store types
import { stopAuthLoading } from '../../../freatures/login_and_register/state/authUiSlice';

const AuthLoader = () => {
  const dispatch = useDispatch();
  const isLoading = useSelector((state: RootState) => state.authUi.auth_loading);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isLoading) {
      timer = setTimeout(() => {
        dispatch(stopAuthLoading());
      }, 3000);
    }

    return () => clearTimeout(timer);
  }, [isLoading, dispatch]);

  

  return (
    <div
      className={`absolute top-0 left-0 w-full h-1 z-[9999] pointer-events-none transition-opacity duration-500 ${
        isLoading ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="h-full bg-white animate-slide-bar"></div>
    </div>
  );
};

export default AuthLoader;