// frontend/src/modules/chat/members/types.ts

// =============================================================================
// External Dependency Types
// =============================================================================

/**
 * UserView DTO from Auth Service - represents enriched user profile data.
 * 
 * This type is resolved via external auth service calls and attached to member DTOs
 * to provide frontend-ready display data without leaking internal domain models.
 */
export interface UserView {
  user_id: string;              // UUID string
  username: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  profile_picture: string | null;  // absolute URL or null
}

// =============================================================================
// Request DTOs - Member Creation & Management
// =============================================================================

/**
 * Request payload for POST /api/rooms/{room_id}/members
 * Content-Type: application/json
 * 
 * Used by room admins to add a new member to a group room.
 */
export interface CreateMemberRequest {
  user_id: string;              // UUID string of the user to add
  status?: "ADMIN" | "USER";    // Optional: defaults to "USER" if not provided
}

/**
 * Request payload for PATCH /api/members/{member_id}/promote
 * Empty body - promotion logic handled server-side based on auth context.
 */
export type PromoteMemberRequest = Record<string, never>;

/**
 * Request payload for PATCH /api/members/{member_id}/demote
 * Empty body - demotion logic handled server-side based on auth context.
 */
export type DemoteMemberRequest = Record<string, never>;

/**
 * Query params for PATCH /api/members/{member_id}/unread (internal service call)
 * 
 * 🔓 No auth required — used by message delivery service to sync unread counts.
 */
export interface UpdateUnreadCountQueryParams {
  amount: number;  // Positive integer to increment unread count
}

/**
 * Request body for POST /api/query/rooms/{room_id}/members/bulk
 * Content-Type: application/json
 * 
 * Bulk fetch members by user IDs within a specific room.
 */
export type BulkFetchMembersByUserIdsRequest = string[];  // Array of UUID strings

/**
 * Request body for POST /api/query/members/bulk
 * Content-Type: application/json
 * 
 * Bulk fetch members by member IDs.
 */
export type BulkFetchMembersByIdsRequest = string[];  // Array of UUID strings

// =============================================================================
// Response DTOs - Single Member Details
// =============================================================================

/**
 * DTO representing a member for command/response scenarios (create, update, delete).
 * 
 * <p>Combines:
 * <ul>
 *   <li>MemberAggregate (domain logic + membership state)</li>
 *   <li>UserView (enriched user data from external Auth Service)</li>
 * </ul>
 * </p>
 * 
 * <p>Minimal surface area: excludes internal tracking fields like timestamps 
 * and unread counts to keep mutation APIs focused.</p>
 */
export interface MemberResponseDTO {
  member_id: string;              // UUID string
  user: UserView;                 // Enriched user profile from Auth Service
  room_id: string;                // UUID string
  status: "ADMIN" | "USER";       // Member role as string for API clarity
  is_admin: boolean;              // Pre-computed for frontend convenience
}

/**
 * DTO representing a member for query/list API responses.
 * 
 * <p>Combines:
 * <ul>
 *   <li>Member (raw domain model with membership state and metadata)</li>
 *   <li>UserView (enriched user data from external Auth Service)</li>
 * </ul>
 * </p>
 * 
 * <p>Optimized for read scenarios: includes additional metadata fields excluded 
 * from command DTOs to keep mutation APIs minimal:</p>
 * <ul>
 *   <li>unread_messages - count of unread messages for this member</li>
 *   <li>joined_at - timestamp when member joined the room</li>
 *   <li>updated_at - last activity/update timestamp</li>
 *   <li>is_active - whether member has left the room (soft-delete flag)</li>
 * </ul>
 */
export interface MemberQueryResponseDTO {
  member_id: string;              // UUID string
  user: UserView;                 // Enriched user profile from Auth Service
  room_id: string;                // UUID string
  status: "ADMIN" | "USER";       // Member role as string
  is_admin: boolean;              // Pre-computed: status === "ADMIN"
  unread_messages: number;        // Count of unread messages for badge UI
  joined_at: string | null;       // ISO-8601 datetime string
  updated_at: string | null;      // ISO-8601 datetime string
  is_active: boolean;             // Soft-delete flag: false = left room
}

// =============================================================================
// Response DTOs - Lightweight Summaries (No External UserView Calls)
// =============================================================================

