// src/project/pages/home/chat/ChatRoomItem.tsx
import { memo, useEffect, useState } from 'react';
import { Users, ChevronRight, Clock, CheckCheck, Check } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';
import { MyRoomsHomePageListDto, getLastMessageDisplayText } from "../../../../apis/chat/rooms/types";
import { Camera } from 'lucide-react';

interface ChatRoomItemProps {
    room: MyRoomsHomePageListDto;
    isActive: boolean;
    darkmode: boolean;
    onClick: (roomId: string) => void;
}

const ChatRoomItem = memo(({ 
    room, 
    isActive, 
    darkmode, 
    onClick 
}: ChatRoomItemProps) => {
    const [unreadCount, setUnreadCount] = useState(room.my_unread_messages_in_room);
    const [lastMessageId, setLastMessageId] = useState(room.last_message?.id || null);

    // Track changes to unread count and last message
    useEffect(() => {
        // Update unread count when new message comes in
        if (room.my_unread_messages_in_room !== unreadCount) {
            // Only increment if it's a new message from someone else
            if (room.last_message && room.last_message.id !== lastMessageId && !room.last_message.is_mine) {
                setUnreadCount(prev => prev + 1);
                setLastMessageId(room.last_message.id);
            } else {
                setUnreadCount(room.my_unread_messages_in_room);
                if (room.last_message) {
                    setLastMessageId(room.last_message.id);
                }
            }
        }
    }, [room.my_unread_messages_in_room, room.last_message, unreadCount, lastMessageId]);

    // Reset unread count when room becomes active (user opens the chat)
    useEffect(() => {
        if (isActive && unreadCount > 0) {
            setUnreadCount(0);
        }
    }, [isActive, unreadCount]);

    const formatTime = (dateString: string | null | undefined) => {
        if (!dateString) return "";
        try {
            return formatDistanceToNow(new Date(dateString), { addSuffix: true });
        } catch {
            return "";
        }
    };

    const getFirstLetter = (name: string) => {
        return name.charAt(0).toUpperCase();
    };

    // Get status icon and color for last message (only if message is mine)
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

    const displayUnreadCount = isActive ? 0 : unreadCount;

    return (
        <div 
            onClick={() => onClick(room.room_id)}
            className={`block group cursor-pointer transition-all duration-200 ${
                isActive ? 'bg-gradient-to-r from-purple-50/30 to-transparent dark:from-purple-500/8 dark:to-transparent' : ''
            }`}
        >
            <div className={`
                flex items-center p-2.5 rounded-xl transition-all duration-200 mx-2 my-0.5
                ${!isActive && 'backdrop-blur-sm'}
                ${darkmode 
                    ? 'hover:bg-white/5 active:bg-white/10' 
                    : 'hover:bg-black/5 active:bg-black/10'
                }
                ${isActive ? (
                    darkmode 
                        ? 'bg-white/15 shadow-lg shadow-purple-500/10 ring-1 ring-purple-500/30' 
                        : 'bg-white/70 shadow-md shadow-purple-500/10 ring-1 ring-purple-500/20'
                ) : 'bg-white/40 dark:bg-black/20'}
                ${isActive ? 'border-purple-300/50 dark:border-purple-500/30' : 'border-white/20 dark:border-white/10'}
                border
            `}>
                {/* Avatar - Reduced size */}
                <div className="relative flex-shrink-0">
                    {room.has_profile_image && room.profile_image_url ? (
                        <img 
                            src={room.profile_image_url} 
                            alt={room.name}
                            className={`w-10 h-10 rounded-full object-cover transition-all duration-200 ${
                                isActive ? 'ring-2 ring-purple-400 ring-offset-1 dark:ring-offset-gray-900' : ''
                            }`}
                            onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                                const parent = (e.target as HTMLImageElement).parentElement;
                                if (parent) {
                                    const fallbackDiv = document.createElement('div');
                                    fallbackDiv.className = `
                                        w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold
                                        ${room.is_group 
                                            ? 'bg-gradient-to-br from-purple-500 to-pink-500' 
                                            : 'bg-gradient-to-br from-blue-500 to-cyan-500'
                                        }
                                        ${isActive ? 'ring-2 ring-purple-400 ring-offset-1 dark:ring-offset-gray-900' : ''}
                                    `;
                                    fallbackDiv.textContent = getFirstLetter(room.name);
                                    (e.target as HTMLImageElement).style.display = 'none';
                                    parent.appendChild(fallbackDiv);
                                }
                            }}
                        />
                    ) : (
                        <div className={`
                            w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold
                            ${room.is_group 
                                ? 'bg-gradient-to-br from-purple-500 to-pink-500' 
                                : 'bg-gradient-to-br from-blue-500 to-cyan-500'
                            }
                            ${isActive ? 'ring-2 ring-purple-400 ring-offset-1 dark:ring-offset-gray-900' : ''}
                        `}>
                            {room.is_group ? (
                                <Users className="w-5 h-5" />
                            ) : (
                                getFirstLetter(room.name)
                            )}
                        </div>
                    )}
                </div>

                {/* Room Info - Reduced spacing */}
                <div className="flex-1 ml-3 min-w-0">
                    <div className="flex items-center justify-between">
                        <h3 className={`font-semibold text-sm truncate transition-all duration-200 ${
                            isActive 
                                ? 'text-purple-700 dark:text-purple-300' 
                                : 'text-gray-700 dark:text-gray-300'
                        }`}>
                            {room.name}
                        </h3>
                        {room.last_activity_at && (
                            <span className={`text-[10px] flex items-center gap-1 flex-shrink-0 ml-2 transition-all duration-200 ${
                                isActive 
                                    ? 'text-purple-500/70 dark:text-purple-400/70' 
                                    : 'text-gray-500 dark:text-gray-400'
                            }`}>
                                <Clock className="w-2.5 h-2.5" />
                                {formatTime(room.last_activity_at)}
                            </span>
                        )}
                    </div>
                    
                    {/* Last Message Preview Row - Reduced text size */}
                    <div className="flex items-center mt-0.5">
                        <div className="flex-1 min-w-0">
                            {room.last_message ? (
                                <div className="flex items-center gap-1 flex-wrap">
                                    {room.last_message.is_mine && (
                                        <span className={`text-[10px] flex-shrink-0 ${
                                            isActive ? 'text-purple-500/70 dark:text-purple-400/70' : 'text-gray-500 dark:text-gray-400'
                                        }`}>You:</span>
                                    )}
                                    <p className={`text-xs truncate transition-all duration-200 ${
                                        isActive 
                                            ? 'text-purple-600/80 dark:text-purple-300/80' 
                                            : 'text-gray-500 dark:text-gray-400'
                                    }`}>
                                        {getLastMessageDisplayText(room.last_message)}
                                    </p>
                                    {room.last_message.has_image && (
                                        <Camera className={`w-3 h-3 flex-shrink-0 ${
                                            isActive ? 'text-purple-500/70' : 'text-gray-400'
                                        }`} />
                                    )}
                                    {/* Status indicator for my messages only */}
                                    {room.last_message.is_mine && (
                                        (() => {
                                            const displayStatus = room.is_group ? "SENT" : room.last_message!.status;
                                            const statusIndicator = getStatusIndicator(displayStatus);
                                            return (
                                                <span 
                                                    className="inline-flex items-center flex-shrink-0" 
                                                    style={{ color: isActive ? '#A855F7' : statusIndicator.color }}
                                                    title={room.is_group ? "Sent to group" : statusIndicator.title}
                                                >
                                                    {statusIndicator.icon}
                                                </span>
                                            );
                                        })()
                                    )}
                                </div>
                            ) : (
                                <p className={`text-xs italic transition-all duration-200 ${
                                    isActive 
                                        ? 'text-purple-400/70 dark:text-purple-400/60' 
                                        : 'text-gray-400 dark:text-gray-500'
                                }`}>
                                    {room.is_group ? 'No messages yet' : 'Start a conversation'}
                                </p>
                            )}
                        </div>
                        
                        {/* Unread messages count - Changed to purple */}
                        {displayUnreadCount > 0 && (
                            <div className="flex-shrink-0 ml-2">
                                <div className={`min-w-[18px] h-4 rounded-full flex items-center justify-center px-1 shadow-sm transition-all duration-200 ${
                                    isActive 
                                        ? 'bg-purple-500 scale-105' 
                                        : 'bg-purple-500'
                                }`}>
                                    <span className="text-white text-[10px] font-bold leading-none">
                                        {displayUnreadCount > 99 ? '99+' : displayUnreadCount}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                
                {/* Chevron indicator */}
                <ChevronRight className={`w-4 h-4 transition-all duration-200 ml-1 flex-shrink-0 ${
                    isActive 
                        ? 'opacity-100 text-purple-500 translate-x-0.5' 
                        : 'opacity-0 group-hover:opacity-100 text-gray-400 group-hover:translate-x-0.5'
                }`} />
            </div>
        </div>
    );
});

ChatRoomItem.displayName = 'ChatRoomItem';
export default ChatRoomItem;