// frontend/src/modules/chat/rooms/types.ts

// =============================================================================
// Request DTOs
// =============================================================================

/**
 * Request payload for POST /api/rooms/direct
 */
export interface CreateDirectRoomRequest {
  friend_id: string; // UUID string
}

/**
 * Request payload for PATCH /api/rooms/{room_id}
 */
export interface UpdateRoomRequest {
  name?: string | null;
  description?: string | null;
  profile_image?: string | null; // relative path or URL
  cover_image?: string | null;   // relative path or URL
}

// =============================================================================
// Response DTOs - Room Details
// =============================================================================

/**
 * DTO representing a room's full details for the "Get Room by ID" query endpoint.
 * 
 * Designed for displaying room settings, member management, and detailed room information.
 * Contains all essential fields needed for rendering a complete room detail view.
 */
export interface GetRoomByIdDTO {
  room_id: string;                    // UUID string
  name: string;                       // group name or friend username
  profile_image_url: string | null;   // absolute URL (converted in controller)
  cover_image_url: string | null;     // absolute URL (converted in controller)
  has_profile_image: boolean;
  has_cover_image: boolean;
  is_group: boolean;
  type: "GROUP" | "DIRECT";
  description: string | null;         // null for DIRECT rooms
  creator_id: string;                 // UUID string
  is_admin: boolean;                  // computed from membership status
  is_owner: boolean;                  // computed: creator_id == current_user_id
  last_activity_at: string | null;    // ISO-8601 datetime string
  created_at: string | null;          // ISO-8601 datetime string
  updated_at: string | null;          // ISO-8601 datetime string
  is_deleted: boolean;
}

// =============================================================================
// Response DTOs - Room Creation
// =============================================================================

/**
 * Minimal member representation for creation/update responses.
 */
export interface MemberPreview {
  username: string;
}

/**
 * DTO representing the response after successfully creating a PRIVATE (DIRECT) or GROUP room.
 * 
 * Designed for immediate navigation to the newly created room view.
 * Contains only the essential display fields needed for the initial room render.
 */
export interface PrivateRoomCreationResponse {
  room_id: string;
  name: string;
  profile_image_url: string | null;   // absolute URL (converted in controller)
  members: MemberPreview[];
  admin: boolean;                     // always true for creator context
  is_group: boolean;
  has_profile_image: boolean;
}


// =============================================================================
// Response DTOs - Room Updates
// =============================================================================

/**
 * DTO representing the response after successfully executing a room update action.
 * 
 * Supported operations: "update_name", "update_description", "update_cover_image", 
 * "update_profile_image", "delete"
 */
export interface GroupUpdateActionsResponse {
  room_id: string;
  name: string;
  description: string;
  profile_image_url: string | null;   // absolute URL (converted in controller)
  cover_image_url: string | null;     // absolute URL (converted in controller)
  members: MemberPreview[];
  admin: boolean;
  is_group: boolean;
  has_profile_image: boolean;
  has_cover_image: boolean;
  updated_at: string;                 // ISO-8601 datetime string
}

// =============================================================================
// Response DTOs - Room List (Home Page)
// =============================================================================

/**
 * Minimal preview representation of the last message in a room.
 * 
 * Follows "image-over-text" priority for preview display:
 * - If message has image: image_url is set, content is null
 * - If message has no image: content is set, image_url is null
 */
export interface LastMessagePreview {
  id: string;                         // UUID string
  room_id: string;                    // UUID string
  content: string | null;             // null if message has image
  image_url: string | null;           // absolute URL (converted in controller), null if no image
  created_at: string | null;          // ISO-8601 datetime string
  is_mine: boolean;                   // true if current user sent the message
  status: "SENT" | "RECEIVED" | "SEEN";
  sender_username: string;            // "You" if is_mine=true, otherwise sender's username
  has_image: boolean;
}

/**
 * DTO representing a room item in the user's home page room list.
 * 
 * Designed for efficient display of rooms in a scrollable list view (WhatsApp-style).
 * Contains only the essential fields needed for rendering room previews.
 */
export interface MyRoomsHomePageListDto {
  room_id: string;
  name: string;                       // group name or friend username
  profile_image_url: string | null;   // absolute URL (converted in controller)
  has_profile_image: boolean;
  is_group: boolean;
  last_activity_at: string | null;    // ISO-8601 datetime string
  is_deleted: boolean;
  last_message: LastMessagePreview | null; // null for empty GROUP rooms (no messages yet)
  my_unread_messages_in_room: number;
}


