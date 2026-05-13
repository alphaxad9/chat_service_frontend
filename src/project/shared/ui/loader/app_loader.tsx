// TopLoader.jsx
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../entities/store';
const TopLoader = () => {
  const [isLoading, setIsLoading] = useState(false);
  const darkmode = useSelector((state: RootState) => state.theme.isDark);

  useEffect(() => {
    const handleClick = () => {
      setIsLoading(true);

      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 3000); // ⏳ keep it visible longer (~3s)

      return () => clearTimeout(timer);
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  return (
    <div
      className={`fixed top-0 left-0 w-full h-1 z-[9999] pointer-events-none transition-opacity duration-500 ${
        isLoading ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className={`h-full ${darkmode ? 'bg-light' : 'bg-dark'} animate-slide-bar`}></div>
    </div>
  );
};

export default TopLoader;
