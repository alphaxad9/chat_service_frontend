import { AxiosError } from 'axios';
import {
  MyUserProfileDTO,
  ForeignUserProfileDTO,
  UpdateProfileRequest,
} from './types';
import { getCsrfToken } from '../authentication/Api';
import { client } from '../../client';
// 1. Get your own profile
export const getMyProfile = async (): Promise<MyUserProfileDTO> => {
  try {
    const csrfToken = await getCsrfToken();
    const response = await client.get<MyUserProfileDTO>('/profile/', {
      headers: { 'X-CSRFToken': csrfToken },
    });
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error('Failed to fetch my profile:', error.response?.data || error.message);
    }
    throw error;
  }
};

// 2. Get someone else's profile by user ID (UUID)
export const getForeignProfile = async (userId: string): Promise<ForeignUserProfileDTO> => {
  if (!userId) {
    throw new Error('User ID is required');
  }
  try {
    const csrfToken = await getCsrfToken();
    const response = await client.get<ForeignUserProfileDTO>(
      `/profile/${userId}/`,
      {
        headers: { 'X-CSRFToken': csrfToken },
      }
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error('Failed to fetch foreign profile:', error.response?.data || error.message);
    }
    throw error;
  }
};

// 3. Update your own profile
export const updateMyProfile = async (data: UpdateProfileRequest): Promise<MyUserProfileDTO> => {
  try {
    const csrfToken = await getCsrfToken();
    const response = await client.patch<MyUserProfileDTO>(
      '/profile/',
      data,
      {
        headers: { 'X-CSRFToken': csrfToken },
      }
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error('Profile update failed:', error.response?.data || error.message);
    }
    throw error;
  }
};

// 4. Clear unread notifications
export const clearUnreadNotifications = async (): Promise<void> => {
  try {
    const csrfToken = await getCsrfToken();
    await client.post(
      '/profile/clear-notifications/',
      {},
      {
        headers: { 'X-CSRFToken': csrfToken },
      }
    );
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error('Failed to clear notifications:', error.response?.data || error.message);
    }
    throw error;
  }
};

// 5. Get top public profiles (limit optional, max 50)
export const getTopPublicProfiles = async (limit: number = 10): Promise<ForeignUserProfileDTO[]> => {
  const safeLimit = Math.min(Math.max(limit, 1), 50);
  try {
    const csrfToken = await getCsrfToken();
    const response = await client.get<{ results: ForeignUserProfileDTO[] }>(
      `/profile/top/?limit=${safeLimit}`,
      {
        headers: { 'X-CSRFToken': csrfToken },
      }
    );
    return response.data.results;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error('Failed to fetch top public profiles:', error.response?.data || error.message);
    }
    throw error;
  }
};

// 6. Get all public, non-deleted foreign profiles (paginated)
export const getAllPublicProfiles = async (
  limit: number = 10,
  offset: number = 0
): Promise<{ results: ForeignUserProfileDTO[]; count: number }> => {
  try {
    const csrfToken = await getCsrfToken();
    const response = await client.get<{
      results: ForeignUserProfileDTO[];
      count: number;
    }>(`/profile/all/?limit=${limit}&offset=${offset}`, {
      headers: { 'X-CSRFToken': csrfToken },
    });
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error('Failed to fetch all public profiles:', error.response?.data || error.message);
    }
    throw error;
  }
};