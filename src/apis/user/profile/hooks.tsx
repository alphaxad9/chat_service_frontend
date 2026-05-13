// src/hooks/useProfile.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getMyProfile,
  getForeignProfile,
  updateMyProfile,
  clearUnreadNotifications,
  getTopPublicProfiles,
  getAllPublicProfiles,
} from './Api';
import {
  MyUserProfileDTO,
  ForeignUserProfileDTO,
  UpdateProfileRequest,
} from './types';

const useProfileQueryClient = () => useQueryClient();

// 1. Get your own profile
export const useGetMyProfile = () => {
  return useQuery<MyUserProfileDTO>({
    queryKey: ['myProfile'],
    queryFn: getMyProfile,
  });
};

// 2. Get someone else's profile by user ID
export const useGetForeignProfile = (userId: string) => {
  return useQuery<ForeignUserProfileDTO>({
    queryKey: ['foreignProfile', userId],
    queryFn: () => getForeignProfile(userId),
    enabled: !!userId, // Only run if userId is truthy
  });
};

// 3. Update your own profile
export const useUpdateMyProfile = () => {
  const queryClient = useProfileQueryClient();
  return useMutation<MyUserProfileDTO, unknown, UpdateProfileRequest>({
    mutationFn: updateMyProfile,
    onSuccess: (updatedProfile) => {
      // Update cached profile data optimistically
      queryClient.setQueryData(['myProfile'], updatedProfile);
      // Optionally invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['myProfile'] });
    },
  });
};

// 4. Clear unread notifications
export const useClearUnreadNotifications = () => {
  const queryClient = useProfileQueryClient();
  return useMutation<void, unknown, void>({
    mutationFn: clearUnreadNotifications,
    onSuccess: () => {
      // Update the cached profile to reflect 0 unread notifications
      queryClient.setQueryData(['myProfile'], (old: MyUserProfileDTO | undefined) => {
        if (old) {
          return { ...old, unread_notifications_count: 0 };
        }
        return old;
      });
    },
  });
};

// 5. Get top public profiles
export const useGetTopPublicProfiles = (limit: number = 10) => {
  return useQuery<ForeignUserProfileDTO[]>({
    queryKey: ['topPublicProfiles', limit],
    queryFn: () => getTopPublicProfiles(limit),
  });
};

// 6. Get all public, non-deleted foreign profiles (paginated)
export const useGetAllPublicProfiles = (limit: number = 10, offset: number = 0) => {
  return useQuery<{
    results: ForeignUserProfileDTO[];
    count: number;
  }>({
    queryKey: ['allPublicProfiles', limit, offset],
    queryFn: () => getAllPublicProfiles(limit, offset),
  });
};