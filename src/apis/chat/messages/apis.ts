// service2/my-frontend/src/apis/chat/messages/api.ts

import { AxiosError } from 'axios';
import { chatClient } from '../../client';
import {
  // Request types
  SendMessageRequest,
  ReplyMessageRequest,
  SendMessageWithImageFormData,
  ReplyMessageWithImageFormData,
  UpdateMessageContentRequest,
  // Response types
  MessageQueryResponseDTO,
  MessageCommandActionsResponse,
} from './types';

// =============================================================================
// MESSAGE COMMAND APIs (POST/PATCH/DELETE) - Mutations
// =============================================================================

/**
 * Send a new text-only message to a room
 * POST /api/messages (application/json)
 * 
 * @param data - Request payload with room_id and content
 * @returns MessageCommandActionsResponse with absolute image URLs
 */
export const sendMessage = async (
  data: SendMessageRequest
): Promise<MessageCommandActionsResponse> => {
  try {
    const response = await chatClient.post<MessageCommandActionsResponse>(
      '/messages',
      data
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error('Send message failed:', error.response?.data || error.message);
    }
    throw error;
  }
};

/**
 * Send a new message with an image attachment
 * POST /api/messages/with-image (multipart/form-data)
 * 
 * @param formData - FormData with room_id, optional content, and image file
 * @returns MessageCommandActionsResponse with absolute image URLs
 */
export const sendMessageWithImage = async (
  formData: FormData
): Promise<MessageCommandActionsResponse> => {
  try {
    const response = await chatClient.post<MessageCommandActionsResponse>(
      '/messages/with-image',
      formData
      // Content-Type header auto-set by browser for FormData with boundary
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error('Send message with image failed:', error.response?.data || error.message);
    }
    throw error;
  }
};

/**
 * Send a reply message (text only) to an existing message
 * POST /api/messages/reply (application/json)
 * 
 * @param data - Request payload with room_id, content, and parent_id
 * @returns MessageCommandActionsResponse with parent_preview and absolute image URLs
 */
export const sendReplyMessage = async (
  data: ReplyMessageRequest
): Promise<MessageCommandActionsResponse> => {
  try {
    const response = await chatClient.post<MessageCommandActionsResponse>(
      '/messages/reply',
      data
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error('Send reply message failed:', error.response?.data || error.message);
    }
    throw error;
  }
};

/**
 * Send a reply message with an image attachment
 * POST /api/messages/reply/with-image (multipart/form-data)
 * 
 * @param formData - FormData with room_id, parent_id, optional content, and image file
 * @returns MessageCommandActionsResponse with parent_preview and absolute image URLs
 */
export const sendReplyMessageWithImage = async (
  formData: FormData
): Promise<MessageCommandActionsResponse> => {
  try {
    const response = await chatClient.post<MessageCommandActionsResponse>(
      '/messages/reply/with-image',
      formData
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error('Send reply with image failed:', error.response?.data || error.message);
    }
    throw error;
  }
};

/**
 * Soft-delete a message (sender only)
 * DELETE /api/messages/{messageId}
 * 
 * @param messageId - UUID of the message to delete
 * @returns MessageCommandActionsResponse with is_deleted=true
 */
export const deleteMessage = async (
  messageId: string
): Promise<MessageCommandActionsResponse> => {
  try {
    const response = await chatClient.delete<MessageCommandActionsResponse>(
      `/messages/${messageId}`
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error('Delete message failed:', error.response?.data || error.message);
    }
    throw error;
  }
};

/**
 * Mark a message as RECEIVED (receiver only)
 * PATCH /api/messages/{messageId}/received
 * 
 * @param messageId - UUID of the message to mark
 * @returns MessageCommandActionsResponse with status="RECEIVED"
 */
export const markMessageAsReceived = async (
  messageId: string
): Promise<MessageCommandActionsResponse> => {
  try {
    const response = await chatClient.patch<MessageCommandActionsResponse>(
      `/messages/${messageId}/received`
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error('Mark as received failed:', error.response?.data || error.message);
    }
    throw error;
  }
};

