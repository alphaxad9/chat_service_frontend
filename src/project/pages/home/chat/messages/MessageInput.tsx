// src/project/pages/chat/components/MessageInput.tsx
import { useState, useRef, useEffect } from 'react';
import { Image, X, Smile } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';
import { useSendMessage } from '../../../../../apis/chat/messages/hooks';
import { SendMessageRequest } from '../../../../../apis/chat/messages/types';

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
    const fileInputRef = useRef<HTMLInputElement>(null);
    const emojiPickerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    
    // Send message mutation
    const { mutate: sendMessage, isPending: isSending } = useSendMessage(roomId || undefined);
    
    // Close emoji picker when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
                setShowEmojiPicker(false);
            }
        };
        
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    
    // Handle image selection
    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                alert('Please select an image file');
                return;
            }
            
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert('Image size should be less than 5MB');
                return;
            }
            
            setSelectedImage(file);
            const preview = URL.createObjectURL(file);
            setImagePreview(preview);
        }
    };
    
    // Clear selected image
    const clearSelectedImage = () => {
        if (imagePreview) {
            URL.revokeObjectURL(imagePreview);
        }
        setSelectedImage(null);
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };
    
    // Handle emoji selection
    const onEmojiClick = (emojiObject: any) => {
        setNewMessage(prev => prev + emojiObject.emoji);
        setShowEmojiPicker(false);
        inputRef.current?.focus();
    };
    
    // Handle send message
    const handleSendMessage = async () => {
        if (!roomId) return;
        
        // Don't send if no content and no image
        if ((!newMessage.trim() && !selectedImage)) return;
        
        try {
            if (selectedImage) {
                // TODO: Implement image sending when you have the API endpoint
                console.log('Image sending not implemented yet');
                // const formData = new FormData();
                // formData.append('room_id', roomId);
                // formData.append('image', selectedImage);
                // if (newMessage.trim()) {
                //     formData.append('content', newMessage);
                // }
                // await sendMessageWithImage(formData);
            } else if (newMessage.trim()) {
                // Send text message
                const request: SendMessageRequest = {
                    room_id: roomId,
                    content: newMessage.trim()
                };
                
                await sendMessage(request);
            }
            
            // Clear input and image
            setNewMessage('');
            clearSelectedImage();
            
            // Trigger refetch if provided
            if (onMessageSent) {
                onMessageSent();
            }
        } catch (error) {
            console.error('Failed to send message:', error);
            alert('Failed to send message. Please try again.');
        }
    };
    
    // Handle key press (Enter to send)
    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };
    
    const canSend = (newMessage.trim() || selectedImage) && !isSending;
    
    return (
        <div className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-gray-800 bg-inherit">
            {/* Image Preview */}
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
            
            {/* ✅ Added z-40 to ensure this container is above sidebar */}
            <div className="flex gap-2 relative z-40">
                {/* Image Upload Button */}
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageSelect}
                    accept="image/*"
                    className="hidden"
                />
                <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isSending}
                    className={`
                        p-2 rounded-full transition-all duration-300 flex-shrink-0
                        ${darkmode 
                            ? 'hover:bg-gray-800 text-gray-400 hover:text-purple-400' 
                            : 'hover:bg-gray-100 text-gray-500 hover:text-purple-500'
                        }
                        ${isSending ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    `}
                    title="Attach image"
                >
                    <Image className="w-5 h-5" />
                </button>
                
                {/* ✅ Emoji Picker Container - Increased z-index */}
                <div className="relative z-[100]" ref={emojiPickerRef}>
                    <button
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        disabled={isSending}
                        className={`
                            p-2 rounded-full transition-all duration-300 flex-shrink-0
                            ${darkmode 
                                ? 'hover:bg-gray-800 text-gray-400 hover:text-yellow-400' 
                                : 'hover:bg-gray-100 text-gray-500 hover:text-yellow-500'
                            }
                            ${showEmojiPicker ? (darkmode ? 'bg-gray-800 text-yellow-400' : 'bg-gray-100 text-yellow-500') : ''}
                            ${isSending ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                        `}
                        title="Select emoji"
                    >
                        <Smile className="w-5 h-5" />
                    </button>
                    
                    {/* ✅ Emoji Picker - Increased z-index and adjusted positioning */}
                    {showEmojiPicker && (
                        <div className="absolute bottom-full mb-2 left-0 z-[100]">
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
                
                {/* Message Input */}
                <input
                    ref={inputRef}
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={selectedImage ? "Add caption (optional)..." : "Type a message..."}
                    disabled={isSending}
                    className={`
                        flex-1 px-4 py-2 rounded-full border focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all
                        ${darkmode 
                            ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400' 
                            : 'bg-gray-100 border-gray-300 text-gray-900 placeholder-gray-500'
                        }
                        ${isSending ? 'opacity-70 cursor-not-allowed' : ''}
                    `}
                />
                
                {/* Send Button */}
                <button
                    onClick={handleSendMessage}
                    disabled={!canSend}
                    className={`
                        px-6 py-2 rounded-full font-semibold transition-all duration-300 flex-shrink-0
                        ${canSend && !isSending
                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg transform hover:scale-105'
                            : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                        }
                    `}
                >
                    {isSending ? (
                        <div className="flex items-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                            <span>Sending</span>
                        </div>
                    ) : (
                        'Send'
                    )}
                </button>
            </div>
        </div>
    );
};

export default MessageInput;