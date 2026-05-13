// src/hooks/useAuth.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getCsrfToken,
  register,
  login,
  deleteAccount,
  refreshToken,
  getProfile,
  updateProfile,
  logout,
  changePassword,
  changeUsername,
  changeEmail,
} from './Api';
import {
  LoginFormData,
  RegisterFormData,
  UpdateProfileFormData,
  ChangePasswordFormData,
  ChangeUsernameFormData,
  ChangeEmailFormData,
  DeleteAccountFormData,
} from '../../../modules/user/authentication/types/auth';

export const useGetCsrfToken = () => {
  return useQuery({
    queryKey: ['csrfToken'],
    queryFn: getCsrfToken,
  });
};

export const useGetProfile = () => {
  return useQuery({
    queryKey: ['userProfile'],
    queryFn: getProfile,
  });
};

export const useRegister = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: RegisterFormData) => register(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    },
  });
};

export const useLogin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: LoginFormData) => login(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    },
  });
};

export const useRefreshToken = () => {
  return useMutation({
    mutationFn: refreshToken,
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateProfileFormData) => updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.removeQueries();
    },
  });
};

// ✅ New: Change Password
export const useChangePassword = () => {
  return useMutation({
    mutationFn: (data: ChangePasswordFormData) => changePassword(data),
  });
};

// ✅ New: Change Username
export const useChangeUsername = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ChangeUsernameFormData) => changeUsername(data),
    onSuccess: () => {
      // Username changed → refetch profile
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    },
  });
};

// ✅ New: Change Email
export const useChangeEmail = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ChangeEmailFormData) => changeEmail(data),
    onSuccess: () => {
      // Email changed → refetch profile
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    },
  });
};

// ✅ Updated: Delete Account (now with password)
export const useDeleteAccount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: DeleteAccountFormData) => deleteAccount(data),
    onSuccess: () => {
      // Clear all cached user data after deletion
      queryClient.removeQueries();
    },
  });
};