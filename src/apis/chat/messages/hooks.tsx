// service2/my-frontend/src/apis/chat/messages/hooks.tsx

import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import {
  // Command mutations
  sendMessage,
  sendMessageWithImage,
  sendReplyMessage,
  sendReplyMessageWithImage,
  deleteMessage,
  markMessageAsReceived,
  markMessageAsSeen,
  updateMessageContent,
  updateMessageImage,
  // Query reads
  getMessagesByRoomId,
  // Helpers
  buildSendMessageWithImageFormData,
  buildReplyMessageWithImageFormData,
  buildMessageImageUpdateFormData,
} from './apis';
import {
  // Request types
  SendMessageRequest,
  ReplyMessageRequest,
  SendMessageWithImageFormData,
  ReplyMessageWithImageFormData,
  UpdateMessageContentRequest,
  // Response types
  MessageQueryResponseDTO,
} from './types';

// =============================================================================
// QUERY HOOKS (GET endpoints)
// =============================================================================

/**
 * Fetch all active messages for a room (chat history)
 * GET /api/messages/room/{roomId}
 * 
 * @param roomId - UUID of the room to query (pass null/undefined to disable query)
 * @param options - Optional React Query options
 */
export const useMessagesByRoomId = (
  roomId: string | null | undefined,
  options?: Omit<UseQueryOptions<MessageQueryResponseDTO[], Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['messages', 'room', roomId],
    queryFn: () => getMessagesByRoomId(roomId as string),
    enabled: !!roomId,
    ...options,
  });
};

// =============================================================================
// MUTATION HOOKS (POST/PATCH/DELETE endpoints)
// =============================================================================

/**
 * Send a new text-only message to a room
 * POST /api/messages (application/json)
 * 
 * Invalidates: ['messages', 'room', roomId]
 */
export const useSendMessage = (roomId?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: SendMessageRequest) => sendMessage(data),
    onSuccess: (response) => {
      if (roomId) {
        queryClient.invalidateQueries({ queryKey: ['messages', 'room', roomId] });
      }
      // Also invalidate if response contains different room_id
      if (response.room_id) {
        queryClient.invalidateQueries({ queryKey: ['messages', 'room', response.room_id] });
      }
    },
  });
};

/**
 * Send a new message with an image attachment
 * POST /api/messages/with-image (multipart/form-data)
 * 
 * Invalidates: ['messages', 'room', roomId]
 */
export const useSendMessageWithImage = (roomId?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formData: FormData) => sendMessageWithImage(formData),
    onSuccess: (response) => {
      if (roomId) {
        queryClient.invalidateQueries({ queryKey: ['messages', 'room', roomId] });
      }
      if (response.room_id) {
        queryClient.invalidateQueries({ queryKey: ['messages', 'room', response.room_id] });
      }
    },
  });
};

/**
 * Send a reply message (text only) to an existing message
 * POST /api/messages/reply (application/json)
 * 
 * Invalidates: ['messages', 'room', roomId]
 */
export const useSendReplyMessage = (roomId?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ReplyMessageRequest) => sendReplyMessage(data),
    onSuccess: (response) => {
      if (roomId) {
        queryClient.invalidateQueries({ queryKey: ['messages', 'room', roomId] });
      }
      if (response.room_id) {
        queryClient.invalidateQueries({ queryKey: ['messages', 'room', response.room_id] });
      }
    },
  });
};

/**
 * Send a reply message with an image attachment
 * POST /api/messages/reply/with-image (multipart/form-data)
 * 
 * Invalidates: ['messages', 'room', roomId]
 */
export const useSendReplyMessageWithImage = (roomId?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formData: FormData) => sendReplyMessageWithImage(formData),
    onSuccess: (response) => {
      if (roomId) {
        queryClient.invalidateQueries({ queryKey: ['messages', 'room', roomId] });
      }
      if (response.room_id) {
        queryClient.invalidateQueries({ queryKey: ['messages', 'room', response.room_id] });
      }
    },
  });
};

/**
 * Soft-delete a message (sender only)
 * DELETE /api/messages/{messageId}
 * 
 * Invalidates: ['messages', 'room', *] for the message's room
 */
export const useDeleteMessage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (messageId: string) => deleteMessage(messageId),
    onSuccess: (response) => {
      // Invalidate the room's message list since message state changed
      if (response.room_id) {
        queryClient.invalidateQueries({ queryKey: ['messages', 'room', response.room_id] });
      }
    },
  });
};

/**
 * Mark a message as RECEIVED (receiver only)
 * PATCH /api/messages/{messageId}/received
 * 
 * Invalidates: ['messages', 'room', roomId] for real-time status sync
 */
export const useMarkMessageAsReceived = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (messageId: string) => markMessageAsReceived(messageId),
    onSuccess: (response) => {
      if (response.room_id) {
        queryClient.invalidateQueries({ queryKey: ['messages', 'room', response.room_id] });
      }
    },
  });
};

