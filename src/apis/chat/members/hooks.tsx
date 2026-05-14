// frontend/src/modules/chat/members/hooks.tsx

import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import {
  // Command mutations
  createMember,
  leaveRoom,
  removeMember,
  promoteMember,
  demoteMember,
  markAllRead,
  addUnreadMessages,
  // Command query reads (minimal DTOs)
  getActiveRoomMembers,
  getMemberById,
  getMyMembership,
  checkMembershipExists,
  // Query controller reads (enriched DTOs)
  getMemberByIdQuery,
  getMemberByUserAndRoomQuery,
  getMyMembershipQuery,
  checkActiveMembershipExists,
  getMyUnreadCount,
  getActiveRoomMembersQuery,
  getActiveRoomAdmins,
  getActiveRoomUsers,
  countActiveRoomMembers,
  getActiveRoomMemberSummaries,
  getMyActiveMemberships,
  getUserActiveMemberships,
  getMyActiveAdminMemberships,
  countMyActiveMemberships,
  getMyMembershipSummaries,
  getActiveMembersByUserIdsInRoom,
  getActiveMembersByIds,
  checkMemberExistsQuery,
  checkMyMembershipExistsQuery,
  // Helpers
  handleExistsResponse,
  formatUnreadCount,
} from './apis';
import {
  // Request types
  CreateMemberRequest,
  BulkFetchMembersByUserIdsRequest,
  BulkFetchMembersByIdsRequest,
  // Response types
  MemberResponseDTO,
  MemberQueryResponseDTO,
  MemberSummaryDTO,
  MemberCountResponse,
  MyUnreadCountResponse,
  MemberStatusResponse,
} from './types';

// =============================================================================
// QUERY HOOKS - Command Controller (Minimal DTOs)
// =============================================================================

/**
 * List all active members of a room (command version - minimal DTOs)
 * GET /api/rooms/{roomId}/members
 * 
 * @param roomId - UUID of the room to query (pass null/undefined to disable)
 */
export const useActiveRoomMembers = (
  roomId: string | null | undefined,
  options?: Omit<UseQueryOptions<MemberResponseDTO[], Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['members', 'room', roomId],
    queryFn: () => getActiveRoomMembers(roomId as string),
    enabled: !!roomId,
    ...options,
  });
};

/**
 * Get a specific member by ID (command version - minimal DTO)
 * GET /api/members/{memberId}
 * 
 * @param memberId - UUID of the membership record (pass null/undefined to disable)
 */
export const useMemberById = (
  memberId: string | null | undefined,
  options?: Omit<UseQueryOptions<MemberResponseDTO, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['members', 'detail', memberId],
    queryFn: () => getMemberById(memberId as string),
    enabled: !!memberId,
    ...options,
  });
};

/**
 * Get authenticated user's membership in a room (command version)
 * GET /api/rooms/{roomId}/me
 * 
 * @param roomId - UUID of the room to check (pass null/undefined to disable)
 */
export const useMyMembership = (
  roomId: string | null | undefined,
  options?: Omit<UseQueryOptions<MemberResponseDTO, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['members', 'me', roomId],
    queryFn: () => getMyMembership(roomId as string),
    enabled: !!roomId,
    ...options,
  });
};

/**
 * Check if a user is an active member of a room (lightweight existence check)
 * GET /api/rooms/{roomId}/members/{userId}
 * 
 * @param roomId - UUID of the room to check
 * @param userId - UUID of the user to check
 * @param enabled - Whether to run the query (default: true if both IDs present)
 */
export const useMembershipExists = (
  roomId: string | null | undefined,
  userId: string | null | undefined,
  enabled?: boolean
) => {
  const isEnabled = enabled ?? (!!roomId && !!userId);
  
  return useQuery({
    queryKey: ['members', 'exists', roomId, userId],
    queryFn: async () => {
      await checkMembershipExists(roomId as string, userId as string);
      return true;
    },
    enabled: isEnabled,
    retry: false,
  });
};

// =============================================================================
// QUERY HOOKS - Query Controller (Enriched DTOs)
// =============================================================================

