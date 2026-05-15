import { useState, useRef, useEffect } from 'react';
import { Image, X, Smile, AlertCircle, Send, Reply as ReplyIcon } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';
import { useQueryClient } from '@tanstack/react-query';
import { 
    useSendMessage, 
    useSendMessageWithImage, 
    useSendReplyMessageWithImage, 
    useSendReplyMessage 
} from '../../../../../apis/chat/messages/hooks';
import { SendMessageRequest, ReplyMessageRequest, MessageQueryResponseDTO } from '../../../../../apis/chat/messages/types';
import type { 
    MyRoomsHomePageListDto, 
    LastMessagePreview 
} from '../../../../../apis/chat/rooms/types';

interface MessageInputProps {
    darkmode: boolean;
    roomId: string | null;
    onMessageSent?: () => void;
    replyingTo?: MessageQueryResponseDTO | null;
    onCancelReply?: () => void;
}

const MessageInput = ({ 
    darkmode, 
    roomId, 
    onMessageSent,
    replyingTo,
    onCancelReply 
}: MessageInputProps) => {
    const [newMessage, setNewMessage] = useState('');
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [showImageContentHint, setShowImageContentHint] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const emojiPickerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    
    const queryClient = useQueryClient();
    
    // Regular message mutations
    const { mutateAsync: sendMessage, isPending: isSendingText } = useSendMessage(roomId || undefined);
    const { mutateAsync: sendMessageWithImage, isPending: isSendingImage } = useSendMessageWithImage(roomId || undefined);
    
    // Reply message mutations
    const { mutateAsync: sendReplyMessage, isPending: isSendingReply } = useSendReplyMessage(roomId || undefined);
    const { mutateAsync: sendReplyMessageWithImage, isPending: isSendingReplyImage } = useSendMessageWithImage(roomId || undefined);
    
    const isSending = isSendingText || isSendingImage || isSendingReply || isSendingReplyImage;
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
                setShowEmojiPicker(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    
    useEffect(() => {
        if (showImageContentHint) {
            const timer = setTimeout(() => setShowImageContentHint(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [showImageContentHint]);

    // Focus input when reply mode is activated
    useEffect(() => {
        if (replyingTo) {
            inputRef.current?.focus();
        }
    }, [replyingTo]);
    
    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.type.startsWith('image/')) return;
            if (file.size > 5 * 1024 * 1024) return;
            setSelectedImage(file);
            const preview = URL.createObjectURL(file);
            setImagePreview(preview);
        }
    };
    
    const clearSelectedImage = () => {
        if (imagePreview) URL.revokeObjectURL(imagePreview);
        setSelectedImage(null);
        setImagePreview(null);
        setShowImageContentHint(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };
    
    const onEmojiClick = (emojiObject: any) => {
        setNewMessage(prev => prev + emojiObject.emoji);
        setShowEmojiPicker(false);
        inputRef.current?.focus();
    };
    
    const buildImageFormData = (isReply: boolean = false): FormData => {
        const formData = new FormData();
        formData.append('room_id', roomId!);
        if (isReply && replyingTo) {
            formData.append('parent_id', replyingTo.id);
        }
        if (newMessage.trim()) formData.append('content', newMessage.trim());
        formData.append('image', selectedImage!);
        return formData;
    };
    
    const handleSendMessage = async () => {
        if (!roomId) return;
        if ((!newMessage.trim() && !selectedImage)) return;
        if (selectedImage && !newMessage.trim()) {
            setShowImageContentHint(true);
            return;
        }
        
        try {
            let sentMessage: any;

            // Determine if sending a reply or regular message
            const isReply = !!replyingTo;

            if (selectedImage) {
                const formData = buildImageFormData(isReply);
                if (isReply) {
                    sentMessage = await sendReplyMessageWithImage(formData);
                } else {
                    sentMessage = await sendMessageWithImage(formData);
                }
            } else if (newMessage.trim()) {
                if (isReply) {
                    const request: ReplyMessageRequest = {
                        room_id: roomId,
                        parent_id: replyingTo!.id,
                        content: newMessage.trim()
                    };
                    sentMessage = await sendReplyMessage(request);
                } else {
                    const request: SendMessageRequest = {
                        room_id: roomId,
                        content: newMessage.trim()
                    };
                    sentMessage = await sendMessage(request);
                }
            }

            // === OPTIMISTIC CACHE UPDATE ===
            if (sentMessage && roomId) {
                const now = new Date().toISOString();
                
                const lastMessageForRoom: LastMessagePreview = {
                    id: sentMessage.id,
                    room_id: roomId,
                    content: sentMessage.content || null,
                    is_mine: true,
                    has_image: !!sentMessage.image_url || !!selectedImage,
                    image_url: sentMessage.image_url || null,
                    created_at: sentMessage.created_at || now,
                    status: sentMessage.status || 'sent',
                    sender_username: sentMessage.sender_username || '',
                };

                queryClient.setQueryData<MyRoomsHomePageListDto[]>(
                    ['rooms', 'home'],
                    (oldRooms) => {
                        if (!oldRooms) return oldRooms;
                        return oldRooms.map((room) => {
                            if (room.room_id === roomId) {
                                return {
                                    ...room,
                                    last_message: lastMessageForRoom,
                                    last_activity_at: now,
                                    my_unread_messages_in_room: 0,
                                };
                            }
                            return room;
                        });
                    }
                );
            }
            
            // Reset form and reply state
            setNewMessage('');
            clearSelectedImage();
            if (onCancelReply) onCancelReply();
            
            if (onMessageSent) onMessageSent();
        } catch (error) {
            console.error('Failed to send message:', error);
        }
    };
    
    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };
    
    const canSend = (newMessage.trim().length > 0 || selectedImage) && !isSending;
    const isImageOnly = selectedImage && !newMessage.trim();
    
    // Get preview text for the message being replied to
    const getReplyPreviewText = () => {
        if (!replyingTo) return '';
        if (replyingTo.has_image && replyingTo.image_url) {
            return replyingTo.content ? `📷 ${replyingTo.content}` : '📷 Photo';
        }
        return replyingTo.content || '';
    };
    
    return (
        <div className="flex-shrink-0 p-4 dark:border-gray-800 bg-inherit">
            {/* Reply Preview Bar */}
            {replyingTo && (
                <div className={`
                    mb-3 p-3 rounded-lg border-l-4 flex items-start gap-2
                    ${darkmode 
                        ? 'bg-gray-800/50 border-purple-500' 
                        : 'bg-gray-100 border-purple-500'
                    }
                `}>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <ReplyIcon className="w-3.5 h-3.5 text-purple-500 flex-shrink-0" />
                            <span className={`text-xs font-medium ${darkmode ? 'text-gray-300' : 'text-gray-700'}`}>
                                Replying to {replyingTo.sender_username}
                            </span>
                        </div>
                        <p className={`text-sm truncate ${darkmode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {getReplyPreviewText()}
                        </p>
                    </div>
                    <button
                        onClick={onCancelReply}
                        className={`
                            p-1 rounded-full flex-shrink-0 transition-colors
                            ${darkmode 
                                ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-200' 
                                : 'hover:bg-gray-200 text-gray-500 hover:text-gray-700'
                            }
                        `}
                        title="Cancel reply"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}
            
            {imagePreview && (
                <div className="mb-3 relative inline-block">
                    <div className="relative group">
                        <img 
                            src={imagePreview} 
                            alt="Preview" 
                            className="w-20 h-20 rounded-lg object-cover border-2 border-purple-500"
                        />
                        <button
                            onClick={clearSelectedImage}
                            className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
            
            {showImageContentHint && (
                <div className={`
                    mb-2 px-3 py-2 rounded-lg text-sm flex items-center gap-2
                    ${darkmode ? 'bg-yellow-900/50 text-yellow-200' : 'bg-yellow-100 text-yellow-800'}
                    animate-pulse
                `}>
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>Please add a message to send with your image</span>
                </div>
            )}
            
            {/* Input Container with integrated buttons */}
            <div className="relative z-40">
                <div className={`
                    flex items-center gap-2 rounded-full border transition-all
                    ${darkmode 
                        ? 'bg-gray-800 border-gray-700 focus-within:ring-2 focus-within:ring-purple-500' 
                        : 'bg-gray-100 border-gray-300 focus-within:ring-2 focus-within:ring-purple-500'
                    }
                    ${isImageOnly ? 'ring-2 ring-yellow-500/50' : ''}
                `}>
                    {/* Hidden file input */}
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageSelect}
                        accept="image/*"
                        className="hidden"
                    />
                    
                    {/* Image Attachment Button */}
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isSending}
                        className={`
                            p-2 ml-2 rounded-full transition-all duration-300 flex-shrink-0
                            ${darkmode 
                                ? 'hover:bg-gray-700 text-gray-400 hover:text-purple-400' 
                                : 'hover:bg-gray-200 text-gray-500 hover:text-purple-500'
                            }
                            ${isSending ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                        `}
                        title="Attach image"
                    >
                        <Image className="w-5 h-5" />
                    </button>
                    
                    {/* Text Input */}
                    <input
                        ref={inputRef}
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder={
                            replyingTo 
                                ? "Reply..." 
                                : selectedImage 
                                    ? "Add a message to send with your image..." 
                                    : "Type a message..."
                        }
                        disabled={isSending}
                        className={`
                            flex-1 py-2 bg-transparent focus:outline-none text-sm
                            ${darkmode 
                                ? 'text-white placeholder-gray-400' 
                                : 'text-gray-900 placeholder-gray-500'
                            }
                            ${isSending ? 'opacity-70 cursor-not-allowed' : ''}
                        `}
                    />
                    
                    {/* Emoji Picker Button */}
                    <div className="relative" ref={emojiPickerRef}>
                        <button
                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                            disabled={isSending}
                            className={`
                                p-2 rounded-full transition-all duration-300 flex-shrink-0
                                ${darkmode 
                                    ? 'hover:bg-gray-700 text-gray-400 hover:text-yellow-400' 
                                    : 'hover:bg-gray-200 text-gray-500 hover:text-yellow-500'
                                }
                                ${showEmojiPicker ? (darkmode ? 'bg-gray-700 text-yellow-400' : 'bg-gray-200 text-yellow-500') : ''}
                                ${isSending ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                            `}
                            title="Select emoji"
                        >
                            <Smile className="w-5 h-5" />
                        </button>
                        
                        {showEmojiPicker && (
                            <div className="absolute bottom-full mb-2 right-0 z-[100]">
                                <EmojiPicker
                                    onEmojiClick={onEmojiClick}
                                    autoFocusSearch={false}
                                    width={350}
                                    height={400}
                                    searchPlaceholder="Search emojis..."
                                    lazyLoadEmojis={true}
                                />
                            </div>
                        )}
                    </div>
                    
                    {/* Send Button */}
                    <button
                        onClick={handleSendMessage}
                        disabled={!canSend}
                        className={`
                            p-2 mr-2 rounded-full transition-all duration-300 flex-shrink-0
                            ${canSend && !isSending
                                ? darkmode
                                    ? 'bg-purple-600 text-white hover:bg-purple-700 hover:scale-105'
                                    : 'bg-purple-500 text-white hover:bg-purple-600 hover:scale-105'
                                : darkmode
                                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            }
                        `}
                        title={isImageOnly ? "Add a message to send with your image" : replyingTo ? "Send reply" : "Send message"}
                    >
                        {isSending ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                        ) : (
                            <Send className="w-5 h-5" />
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MessageInput;