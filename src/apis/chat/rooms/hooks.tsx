// service2/my-frontend/src/apis/chat/rooms/hooks.tsx
import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import {
  // Command mutations
  createGroupRoom,
  createDirectRoom,
  deleteGroupRoom,
  updateGroupName,
  updateGroupDescription,
  updateGroupCoverImage,
  updateGroupProfileImage,
  // Query reads
  getRoomsForHomePage,
  getRoomById,
  getUsersForNewConversation,
  // Helpers
  buildCreateGroupRoomFormData,
  buildImageUpdateFormData,
} from './api';
import {
  // Request types
  CreateDirectRoomRequest,
  CreateGroupRoomFormData,
  UpdateGroupNameRequest,
  UpdateGroupDescriptionRequest,
  // Response types
  GetRoomByIdDTO,
  MyRoomsHomePageListDto,
} from './types';

// =============================================================================
// QUERY HOOKS (GET endpoints)
// =============================================================================

/**
 * Fetch authenticated user's room list for home page display
 * GET /api/query/rooms/home
 */

export const useRoomsForHomePage = (
  options?: Omit<UseQueryOptions<MyRoomsHomePageListDto[], Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['rooms', 'home'],
    queryFn: getRoomsForHomePage,

    // ── Polling every 3 seconds ─────────────────────
    refetchInterval: 3000,                    // Query every 3 seconds
    refetchIntervalInBackground: true,        // Keep polling even when tab is in background

    // You can override these if you pass options from the component
    ...options,
  });
};
// export const useRoomsForHomePage = (
//   options?: Omit<UseQueryOptions<MyRoomsHomePageListDto[], Error>, 'queryKey' | 'queryFn'>
// ) => {
//   return useQuery({
//     queryKey: ['rooms', 'home'],
//     queryFn: getRoomsForHomePage,
//     staleTime: 5 * 60 * 1000,        // 5 minutes — data stays fresh
//     gcTime: 10 * 60 * 1000,          // keep in cache longer
//     refetchOnWindowFocus: false,
//     refetchOnMount: false,           // only refetch manually when you really need it
//     ...options,
//   });
// };

/**
 * Fetch detailed information for a specific room
 * GET /api/query/rooms/{roomId}
 * 
 * @param roomId - UUID of the room to fetch (pass null/undefined to disable query)
 */
export const useRoomById = (
  roomId: string | null | undefined,
  options?: Omit<UseQueryOptions<GetRoomByIdDTO, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['rooms', 'detail', roomId],
    queryFn: () => getRoomById(roomId as string),
    enabled: !!roomId,
    ...options,
  });
};

/**
 * Fetch users available to start a new conversation with
 * GET /api/query/rooms/users-for-conversation
 * 
 * @param params - Optional query params for pagination/filtering
 */
export const useUsersForNewConversation = (
  params?: {
    limit?: number;
    offset?: number;
    include_deleted?: boolean;
  },
  options?: Omit<UseQueryOptions<Array<{
    user_id: string;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    profile_picture: string | null;
  }>, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['rooms', 'users-for-conversation', params],
    queryFn: () => getUsersForNewConversation(params),
    ...options,
  });
};

// =============================================================================
// MUTATION HOOKS (POST/PATCH/DELETE endpoints)
// =============================================================================

/**
 * Create a new GROUP room with participants and optional images
 * POST /api/rooms/groups (multipart/form-data)
 * 
 * Invalidates: ['rooms', 'home'], ['rooms', 'users-for-conversation']
 */
export const useCreateGroupRoom = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formData: FormData) => createGroupRoom(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms', 'home'] });
      queryClient.invalidateQueries({ queryKey: ['rooms', 'users-for-conversation'] });
    },
  });
};

/**
 * Create or retrieve a DIRECT room with a friend
 * POST /api/rooms/direct (application/json)
 * 
 * Invalidates: ['rooms', 'home'], ['rooms', 'users-for-conversation']
 */
export const useCreateDirectRoom = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateDirectRoomRequest) => createDirectRoom(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms', 'home'] });
      queryClient.invalidateQueries({ queryKey: ['rooms', 'users-for-conversation'] });
    },
  });
};

/**
 * Delete a GROUP room (creator/admin only)
 * DELETE /api/rooms/groups/{roomId}
 * 
 * Invalidates: ['rooms', 'home'], ['rooms', 'detail', roomId]
 */
export const useDeleteGroupRoom = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (roomId: string) => deleteGroupRoom(roomId),
    onSuccess: (_, roomId) => {
      queryClient.invalidateQueries({ queryKey: ['rooms', 'home'] });
      queryClient.removeQueries({ queryKey: ['rooms', 'detail', roomId] });
    },
  });
};

/**
 * Update the name of a GROUP room
 * PATCH /api/rooms/groups/{roomId}/name (application/json)
 * 
 * Invalidates: ['rooms', 'home'], ['rooms', 'detail', roomId]
 */
export const useUpdateGroupName = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ roomId, data }: { roomId: string; data: UpdateGroupNameRequest }) =>
      updateGroupName(roomId, data),
    onSuccess: (_, { roomId }) => {
      queryClient.invalidateQueries({ queryKey: ['rooms', 'home'] });
      queryClient.invalidateQueries({ queryKey: ['rooms', 'detail', roomId] });
    },
  });
};