/**
 * Get a specific member by ID with enriched metadata (query version)
 * GET /api/query/members/{memberId}
 * 
 * @param memberId - UUID of the membership record (pass null/undefined to disable)
 */
export const useMemberByIdQuery = (
  memberId: string | null | undefined,
  options?: Omit<UseQueryOptions<MemberQueryResponseDTO, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['members', 'query', 'detail', memberId],
    queryFn: () => getMemberByIdQuery(memberId as string),
    enabled: !!memberId,
    ...options,
  });
};

/**
 * Get membership details for a specific user in a specific room (query version)
 * GET /api/query/rooms/{roomId}/users/{userId}
 * 
 * @param roomId - UUID of the room to query
 * @param userId - UUID of the user to look up
 * @param enabled - Whether to run the query (default: true if both IDs present)
 */
export const useMemberByUserAndRoomQuery = (
  roomId: string | null | undefined,
  userId: string | null | undefined,
  options?: Omit<UseQueryOptions<MemberQueryResponseDTO, Error>, 'queryKey' | 'queryFn'>
) => {
  const isEnabled = options?.enabled ?? (!!roomId && !!userId);
  
  return useQuery({
    queryKey: ['members', 'query', 'room', roomId, 'user', userId],
    queryFn: () => getMemberByUserAndRoomQuery(roomId as string, userId as string),
    enabled: isEnabled,
    ...options,
  });
};

/**
 * Get authenticated user's membership in a room with enriched metadata (query version)
 * GET /api/query/rooms/{roomId}/me
 * 
 * @param roomId - UUID of the room to check (pass null/undefined to disable)
 */
export const useMyMembershipQuery = (
  roomId: string | null | undefined,
  options?: Omit<UseQueryOptions<MemberQueryResponseDTO, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['members', 'query', 'me', roomId],
    queryFn: () => getMyMembershipQuery(roomId as string),
    enabled: !!roomId,
    ...options,
  });
};

/**
 * Check if a user is an active member of a room (query version - lightweight)
 * GET /api/query/rooms/{roomId}/members/{userId}
 * 
 * @param roomId - UUID of the room to check
 * @param userId - UUID of the user to check
 * @param enabled - Whether to run the query (default: true if both IDs present)
 */
export const useActiveMembershipExists = (
  roomId: string | null | undefined,
  userId: string | null | undefined,
  enabled?: boolean
) => {
  const isEnabled = enabled ?? (!!roomId && !!userId);
  
  return useQuery({
    queryKey: ['members', 'query', 'exists', roomId, userId],
    queryFn: async () => {
      await checkActiveMembershipExists(roomId as string, userId as string);
      return true;
    },
    enabled: isEnabled,
    retry: false,
  });
};


/**
 * Get authenticated user's unread message count in a room
 * GET /api/query/rooms/{roomId}/me/unread
 * 
 * @param roomId - UUID of the room to check (pass null/undefined to disable)
 */
export const useMyUnreadCount = (
  roomId: string | null | undefined,
  options?: Omit<UseQueryOptions<MyUnreadCountResponse, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['members', 'query', 'me', roomId, 'unread'],
    queryFn: () => getMyUnreadCount(roomId as string),
    enabled: !!roomId,
    ...options,
  });
};

/**
 * List all active members of a room with enriched metadata (query version)
 * GET /api/query/rooms/{roomId}/members
 * 
 * @param roomId - UUID of the room to query (pass null/undefined to disable)
 */
export const useActiveRoomMembersQuery = (
  roomId: string | null | undefined,
  options?: Omit<UseQueryOptions<MemberQueryResponseDTO[], Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['members', 'query', 'room', roomId],
    queryFn: () => getActiveRoomMembersQuery(roomId as string),
    enabled: !!roomId,
    ...options,
  });
};

/**
 * List all active ADMIN members of a room
 * GET /api/query/rooms/{roomId}/members/admins
 * 
 * @param roomId - UUID of the room to query (pass null/undefined to disable)
 */
