// src/apis/user/authentication/AuthContext.tsx

import { createContext, useContext, ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DeleteAccountFormData } from '../../../modules/user/authentication/types/auth';
import {
    getCsrfToken as apiGetCsrfToken,
    register as apiRegister,
    login as apiLogin,
    deleteAccount as apiDeleteAccount,
    refreshToken as apiRefreshToken,
    getProfile as apiGetProfile,
    updateProfile as apiUpdateProfile,
    logout as apiLogout,
} from './Api';

import { getMyProfile as apiGetMyProfile } from '../profile/Api';
import { MyUserProfileDTO } from '../profile/types';
import {
    LoginFormData,
    RegisterFormData,
    UpdateProfileFormData,
    UserProfile,
} from '../../../modules/user/authentication/types/auth';
interface AuthContextType {
    csrfToken: string | undefined;
    profile: UserProfile | undefined;
    myProfile: MyUserProfileDTO | undefined;

    isProfileLoading: boolean;
    isMyProfileLoading: boolean;

    register: (data: RegisterFormData) => Promise<UserProfile>;
    login: (data: LoginFormData) => Promise<UserProfile>;
    deleteAccount: (data: DeleteAccountFormData) => Promise<void>; // ✅ FIXED
    refreshToken: () => Promise<{ access: string; refresh: string }>;
    updateProfile: (data: UpdateProfileFormData) => Promise<UserProfile>;
    logout: () => Promise<void>;

    isRegistering: boolean;
    isLoggingIn: boolean;
    isDeletingAccount: boolean;
    isRefreshingToken: boolean;
    isUpdatingProfile: boolean;
    isLoggingOut: boolean;

    isAuthBooting: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const queryClient = useQueryClient();

    // CSRF
    const { data: csrfToken } = useQuery({
        queryKey: ['csrfToken'],
        queryFn: apiGetCsrfToken,
        staleTime: 3600000,
    });

    // Basic user profile
    const {
        data: profile,
        isLoading: isProfileLoading,
    } = useQuery({
        queryKey: ['userProfile'],
        queryFn: apiGetProfile,
        enabled: csrfToken !== undefined,
        retry: 1,
    });

    // Full profile
    const {
        data: myProfile,
        isLoading: isMyProfileLoading,
    } = useQuery({
        queryKey: ['myProfile'],
        queryFn: apiGetMyProfile,
        enabled: Boolean(profile?.id),
        retry: 1,
    });
 

    // AUTH MUTATIONS
    const { mutateAsync: register, isPending: isRegistering } = useMutation({
        mutationFn: apiRegister,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['userProfile'] });
            queryClient.invalidateQueries({ queryKey: ['myProfile'] });
        },
    });

    const { mutateAsync: login, isPending: isLoggingIn } = useMutation({
        mutationFn: apiLogin,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['userProfile'] });
            queryClient.invalidateQueries({ queryKey: ['myProfile'] });
        },
    });

    const { mutateAsync: deleteAccount, isPending: isDeletingAccount } = useMutation({
        mutationFn: apiDeleteAccount,
        onSuccess: () => {
            queryClient.removeQueries({ queryKey: ['userProfile'] });
            queryClient.removeQueries({ queryKey: ['myProfile'] });
        },
    });

    const { mutateAsync: refreshToken, isPending: isRefreshingToken } = useMutation({
        mutationFn: apiRefreshToken,
    });

    const { mutateAsync: updateProfile, isPending: isUpdatingProfile } = useMutation({
        mutationFn: apiUpdateProfile,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['userProfile'] });
            queryClient.invalidateQueries({ queryKey: ['myProfile'] });
        },
    });

    const { mutateAsync: logout, isPending: isLoggingOut } = useMutation({
        mutationFn: apiLogout,
        onSuccess: () => {
            queryClient.removeQueries({ queryKey: ['userProfile'] });
            queryClient.removeQueries({ queryKey: ['myProfile'] });
        },
    });

    // ----------------------------------------------------
    // FIX: MUST FORCE EVERYTHING TO BOOLEAN
    // ----------------------------------------------------
    const hasBasicProfile = Boolean(profile?.id);
const isAuthBooting =
    csrfToken === undefined ||
    isProfileLoading ||
    (hasBasicProfile && isMyProfileLoading);

    return (
        <AuthContext.Provider
            value={{
                csrfToken,
                profile,
                myProfile,
                isProfileLoading,
                isMyProfileLoading,

                register,
                login,
                deleteAccount,
                refreshToken,
                updateProfile,
                logout,

                isRegistering,
                isLoggingIn,
                isDeletingAccount,
                isRefreshingToken,
                isUpdatingProfile,
                isLoggingOut,

                isAuthBooting,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
    return ctx;
};