/**
 * Mark a message as SEEN (receiver only)
 * PATCH /api/messages/{messageId}/seen
 * 
 * Invalidates: ['messages', 'room', roomId] for real-time status sync
 */
export const useMarkMessageAsSeen = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (messageId: string) => markMessageAsSeen(messageId),
    onSuccess: (response) => {
      if (response.room_id) {
        queryClient.invalidateQueries({ queryKey: ['messages', 'room', response.room_id] });
      }
    },
  });
};

/**
 * Update message text content (sender only)
 * PATCH /api/messages/{messageId}/content (application/json)
 * 
 * Invalidates: ['messages', 'room', roomId] for optimistic UI updates
 */
export const useUpdateMessageContent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ messageId, data }: { messageId: string; data: UpdateMessageContentRequest }) =>
      updateMessageContent(messageId, data),
    onSuccess: (response) => {
      if (response.room_id) {
        queryClient.invalidateQueries({ queryKey: ['messages', 'room', response.room_id] });
      }
    },
  });
};

/**
 * Update message image attachment (sender only)
 * PATCH /api/messages/{messageId}/image (multipart/form-data)
 * 
 * Invalidates: ['messages', 'room', roomId] for image preview updates
 */
export const useUpdateMessageImage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      messageId,
      formData,
      remove,
    }: {
      messageId: string;
      formData: FormData;
      remove?: boolean;
    }) => updateMessageImage(messageId, formData, remove),
    onSuccess: (response) => {
      if (response.room_id) {
        queryClient.invalidateQueries({ queryKey: ['messages', 'room', response.room_id] });
      }
    },
  });
};

// =============================================================================
// COMPOSITE HOOKS (Convenience wrappers for common patterns)
// =============================================================================

/**
 * Hook for sending a message with image using typed form data
 * Automatically builds FormData from SendMessageWithImageFormData object
 * 
 * @param roomId - Optional room ID for query invalidation
 */
export const useSendMessageWithImageFormData = (roomId?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: SendMessageWithImageFormData) =>
      sendMessageWithImage(buildSendMessageWithImageFormData(data)),
    onSuccess: (response) => {
      if (roomId) {
        queryClient.invalidateQueries({ queryKey: ['messages', 'room', roomId] });
      }
      if (response.room_id) {
        queryClient.invalidateQueries({ queryKey: ['messages', 'room', response.room_id] });
      }
    },
  });
};

/**
 * Hook for sending a reply message with image using typed form data
 * Automatically builds FormData from ReplyMessageWithImageFormData object
 * 
 * @param roomId - Optional room ID for query invalidation
 */
export const useSendReplyMessageWithImageFormData = (roomId?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ReplyMessageWithImageFormData) =>
      sendReplyMessageWithImage(buildReplyMessageWithImageFormData(data)),
    onSuccess: (response) => {
      if (roomId) {
        queryClient.invalidateQueries({ queryKey: ['messages', 'room', roomId] });
      }
      if (response.room_id) {
        queryClient.invalidateQueries({ queryKey: ['messages', 'room', response.room_id] });
      }
    },
  });
};

/**
 * Hook for updating a message image with File object
 * Automatically builds FormData from File
 */
export const useUpdateMessageImageWithFile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      messageId,
      file,
      remove,
    }: {
      messageId: string;
      file?: File;
      remove?: boolean;
    }) => {
      if (remove) {
        return updateMessageImage(messageId, new FormData(), true);
      }
      if (!file) {
        throw new Error('Either file or remove=true must be provided');
      }
      return updateMessageImage(messageId, buildMessageImageUpdateFormData(file), false);
    },
    onSuccess: (response) => {
      if (response.room_id) {
        queryClient.invalidateQueries({ queryKey: ['messages', 'room', response.room_id] });
      }
    },
  });
};

/**
 * Composite hook for sending any message type (text, image, reply)
 * Provides a unified interface with automatic FormData handling
 */