export const useActiveRoomAdmins = (
  roomId: string | null | undefined,
  options?: Omit<UseQueryOptions<MemberQueryResponseDTO[], Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['members', 'query', 'room', roomId, 'admins'],
    queryFn: () => getActiveRoomAdmins(roomId as string),
    enabled: !!roomId,
    ...options,
  });
};

/**
 * List all active regular USER members of a room (excludes admins)
 * GET /api/query/rooms/{roomId}/members/users
 * 
 * @param roomId - UUID of the room to query (pass null/undefined to disable)
 */
export const useActiveRoomUsers = (
  roomId: string | null | undefined,
  options?: Omit<UseQueryOptions<MemberQueryResponseDTO[], Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['members', 'query', 'room', roomId, 'users'],
    queryFn: () => getActiveRoomUsers(roomId as string),
    enabled: !!roomId,
    ...options,
  });
};

/**
 * Get count of active members in a room
 * GET /api/query/rooms/{roomId}/members/count
 * 
 * @param roomId - UUID of the room to count (pass null/undefined to disable)
 */
export const useActiveRoomMembersCount = (
  roomId: string | null | undefined,
  options?: Omit<UseQueryOptions<MemberCountResponse, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['members', 'query', 'room', roomId, 'count'],
    queryFn: () => countActiveRoomMembers(roomId as string),
    enabled: !!roomId,
    ...options,
  });
};

/**
 * Fetch lightweight member summaries for a room (no external UserView calls)
 * GET /api/query/rooms/{roomId}/members/summaries
 * 
 * @param roomId - UUID of the room to query (pass null/undefined to disable)
 */
export const useActiveRoomMemberSummaries = (
  roomId: string | null | undefined,
  options?: Omit<UseQueryOptions<MemberSummaryDTO[], Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['members', 'query', 'room', roomId, 'summaries'],
    queryFn: () => getActiveRoomMemberSummaries(roomId as string),
    enabled: !!roomId,
    ...options,
  });
};

// =============================================================================
// QUERY HOOKS - By User (Query Controller)
// =============================================================================

/**
 * List all active memberships for the authenticated user across all rooms
 * GET /api/query/users/me/memberships
 */
export const useMyActiveMemberships = (
  options?: Omit<UseQueryOptions<MemberQueryResponseDTO[], Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['members', 'query', 'users', 'me'],
    queryFn: getMyActiveMemberships,
    ...options,
  });
};

/**
 * List all active memberships for a specific user across all rooms
 * GET /api/query/users/{userId}/memberships
 * 
 * @param userId - UUID of the user to query (pass null/undefined to disable)
 */
export const useUserActiveMemberships = (
  userId: string | null | undefined,
  options?: Omit<UseQueryOptions<MemberQueryResponseDTO[], Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['members', 'query', 'users', userId],
    queryFn: () => getUserActiveMemberships(userId as string),
    enabled: !!userId,
    ...options,
  });
};

/**
 * List all active ADMIN memberships for the authenticated user
 * GET /api/query/users/me/memberships/admin
 */
export const useMyActiveAdminMemberships = (
  options?: Omit<UseQueryOptions<MemberQueryResponseDTO[], Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['members', 'query', 'users', 'me', 'admin'],
    queryFn: getMyActiveAdminMemberships,
    ...options,
  });
};

/**
 * Get count of active memberships for the authenticated user
 * GET /api/query/users/me/memberships/count
 */
export const useMyActiveMembershipsCount = (
  options?: Omit<UseQueryOptions<MemberCountResponse, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['members', 'query', 'users', 'me', 'count'],
    queryFn: countMyActiveMemberships,
    ...options,
  });
};

/**
 * Fetch lightweight membership summaries for the authenticated user
 * GET /api/query/users/me/memberships/summaries
 */
export const useMyMembershipSummaries = (
  options?: Omit<UseQueryOptions<MemberSummaryDTO[], Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['members', 'query', 'users', 'me', 'summaries'],
    queryFn: getMyMembershipSummaries,
    ...options,
  });
};

// =============================================================================
// BULK LOOKUP QUERY HOOKS (POST endpoints)
// =============================================================================

