// frontend/src/modules/chat/messages/types.ts

// =============================================================================
// Request DTOs - Message Commands
// =============================================================================

/**
 * Request payload for POST /api/messages
 * Send a new text-only message to a room
 */
export interface SendMessageRequest {
  room_id: string;        // UUID string
  content: string;        // Message text content
}

/**
 * Request payload for POST /api/messages/reply
 * Reply to an existing message with text only
 */
export interface ReplyMessageRequest extends SendMessageRequest {
  parent_id: string;      // UUID string of the parent message being replied to
}

/**
 * Form data fields for POST /api/messages/with-image (multipart/form-data)
 * Send a new message with an image attachment
 */
export interface SendMessageWithImageFormData {
  room_id: string;                    // UUID string
  content?: string;                   // Optional message text (can be empty for image-only)
  image: File;                        // Image file to upload
}

/**
 * Form data fields for POST /api/messages/reply/with-image (multipart/form-data)
 * Reply to a message with both text and image attachment
 */
export interface ReplyMessageWithImageFormData extends SendMessageWithImageFormData {
  parent_id: string;                  // UUID string of the parent message
}

// =============================================================================
// Request DTOs - Message Updates
// =============================================================================

/**
 * Request payload for PATCH /api/messages/{message_id}/content
 * Update the text content of an existing message (sender only)
 */
export interface UpdateMessageContentRequest {
  new_content: string;                // New text content for the message
}

/**
 * Form data fields for PATCH /api/messages/{message_id}/image (multipart/form-data)
 * Replace the image of an existing message (sender only)
 * Use query param ?remove=true to clear the image instead of uploading
 */
export interface UpdateMessageImageFormData {
  image: File;                        // New image file to upload
}

// =============================================================================
// Response DTOs - Message Core Structures
// =============================================================================

/**
 * Minimal preview representation of a parent message for reply context.
 * 
 * Follows "image-over-text" priority:
 * - If parent has image: image_url is set, content is null
 * - If parent has no image: content is set, image_url is null
 */
export interface ParentMessagePreview {
  content: string | null;             // null if parent has image
  image_url: string | null;           // absolute URL (converted in controller), null if no image
  creator_username: string;           // Username of the parent message's sender
  has_image: boolean;                 // true if parent message has an image
}

/**
 * DTO representing a message for query/list API responses.
 * 
 * Designed for read-side operations: fetching message history, loading chat threads,
 * displaying message details. Contains message core data, reply context, sender info,
 * state flags, and timestamps.
 */
export interface MessageQueryResponseDTO {
  id: string;                         // UUID string
  room_id: string;                    // UUID string
  content: string;                    // Message text content
  image_url: string | null;           // absolute URL (converted in controller), null if no image
  is_reply: boolean;                  // true if this message is a reply to another
  parent_preview: ParentMessagePreview | null;  // Preview of parent message if is_reply=true
  created_at: string | null;          // ISO-8601 datetime string
  is_mine: boolean;                   // true if current user sent this message
  status: "SENT" | "RECEIVED" | "SEEN";  // Message delivery status
  sender_username: string;            // "You" if is_mine=true, otherwise sender's username
  sender_profile_image: string | null;  // absolute URL of sender's profile image
  has_image: boolean;                 // true if this message has an image attachment
  is_deleted: boolean;                // true if message was soft-deleted
  updated_at: string | null;          // ISO-8601 datetime string (last edit time)
  seen_at: string | null;             // ISO-8601 datetime string (when message was read)
}

/**
 * DTO representing the response after successfully executing a message command action.
 * 
 * Supported operations: "send", "update_content", "update_image", "delete", 
 * "restore", "mark_as_received", "mark_as_seen"
 * 
 * Contains the updated message state for immediate UI synchronization.
 */
export interface MessageCommandActionsResponse {
  id: string;                         // UUID string
  room_id: string;                    // UUID string
  content: string;                    // Message text content
  image_url: string | null;           // absolute URL (converted in controller), null if no image
  is_reply: boolean;                  // true if this message is a reply to another
  parent_preview: ParentMessagePreview | null;  // Preview of parent message if is_reply=true
  created_at: string;                 // ISO-8601 datetime string
  is_mine: boolean;                   // true if current user sent this message
  status: "SENT" | "RECEIVED" | "SEEN";  // Message delivery status
  sender_username: string;            // "You" if is_mine=true, otherwise sender's username
  sender_profile_image: string | null;  // absolute URL of sender's profile image
  has_image: boolean;                 // true if this message has an image attachment
  is_deleted: boolean;                // true if message was soft-deleted
}

// =============================================================================
// Response DTOs - Authentication
// =============================================================================

/**
 * Request payload for POST /zedvye_one/users/token/
 * Authenticate user and receive JWT tokens
 */
