// frontend/src/modules/chat/members/api.ts

import { AxiosError } from 'axios';
import { chatClient } from '../../client';
import {
  // Request types
  CreateMemberRequest,
  PromoteMemberRequest,
  DemoteMemberRequest,
  UpdateUnreadCountQueryParams,
  BulkFetchMembersByUserIdsRequest,
  BulkFetchMembersByIdsRequest,
  // Response types
  MemberResponseDTO,
  MemberQueryResponseDTO,
  MemberSummaryDTO,
  MemberCountResponse,
  MyUnreadCountResponse,
  ExistsResponse,
  // Utility types
} from './types';

// =============================================================================
// MEMBER COMMAND APIs (POST/PATCH/DELETE) - Mutations
// =============================================================================

/**
 * Add a new member to a room (admin/system only)
 * POST /api/rooms/{roomId}/members (application/json)
 * 
 * @param roomId - UUID of the room to add member to
 * @param data - Request payload with user_id and optional status ("ADMIN" | "USER")
 * @returns MemberResponseDTO with enriched user data
 */
export const createMember = async (
  roomId: string,
  data: CreateMemberRequest
): Promise<MemberResponseDTO> => {
  try {
    const response = await chatClient.post<MemberResponseDTO>(
      `/rooms/${roomId}/members`,
      data
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error('Create member failed:', error.response?.data || error.message);
    }
    throw error;
  }
};

/**
 * Member voluntarily leaves a room
 * DELETE /api/members/{memberId}/leave
 * 
 * <p><strong>Security:</strong> Authenticated user from JWT must match the member's userId.
 * Domain enforces ownership verification — users cannot leave other members' memberships.</p>
 * 
 * @param memberId - UUID of the membership record to update
 * @returns MemberResponseDTO with updated membership state (is_active: false)
 */
export const leaveRoom = async (
  memberId: string
): Promise<MemberResponseDTO> => {
  try {
    const response = await chatClient.delete<MemberResponseDTO>(
      `/members/${memberId}/leave`
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error('Leave room failed:', error.response?.data || error.message);
    }
    throw error;
  }
};

/**
 * Remove a member from a room (admin/system-initiated)
 * DELETE /api/members/{memberId}
 * 
 * <p><strong>Authorization:</strong> Caller must be admin of the room containing this member.
 * Add authorization check in your API wrapper or backend middleware as needed.</p>
 * 
 * @param memberId - UUID of the membership record to remove
 * @returns MemberResponseDTO with final membership state
 */
export const removeMember = async (
  memberId: string
): Promise<MemberResponseDTO> => {
  try {
    const response = await chatClient.delete<MemberResponseDTO>(
      `/members/${memberId}`
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error('Remove member failed:', error.response?.data || error.message);
    }
    throw error;
  }
};

/**
 * Promote a member to ADMIN status
 * PATCH /api/members/{memberId}/promote
 * 
 * <p><strong>Authorization:</strong> Caller must be admin of the room.
 * Domain enforces role hierarchy — only admins can promote.</p>
 * 
 * @param memberId - UUID of the membership record to promote
 * @returns MemberResponseDTO with updated status: "ADMIN", is_admin: true
 */
export const promoteMember = async (
  memberId: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _data: PromoteMemberRequest = {}
): Promise<MemberResponseDTO> => {
  try {
    const response = await chatClient.patch<MemberResponseDTO>(
      `/members/${memberId}/promote`
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error('Promote member failed:', error.response?.data || error.message);
    }
    throw error;
  }
};

/**
 * Demote a member to USER status
 * PATCH /api/members/{memberId}/demote
 * 
 * <p><strong>Authorization:</strong> Caller must be admin of the room.</p>
 * 
 * @param memberId - UUID of the membership record to demote
 * @returns MemberResponseDTO with updated status: "USER", is_admin: false
 */
export const demoteMember = async (
  memberId: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _data: DemoteMemberRequest = {}
): Promise<MemberResponseDTO> => {
  try {
    const response = await chatClient.patch<MemberResponseDTO>(
      `/members/${memberId}/demote`
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error('Demote member failed:', error.response?.data || error.message);
    }
    throw error;
  }
};