/**
 * Bulk fetch active members by user IDs within a specific room
 * POST /api/query/rooms/{roomId}/members/bulk
 * 
 * @param roomId - UUID of the room to filter by
 * @param userIds - Array of user UUID strings to look up (pass null/empty to disable)
 */
export const useActiveMembersByUserIdsInRoom = (
  roomId: string | null | undefined,
  userIds: BulkFetchMembersByUserIdsRequest | null | undefined,
  options?: Omit<UseQueryOptions<MemberQueryResponseDTO[], Error>, 'queryKey' | 'queryFn'>
) => {
  const isEnabled = options?.enabled ?? (!!roomId && !!userIds && userIds.length > 0);
  
  return useQuery({
    queryKey: ['members', 'query', 'bulk', 'room', roomId, userIds],
    queryFn: () => getActiveMembersByUserIdsInRoom(roomId as string, userIds as string[]),
    enabled: isEnabled,
    ...options,
  });
};

/**
 * Bulk fetch active members by member IDs
 * POST /api/query/members/bulk
 * 
 * @param memberIds - Array of member UUID strings to look up (pass null/empty to disable)
 */
export const useActiveMembersByIds = (
  memberIds: BulkFetchMembersByIdsRequest | null | undefined,
  options?: Omit<UseQueryOptions<MemberQueryResponseDTO[], Error>, 'queryKey' | 'queryFn'>
) => {
  const isEnabled = options?.enabled ?? (!!memberIds && memberIds.length > 0);
  
  return useQuery({
    queryKey: ['members', 'query', 'bulk', 'ids', memberIds],
    queryFn: () => getActiveMembersByIds(memberIds as string[]),
    enabled: isEnabled,
    ...options,
  });
};

/**
 * Check if an active member exists by member ID (query version)
 * GET /api/query/members/{memberId}/exists
 * 
 * @param memberId - UUID of the membership record to check
 * @param enabled - Whether to run the query (default: true if memberId present)
 */
export const useMemberExistsQuery = (
  memberId: string | null | undefined,
  enabled?: boolean
) => {
  const isEnabled = enabled ?? !!memberId;
  
  return useQuery({
    queryKey: ['members', 'query', 'exists', 'id', memberId],
    queryFn: async () => {
      await checkMemberExistsQuery(memberId as string);
      return true;
    },
    enabled: isEnabled,
    retry: false,
  });
};

/**
 * Check if authenticated user is an active member of a room (query version)
 * GET /api/query/rooms/{roomId}/me/exists
 * 
 * @param roomId - UUID of the room to check (pass null/undefined to disable)
 * @param enabled - Whether to run the query (default: true if roomId present)
 */
export const useMyMembershipExistsQuery = (
  roomId: string | null | undefined,
  enabled?: boolean
) => {
  const isEnabled = enabled ?? !!roomId;
  
  return useQuery({
    queryKey: ['members', 'query', 'exists', 'me', roomId],
    queryFn: async () => {
      await checkMyMembershipExistsQuery(roomId as string);
      return true;
    },
    enabled: isEnabled,
    retry: false,
  });
};

// =============================================================================
// MUTATION HOOKS (Command Endpoints)
// =============================================================================

/**
 * Add a new member to a room (admin/system only)
 * POST /api/rooms/{roomId}/members
 * 
 * Invalidates: ['members', 'query', 'room', roomId], ['members', 'query', 'room', roomId, 'count']
 */
export const useCreateMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ roomId, data }: { roomId: string; data: CreateMemberRequest }) =>
      createMember(roomId, data),
    onSuccess: (_, { roomId }) => {
      queryClient.invalidateQueries({ queryKey: ['members', 'query', 'room', roomId] });
      queryClient.invalidateQueries({ queryKey: ['members', 'query', 'room', roomId, 'count'] });
      queryClient.invalidateQueries({ queryKey: ['members', 'query', 'room', roomId, 'summaries'] });
    },
  });
};

/**
 * Member voluntarily leaves a room
 * DELETE /api/members/{memberId}/leave
 * 
 * Invalidates: ['members', 'query', 'me', roomId], ['members', 'query', 'users', 'me']
 */
