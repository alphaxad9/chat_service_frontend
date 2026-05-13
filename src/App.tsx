import { ReactNode } from 'react';
import './App.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from './apis/user/authentication/AuthContext';

import Authentication from './project/freatures/login_and_register/ui/authentication';
import FirstProfileCompletion from './project/pages/profile/first_profile_complete/profile_completion';
import Profile from './project/pages/profile/ui/profile';
import { Provider } from 'react-redux';
import { store } from './project/entities/store';
import Feed from './project/pages/home/feed';
import ProtectedRoute from './project/routes/ProtectedRoute';
import FullScreenLoader from './project/entities/ui/components/FullScreenLoader';

const queryClient = new QueryClient();

// ✅ Simplified AuthGate: only check isAuthBooting
const AuthGate = ({ children }: { children: ReactNode }) => {
  const { isAuthBooting } = useAuth();

  if (isAuthBooting) {
    return <FullScreenLoader />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <AuthGate>
            <BrowserRouter
              future={{
                v7_startTransition: true,
                v7_relativeSplatPath: true,
              }}
            >
              <Routes>
                {/* Public routes */}
                <Route path="/authentication" element={<Authentication />} />

                {/* Protected routes */}
                <Route
                  path="/complete_profile"
                  element={
                    <ProtectedRoute>
                      <FirstProfileCompletion />
                    </ProtectedRoute>
                  }
                />

                {/* Main feed - shows rooms list and optionally a selected chat */}
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <Feed />
                    </ProtectedRoute>
                  }
                />
                
                {/* Chat route with roomId parameter - renders same Feed component */}
                <Route
                  path="/chat/:roomId"
                  element={
                    <ProtectedRoute>
                      <Feed />
                    </ProtectedRoute>
                  }
                />

                {/* Profile route */}
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </BrowserRouter>
          </AuthGate>
        </AuthProvider>
      </QueryClientProvider>
    </Provider>
  );
}

export default App;