/**
 * Mark all messages as read for the authenticated member
 * PATCH /api/members/{memberId}/read
 * 
 * <p><strong>Security:</strong> Authenticated user from JWT must match the member's userId.
 * Resets unread_messages count to 0 for badge UI synchronization.</p>
 * 
 * @param memberId - UUID of the membership record to update
 * @returns MemberQueryResponseDTO with unread_messages: 0
 */
export const markAllRead = async (
  memberId: string
): Promise<MemberQueryResponseDTO> => {
  try {
    const response = await chatClient.patch<MemberQueryResponseDTO>(
      `/members/${memberId}/read`
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error('Mark all read failed:', error.response?.data || error.message);
    }
    throw error;
  }
};

/**
 * System endpoint: Increment unread messages count (internal service call)
 * PATCH /api/members/{memberId}/unread?amount={amount}
 * 
 * <p><strong>🔓 No auth required</strong> — typically called by message delivery service
 * after successfully delivering a message to a room member.</p>
 * 
 * @param memberId - UUID of the membership record to update
 * @param amount - Positive integer to add to unread count
 * @returns MemberQueryResponseDTO with updated unread_messages count
 */
export const addUnreadMessages = async (
  memberId: string,
  amount: number
): Promise<MemberQueryResponseDTO> => {
  try {
    const response = await chatClient.patch<MemberQueryResponseDTO>(
      `/members/${memberId}/unread`,
      {},
      { params: { amount } as UpdateUnreadCountQueryParams }
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error('Add unread messages failed:', error.response?.data || error.message);
    }
    throw error;
  }
};

// =============================================================================
// MEMBER QUERY APIs (GET) - Reads (Command Controller - Minimal DTOs)
// =============================================================================

/**
 * List all active members of a room (command version - minimal DTOs)
 * GET /api/rooms/{roomId}/members
 * 
 * <p>Returns MemberResponseDTO (minimal surface area) — use /api/query/... 
 * endpoint for enriched metadata like unread_messages, timestamps, is_active.</p>
 * 
 * @param roomId - UUID of the room to query
 * @returns List of MemberResponseDTO with basic membership info
 */
export const getActiveRoomMembers = async (
  roomId: string
): Promise<MemberResponseDTO[]> => {
  try {
    const response = await chatClient.get<MemberResponseDTO[]>(
      `/rooms/${roomId}/members`
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error('Fetch room members failed:', error.response?.data || error.message);
    }
    throw error;
  }
};

/**
 * Get a specific member by ID (command version - minimal DTO)
 * GET /api/members/{memberId}
 * 
 * @param memberId - UUID of the membership record to fetch
 * @returns MemberResponseDTO with basic membership info, or throws 404 if not found
 */
export const getMemberById = async (
  memberId: string
): Promise<MemberResponseDTO> => {
  try {
    const response = await chatClient.get<MemberResponseDTO>(
      `/members/${memberId}`
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error('Fetch member failed:', error.response?.data || error.message);
    }
    throw error;
  }
};

/**
 * Get authenticated user's membership in a room (command version)
 * GET /api/rooms/{roomId}/me
 * 
 * <p>Convenience endpoint for "am I a member?" checks. Uses JWT auth context.</p>
 * 
 * @param roomId - UUID of the room to check
 * @returns MemberResponseDTO with current user's membership, or throws 404 if not a member
 */
export const getMyMembership = async (
  roomId: string
): Promise<MemberResponseDTO> => {
  try {
    const response = await chatClient.get<MemberResponseDTO>(
      `/rooms/${roomId}/me`
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error('Fetch my membership failed:', error.response?.data || error.message);
    }
    throw error;
  }
};

/**
 * Check if a user is an active member of a room (lightweight existence check)
 * GET /api/rooms/{roomId}/members/{userId}
 * 
 * <p>Returns 204 No Content if member exists, 404 if not. Useful for conditional UI rendering.</p>
 * 
 * @param roomId - UUID of the room to check
 * @param userId - UUID of the user to check
 * @returns ExistsResponse (void) — check response status code instead
 */