export const useLeaveRoom = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (memberId: string) => leaveRoom(memberId),
    onSuccess: (data) => {
      // Invalidate based on room_id from response
      if (data?.room_id) {
        queryClient.invalidateQueries({ queryKey: ['members', 'query', 'me', data.room_id] });
        queryClient.invalidateQueries({ queryKey: ['members', 'query', 'room', data.room_id] });
      }
      queryClient.invalidateQueries({ queryKey: ['members', 'query', 'users', 'me'] });
    },
  });
};

/**
 * Remove a member from a room (admin/system-initiated)
 * DELETE /api/members/{memberId}
 * 
 * Invalidates: ['members', 'query', 'room', roomId], ['members', 'query', 'users', userId]
 */
export const useRemoveMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (memberId: string) => removeMember(memberId),
    onSuccess: (data) => {
      if (data?.room_id) {
        queryClient.invalidateQueries({ queryKey: ['members', 'query', 'room', data.room_id] });
        queryClient.invalidateQueries({ queryKey: ['members', 'query', 'room', data.room_id, 'count'] });
      }
      if (data?.user?.user_id) {
        queryClient.invalidateQueries({ queryKey: ['members', 'query', 'users', data.user.user_id] });
      }
    },
  });
};


/**
 * Demote a member to USER status
 * PATCH /api/members/{memberId}/demote
 * 
 * Invalidates: ['members', 'query', 'room', roomId], ['members', 'query', 'room', roomId, 'admins']
 */
export const useDemoteMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (memberId: string) => demoteMember(memberId),
    onSuccess: (data) => {
      if (data?.room_id) {
        queryClient.invalidateQueries({ queryKey: ['members', 'query', 'room', data.room_id] });
        queryClient.invalidateQueries({ queryKey: ['members', 'query', 'room', data.room_id, 'admins'] });
        queryClient.invalidateQueries({ queryKey: ['members', 'query', 'room', data.room_id, 'users'] });
      }
      queryClient.invalidateQueries({ queryKey: ['members', 'query', 'detail', data?.member_id] });
    },
  });
};

/**
 * Mark all messages as read for the authenticated member
 * PATCH /api/members/{memberId}/read
 * 
 * Invalidates: ['members', 'query', 'me', roomId, 'unread'], ['members', 'query', 'room', roomId]
 */
export const useMarkAllRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (memberId: string) => markAllRead(memberId),
    onSuccess: (data) => {
      if (data?.room_id) {
        queryClient.invalidateQueries({ queryKey: ['members', 'query', 'me', data.room_id, 'unread'] });
        queryClient.invalidateQueries({ queryKey: ['members', 'query', 'room', data.room_id] });
      }
      queryClient.invalidateQueries({ queryKey: ['members', 'query', 'detail', data?.member_id] });
    },
  });
};

/**
 * System endpoint: Increment unread messages count (internal service call)
 * PATCH /api/members/{memberId}/unread?amount={amount}
 * 
 * Invalidates: ['members', 'query', 'me', roomId, 'unread'], ['members', 'query', 'detail', memberId]
 */
export const useAddUnreadMessages = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ memberId, amount }: { memberId: string; amount: number }) =>
      addUnreadMessages(memberId, amount),
    onSuccess: (data) => {
      if (data?.room_id) {
        queryClient.invalidateQueries({ queryKey: ['members', 'query', 'me', data.room_id, 'unread'] });
      }
      queryClient.invalidateQueries({ queryKey: ['members', 'query', 'detail', data?.member_id] });
    },
  });
};

// =============================================================================
// COMPOSITE HOOKS (Convenience wrappers)
// =============================================================================

/**
 * Hook for checking if current user can manage a specific member
 * Combines: useMyMembershipQuery + useActiveRoomMembersQuery
 * 
 * @param roomId - UUID of the room
 * @param targetMemberId - UUID of the member to check permissions for
 */
