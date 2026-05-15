import { useState, useRef, useEffect } from 'react';
import { Image, X, Smile, AlertCircle, Send } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';
import { useQueryClient } from '@tanstack/react-query';
import { useSendMessage, useSendMessageWithImage } from '../../../../../apis/chat/messages/hooks';
import { SendMessageRequest } from '../../../../../apis/chat/messages/types';
import type { 
    MyRoomsHomePageListDto, 
    LastMessagePreview 
} from '../../../../../apis/chat/rooms/types';

interface MessageInputProps {
    darkmode: boolean;
    roomId: string | null;
    onMessageSent?: () => void; 
}

const MessageInput = ({ darkmode, roomId, onMessageSent }: MessageInputProps) => {
    const [newMessage, setNewMessage] = useState('');
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [showImageContentHint, setShowImageContentHint] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const emojiPickerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    
    const queryClient = useQueryClient();
    
    const { mutateAsync: sendMessage, isPending: isSendingText } = useSendMessage(roomId || undefined);
    const { mutateAsync: sendMessageWithImage, isPending: isSendingImage } = useSendMessageWithImage(roomId || undefined);
    
    const isSending = isSendingText || isSendingImage;
    
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
    
    const buildImageFormData = (): FormData => {
        const formData = new FormData();
        formData.append('room_id', roomId!);
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

            if (selectedImage) {
                const formData = buildImageFormData();
                sentMessage = await sendMessageWithImage(formData);
            } else if (newMessage.trim()) {
                const request: SendMessageRequest = {
                    room_id: roomId,
                    content: newMessage.trim()
                };
                sentMessage = await sendMessage(request);
            }

            // === OPTIMISTIC CACHE UPDATE ===
            if (sentMessage && roomId) {
                const now = new Date().toISOString();
                
                // Build LastMessagePreview with ALL required fields from your types.ts
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
            setNewMessage('');
            clearSelectedImage();
            
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
    
    return (
        <div className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-gray-800 bg-inherit">
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
                        placeholder={selectedImage ? "Add a message to send with your image..." : "Type a message..."}
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
                        title={isImageOnly ? "Add a message to send with your image" : "Send message"}
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