/**
 * Mark a message as SEEN (receiver only)
 * PATCH /api/messages/{messageId}/seen
 * 
 * @param messageId - UUID of the message to mark
 * @returns MessageCommandActionsResponse with status="SEEN"
 */
export const markMessageAsSeen = async (
  messageId: string
): Promise<MessageCommandActionsResponse> => {
  try {
    const response = await chatClient.patch<MessageCommandActionsResponse>(
      `/messages/${messageId}/seen`
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error('Mark as seen failed:', error.response?.data || error.message);
    }
    throw error;
  }
};

/**
 * Update message text content (sender only)
 * PATCH /api/messages/{messageId}/content (application/json)
 * 
 * @param messageId - UUID of the message to update
 * @param data - Request payload with new_content
 * @returns MessageCommandActionsResponse with updated content
 */
export const updateMessageContent = async (
  messageId: string,
  data: UpdateMessageContentRequest
): Promise<MessageCommandActionsResponse> => {
  try {
    const response = await chatClient.patch<MessageCommandActionsResponse>(
      `/messages/${messageId}/content`,
      data
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error('Update message content failed:', error.response?.data || error.message);
    }
    throw error;
  }
};

/**
 * Update message image attachment (sender only)
 * PATCH /api/messages/{messageId}/image (multipart/form-data)
 * 
 * @param messageId - UUID of the message to update
 * @param formData - FormData with image file, OR use remove=true to clear
 * @param remove - If true, clears the image instead of uploading new one
 * @returns MessageCommandActionsResponse with updated image_url and has_image
 */
export const updateMessageImage = async (
  messageId: string,
  formData: FormData,
  remove?: boolean
): Promise<MessageCommandActionsResponse> => {
  try {
    const url = `/messages/${messageId}/image${remove ? '?remove=true' : ''}`;
    const response = await chatClient.patch<MessageCommandActionsResponse>(
      url,
      formData
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error('Update message image failed:', error.response?.data || error.message);
    }
    throw error;
  }
};

// =============================================================================
// MESSAGE QUERY APIs (GET) - Reads
// =============================================================================

/**
 * Fetch all active messages for a room (chat history)
 * GET /api/messages/room/{roomId}
 * 
 * @param roomId - UUID of the room to query
 * @returns Array of MessageQueryResponseDTO with absolute image URLs, ordered by created_at ascending
 */
export const getMessagesByRoomId = async (
  roomId: string
): Promise<MessageQueryResponseDTO[]> => {
  try {
    const response = await chatClient.get<MessageQueryResponseDTO[]>(
      `/messages/room/${roomId}`
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error('Fetch messages failed:', error.response?.data || error.message);
    }
    throw error;
  }
};

// =============================================================================
// Helper Functions for FormData Construction
// =============================================================================

/**
 * Build FormData for sending a message with image
 * Usage: const formData = buildSendMessageWithImageFormData({ room_id: "...", content: "...", image: file })
 */
export const buildSendMessageWithImageFormData = (
  data: SendMessageWithImageFormData
): FormData => {
  const formData = new FormData();
  formData.append('room_id', data.room_id);
  if (data.content !== undefined && data.content !== '') {
    formData.append('content', data.content);
  }
  formData.append('image', data.image);
  return formData;
};

/**
 * Build FormData for sending a reply message with image
 * Usage: const formData = buildReplyMessageWithImageFormData({ room_id: "...", parent_id: "...", content: "...", image: file })
 */
export const buildReplyMessageWithImageFormData = (
  data: ReplyMessageWithImageFormData
): FormData => {
  const formData = new FormData();
  formData.append('room_id', data.room_id);
  formData.append('parent_id', data.parent_id);
  if (data.content !== undefined && data.content !== '') {
    formData.append('content', data.content);
  }
  formData.append('image', data.image);
  return formData;
};

/**
 * Build FormData for updating a message image
 * Usage: const formData = buildMessageImageUpdateFormData(file)
 */
export const buildMessageImageUpdateFormData = (file: File): FormData => {
  const formData = new FormData();
  formData.append('image', file);
  return formData;
};