export const useCanManageMember = (
  roomId: string | null | undefined,
  targetMemberId: string | null | undefined
) => {
  const { data: myMembership } = useMyMembershipQuery(roomId);
  const { data: targetMember } = useMemberByIdQuery(targetMemberId);
  
  const canManage = !!myMembership?.is_admin && 
                    !!targetMember && 
                    targetMember.room_id === roomId &&
                    targetMember.member_id !== myMembership.member_id;
  
  return {
    canManage,
    myMembership,
    targetMember,
    isLoading: !myMembership || !targetMember,
  };
};

/**
 * Hook for fetching room members with unread badge counts
 * Combines: useActiveRoomMembersQuery + optional unread polling
 * 
 * @param roomId - UUID of the room
 * @param pollUnread - Whether to poll for unread count updates (default: false)
 * @param pollInterval - Polling interval in ms (default: 30000)
 */
export const useRoomMembersWithUnread = (
  roomId: string | null | undefined,
  pollUnread: boolean = false,
  pollInterval: number = 30000
) => {
  const membersQuery = useActiveRoomMembersQuery(roomId, {
    refetchInterval: pollUnread ? pollInterval : false,
  });
  
  return {
    ...membersQuery,
    data: membersQuery.data?.map(member => ({
      ...member,
      unreadBadge: formatUnreadCount(member.unread_messages),
    })),
  };
};

/**
 * Hook for bulk loading member profiles with optimistic caching
 * POST /api/query/members/bulk with cache-first strategy
 * 
 * @param memberIds - Array of member IDs to fetch
 */
export const useBulkMemberLoader = () => {
  const queryClient = useQueryClient();
  
  const loadMembers = async (memberIds: string[]): Promise<MemberQueryResponseDTO[]> => {
    // Check cache first
    const cached = memberIds
      .map(id => queryClient.getQueryData<MemberQueryResponseDTO>(['members', 'query', 'detail', id]))
      .filter((m): m is MemberQueryResponseDTO => !!m);
    
    // Find missing IDs
    const missingIds = memberIds.filter(id => 
      !cached.some(c => c.member_id === id)
    );
    
    if (missingIds.length === 0) {
      return cached;
    }
    
    // Fetch missing from API
    const fetched = await getActiveMembersByIds(missingIds);
    
    // Update cache for individual member queries
    fetched.forEach(member => {
      queryClient.setQueryData(
        ['members', 'query', 'detail', member.member_id],
        member
      );
    });
    
    return [...cached, ...fetched];
  };
  
  return { loadMembers };
};
/**
 * Promote a member to ADMIN status
 * PATCH /api/members/{memberId}/promote
 * 
 * Invalidates: ['members', 'query', 'room', roomId], ['members', 'query', 'room', roomId, 'admins']
 */
export const usePromoteMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (memberId: string) => promoteMember(memberId),
    onSuccess: (data) => {
      if (data?.room_id) {
        // ✅ Fixed: use data.room_id instead of undefined roomId
        queryClient.invalidateQueries({ queryKey: ['members', 'query', 'room', data.room_id] });
        queryClient.invalidateQueries({ queryKey: ['members', 'query', 'room', data.room_id, 'admins'] });
        queryClient.invalidateQueries({ queryKey: ['members', 'query', 'room', data.room_id, 'users'] });
      }
      queryClient.invalidateQueries({ queryKey: ['members', 'query', 'detail', data?.member_id] });
    },
  });
};
/**
 * Hook for real-time unread count sync via WebSocket integration point
 * 
 * @param memberId - UUID of the membership to watch
 * @param roomId - UUID of the room (required to invalidate unread count query)
 * @param onUnreadUpdate - Callback when unread count changes
 */