// frontend/src/modules/chat/rooms/types.ts

// =============================================================================
// Request DTOs - Room Creation
// =============================================================================

/**
 * Request payload for POST /api/rooms/direct
 * Content-Type: application/json
 */
export interface CreateDirectRoomRequest {
  friend_id: string; // UUID string
}

/**
 * Form data fields for POST /api/rooms/groups (multipart/form-data)
 * Note: participant_ids should be JSON.stringify'd when appending to FormData
 */
export interface CreateGroupRoomFormData {
  group_name: string;
  description?: string;
  participant_ids: string[]; // Will be JSON.stringify'd for FormData
  profile_image?: File;      // Optional file upload
  cover_image?: File;        // Optional file upload
}

// =============================================================================
// Request DTOs - Room Updates
// =============================================================================

/**
 * Request payload for PATCH /api/rooms/groups/{room_id}/name
 * Content-Type: application/json
 */
export interface UpdateGroupNameRequest {
  new_name: string;
}

/**
 * Request payload for PATCH /api/rooms/groups/{room_id}/description
 * Content-Type: application/json
 * Send empty string "" to clear the description
 */
export interface UpdateGroupDescriptionRequest {
  new_description: string;
}

/**
 * Form data fields for PATCH /api/rooms/groups/{room_id}/cover-image (multipart/form-data)
 * Use query param ?remove=true to clear the cover image instead of uploading
 */
export interface UpdateGroupCoverImageFormData {
  cover_image: File; // File to upload
}

/**
 * Form data fields for PATCH /api/rooms/groups/{room_id}/profile-image (multipart/form-data)
 * Use query param ?remove=true to clear the profile image instead of uploading
 */
export interface UpdateGroupProfileImageFormData {
  profile_image: File; // File to upload
}

// =============================================================================
// Response DTOs - Room Details
// =============================================================================

/**
 * DTO representing a room's full details for the "Get Room by ID" query endpoint.
 * 
 * Designed for displaying room settings, member management, and detailed room information.
 * Contains all essential fields needed for rendering a complete room detail view.
 */
export interface GetRoomByIdDTO {
  room_id: string;                    // UUID string
  name: string;                       // group name or friend username
  profile_image_url: string | null;   // absolute URL (converted in controller)
  cover_image_url: string | null;     // absolute URL (converted in controller)
  has_profile_image: boolean;
  has_cover_image: boolean;
  is_group: boolean;
  type: "GROUP" | "DIRECT";
  description: string | null;         // null for DIRECT rooms
  creator_id: string;                 // UUID string
  is_admin: boolean;                  // computed from membership status
  is_owner: boolean;                  // computed: creator_id == current_user_id
  last_activity_at: string | null;    // ISO-8601 datetime string
  created_at: string | null;          // ISO-8601 datetime string
  updated_at: string | null;          // ISO-8601 datetime string
  is_deleted: boolean;
}

// =============================================================================
// Response DTOs - Room Creation
// =============================================================================

/**
 * Minimal member representation for creation/update responses.
 */
export interface MemberPreview {
  username: string;
}

/**
 * DTO representing the response after successfully creating a PRIVATE (DIRECT) or GROUP room.
 * 
 * Designed for immediate navigation to the newly created room view.
 * Contains only the essential display fields needed for the initial room render.
 */
export interface PrivateRoomCreationResponse {
  room_id: string;
  name: string;
  profile_image_url: string | null;   // absolute URL (converted in controller)
  members: MemberPreview[];
  admin: boolean;                     // always true for creator context
  is_group: boolean;
  has_profile_image: boolean;
}

/**
 * Alias for backward compatibility with existing code references.
 */
export type GroupCreationResponse = PrivateRoomCreationResponse;

// =============================================================================
// Response DTOs - Room Updates
// =============================================================================

/**
 * DTO representing the response after successfully executing a room update action.
 * 
 * Supported operations: "update_name", "update_description", "update_cover_image", 
 * "update_profile_image", "delete"
 */
