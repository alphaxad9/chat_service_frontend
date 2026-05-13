import { ReactNode } from 'react';
import './App.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from './apis/user/authentication/AuthContext';

import Authentication from './project/freatures/login_and_register/ui/authentication';
import Chat from './project/pages/chat/chat';
import Community from './project/pages/community/community';
import LandingPage from './project/pages/landingPage';
import FirstProfileCompletion from './project/pages/profile/first_profile_complete/profile_completion';
import Profile from './project/pages/profile/ui/profile';
import { Provider } from 'react-redux';
import { store } from './project/entities/store';
import Explore from './project/pages/explore/explore';
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
                <Route path="/authentication" element={<Authentication />} />

                <Route
                  path="/complete_profile"
                  element={
                    <ProtectedRoute>
                      <FirstProfileCompletion />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <LandingPage />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<Feed />} />
                  <Route path="explore" element={<Explore />} />
                  <Route path="community" element={<Community />} />
                  <Route path="chat" element={<Chat />} />
                  <Route path="profile" element={<Profile />} />
                </Route>
              </Routes>
            </BrowserRouter>
          </AuthGate>
        </AuthProvider>
      </QueryClientProvider>
    </Provider>
  );
}

export default App;