/**
 * Minimal member summary for high-performance list views.
 * 
 * <p>Does NOT include external UserView data — uses only domain model fields.
 * Ideal for scenarios where full profile enrichment is unnecessary or 
 * where external auth service calls should be avoided for performance.</p>
 */
export interface MemberSummaryDTO {
  member_id: string;              // UUID string
  user_id: string;                // UUID string (for external resolution if needed)
  username: string;               // Cached username from domain (may be stale)
  status: "ADMIN" | "USER";
  is_admin: boolean;
  is_active: boolean;
}

// =============================================================================
// Response DTOs - Bulk & List Operations
// =============================================================================

/**
 * Response for bulk member fetch endpoints.
 * 
 * Returns array of enriched MemberQueryResponseDTO objects.
 */
export type BulkMembersResponse = MemberQueryResponseDTO[];

/**
 * Response for lightweight member summary list endpoints.
 */
export type MemberSummariesResponse = MemberSummaryDTO[];

/**
 * Response for member count endpoints.
 */
export interface MemberCountResponse {
  count: number;
}

/**
 * Response for unread count endpoint (my membership in room).
 */
export interface MyUnreadCountResponse {
  unread_count: number;
}

/**
 * Response for member status lookup endpoint.
 */
export interface MemberStatusResponse {
  status: "ADMIN" | "USER";
}

// =============================================================================
// Response DTOs - Existence Checks (204/404)
// =============================================================================

/**
 * Marker type for existence check endpoints that return 204 No Content.
 * 
 * Used for type safety in API client wrappers.
 */
export type ExistsResponse = void;

// =============================================================================
// Utility Types & Type Guards
// =============================================================================

/**
 * Union type for any member response DTO.
 */
export type MemberResponseUnion = 
  | MemberResponseDTO
  | MemberQueryResponseDTO
  | MemberSummaryDTO;

/**
 * Type guard to check if a member is an ADMIN.
 */
export const isAdminMember = (member: { is_admin: boolean }): member is Extract<MemberResponseUnion, { is_admin: true }> => {
  return member.is_admin === true;
};

/**
 * Type guard to check if a member is active (has not left the room).
 */
export const isActiveMember = (member: { is_active: boolean }): member is Extract<MemberResponseUnion, { is_active: true }> => {
  return member.is_active === true;
};

/**
 * Type guard to check if a member has enriched UserView data.
 * 
 * Use to distinguish MemberQueryResponseDTO/MemberResponseDTO from MemberSummaryDTO.
 */
export const hasEnrichedUser = (member: MemberResponseUnion): member is MemberResponseDTO | MemberQueryResponseDTO => {
  return 'user' in member && member.user !== undefined;
};

/**
 * Helper to safely get display name for a member.
 * 
 * Prioritizes: first_name + last_name > username > user_id fallback.
 */
// 1. Add branded UUID type for compile-time validation
export type UUID = string & { readonly __brand: 'UUID' };

// Then use: user_id: UUID; instead of user_id: string;

// 2. Add literal union for status to prevent typos
export type MemberStatus = "ADMIN" | "USER";
// Then use: status: MemberStatus; in all interfaces

// 3. Add error response type for API client consistency
export interface ApiErrorResponse {
  error: string;
  message: string;
  details?: Record<string, unknown>;
  status_code: number;
}
/**
 * Helper to get profile picture URL with fallback.
 */
export const getMemberProfilePicture = (member: MemberResponseUnion, fallback?: string): string | null => {
  if (hasEnrichedUser(member)) {
    return member.user.profile_picture ?? fallback ?? null;
  }
  // MemberSummaryDTO has no profile picture field
  return fallback ?? null;
};

/**
 * Helper to format joined date for display.
 */
export const formatMemberJoinedDate = (member: MemberQueryResponseDTO, locale: string = 'en-US'): string => {
  if (!member.joined_at) return 'Unknown';
  try {
    return new Date(member.joined_at).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return member.joined_at; // Fallback to raw ISO string
  }
};

// =============================================================================
// API Endpoint Type Helpers (for API client wrappers)
// =============================================================================

/**
 * Maps HTTP method + path to expected request/response types.
 * 
 * Use with typed API client wrappers for compile-time endpoint safety.
 */