/**
 * Update the description of a GROUP room
 * PATCH /api/rooms/groups/{roomId}/description (application/json)
 * 
 * Invalidates: ['rooms', 'home'], ['rooms', 'detail', roomId]
 */
export const useUpdateGroupDescription = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ roomId, data }: { roomId: string; data: UpdateGroupDescriptionRequest }) =>
      updateGroupDescription(roomId, data),
    onSuccess: (_, { roomId }) => {
      queryClient.invalidateQueries({ queryKey: ['rooms', 'home'] });
      queryClient.invalidateQueries({ queryKey: ['rooms', 'detail', roomId] });
    },
  });
};

/**
 * Update the cover image of a GROUP room
 * PATCH /api/rooms/groups/{roomId}/cover-image (multipart/form-data)
 * 
 * Invalidates: ['rooms', 'home'], ['rooms', 'detail', roomId]
 */
export const useUpdateGroupCoverImage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      roomId,
      formData,
      remove,
    }: {
      roomId: string;
      formData: FormData;
      remove?: boolean;
    }) => updateGroupCoverImage(roomId, formData, remove),
    onSuccess: (_, { roomId }) => {
      queryClient.invalidateQueries({ queryKey: ['rooms', 'home'] });
      queryClient.invalidateQueries({ queryKey: ['rooms', 'detail', roomId] });
    },
  });
};

/**
 * Update the profile image of a GROUP room
 * PATCH /api/rooms/groups/{roomId}/profile-image (multipart/form-data)
 * 
 * Invalidates: ['rooms', 'home'], ['rooms', 'detail', roomId]
 */
export const useUpdateGroupProfileImage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      roomId,
      formData,
      remove,
    }: {
      roomId: string;
      formData: FormData;
      remove?: boolean;
    }) => updateGroupProfileImage(roomId, formData, remove),
    onSuccess: (_, { roomId }) => {
      queryClient.invalidateQueries({ queryKey: ['rooms', 'home'] });
      queryClient.invalidateQueries({ queryKey: ['rooms', 'detail', roomId] });
    },
  });
};

// =============================================================================
// COMPOSITE HOOKS (Convenience wrappers for common patterns)
// =============================================================================

/**
 * Hook for creating a GROUP room with typed form data
 * Automatically builds FormData from CreateGroupRoomFormData object
 */
export const useCreateGroupRoomWithFormData = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateGroupRoomFormData) =>
      createGroupRoom(buildCreateGroupRoomFormData(data)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms', 'home'] });
      queryClient.invalidateQueries({ queryKey: ['rooms', 'users-for-conversation'] });
    },
  });
};

/**
 * Hook for updating a room image with File object
 * Automatically builds FormData from File and fieldName
 */
export const useUpdateRoomImage = (fieldName: 'cover_image' | 'profile_image') => {
  const queryClient = useQueryClient();
  const updateFn = fieldName === 'cover_image' ? updateGroupCoverImage : updateGroupProfileImage;
  
  return useMutation({
    mutationFn: ({
      roomId,
      file,
      remove,
    }: {
      roomId: string;
      file?: File;
      remove?: boolean;
    }) => {
      if (remove) {
        return updateFn(roomId, new FormData(), true);
      }
      if (!file) {
        throw new Error('Either file or remove=true must be provided');
      }
      return updateFn(roomId, buildImageUpdateFormData(file, fieldName), false);
    },
    onSuccess: (_, { roomId }) => {
      queryClient.invalidateQueries({ queryKey: ['rooms', 'home'] });
      queryClient.invalidateQueries({ queryKey: ['rooms', 'detail', roomId] });
    },
  });
};

/**
 * Alias hooks for clearer intent in components
 */
export const useUpdateGroupCover = () => useUpdateRoomImage('cover_image');
export const useUpdateGroupProfile = () => useUpdateRoomImage('profile_image');

// =============================================================================
// TYPE UTILITIES FOR HOOK RETURN VALUES
// =============================================================================

export type UseRoomsForHomePageReturn = ReturnType<typeof useRoomsForHomePage>;
export type UseRoomByIdReturn = ReturnType<typeof useRoomById>;
export type UseUsersForNewConversationReturn = ReturnType<typeof useUsersForNewConversation>;
export type UseCreateGroupRoomReturn = ReturnType<typeof useCreateGroupRoom>;
export type UseCreateDirectRoomReturn = ReturnType<typeof useCreateDirectRoom>;
export type UseDeleteGroupRoomReturn = ReturnType<typeof useDeleteGroupRoom>;
export type UseUpdateGroupNameReturn = ReturnType<typeof useUpdateGroupName>;
export type UseUpdateGroupDescriptionReturn = ReturnType<typeof useUpdateGroupDescription>;
export type UseUpdateGroupCoverImageReturn = ReturnType<typeof useUpdateGroupCoverImage>;
export type UseUpdateGroupProfileImageReturn = ReturnType<typeof useUpdateGroupProfileImage>;