import { ReactElement } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../apis/user/authentication/AuthContext";
import FullScreenLoader from "../entities/ui/components/FullScreenLoader";

interface Props {
  children: ReactElement;
}

export default function ProtectedRoute({ children }: Props) {
  const {
    profile,
    myProfile,
    isAuthBooting,
    isProfileLoading,
    isMyProfileLoading,
  } = useAuth();

  // Wait until all auth-related loading is COMPLETE
  if (isAuthBooting || isProfileLoading || isMyProfileLoading) {
    return <FullScreenLoader />;
  }

  // User is not authenticated → go to login/register
  if (!profile) {
    return <Navigate to="/authentication" replace />;
  }

  // Authenticated but hasn't completed extended profile → go to completion
  if (!myProfile) {
    return <Navigate to="/complete_profile" replace />;
  }

  return children;
}