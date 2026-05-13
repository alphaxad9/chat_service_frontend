// service2/my-frontend/src/apis/chat/rooms/api.ts

import { AxiosError } from 'axios';
import { chatClient } from '../../client';
import {
  // Request types
  CreateDirectRoomRequest,
  CreateGroupRoomFormData,
  UpdateGroupNameRequest,
  UpdateGroupDescriptionRequest,
  // Response types
  PrivateRoomCreationResponse,
  GroupUpdateActionsResponse,
  GetRoomByIdDTO,
  MyRoomsHomePageListDto,
} from './types';

// =============================================================================
// ROOM COMMAND APIs (POST/PATCH/DELETE) - Mutations
// =============================================================================

/**
 * Create a new GROUP room with participants and optional images
 * POST /api/rooms/groups (multipart/form-data)
 * 
 * @param formData - FormData with group_name, participant_ids (JSON string), optional description, profile_image, cover_image
 * @returns PrivateRoomCreationResponse with absolute image URLs
 */
export const createGroupRoom = async (
  formData: FormData
): Promise<PrivateRoomCreationResponse> => {
  try {
    const response = await chatClient.post<PrivateRoomCreationResponse>(
      '/rooms/groups',
      formData
      // Content-Type header auto-set by browser for FormData with boundary
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error('Create group room failed:', error.response?.data || error.message);
    }
    throw error;
  }
};

/**
 * Create or retrieve a DIRECT room with a friend
 * POST /api/rooms/direct (application/json)
 * 
 * @param data - Request payload with friend_id
 * @returns PrivateRoomCreationResponse with room details
 */
export const createDirectRoom = async (
  data: CreateDirectRoomRequest
): Promise<PrivateRoomCreationResponse> => {
  try {
    const response = await chatClient.post<PrivateRoomCreationResponse>(
      '/rooms/direct',
      data
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error('Create direct room failed:', error.response?.data || error.message);
    }
    throw error;
  }
};

/**
 * Delete a GROUP room (creator/admin only)
 * DELETE /api/rooms/groups/{roomId}
 * 
 * @param roomId - UUID of the room to delete
 * @returns GroupUpdateActionsResponse with final room state
 */
export const deleteGroupRoom = async (
  roomId: string
): Promise<GroupUpdateActionsResponse> => {
  try {
    const response = await chatClient.delete<GroupUpdateActionsResponse>(
      `/rooms/groups/${roomId}`
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error('Delete group room failed:', error.response?.data || error.message);
    }
    throw error;
  }
};

/**
 * Update the name of a GROUP room
 * PATCH /api/rooms/groups/{roomId}/name (application/json)
 * 
 * @param roomId - UUID of the room to update
 * @param data - Request payload with new_name
 * @returns GroupUpdateActionsResponse with updated room state
 */
export const updateGroupName = async (
  roomId: string,
  data: UpdateGroupNameRequest
): Promise<GroupUpdateActionsResponse> => {
  try {
    const response = await chatClient.patch<GroupUpdateActionsResponse>(
      `/rooms/groups/${roomId}/name`,
      data
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error('Update group name failed:', error.response?.data || error.message);
    }
    throw error;
  }
};

/**
 * Update the description of a GROUP room
 * PATCH /api/rooms/groups/{roomId}/description (application/json)
 * 
 * @param roomId - UUID of the room to update
 * @param data - Request payload with new_description (send "" to clear)
 * @returns GroupUpdateActionsResponse with updated room state
 */
export const updateGroupDescription = async (
  roomId: string,
  data: UpdateGroupDescriptionRequest
): Promise<GroupUpdateActionsResponse> => {
  try {
    const response = await chatClient.patch<GroupUpdateActionsResponse>(
      `/rooms/groups/${roomId}/description`,
      data
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error('Update group description failed:', error.response?.data || error.message);
    }
    throw error;
  }
};

/**
 * Update the cover image of a GROUP room
 * PATCH /api/rooms/groups/{roomId}/cover-image (multipart/form-data)
 * 
 * @param roomId - UUID of the room to update
 * @param formData - FormData with cover_image File, or use ?remove=true query param to clear
 * @param remove - If true, clears the cover image instead of uploading
 * @returns GroupUpdateActionsResponse with updated room state
 */
