// src/project/pages/chat/components/MessageArea.tsx
import { format } from 'date-fns';
import { useRef, useEffect } from 'react';
import { useMessagesByRoomId } from '../../../../../apis/chat/messages/hooks';
import { MessageQueryResponseDTO, getMessageDisplayText } from '../../../../../apis/chat/messages/types';
import MessageInput from './MessageInput';
import { Camera } from 'lucide-react';
import "../../feed.css"

interface MessageAreaProps {
    darkmode: boolean;
    roomId: string | null;
}

const MessageArea = ({ darkmode, roomId }: MessageAreaProps) => {
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    
    // Fetch messages from API
    const { 
        data: fetchedMessages, 
        isLoading, 
        error,
        refetch 
    } = useMessagesByRoomId(roomId, {
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        refetchInterval: 3000, // Poll every 3 seconds for new messages
    });

    // Scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [fetchedMessages]);

    // Handle refetch after sending message
    const handleMessageSent = () => {
        refetch();
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="flex flex-col h-full">
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
                        <p className="text-gray-500 dark:text-gray-400">Loading messages...</p>
                    </div>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="flex flex-col h-full">
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <div className="text-red-500 mb-4">
                            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">Failed to load messages</p>
                        <button 
                            onClick={() => refetch()} 
                            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Filter out deleted messages (optional - show them as "deleted")
    const activeMessages = fetchedMessages?.filter(msg => !msg.is_deleted) || [];

    return (
        <div className="flex flex-col h-full overflow-hidden">
            {/* Messages Area - Takes available space and scrolls with custom scrollbar */}
            <div 
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar"
                style={{ minHeight: 0 }} // Important for Firefox
            >
                {activeMessages.length === 0 && (
                    <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                        <div className="text-center">
                            <Camera className="w-16 h-16 mx-auto mb-4 opacity-50" />
                            <p className="text-lg font-medium mb-2">No messages yet</p>
                            <p className="text-sm">Start the conversation!</p>
                        </div>
                    </div>
                )}
                
                {activeMessages.map((message: MessageQueryResponseDTO) => (
                    <div
                        key={message.id}
                        className={`flex ${message.is_mine ? 'justify-end' : 'justify-start'} animate-fade-in`}
                    >
                        {/* Avatar for other users */}
                        {!message.is_mine && (
                            <div className="flex-shrink-0 mr-2 self-end mb-1">
                                {message.sender_profile_image ? (
                                    <img 
                                        src={message.sender_profile_image} 
                                        alt={message.sender_username}
                                        className="w-8 h-8 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                                        <span className="text-white text-xs font-medium">
                                            {message.sender_username.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                )}
                            </div>
                        )}
                        
                        {/* Message Bubble */}
                        <div className="relative max-w-[70%]">
                            {/* Sender name for group chats (only for non-mine messages) */}
                            {!message.is_mine && (
                                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1 ml-2">
                                    {message.sender_username}
                                </div>
                            )}
                            
                            <div
                                className={`
                                    rounded-2xl px-4 py-2 transition-all duration-200
                                    ${message.is_mine
                                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                                        : darkmode
                                        ? 'bg-gray-800 text-gray-100'
                                        : 'bg-gray-100 text-gray-900'
                                    }
                                    ${message.is_reply ? 'mt-1' : ''}
                                `}
                            >
                                {/* Reply Preview (if message is a reply) */}
                                {message.is_reply && message.parent_preview && (
                                    <div className={`
                                        text-xs mb-1 pb-1 border-l-2 pl-2
                                        ${message.is_mine 
                                            ? 'border-white/30' 
                                            : darkmode 
                                                ? 'border-gray-600' 
                                                : 'border-gray-400'
                                        }
                                    `}>
                                        <span className="opacity-70">
                                            ↪ Replying to {message.parent_preview.creator_username}
                                        </span>
                                        <div className="truncate max-w-[200px]">
                                            {message.parent_preview.has_image ? `${<Camera className="w-16 h-5 mx-auto mb-4 " />} Photo` : message.parent_preview.content}
                                        </div>
                                    </div>
                                )}
                                
                                {/* Image Attachment */}
                                {message.has_image && message.image_url && (
                                    <div className="mb-2">
                                        <img 
                                            src={message.image_url} 
                                            alt="Message attachment"
                                            className="max-w-full rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                                            onClick={() => window.open(message.image_url!, '_blank')}
                                        />
                                    </div>
                                )}
                                
                                {/* Message Content */}
                                {message.content && (
                                    <p className="break-words whitespace-pre-wrap">
                                        {getMessageDisplayText(message)}
                                    </p>
                                )}
                                
                                {/* Message Metadata */}
                                <div className="flex items-center justify-end gap-1 mt-1">
                                    <span className="text-xs opacity-70">
                                        {message.created_at ? format(new Date(message.created_at), 'HH:mm') : ''}
                                    </span>
                                    
                                    {/* Status indicators for my messages */}
                                    {message.is_mine && (
                                        <span className="text-xs opacity-70" title={message.status}>
                                            {message.status === 'SEEN' && '✓✓'}
                                            {message.status === 'RECEIVED' && '✓✓'}
                                            {message.status === 'SENT' && '✓'}
                                        </span>
                                    )}
                                    
                                    {/* Edited indicator */}
                                    {message.updated_at && message.updated_at !== message.created_at}
                                </div>
                            </div>
                        </div>
                        
                        {/* Avatar for my messages */}
                        {message.is_mine && (
                            <div className="flex-shrink-0 ml-2 self-end mb-1">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                                    <span className="text-white text-xs font-medium">You</span>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Message Input - Pass required props */}
            <MessageInput 
                darkmode={darkmode} 
                roomId={roomId}
                onMessageSent={handleMessageSent}
            />
        </div>
    );
};

export default MessageArea;