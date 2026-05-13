// src/project/features/login_and_register/ui/authentication.tsx
import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../entities/store';
import Login from './forms/login_form';
import Register from './forms/register_form';
import OtherParties from './forms/other_parties';
import { motion, AnimatePresence } from 'framer-motion';
import AuthLoader from '../../../shared/ui/loader/authentication_loader';
const Authentication: React.FC = () => {
  const currentView = useSelector((state: RootState) => state.authUi.view);
  return (
    <div className="bg-dark text-light h-full min-h-screen w-screen flex items-center justify-center text-[.8rem]">
      <div className="auth-container relative">
        <AuthLoader />
        <div className="text-center py-2 px-1">
          <h2 className="text-2xl font-extrabold text-white pt-4">ZedVye</h2>
          <p className="mt-0 text-blue-100">
            {currentView === 'login' ? 'Sign in to your account' : 'Create your account'}
          </p>
        </div>
        {/* Render Login or Register Form with Animation */}
        <div className="px-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ x: 200, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -200, opacity: 0 }}
              transition={{ type: 'tween', ease: 'easeInOut', duration: 0.25 }}
            >
               
              {currentView === 'login' ? <Login /> : <Register />}
            </motion.div>
          </AnimatePresence>
        </div>
        {/* Social Login Buttons — shown only on Login view for now */}
        <OtherParties />
      </div>
    </div>
  );
};

export default Authentication;