export const useUnreadSync = (
  memberId: string | null | undefined,
  roomId: string | null | undefined,
  onUnreadUpdate?: (newCount: number) => void
) => {
  const queryClient = useQueryClient();
  
  const updateUnreadCount = (newCount: number) => {
    if (!memberId || !roomId) return;
    
    // Update the member detail cache
    queryClient.setQueryData(
      ['members', 'query', 'detail', memberId],
      (prev: MemberQueryResponseDTO | undefined) => 
        prev ? { ...prev, unread_messages: newCount } : prev
    );
    
    // ✅ Fixed: Use the roomId parameter (in scope) instead of old?.room_id
    queryClient.setQueryData(
      ['members', 'query', 'me', roomId, 'unread'],
      { unread_count: newCount }
    );
    
    // Also update the room members list cache if it exists
    queryClient.setQueryData(
      ['members', 'query', 'room', roomId],
      (prev: MemberQueryResponseDTO[] | undefined) =>
        prev?.map(m => 
          m.member_id === memberId 
            ? { ...m, unread_messages: newCount } 
            : m
        ) ?? prev
    );
    
    onUnreadUpdate?.(newCount);
  };
  
  return { updateUnreadCount };
};
// =============================================================================
// TYPE UTILITIES FOR HOOK RETURN VALUES
// =============================================================================

export type UseActiveRoomMembersReturn = ReturnType<typeof useActiveRoomMembers>;
export type UseMemberByIdReturn = ReturnType<typeof useMemberById>;
export type UseMyMembershipReturn = ReturnType<typeof useMyMembership>;
export type UseMembershipExistsReturn = ReturnType<typeof useMembershipExists>;

export type UseMemberByIdQueryReturn = ReturnType<typeof useMemberByIdQuery>;
export type UseMemberByUserAndRoomQueryReturn = ReturnType<typeof useMemberByUserAndRoomQuery>;
export type UseMyMembershipQueryReturn = ReturnType<typeof useMyMembershipQuery>;
export type UseActiveMembershipExistsReturn = ReturnType<typeof useActiveMembershipExists>;
export type UseMyUnreadCountReturn = ReturnType<typeof useMyUnreadCount>;
export type UseActiveRoomMembersQueryReturn = ReturnType<typeof useActiveRoomMembersQuery>;
export type UseActiveRoomAdminsReturn = ReturnType<typeof useActiveRoomAdmins>;
export type UseActiveRoomUsersReturn = ReturnType<typeof useActiveRoomUsers>;
export type UseActiveRoomMembersCountReturn = ReturnType<typeof useActiveRoomMembersCount>;
export type UseActiveRoomMemberSummariesReturn = ReturnType<typeof useActiveRoomMemberSummaries>;

export type UseMyActiveMembershipsReturn = ReturnType<typeof useMyActiveMemberships>;
export type UseUserActiveMembershipsReturn = ReturnType<typeof useUserActiveMemberships>;
export type UseMyActiveAdminMembershipsReturn = ReturnType<typeof useMyActiveAdminMemberships>;
export type UseMyActiveMembershipsCountReturn = ReturnType<typeof useMyActiveMembershipsCount>;
export type UseMyMembershipSummariesReturn = ReturnType<typeof useMyMembershipSummaries>;

export type UseActiveMembersByUserIdsInRoomReturn = ReturnType<typeof useActiveMembersByUserIdsInRoom>;
export type UseActiveMembersByIdsReturn = ReturnType<typeof useActiveMembersByIds>;
export type UseMemberExistsQueryReturn = ReturnType<typeof useMemberExistsQuery>;
export type UseMyMembershipExistsQueryReturn = ReturnType<typeof useMyMembershipExistsQuery>;

export type UseCreateMemberReturn = ReturnType<typeof useCreateMember>;
export type UseLeaveRoomReturn = ReturnType<typeof useLeaveRoom>;
export type UseRemoveMemberReturn = ReturnType<typeof useRemoveMember>;
export type UsePromoteMemberReturn = ReturnType<typeof usePromoteMember>;
export type UseDemoteMemberReturn = ReturnType<typeof useDemoteMember>;
export type UseMarkAllReadReturn = ReturnType<typeof useMarkAllRead>;
export type UseAddUnreadMessagesReturn = ReturnType<typeof useAddUnreadMessages>;

export type UseCanManageMemberReturn = ReturnType<typeof useCanManageMember>;
export type UseRoomMembersWithUnreadReturn = ReturnType<typeof useRoomMembersWithUnread>;
export type UseBulkMemberLoaderReturn = ReturnType<typeof useBulkMemberLoader>;
export type UseUnreadSyncReturn = ReturnType<typeof useUnreadSync>;