export interface GroupUpdateActionsResponse {
  room_id: string;
  name: string;
  description: string;
  profile_image_url: string | null;   // absolute URL (converted in controller)
  cover_image_url: string | null;     // absolute URL (converted in controller)
  members: MemberPreview[];
  admin: boolean;
  is_group: boolean;
  has_profile_image: boolean;
  has_cover_image: boolean;
  updated_at: string;                 // ISO-8601 datetime string
}

// =============================================================================
// Response DTOs - Room List (Home Page)
// =============================================================================

/**
 * Minimal preview representation of the last message in a room.
 * 
 * Follows "image-over-text" priority for preview display:
 * - If message has image: image_url is set, content is null
 * - If message has no image: content is set, image_url is null
 */
export interface LastMessagePreview {
  id: string;                         // UUID string
  room_id: string;                    // UUID string
  content: string | null;             // null if message has image
  image_url: string | null;           // absolute URL (converted in controller), null if no image
  created_at: string | null;          // ISO-8601 datetime string
  is_mine: boolean;                   // true if current user sent the message
  status: "SENT" | "RECEIVED" | "SEEN";
  sender_username: string;            // "You" if is_mine=true, otherwise sender's username
  has_image: boolean;
}

/**
 * DTO representing a room item in the user's home page room list.
 * 
 * Designed for efficient display of rooms in a scrollable list view (WhatsApp-style).
 * Contains only the essential fields needed for rendering room previews.
 */
export interface MyRoomsHomePageListDto {
  room_id: string;
  name: string;                       // group name or friend username
  profile_image_url: string | null;   // absolute URL (converted in controller)
  has_profile_image: boolean;
  is_group: boolean;
  last_activity_at: string | null;    // ISO-8601 datetime string
  is_deleted: boolean;
  last_message: LastMessagePreview | null; // null for empty GROUP rooms (no messages yet)
  my_unread_messages_in_room: number;
}

// =============================================================================
// Utility Types & Helpers
// =============================================================================

/**
 * Union type for any room response DTO.
 */
export type RoomResponseDTO = 
  | GetRoomByIdDTO
  | PrivateRoomCreationResponse
  | GroupUpdateActionsResponse
  | MyRoomsHomePageListDto;

/**
 * Type guard to check if a room is a GROUP room.
 */
export const isGroupRoom = (room: { is_group: boolean }): room is Extract<RoomResponseDTO, { is_group: true }> => {
  return room.is_group === true;
};

/**
 * Type guard to check if a room is a DIRECT room.
 */
export const isDirectRoom = (room: { is_group: boolean }): room is Extract<RoomResponseDTO, { is_group: false }> => {
  return room.is_group === false;
};

/**
 * Helper to safely access last_message content (handles image-over-text priority).
 */
export const getLastMessageDisplayText = (lastMessage: LastMessagePreview | null): string => {
  if (!lastMessage) return "";
  if (lastMessage.has_image && lastMessage.image_url) {
    return " Photo";
  }
  return lastMessage.content || "";
};

/**
 * Helper to build FormData for CreateGroupRoomRequest
 * Usage: const formData = buildCreateGroupRoomFormData({ group_name: "...", participant_ids: [...], ... })
 */
export const buildCreateGroupRoomFormData = (data: CreateGroupRoomFormData): FormData => {
  const formData = new FormData();
  formData.append("group_name", data.group_name);
  if (data.description) {
    formData.append("description", data.description);
  }
  formData.append("participant_ids", JSON.stringify(data.participant_ids));
  if (data.profile_image) {
    formData.append("profile_image", data.profile_image);
  }
  if (data.cover_image) {
    formData.append("cover_image", data.cover_image);
  }
  return formData;
};

/**
 * Helper to build FormData for image update requests
 * Usage: const formData = buildImageUpdateFormData(file, "cover_image")
 */
export const buildImageUpdateFormData = (file: File, fieldName: "cover_image" | "profile_image"): FormData => {
  const formData = new FormData();
  formData.append(fieldName, file);
  return formData;
};


/**
 * Query params for GET /api/query/rooms/{room_id}/users-to-add
 */
export interface GetUsersToAddInGroupParams {
  limit?: number;           // default: 20
  offset?: number;          // default: 0
  include_deleted?: boolean; // default: false
}

// Add this to the UserView type definition section (if not already defined):
// Note: If UserView is imported from external/users, ensure it includes these fields:
export interface UserView {
  user_id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  profile_picture: string | null; // relative path, convert to absolute if needed
}