export const useSendAnyMessage = (roomId?: string) => {
  const queryClient = useQueryClient();
  
  const sendText = useMutation({
    mutationFn: (data: SendMessageRequest) => sendMessage(data),
    onSuccess: (response) => {
      if (roomId || response.room_id) {
        queryClient.invalidateQueries({ queryKey: ['messages', 'room', roomId || response.room_id] });
      }
    },
  });
  
  const sendImage = useMutation({
    mutationFn: (data: SendMessageWithImageFormData) =>
      sendMessageWithImage(buildSendMessageWithImageFormData(data)),
    onSuccess: (response) => {
      if (roomId || response.room_id) {
        queryClient.invalidateQueries({ queryKey: ['messages', 'room', roomId || response.room_id] });
      }
    },
  });
  
  const sendReply = useMutation({
    mutationFn: (data: ReplyMessageRequest) => sendReplyMessage(data),
    onSuccess: (response) => {
      if (roomId || response.room_id) {
        queryClient.invalidateQueries({ queryKey: ['messages', 'room', roomId || response.room_id] });
      }
    },
  });
  
  const sendReplyImage = useMutation({
    mutationFn: (data: ReplyMessageWithImageFormData) =>
      sendReplyMessageWithImage(buildReplyMessageWithImageFormData(data)),
    onSuccess: (response) => {
      if (roomId || response.room_id) {
        queryClient.invalidateQueries({ queryKey: ['messages', 'room', roomId || response.room_id] });
      }
    },
  });
  
  return {
    sendText,
    sendImage,
    sendReply,
    sendReplyImage,
    // Unified mutate function for dynamic dispatch
    mutate: (payload: 
      | { type: 'text'; data: SendMessageRequest }
      | { type: 'image'; data: SendMessageWithImageFormData }
      | { type: 'reply'; data: ReplyMessageRequest }
      | { type: 'reply-image'; data: ReplyMessageWithImageFormData }
    ) => {
      switch (payload.type) {
        case 'text': return sendText.mutateAsync(payload.data);
        case 'image': return sendImage.mutateAsync(payload.data);
        case 'reply': return sendReply.mutateAsync(payload.data);
        case 'reply-image': return sendReplyImage.mutateAsync(payload.data);
      }
    },
  };
};

// =============================================================================
// TYPE UTILITIES FOR HOOK RETURN VALUES
// =============================================================================

export type UseMessagesByRoomIdReturn = ReturnType<typeof useMessagesByRoomId>;
export type UseSendMessageReturn = ReturnType<typeof useSendMessage>;
export type UseSendMessageWithImageReturn = ReturnType<typeof useSendMessageWithImage>;
export type UseSendReplyMessageReturn = ReturnType<typeof useSendReplyMessage>;
export type UseSendReplyMessageWithImageReturn = ReturnType<typeof useSendReplyMessageWithImage>;
export type UseDeleteMessageReturn = ReturnType<typeof useDeleteMessage>;
export type UseMarkMessageAsReceivedReturn = ReturnType<typeof useMarkMessageAsReceived>;
export type UseMarkMessageAsSeenReturn = ReturnType<typeof useMarkMessageAsSeen>;
export type UseUpdateMessageContentReturn = ReturnType<typeof useUpdateMessageContent>;
export type UseUpdateMessageImageReturn = ReturnType<typeof useUpdateMessageImage>;
export type UseSendMessageWithImageFormDataReturn = ReturnType<typeof useSendMessageWithImageFormData>;
export type UseSendReplyMessageWithImageFormDataReturn = ReturnType<typeof useSendReplyMessageWithImageFormData>;
export type UseUpdateMessageImageWithFileReturn = ReturnType<typeof useUpdateMessageImageWithFile>;
export type UseSendAnyMessageReturn = ReturnType<typeof useSendAnyMessage>;

// =============================================================================
// HELPER HOOKS FOR MESSAGE STATE MANAGEMENT
// =============================================================================

/**
 * Hook to optimistically update a message in the cache before server confirmation
 * Useful for delete/edit operations with rollback on error
 */
export const useOptimisticMessageUpdate = (roomId: string) => {
  const queryClient = useQueryClient();
  
  const getCacheKey = () => ['messages', 'room', roomId];
  
  const updateMessageInCache = (
    messageId: string,
    updater: (msg: MessageQueryResponseDTO) => MessageQueryResponseDTO
  ) => {
    queryClient.setQueryData<MessageQueryResponseDTO[]>(getCacheKey(), (old) => {
      if (!old) return old;
      return old.map((msg) => (msg.id === messageId ? updater(msg) : msg));
    });
  };
  
  const removeMessageFromCache = (messageId: string) => {
    queryClient.setQueryData<MessageQueryResponseDTO[]>(getCacheKey(), (old) => {
      if (!old) return old;
      return old.filter((msg) => msg.id !== messageId);
    });
  };
  
  return {
    updateMessageInCache,
    removeMessageFromCache,
    getCacheKey,
  };
};

/**
 * Hook to append a new message to the room's message list cache
 * Useful for WebSocket real-time message reception
 */
export const useAppendMessageToCache = (roomId: string) => {
  const queryClient = useQueryClient();
  
  const append = (newMessage: MessageQueryResponseDTO) => {
    queryClient.setQueryData<MessageQueryResponseDTO[]>(
      ['messages', 'room', roomId],
      (old) => {
        if (!old) return [newMessage];
        // Avoid duplicates by checking ID
        if (old.some((msg) => msg.id === newMessage.id)) return old;
        return [...old, newMessage];
      }
    );
  };
  
  const prepend = (newMessage: MessageQueryResponseDTO) => {
    queryClient.setQueryData<MessageQueryResponseDTO[]>(
      ['messages', 'room', roomId],
      (old) => {
        if (!old) return [newMessage];
        if (old.some((msg) => msg.id === newMessage.id)) return old;
        return [newMessage, ...old];
      }
    );
  };
  
  return { append, prepend };
};