export const checkMembershipExists = async (
  roomId: string,
  userId: string
): Promise<ExistsResponse> => {
  try {
    const response = await chatClient.get<void>(
      `/rooms/${roomId}/members/${userId}`
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response?.status === 404) {
      // 404 = not a member, this is expected behavior
      throw error;
    }
    if (error instanceof AxiosError) {
      console.error('Check membership failed:', error.response?.data || error.message);
    }
    throw error;
  }
};

// =============================================================================
// MEMBER QUERY APIs (GET) - Reads (Query Controller - Enriched DTOs)
// =============================================================================

/**
 * Get a specific member by ID with enriched metadata (query version)
 * GET /api/query/members/{memberId}
 * 
 * <p>Returns MemberQueryResponseDTO with full metadata: unread_messages, 
 * joined_at, updated_at, is_active, and enriched UserView.</p>
 * 
 * @param memberId - UUID of the membership record to fetch
 * @returns MemberQueryResponseDTO with enriched data, or throws 404 if not found
 */
export const getMemberByIdQuery = async (
  memberId: string
): Promise<MemberQueryResponseDTO> => {
  try {
    const response = await chatClient.get<MemberQueryResponseDTO>(
      `/query/members/${memberId}`
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error('Fetch member query failed:', error.response?.data || error.message);
    }
    throw error;
  }
};

/**
 * Get membership details for a specific user in a specific room (query version)
 * GET /api/query/rooms/{roomId}/users/{userId}
 * 
 * @param roomId - UUID of the room to query
 * @param userId - UUID of the user to look up
 * @returns MemberQueryResponseDTO with enriched data, or throws 404 if not found
 */
export const getMemberByUserAndRoomQuery = async (
  roomId: string,
  userId: string
): Promise<MemberQueryResponseDTO> => {
  try {
    const response = await chatClient.get<MemberQueryResponseDTO>(
      `/query/rooms/${roomId}/users/${userId}`
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error('Fetch member by user/room failed:', error.response?.data || error.message);
    }
    throw error;
  }
};

/**
 * Get authenticated user's membership in a room with enriched metadata (query version)
 * GET /api/query/rooms/{roomId}/me
 * 
 * <p>Convenience endpoint for UI to check membership + retrieve full metadata.
 * Uses JWT auth context — no userId parameter needed.</p>
 * 
 * @param roomId - UUID of the room to check
 * @returns MemberQueryResponseDTO with enriched data, or throws 404 if not a member
 */
export const getMyMembershipQuery = async (
  roomId: string
): Promise<MemberQueryResponseDTO> => {
  try {
    const response = await chatClient.get<MemberQueryResponseDTO>(
      `/query/rooms/${roomId}/me`
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error('Fetch my membership query failed:', error.response?.data || error.message);
    }
    throw error;
  }
};

/**
 * Check if a user is an active member of a room (query version - lightweight)
 * GET /api/query/rooms/{roomId}/members/{userId}
 * 
 * <p>Returns 204 No Content if member exists and is active, 404 if not.
 * Spring handles HEAD requests automatically for GET mappings.</p>
 * 
 * @param roomId - UUID of the room to check
 * @param userId - UUID of the user to check
 * @returns ExistsResponse (void) — check response status code instead
 */
export const checkActiveMembershipExists = async (
  roomId: string,
  userId: string
): Promise<ExistsResponse> => {
  try {
    const response = await chatClient.get<void>(
      `/query/rooms/${roomId}/members/${userId}`
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response?.status === 404) {
      // 404 = not an active member, this is expected behavior
      throw error;
    }
    if (error instanceof AxiosError) {
      console.error('Check active membership failed:', error.response?.data || error.message);
    }
    throw error;
  }
};


