// src/project/pages/home/feed.tsx
import { NavLink } from "react-router-dom";
import { User, MessageCircle, Users, ChevronRight, Clock } from "lucide-react";
import { useSelector } from 'react-redux';
import { RootState } from '../../entities/store';
import { useRoomsForHomePage } from "../../../apis/chat/rooms/hooks";
import { getLastMessageDisplayText } from "../../../apis/chat/rooms/types";
import { formatDistanceToNow } from 'date-fns';
import { memo, useMemo } from 'react';

const Feed = () => {
    const darkmode = useSelector((state: RootState) => state.theme.isDark);
    const { data: rooms, isLoading, error } = useRoomsForHomePage();
    
    const baseClasses = "flex flex-row items-center cursor-pointer";
    const activeClasses = "text-myhover";

    // Helper function to format time
    const formatTime = (dateString: string | null | undefined) => {
        if (!dateString) return "";
        try {
            return formatDistanceToNow(new Date(dateString), { addSuffix: true });
        } catch {
            return "";
        }
    };

    // Memoized room list to prevent unnecessary re-renders
    const roomList = useMemo(() => rooms || [], [rooms]);

    // Type inference from hook return type
    type RoomItem = NonNullable<typeof rooms>[number];

    // Loading state
    if (isLoading) {
        return (
            <div className={`${darkmode ? 'bg-dark text-light' : 'bg-light text-dark'} min-w-screen min-h-screen flex items-center justify-center relative`}>
                <div className="absolute top-4 left-4">
                    <NavLink 
                        to="/profile" 
                        className={({ isActive }) => 
                            `${baseClasses} ${isActive ? activeClasses : ""} bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 p-2 rounded-lg shadow-lg transition-all duration-300`
                        }
                    >
                        <div className="rounded-full flex items-center justify-center">
                            <User className="w-6 h-6" />
                        </div>
                        <span className="ml-3 hidden small:inline homecommunitybarscreen:hidden homeleftbarscreen:inline">Profile</span>
                    </NavLink>
                </div>
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
                    <p className="text-gray-500 dark:text-gray-400">Loading conversations...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className={`${darkmode ? 'bg-dark text-light' : 'bg-light text-dark'} min-w-screen min-h-screen flex items-center justify-center relative`}>
                <div className="absolute top-4 left-4">
                    <NavLink 
                        to="/profile" 
                        className={({ isActive }) => 
                            `${baseClasses} ${isActive ? activeClasses : ""} bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 p-2 rounded-lg shadow-lg transition-all duration-300`
                        }
                    >
                        <div className="rounded-full flex items-center justify-center">
                            <User className="w-6 h-6" />
                        </div>
                        <span className="ml-3 hidden small:inline homecommunitybarscreen:hidden homeleftbarscreen:inline">Profile</span>
                    </NavLink>
                </div>
                <div className="text-center">
                    <div className="text-red-500 mb-4">
                        <MessageCircle className="w-16 h-16 mx-auto" />
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">Failed to load conversations</p>
                    <button 
                        onClick={() => window.location.reload()} 
                        className="mt-4 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    // Empty state
    if (roomList.length === 0) {
        return (
            <div className={`${darkmode ? 'bg-dark text-light' : 'bg-light text-dark'} min-w-screen min-h-screen flex items-center justify-center relative`}>
                <div className="absolute top-4 left-4">
                    <NavLink 
                        to="/profile" 
                        className={({ isActive }) => 
                            `${baseClasses} ${isActive ? activeClasses : ""} bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 p-2 rounded-lg shadow-lg transition-all duration-300`
                        }
                    >
                        <div className="rounded-full flex items-center justify-center">
                            <User className="w-6 h-6" />
                        </div>
                        <span className="ml-3 hidden small:inline homecommunitybarscreen:hidden homeleftbarscreen:inline">Profile</span>
                    </NavLink>
                </div>
                <div className="text-center max-w-md mx-auto px-4">
                    <div className="bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 rounded-full p-6 w-32 h-32 mx-auto mb-6 flex items-center justify-center">
                        <MessageCircle className="w-16 h-16 text-purple-500" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">No conversations yet</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Start a new conversation by finding friends or creating a group chat
                    </p>
                    <NavLink 
                        to="/explore" 
                        className="inline-block px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg"
                    >
                        Find Friends
                    </NavLink>
                </div>
            </div>
        );
    }

    // Chat room item component (memoized for performance)
    const ChatRoomItem = memo(({ room }: { room: RoomItem }) => {
        return (
            <NavLink 
                to={`/chat/${room.room_id}`}
                className="block group"
            >
                <div className={`
                    flex items-center p-4 rounded-xl transition-all duration-300
                    ${darkmode 
                        ? 'hover:bg-gray-800/50 active:bg-gray-800/70' 
                        : 'hover:bg-gray-50 active:bg-gray-100'
                    }
                    border border-transparent hover:border-gray-200 dark:hover:border-gray-700
                    cursor-pointer
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
                                }}
                            />
                        ) : (
                            <div className={`
                                w-14 h-14 rounded-full flex items-center justify-center
                                ${room.is_group 
                                    ? 'bg-gradient-to-br from-purple-500 to-pink-500' 
                                    : 'bg-gradient-to-br from-blue-500 to-cyan-500'
                                }
                            `}>
                                {room.is_group ? (
                                    <Users className="w-7 h-7 text-white" />
                                ) : (
                                    <User className="w-7 h-7 text-white" />
                                )}
                            </div>
                        )}
                        
                        {/* Unread badge */}
                        {room.my_unread_messages_in_room > 0 && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-900">
                                <span className="text-white text-xs font-bold">
                                    {room.my_unread_messages_in_room > 9 ? '9+' : room.my_unread_messages_in_room}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Room Info */}
                    <div className="flex-1 ml-4 min-w-0">
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-lg truncate">
                                {room.name}
                            </h3>
                            {room.last_activity_at && (
                                <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 flex-shrink-0 ml-2">
                                    <Clock className="w-3 h-3" />
                                    {formatTime(room.last_activity_at)}
                                </span>
                            )}
                        </div>
                        
                        {/* Last Message Preview */}
                        <div className="flex items-center justify-between mt-1">
                            <div className="flex-1 truncate">
                                {room.last_message ? (
                                    <div className="flex items-center gap-2">
                                        {room.last_message.is_mine && (
                                            <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">You:</span>
                                        )}
                                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                                            {getLastMessageDisplayText(room.last_message)}
                                        </p>
                                        {room.last_message.has_image && (
                                            <span className="text-xs text-gray-500 flex-shrink-0">📷</span>
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500 dark:text-gray-500 italic">
                                        {room.is_group ? 'No messages yet' : 'Start a conversation'}
                                    </p>
                                )}
                            </div>
                            
                            {/* Chevron indicator */}
                            <ChevronRight className="w-5 h-5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ml-2 flex-shrink-0" />
                        </div>
                    </div>
                </div>
            </NavLink>
        );
    });

    ChatRoomItem.displayName = 'ChatRoomItem';

    // Chat rooms list view
    return (
        <div className={`${darkmode ? 'bg-dark text-light' : 'bg-light text-dark'} min-w-screen min-h-screen relative`}>
            {/* Profile button in left-top corner */}
            <div className="fixed top-4 left-4 z-10">
                <NavLink 
                    to="/profile" 
                    className={({ isActive }) => 
                        `${baseClasses} ${isActive ? activeClasses : ""} bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 p-2 rounded-lg shadow-lg transition-all duration-300`
                    }
                >
                    <div className="rounded-full flex items-center justify-center">
                        <User className="w-6 h-6" />
                    </div>
                    <span className="ml-3 hidden small:inline homecommunitybarscreen:hidden homeleftbarscreen:inline">Profile</span>
                </NavLink>
            </div>

            {/* Chat Rooms Container */}
            <div className="flex-1 max-w-4xl mx-auto w-full px-4 py-6 pt-20">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        Chats
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Your conversations at a glance
                    </p>
                </div>

                {/* Rooms List */}
                <div className="space-y-2 pb-8">
                    {roomList.map((room) => (
                        <ChatRoomItem key={room.room_id} room={room} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Feed;