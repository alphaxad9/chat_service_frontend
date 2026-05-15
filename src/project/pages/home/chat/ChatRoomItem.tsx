// src/project/pages/home/chat/ChatRoomItem.tsx
import { memo } from 'react';
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
                    color: '#9CA3AF', // Gray for sent
                    title: 'Sent'
                };
            case 'RECEIVED':
                return {
                    icon: <CheckCheck className="w-3 h-3" />,
                    color: '#9CA3AF', // Gray for received
                    title: 'Delivered'
                };
            case 'SEEN':
                return {
                    icon: <CheckCheck className="w-3 h-3" />,
                    color: '#34D399', // Green for seen
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

    // Debug log to check unread count
    console.log(`Room: ${room.name}, Unread: ${room.my_unread_messages_in_room}`);

    return (
        <div 
            onClick={() => onClick(room.room_id)}
            className={`block group cursor-pointer transition-all duration-300 ${
                isActive ? 'bg-purple-50 dark:bg-purple-900/20' : ''
            }`}
        >
            <div className={`
                flex items-center p-4 rounded-xl transition-all duration-300 mx-2
                ${darkmode 
                    ? 'hover:bg-gray-800/50 active:bg-gray-800/70' 
                    : 'hover:bg-gray-50 active:bg-gray-100'
                }
                ${isActive ? (
                    darkmode 
                        ? 'bg-gray-800/30 ring-1 ring-purple-500/50' 
                        : 'bg-gray-50 ring-1 ring-purple-500/30'
                ) : ''}
                border border-transparent hover:border-gray-200 dark:hover:border-gray-700
            `}>
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                    {room.has_profile_image && room.profile_image_url ? (
                        <img 
                            src={room.profile_image_url} 
                            alt={room.name}
                            className="w-14 h-14 rounded-full object-cover"
                            onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                                const parent = (e.target as HTMLImageElement).parentElement;
                                if (parent) {
                                    const fallbackDiv = document.createElement('div');
                                    fallbackDiv.className = `
                                        w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-bold
                                        ${room.is_group 
                                            ? 'bg-gradient-to-br from-purple-500 to-pink-500' 
                                            : 'bg-gradient-to-br from-blue-500 to-cyan-500'
                                        }
                                    `;
                                    fallbackDiv.textContent = getFirstLetter(room.name);
                                    (e.target as HTMLImageElement).style.display = 'none';
                                    parent.appendChild(fallbackDiv);
                                }
                            }}
                        />
                    ) : (
                        <div className={`
                            w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-bold
                            ${room.is_group 
                                ? 'bg-gradient-to-br from-purple-500 to-pink-500' 
                                : 'bg-gradient-to-br from-blue-500 to-cyan-500'
                            }
                        `}>
                            {room.is_group ? (
                                <Users className="w-7 h-7" />
                            ) : (
                                getFirstLetter(room.name)
                            )}
                        </div>
                    )}
                </div>

                {/* Room Info */}
                <div className="flex-1 ml-4 min-w-0">
                    <div className="flex items-center justify-between">
                        <h3 className={`font-semibold text-base truncate ${isActive ? 'text-purple-600 dark:text-purple-400' : ''}`}>
                            {room.name}
                        </h3>
                        {room.last_activity_at && (
                            <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 flex-shrink-0 ml-2">
                                <Clock className="w-3 h-3" />
                                {formatTime(room.last_activity_at)}
                            </span>
                        )}
                    </div>
                    
                    {/* Last Message Preview Row */}
                    <div className="flex items-center mt-1">
                        <div className="flex-1 min-w-0">
                            {room.last_message ? (
                                <div className="flex items-center gap-1.5 flex-wrap">
                                    {room.last_message.is_mine && (
                                        <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">You:</span>
                                    )}
                                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                                        {getLastMessageDisplayText(room.last_message)}
                                    </p>
                                    {room.last_message.has_image && (
                                        <Camera className="w-4 h-4 flex-shrink-0" />
                                    )}
                                    {/* Status indicator for my messages only */}
                                    {room.last_message.is_mine && (
                                        (() => {
                                            const displayStatus = room.is_group ? "SENT" : room.last_message!.status;
                                            const statusIndicator = getStatusIndicator(displayStatus);
                                            return (
                                                <span 
                                                    className="inline-flex items-center flex-shrink-0" 
                                                    style={{ color: statusIndicator.color }}
                                                    title={room.is_group ? "Sent to group" : statusIndicator.title}
                                                >
                                                    {statusIndicator.icon}
                                                </span>
                                            );
                                        })()
                                    )}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500 dark:text-gray-500 italic">
                                    {room.is_group ? 'No messages yet' : 'Start a conversation'}
                                </p>
                            )}
                        </div>
                        
                        {/* Unread messages count - NOW WITH !important and better visibility */}
                        {room.my_unread_messages_in_room > 0 && (
                            <div className="flex-shrink-0 ml-3">
                                <div className="min-w-[20px] h-5 bg-red-500 rounded-full flex items-center justify-center px-1.5 shadow-sm">
                                    <span className="text-white text-xs font-bold">
                                        {room.my_unread_messages_in_room > 99 ? '99+' : room.my_unread_messages_in_room}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                
                {/* Chevron indicator - moved outside room info for better alignment */}
                <ChevronRight className={`w-5 h-5 transition-opacity duration-300 ml-2 flex-shrink-0 ${
                    isActive ? 'opacity-100 text-purple-500' : 'opacity-0 group-hover:opacity-100 text-gray-400'
                }`} />
            </div>
        </div>
    );
});

ChatRoomItem.displayName = 'ChatRoomItem';
export default ChatRoomItem;