/**
 * Get authenticated user's unread message count in a room
 * GET /api/query/rooms/{roomId}/me/unread
 * 
 * <p>Convenience endpoint for UI badge counters. Uses JWT auth context.</p>
 * 
 * @param roomId - UUID of the room to check
 * @returns MyUnreadCountResponse with unread_count integer
 */
export const getMyUnreadCount = async (
  roomId: string
): Promise<MyUnreadCountResponse> => {
  try {
    const response = await chatClient.get<number>(
      `/query/rooms/${roomId}/me/unread`
    );
    return { unread_count: response.data };
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error('Fetch unread count failed:', error.response?.data || error.message);
    }
    throw error;
  }
};

// =============================================================================
// BULK QUERY APIs BY ROOM (Query Controller)
// =============================================================================

/**
 * List all active members of a room with enriched metadata
 * GET /api/query/rooms/{roomId}/members
 * 
 * @param roomId - UUID of the room to query
 * @returns List of MemberQueryResponseDTO with full user profiles and membership metadata
 */
export const getActiveRoomMembersQuery = async (
  roomId: string
): Promise<MemberQueryResponseDTO[]> => {
  try {
    const response = await chatClient.get<MemberQueryResponseDTO[]>(
      `/query/rooms/${roomId}/members`
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error('Fetch active room members query failed:', error.response?.data || error.message);
    }
    throw error;
  }
};

/**
 * List all active ADMIN members of a room
 * GET /api/query/rooms/{roomId}/members/admins
 * 
 * @param roomId - UUID of the room to query
 * @returns List of MemberQueryResponseDTO for admin members only
 */
export const getActiveRoomAdmins = async (
  roomId: string
): Promise<MemberQueryResponseDTO[]> => {
  try {
    const response = await chatClient.get<MemberQueryResponseDTO[]>(
      `/query/rooms/${roomId}/members/admins`
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error('Fetch room admins failed:', error.response?.data || error.message);
    }
    throw error;
  }
};

/**
 * List all active regular USER members of a room (excludes admins)
 * GET /api/query/rooms/{roomId}/members/users
 * 
 * @param roomId - UUID of the room to query
 * @returns List of MemberQueryResponseDTO for regular user members only
 */
export const getActiveRoomUsers = async (
  roomId: string
): Promise<MemberQueryResponseDTO[]> => {
  try {
    const response = await chatClient.get<MemberQueryResponseDTO[]>(
      `/query/rooms/${roomId}/members/users`
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error('Fetch room users failed:', error.response?.data || error.message);
    }
    throw error;
  }
};

/**
 * Get count of active members in a room
 * GET /api/query/rooms/{roomId}/members/count
 * 
 * @param roomId - UUID of the room to count
 * @returns MemberCountResponse with count integer
 */
export const countActiveRoomMembers = async (
  roomId: string
): Promise<MemberCountResponse> => {
  try {
    const response = await chatClient.get<number>(
      `/query/rooms/${roomId}/members/count`
    );
    return { count: response.data };
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error('Count room members failed:', error.response?.data || error.message);
    }
    throw error;
  }
};

/**
 * Fetch lightweight member summaries for a room (no external UserView calls)
 * GET /api/query/rooms/{roomId}/members/summaries
 * 
 * <p>Use this endpoint when you only need basic membership info without enriched
 * user profiles — reduces external API calls and improves response time.</p>
 * 
 * @param roomId - UUID of the room to query
 * @returns List of MemberSummaryDTO with minimal fields (no UserView)
 */
export const getActiveRoomMemberSummaries = async (
  roomId: string
): Promise<MemberSummaryDTO[]> => {
  try {
    const response = await chatClient.get<MemberSummaryDTO[]>(
      `/query/rooms/${roomId}/members/summaries`
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error('Fetch member summaries failed:', error.response?.data || error.message);
    }
    throw error;
  }
};

// =============================================================================
// BULK QUERY APIs BY USER (Query Controller)
// =============================================================================

/**
 * List all active memberships for the authenticated user across all rooms
 * GET /api/query/users/me/memberships
 * 
 * <p>Convenience endpoint for "My Rooms" or "My Groups" views. Uses JWT auth context.</p>
 * 
 * @returns List of MemberQueryResponseDTO for all rooms user is an active member of
 */
