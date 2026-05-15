import { format } from 'date-fns';
import { useRef, useEffect, useState } from 'react';
import { useMessagesByRoomId, useDeleteMessage, useUpdateMessageContent } from '../../../../../apis/chat/messages/hooks';
import { MessageQueryResponseDTO, getMessageDisplayText, UpdateMessageContentRequest } from '../../../../../apis/chat/messages/types';
import MessageInput from './MessageInput';
import { Camera, CheckCheck, Check, MoreVertical, Reply, Trash2, Edit2, X, Check as CheckIcon } from 'lucide-react';
import "../../feed.css"

interface MessageAreaProps {
    darkmode: boolean;
    roomId: string | null;
}

const MessageArea = ({ darkmode, roomId }: MessageAreaProps) => {
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [replyingTo, setReplyingTo] = useState<MessageQueryResponseDTO | null>(null);
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const [editingMessage, setEditingMessage] = useState<MessageQueryResponseDTO | null>(null);
    const [editContent, setEditContent] = useState('');
    const editInputRef = useRef<HTMLInputElement>(null);
    
    // Fetch messages from API
    const { 
        data: fetchedMessages, 
        isLoading, 
        error,
        refetch 
    } = useMessagesByRoomId(roomId, {
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        refetchInterval: 3000,
    });

    const { mutate: deleteMessage } = useDeleteMessage();
    const { mutate: updateMessageContent } = useUpdateMessageContent();

    // Scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [fetchedMessages]);

    // Focus edit input when editing starts
    useEffect(() => {
        if (editingMessage && editInputRef.current) {
            editInputRef.current.focus();
        }
    }, [editingMessage]);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (!(event.target as Element).closest('[data-message-menu]')) {
                setOpenMenuId(null);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    // Handle refetch after sending message
    const handleMessageSent = () => {
        setReplyingTo(null);
        refetch();
    };

    // Handle reply click
    const handleReplyClick = (message: MessageQueryResponseDTO) => {
        setReplyingTo(message);
        setOpenMenuId(null);
    };

    // Handle edit click
    const handleEditClick = (message: MessageQueryResponseDTO) => {
        setEditingMessage(message);
        setEditContent(message.content || '');
        setOpenMenuId(null);
    };

    // Handle save edit
    const handleSaveEdit = () => {
        if (!editingMessage || !editContent.trim()) return;
        
        const request: UpdateMessageContentRequest = {
            new_content: editContent.trim()
        };
        
        updateMessageContent(
            { messageId: editingMessage.id, data: request },
            {
                onSuccess: () => {
                    setEditingMessage(null);
                    setEditContent('');
                    refetch();
                },
                onError: (error) => {
                    console.error('Failed to update message:', error);
                }
            }
        );
    };

    // Handle cancel edit
    const handleCancelEdit = () => {
        setEditingMessage(null);
        setEditContent('');
    };

    // Handle key press in edit input
    const handleEditKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSaveEdit();
        } else if (e.key === 'Escape') {
            handleCancelEdit();
        }
    };

    // Handle delete click - no confirmation
    const handleDeleteClick = (messageId: string) => {
        deleteMessage(messageId, {
            onSuccess: () => {
                setOpenMenuId(null);
            },
        });
    };

    // Generate a consistent color for a username
    const getUsernameColor = (username: string) => {
        const colors = [
            '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD',
            '#98D8C8', '#F7B05B', '#E8A87C', '#C38D9E', '#6C5B7B', '#F08A5D',
            '#B83B5E', '#2F9292', '#E8A87C', '#9B59B6', '#3498DB', '#E74C3C',
            '#1ABC9C', '#F39C12', '#8E44AD', '#16A085', '#27AE60', '#2980B9'
        ];
        
        let hash = 0;
        for (let i = 0; i < username.length; i++) {
            hash = username.charCodeAt(i) + ((hash << 5) - hash);
        }
        const index = Math.abs(hash) % colors.length;
        return colors[index];
    };

    // Get status icon and color for my messages
    const getStatusIndicator = (status: "SENT" | "RECEIVED" | "SEEN") => {
        switch (status) {
            case 'SENT':
                return {
                    icon: <Check className="w-3 h-3" />,
                    color: '#9CA3AF',
                    title: 'Sent'
                };
            case 'RECEIVED':
                return {
                    icon: <CheckCheck className="w-3 h-3" />,
                    color: '#9CA3AF',
                    title: 'Delivered'
                };
            case 'SEEN':
                return {
                    icon: <CheckCheck className="w-3 h-3" />,
                    color: '#34D399',
                    title: 'Seen'
                };
            default:
                return {
                    icon: <Check className="w-3 h-3" />,
                    color: '#9CA3AF',
                    title: 'Sent'
                };
        }
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

    // Filter out deleted messages
    const activeMessages = fetchedMessages?.filter(msg => !msg.is_deleted) || [];

    return (
        <div className="flex flex-col h-full overflow-hidden">
            {/* Messages Area */}
            <div 
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar"
                style={{ minHeight: 0 }}
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
                
                {activeMessages.map((message: MessageQueryResponseDTO) => {
                    const statusIndicator = message.is_mine ? getStatusIndicator(message.status) : null;
                    const isMenuOpen = openMenuId === message.id;
                    const usernameColor = !message.is_mine ? getUsernameColor(message.sender_username) : '';
                    const isEditing = editingMessage?.id === message.id;
                    
                    return (
                        <div
                            key={message.id}
                            className={`flex ${message.is_mine ? 'justify-end' : 'justify-start'} animate-fade-in relative group`}
                        >
                            {/* Avatar for other users - outside bubble */}
                            {!message.is_mine && (
                                <div className="flex-shrink-0 mr-2 self-end mb-1">
                                    {message.sender_profile_image ? (
                                        <img 
                                            src={message.sender_profile_image} 
                                            alt={message.sender_username}
                                            className="w-8 h-8 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full flex items-center justify-center shadow-md" style={{ backgroundColor: usernameColor }}>
                                            <span className="text-white text-xs font-medium">
                                                {message.sender_username.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            )}
                            
                            {/* Message Bubble Container */}
                            <div className="relative max-w-[70%]">
                                <div
                                    className={`
                                        rounded-2xl px-3 py-1.5 transition-all duration-200 relative
                                        ${message.is_mine
                                            ? 'bg-gradient-to-r from-gray-800 to-gray-900 text-white shadow-sm'
                                            : darkmode
                                            ? 'bg-gradient-to-r from-gray-600 to-gray-700 text-gray-100 shadow-sm'
                                            : 'bg-gradient-to-r from-blue-100 to-indigo-100 text-gray-900 shadow-sm border border-blue-200'
                                        }
                                        ${message.is_reply ? 'pt-2.5' : ''}
                                        ${isEditing ? 'ring-2 ring-purple-500' : ''}
                                    `}
                                >
                                    {/* Header Row: Sender Name + Three-dots Menu */}
                                    <div className="flex items-center justify-between mb-0.5 gap-2">
                                        {/* Sender name - shows "You" for own messages, username for others */}
                                        <span 
                                            className="text-xs font-semibold"
                                            style={!message.is_mine ? { color: usernameColor } : {}}
                                        >
                                            {message.is_mine ? 'You' : message.sender_username}
                                        </span>
                                        
                                        {/* Three-dots menu button - only show when not editing */}
                                        {!isEditing && (
                                            <button
                                                data-message-menu
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setOpenMenuId(isMenuOpen ? null : message.id);
                                                }}
                                                className={`
                                                    p-0.5 rounded-full transition-all
                                                    opacity-0 group-hover:opacity-100
                                                    ${darkmode 
                                                        ? 'hover:bg-gray-700 text-gray-300' 
                                                        : 'hover:bg-white/50 text-gray-600'
                                                    }
                                                `}
                                                title="Message options"
                                            >
                                                <MoreVertical className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                    </div>

                                    {/* Dropdown Menu */}
                                    {isMenuOpen && !isEditing && (
                                        <div className={`
                                            absolute ${message.is_mine ? 'left-2' : 'right-2'} 
                                            top-8 w-36 rounded-lg shadow-lg border
                                            ${darkmode 
                                                ? 'bg-gray-800 border-gray-700' 
                                                : 'bg-white border-gray-200'
                                            }
                                            z-30 overflow-hidden
                                        `}>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleReplyClick(message);
                                                }}
                                                className={`
                                                    w-full px-3 py-1.5 text-left text-xs flex items-center gap-2
                                                    ${darkmode 
                                                        ? 'hover:bg-gray-700 text-gray-200' 
                                                        : 'hover:bg-gray-100 text-gray-700'
                                                    }
                                                `}
                                            >
                                                <Reply className="w-3.5 h-3.5" />
                                                Reply
                                            </button>
                                            {message.is_mine && (
                                                <>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleEditClick(message);
                                                        }}
                                                        className={`
                                                            w-full px-3 py-1.5 text-left text-xs flex items-center gap-2
                                                            ${darkmode 
                                                                ? 'hover:bg-gray-700 text-blue-400' 
                                                                : 'hover:bg-gray-100 text-blue-600'
                                                            }
                                                        `}
                                                    >
                                                        <Edit2 className="w-3.5 h-3.5" />
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteClick(message.id);
                                                        }}
                                                        className={`
                                                            w-full px-3 py-1.5 text-left text-xs flex items-center gap-2
                                                            ${darkmode 
                                                                ? 'hover:bg-red-900/50 text-red-400' 
                                                                : 'hover:bg-red-50 text-red-600'
                                                            }
                                                        `}
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                        Delete
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    )}
                                    
                                    {/* Reply Preview */}
                                    {message.is_reply && message.parent_preview && (
                                        <div className={`
                                            text-[10px] mb-1.5 pb-1 border-l-2 pl-1.5
                                            ${message.is_mine 
                                                ? 'border-white/30' 
                                                : darkmode 
                                                    ? 'border-gray-400' 
                                                    : 'border-blue-400'
                                            }
                                        `}>
                                            <span className="opacity-80">
                                                ↪ Replying to {message.parent_preview.creator_username}
                                            </span>
                                            <div className="truncate max-w-[180px] opacity-90">
                                                {message.parent_preview.has_image ? '📷 Photo' : message.parent_preview.content}
                                            </div>
                                        </div>
                                    )}
                                    
                                    {/* Image Attachment */}
                                    {message.has_image && message.image_url && !isEditing && (
                                        <div className="mb-2">
                                            <img 
                                                src={message.image_url} 
                                                alt="Message attachment"
                                                className="w-full max-h-96 object-contain rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                                                onClick={() => window.open(message.image_url!, '_blank')}
                                            />
                                        </div>
                                    )}
                                    
                                    {/* Message Content or Edit Input */}
                                    {isEditing ? (
                                        <div className="flex items-center gap-2">
                                            <input
                                                ref={editInputRef}
                                                type="text"
                                                value={editContent}
                                                onChange={(e) => setEditContent(e.target.value)}
                                                onKeyPress={handleEditKeyPress}
                                                className={`
                                                    flex-1 px-2 py-1 rounded text-sm focus:outline-none
                                                    ${darkmode 
                                                        ? 'bg-gray-700 text-white border-gray-600' 
                                                        : 'bg-white text-gray-900 border-gray-300'
                                                    }
                                                    border focus:ring-2 focus:ring-purple-500
                                                `}
                                                autoFocus
                                            />
                                            <button
                                                onClick={handleSaveEdit}
                                                className={`
                                                    p-1 rounded-full transition-colors
                                                    ${darkmode 
                                                        ? 'hover:bg-gray-700 text-green-400' 
                                                        : 'hover:bg-gray-100 text-green-600'
                                                    }
                                                `}
                                                title="Save"
                                            >
                                                <CheckIcon className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={handleCancelEdit}
                                                className={`
                                                    p-1 rounded-full transition-colors
                                                    ${darkmode 
                                                        ? 'hover:bg-gray-700 text-red-400' 
                                                        : 'hover:bg-gray-100 text-red-600'
                                                    }
                                                `}
                                                title="Cancel"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            {/* Message Content and Time on Same Line */}
                                            <div className="flex items-baseline gap-2 flex-wrap">
                                                {message.content && (
                                                    <p className="break-words whitespace-pre-wrap text-sm leading-relaxed">
                                                        {getMessageDisplayText(message)}
                                                    </p>
                                                )}
                                                
                                                {/* Time and Status */}
                                                <div className="flex items-center gap-1 flex-shrink-0">
                                                    <span className="text-[10px] opacity-70">
                                                        {message.created_at ? format(new Date(message.created_at), 'HH:mm') : ''}
                                                    </span>
                                                    
                                                    {message.updated_at && message.updated_at !== message.created_at && (
                                                        <span className="text-[10px] opacity-50 italic ml-1">
                                                            (edited)
                                                        </span>
                                                    )}
                                                    
                                                    {message.is_mine && statusIndicator && (
                                                        <span 
                                                            className="text-[10px] inline-flex items-center" 
                                                            style={{ color: statusIndicator.color }}
                                                            title={statusIndicator.title}
                                                        >
                                                            {statusIndicator.icon}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                            
                            {/* Avatar for my messages - show profile image if available, otherwise gradient fallback */}
                            {message.is_mine && (
                                <div className="flex-shrink-0 ml-2 self-end mb-1">
                                    {message.sender_profile_image ? (
                                        <img 
                                            src={message.sender_profile_image} 
                                            alt="Your profile"
                                            className="w-8 h-8 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center shadow-md">
                                            <span className="text-white text-xs font-medium">You</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Message Input with reply support */}
            <MessageInput 
                darkmode={darkmode} 
                roomId={roomId}
                onMessageSent={handleMessageSent}
                replyingTo={replyingTo}
                onCancelReply={() => setReplyingTo(null)}
            />
        </div>
    );
};

export default MessageArea;