export interface TokenAuthRequest {
  identifier: string;                 // Email or username
  password: string;                   // User password
}

/**
 * Response from POST /zedvye_one/users/token/
 * Contains JWT tokens for authenticated session
 */
export interface TokenAuthResponse {
  access: string;                     // JWT access token (for API requests)
  refresh?: string;                   // JWT refresh token (optional, for token renewal)
  user_id?: string;                   // UUID string of authenticated user (optional)
  username?: string;                  // Username of authenticated user (optional)
}

// =============================================================================
// Utility Types & Helpers
// =============================================================================

/**
 * Union type for any message response DTO.
 */
export type MessageResponseDTO = 
  | MessageQueryResponseDTO 
  | MessageCommandActionsResponse;

/**
 * Type guard to check if a message is a reply.
 */
export const isReplyMessage = (message: { is_reply: boolean }): message is Extract<MessageResponseDTO, { is_reply: true }> => {
  return message.is_reply === true;
};

/**
 * Type guard to check if a message has an image.
 */
export const messageHasImage = (message: { has_image: boolean }): message is Extract<MessageResponseDTO, { has_image: true }> => {
  return message.has_image === true;
};

/**
 * Type guard to check if a message is deleted.
 */
export const isDeletedMessage = (message: { is_deleted: boolean }): message is Extract<MessageResponseDTO, { is_deleted: true }> => {
  return message.is_deleted === true;
};

/**
 * Helper to safely get message display text (handles image-over-text priority).
 * Returns emoji prefix for images, content text, or placeholder for deleted messages.
 */
export const getMessageDisplayText = (message: MessageResponseDTO): string => {
  if (message.is_deleted) return "💬 This message was deleted";
  if (message.has_image && message.image_url) {
    return message.content ? `📷 ${message.content}` : "📷 Photo";
  }
  return message.content || "";
};

/**
 * Helper to get parent preview display text (for reply context rendering).
 * Follows image-over-text priority: shows "📷 Photo" if parent has image.
 */
export const getParentPreviewDisplayText = (preview: ParentMessagePreview | null): string => {
  if (!preview) return "";
  if (preview.has_image && preview.image_url) {
    return "📷 Photo";
  }
  return preview.content || "";
};

/**
 * Helper to build FormData for SendMessageWithImageFormData
 * Usage: const formData = buildSendMessageWithImageFormData({ room_id: "...", content: "...", image: file })
 */
export const buildSendMessageWithImageFormData = (data: SendMessageWithImageFormData): FormData => {
  const formData = new FormData();
  formData.append("room_id", data.room_id);
  if (data.content !== undefined && data.content !== "") {
    formData.append("content", data.content);
  }
  formData.append("image", data.image);
  return formData;
};

/**
 * Helper to build FormData for ReplyMessageWithImageFormData
 * Usage: const formData = buildReplyMessageWithImageFormData({ room_id: "...", parent_id: "...", content: "...", image: file })
 */
export const buildReplyMessageWithImageFormData = (data: ReplyMessageWithImageFormData): FormData => {
  const formData = new FormData();
  formData.append("room_id", data.room_id);
  formData.append("parent_id", data.parent_id);
  if (data.content !== undefined && data.content !== "") {
    formData.append("content", data.content);
  }
  formData.append("image", data.image);
  return formData;
};

/**
 * Helper to build FormData for image update requests
 * Usage: const formData = buildMessageImageUpdateFormData(file)
 */
export const buildMessageImageUpdateFormData = (file: File): FormData => {
  const formData = new FormData();
  formData.append("image", file);
  return formData;
};

/**
 * Helper to format status for UI display
 */
export const formatMessageStatus = (status: "SENT" | "RECEIVED" | "SEEN"): string => {
  switch (status) {
    case "SENT": return "Sent";
    case "RECEIVED": return "Delivered";
    case "SEEN": return "Seen";
    default: return status;
  }
};

/**
 * Helper to check if message can be edited by current user
 * (Only sender can edit, and only if not deleted)
 */
export const canEditMessage = (message: MessageResponseDTO, isCurrentUser: boolean): boolean => {
  return isCurrentUser && message.is_mine && !message.is_deleted;
};

/**
 * Helper to check if message can be deleted by current user
 * (Only sender can delete their own messages)
 */
export const canDeleteMessage = (message: MessageResponseDTO, isCurrentUser: boolean): boolean => {
  return isCurrentUser && message.is_mine;
};

/**
 * Helper to check if message can be marked as seen by current user
 * (Only receiver can mark as seen, and only if not already seen and not deleted)
 */
export const canMarkAsSeen = (
  message: MessageResponseDTO, 
  isCurrentUser: boolean, 
  isReceiver: boolean
): boolean => {
  return isCurrentUser && isReceiver && !message.is_mine && message.status !== "SEEN" && !message.is_deleted;
};