export interface MemberApiEndpoints {
  // ── Command Endpoints (Mutations) ──
  'POST /api/rooms/:room_id/members': {
    request: CreateMemberRequest;
    response: MemberResponseDTO;
  };
  'DELETE /api/members/:member_id/leave': {
    request: void;
    response: MemberResponseDTO;
  };
  'DELETE /api/members/:member_id': {
    request: void;
    response: { success: boolean; message?: string };
  };
  'PATCH /api/members/:member_id/promote': {
    request: PromoteMemberRequest;
    response: MemberResponseDTO;
  };
  'PATCH /api/members/:member_id/demote': {
    request: DemoteMemberRequest;
    response: MemberResponseDTO;
  };
  'PATCH /api/members/:member_id/unread': {
    queryParams: UpdateUnreadCountQueryParams;
    request: void;
    response: MemberQueryResponseDTO;
  };

  // ── Query Endpoints (Single) ──
  'GET /api/members/:member_id': {
    response: MemberQueryResponseDTO;
  };
  'GET /api/rooms/:room_id/me': {
    response: MemberQueryResponseDTO;
  };
  'GET /api/rooms/:room_id/members/:user_id': {
    response: MemberQueryResponseDTO;
  };

  // ── Query Endpoints (List/Bulk) ──
  'GET /api/rooms/:room_id/members': {
    response: MemberQueryResponseDTO[];
  };
  'GET /api/rooms/:room_id/members/admins': {
    response: MemberQueryResponseDTO[];
  };
  'GET /api/rooms/:room_id/members/users': {
    response: MemberQueryResponseDTO[];
  };
  'GET /api/rooms/:room_id/members/summaries': {
    response: MemberSummaryDTO[];
  };
  'GET /api/rooms/:room_id/members/count': {
    response: MemberCountResponse;
  };
  'GET /api/rooms/:room_id/me/unread': {
    response: MyUnreadCountResponse;
  };
  'GET /api/rooms/:room_id/users/:user_id/status': {
    response: MemberStatusResponse;
  };

  // ── User-Centric Query Endpoints ──
  'GET /api/users/me/memberships': {
    response: MemberQueryResponseDTO[];
  };
  'GET /api/users/:user_id/memberships': {
    response: MemberQueryResponseDTO[];
  };
  'GET /api/users/me/memberships/admin': {
    response: MemberQueryResponseDTO[];
  };
  'GET /api/users/me/memberships/summaries': {
    response: MemberSummaryDTO[];
  };
  'GET /api/users/me/memberships/count': {
    response: MemberCountResponse;
  };

  // ── Bulk Lookup Endpoints ──
  'POST /api/rooms/:room_id/members/bulk': {
    request: BulkFetchMembersByUserIdsRequest;
    response: BulkMembersResponse;
  };
  'POST /api/members/bulk': {
    request: BulkFetchMembersByIdsRequest;
    response: BulkMembersResponse;
  };

  // ── Existence Check Endpoints (204/404) ──
  'HEAD /api/rooms/:room_id/members/:user_id': {
    response: ExistsResponse;
  };
  'HEAD /api/members/:member_id/exists': {
    response: ExistsResponse;
  };
  'HEAD /api/rooms/:room_id/me/exists': {
    response: ExistsResponse;
  };
}

// =============================================================================
// Frontend-Specific Helper Types
// =============================================================================

/**
 * Member item for UI list rendering (WhatsApp-style member list).
 * 
 * Combines query DTO fields with UI-specific computed properties.
 */
export interface MemberListItem {
  member_id: string;
  user: UserView;
  display_name: string;           // Computed: first+last name or username
  profile_picture_url: string | null;  // Absolute URL or null
  status: "ADMIN" | "USER";
  is_admin: boolean;
  is_active: boolean;
  unread_badge: number;           // For notification badge UI
  joined_date_formatted: string;  // Pre-formatted for display
  can_manage: boolean;            // Computed: current user can promote/demote/remove
}

/**
 * Props for member avatar component.
 */
export interface MemberAvatarProps {
  member: MemberResponseUnion;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showStatusBadge?: boolean;
  onClick?: (memberId: string) => void;
}

/**
 * Props for member list item component.
 */
export interface MemberListItemProps {
  item: MemberListItem;
  isCurrentUser: boolean;
  onPromote?: (memberId: string) => void;
  onDemote?: (memberId: string) => void;
  onRemove?: (memberId: string) => void;
  onViewProfile?: (userId: string) => void;
}