export const getMyActiveMemberships = async (): Promise<MemberQueryResponseDTO[]> => {
  try {
    const response = await chatClient.get<MemberQueryResponseDTO[]>(
      '/query/users/me/memberships'
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error('Fetch my memberships failed:', error.response?.data || error.message);
    }
    throw error;
  }
};

/**
 * List all active memberships for a specific user across all rooms
 * GET /api/query/users/{userId}/memberships
 * 
 * <p>Typically used by admin panels or user profile views. May require
 * authorization checks depending on privacy requirements.</p>
 * 
 * @param userId - UUID of the user to query
 * @returns List of MemberQueryResponseDTO for user's active memberships
 */
export const getUserActiveMemberships = async (
  userId: string
): Promise<MemberQueryResponseDTO[]> => {
  try {
    const response = await chatClient.get<MemberQueryResponseDTO[]>(
      `/query/users/${userId}/memberships`
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error('Fetch user memberships failed:', error.response?.data || error.message);
    }
    throw error;
  }
};

/**
 * List all active ADMIN memberships for the authenticated user
 * GET /api/query/users/me/memberships/admin
 * 
 * <p>Useful for "Rooms I Administer" views. Uses JWT auth context.</p>
 * 
 * @returns List of MemberQueryResponseDTO for rooms where user has ADMIN status
 */
export const getMyActiveAdminMemberships = async (): Promise<MemberQueryResponseDTO[]> => {
  try {
    const response = await chatClient.get<MemberQueryResponseDTO[]>(
      '/query/users/me/memberships/admin'
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error('Fetch my admin memberships failed:', error.response?.data || error.message);
    }
    throw error;
  }
};

/**
 * Get count of active memberships for the authenticated user
 * GET /api/query/users/me/memberships/count
 * 
 * @returns MemberCountResponse with count of user's active memberships
 */
export const countMyActiveMemberships = async (): Promise<MemberCountResponse> => {
  try {
    const response = await chatClient.get<number>(
      '/query/users/me/memberships/count'
    );
    return { count: response.data };
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error('Count my memberships failed:', error.response?.data || error.message);
    }
    throw error;
  }
};

/**
 * Fetch lightweight membership summaries for the authenticated user
 * GET /api/query/users/me/memberships/summaries
 * 
 * <p>Use this when listing a user's rooms without needing full profile data —
 * reduces external API calls and improves performance.</p>
 * 
 * @returns List of MemberSummaryDTO for user's active memberships (no UserView)
 */
export const getMyMembershipSummaries = async (): Promise<MemberSummaryDTO[]> => {
  try {
    const response = await chatClient.get<MemberSummaryDTO[]>(
      '/query/users/me/memberships/summaries'
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error('Fetch my membership summaries failed:', error.response?.data || error.message);
    }
    throw error;
  }
};

// =============================================================================
// BULK LOOKUP QUERY APIs (POST with JSON body)
// =============================================================================

/**
 * Bulk fetch active members by user IDs within a specific room
 * POST /api/query/rooms/{roomId}/members/bulk (application/json)
 * 
 * <p>Useful for rendering participant lists when you have a known set of user IDs.
 * Request body should contain JSON array of UUID strings.</p>
 * 
 * @param roomId - UUID of the room to filter by
 * @param userIds - Array of user UUID strings to look up
 * @returns List of MemberQueryResponseDTO for found active members (may be shorter than input)
 */
export const getActiveMembersByUserIdsInRoom = async (
  roomId: string,
  userIds: BulkFetchMembersByUserIdsRequest
): Promise<MemberQueryResponseDTO[]> => {
  try {
    const response = await chatClient.post<MemberQueryResponseDTO[]>(
      `/query/rooms/${roomId}/members/bulk`,
      userIds
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error('Bulk fetch members by user IDs failed:', error.response?.data || error.message);
    }
    throw error;
  }
};