export const updateGroupCoverImage = async (
  roomId: string,
  formData: FormData,
  remove?: boolean
): Promise<GroupUpdateActionsResponse> => {
  try {
    const url = `/rooms/groups/${roomId}/cover-image${remove ? '?remove=true' : ''}`;
    const response = await chatClient.patch<GroupUpdateActionsResponse>(
      url,
      formData
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error('Update cover image failed:', error.response?.data || error.message);
    }
    throw error;
  }
};

/**
 * Update the profile image of a GROUP room
 * PATCH /api/rooms/groups/{roomId}/profile-image (multipart/form-data)
 * 
 * @param roomId - UUID of the room to update
 * @param formData - FormData with profile_image File, or use ?remove=true query param to clear
 * @param remove - If true, clears the profile image instead of uploading
 * @returns GroupUpdateActionsResponse with updated room state
 */
export const updateGroupProfileImage = async (
  roomId: string,
  formData: FormData,
  remove?: boolean
): Promise<GroupUpdateActionsResponse> => {
  try {
    const url = `/rooms/groups/${roomId}/profile-image${remove ? '?remove=true' : ''}`;
    const response = await chatClient.patch<GroupUpdateActionsResponse>(
      url,
      formData
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error('Update profile image failed:', error.response?.data || error.message);
    }
    throw error;
  }
};

// =============================================================================
// ROOM QUERY APIs (GET) - Reads
// =============================================================================

/**
 * Fetch authenticated user's room list for home page display
 * GET /api/query/rooms/home
 * 
 * @returns List of MyRoomsHomePageListDto with absolute image URLs, ordered by last_activity_at desc
 */
export const getRoomsForHomePage = async (): Promise<MyRoomsHomePageListDto[]> => {
  try {
    const response = await chatClient.get<MyRoomsHomePageListDto[]>(
      '/query/rooms/home'
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error('Fetch home page rooms failed:', error.response?.data || error.message);
    }
    throw error;
  }
};

/**
 * Fetch detailed information for a specific room (settings/member management view)
 * GET /api/query/rooms/{roomId}
 * 
 * @param roomId - UUID of the room to fetch
 * @returns GetRoomByIdDTO with absolute image URLs, or throws 404 if not found/not authorized
 */
export const getRoomById = async (
  roomId: string
): Promise<GetRoomByIdDTO> => {
  try {
    const response = await chatClient.get<GetRoomByIdDTO>(
      `/query/rooms/${roomId}`
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error('Fetch room details failed:', error.response?.data || error.message);
    }
    throw error;
  }
};

/**
 * Fetch users available to start a new conversation with
 * GET /api/query/rooms/users-for-conversation
 * 
 * @param params - Optional query params: limit (default: 20), offset (default: 0), include_deleted (default: false)
 * @returns List of UserView with minimal user data for "start conversation" UI
 */
export const getUsersForNewConversation = async (
  params?: {
    limit?: number;
    offset?: number;
    include_deleted?: boolean;
  }
): Promise<Array<{
  user_id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  profile_picture: string | null;
}>> => {
  try {
    const response = await chatClient.get<Array<{
      user_id: string;
      username: string;
      email: string;
      first_name: string;
      last_name: string;
      profile_picture: string | null;
    }>>(
      '/query/rooms/users-for-conversation',
      { params }
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error('Fetch users for conversation failed:', error.response?.data || error.message);
    }
    throw error;
  }
};

// =============================================================================
// Helper Functions for FormData Construction
// =============================================================================

/**
 * Build FormData for creating a GROUP room
 * Usage: const formData = buildCreateGroupRoomFormData({ group_name: "Team", participant_ids: [...], profile_image: file })
 */
export const buildCreateGroupRoomFormData = (data: CreateGroupRoomFormData): FormData => {
  const formData = new FormData();
  formData.append('group_name', data.group_name);
  if (data.description) {
    formData.append('description', data.description);
  }
  formData.append('participant_ids', JSON.stringify(data.participant_ids));
  if (data.profile_image) {
    formData.append('profile_image', data.profile_image);
  }
  if (data.cover_image) {
    formData.append('cover_image', data.cover_image);
  }
  return formData;
};

/**
 * Build FormData for updating a room image
 * Usage: const formData = buildImageUpdateFormData(file, 'cover_image')
 */
export const buildImageUpdateFormData = (
  file: File,
  fieldName: 'cover_image' | 'profile_image'
): FormData => {
  const formData = new FormData();
  formData.append(fieldName, file);
  return formData;
};