/**
 * Bulk fetch active members by member IDs
 * POST /api/query/members/bulk (application/json)
 * 
 * <p>Useful for batch loading membership details when you have a known set
 * of member record IDs. Request body should contain JSON array of UUID strings.</p>
 * 
 * @param memberIds - Array of member UUID strings to look up
 * @returns List of MemberQueryResponseDTO for found active members (may be shorter than input)
 */
export const getActiveMembersByIds = async (
  memberIds: BulkFetchMembersByIdsRequest
): Promise<MemberQueryResponseDTO[]> => {
  try {
    const response = await chatClient.post<MemberQueryResponseDTO[]>(
      '/query/members/bulk',
      memberIds
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error('Bulk fetch members by IDs failed:', error.response?.data || error.message);
    }
    throw error;
  }
};

// =============================================================================
// EXISTENCE CHECK QUERY APIs (204/404 responses)
// =============================================================================

/**
 * Check if an active member exists by member ID (query version)
 * GET /api/query/members/{memberId}/exists
 * 
 * <p>Lightweight existence check — returns 204 No Content if member exists and is active,
 * 404 if not. Useful for pre-flight validation.</p>
 * 
 * @param memberId - UUID of the membership record to check
 * @returns ExistsResponse (void) — check response status code instead
 */
export const checkMemberExistsQuery = async (
  memberId: string
): Promise<ExistsResponse> => {
  try {
    const response = await chatClient.get<void>(
      `/query/members/${memberId}/exists`
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response?.status === 404) {
      // 404 = member doesn't exist or is not active, this is expected behavior
      throw error;
    }
    if (error instanceof AxiosError) {
      console.error('Check member exists failed:', error.response?.data || error.message);
    }
    throw error;
  }
};

/**
 * Check if authenticated user is an active member of a room (query version)
 * GET /api/query/rooms/{roomId}/me/exists
 * 
 * <p>Convenience endpoint using JWT auth context. Returns 204 if membership exists
 * and is active, 404 otherwise. Useful for conditional UI rendering.</p>
 * 
 * @param roomId - UUID of the room to check
 * @returns ExistsResponse (void) — check response status code instead
 */
export const checkMyMembershipExistsQuery = async (
  roomId: string
): Promise<ExistsResponse> => {
  try {
    const response = await chatClient.get<void>(
      `/query/rooms/${roomId}/me/exists`
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response?.status === 404) {
      // 404 = user is not an active member, this is expected behavior
      throw error;
    }
    if (error instanceof AxiosError) {
      console.error('Check my membership exists failed:', error.response?.data || error.message);
    }
    throw error;
  }
};

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Type-safe wrapper for handling 204/404 existence check responses
 * 
 * @param promise - The API call promise that may throw 404
 * @returns true if exists (204), false if not found (404)
 */
export const handleExistsResponse = async (
  promise: Promise<ExistsResponse>
): Promise<boolean> => {
  try {
    await promise;
    return true; // 204 = exists
  } catch (error) {
    if (error instanceof AxiosError && error.response?.status === 404) {
      return false; // 404 = not found
    }
    // Re-throw unexpected errors
    throw error;
  }
};

/**
 * Extract member ID from a MemberResponseDTO or MemberQueryResponseDTO
 * 
 * @param member - Any member response type
 * @returns The member_id UUID string
 */
export const extractMemberId = (
  member: MemberResponseDTO | MemberQueryResponseDTO
): string => {
  return member.member_id;
};

/**
 * Check if a member has unread messages (for badge UI)
 * 
 * @param member - MemberQueryResponseDTO with unread_messages field
 * @returns true if unread_messages > 0
 */
export const hasUnreadMessages = (
  member: MemberQueryResponseDTO
): boolean => {
  return member.unread_messages > 0;
};

/**
 * Format unread count for display (e.g., "99+" for large numbers)
 * 
 * @param count - The unread message count
 * @returns Formatted string for UI badge display
 */
export const formatUnreadCount = (count: number): string => {
  if (count <= 0) return '';
  if (count >= 100) return '99+';
  return count.toString();
};