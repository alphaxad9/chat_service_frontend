// src/project/pages/home/feed.tsx
import { NavLink, useNavigate, useParams } from "react-router-dom";
import { useEffect, useRef, useMemo } from 'react';
import { User, MessageCircle, ArrowLeft } from "lucide-react";
import { useSelector } from 'react-redux';
import { RootState } from '../../entities/store';
import { useRoomsForHomePage } from "../../../apis/chat/rooms/hooks";

import LoadingRooms from "./components/loading_rooms";
import EmptyRoomsList from "./components/empty_room_list";
import LoadingRoomError from "./components/loading_rooms_error";
import ChatRoomItem from "./chat/ChatRoomItem";
import ChatRoom from "./chat/ChatRoom";

ChatRoomItem.displayName = 'ChatRoomItem';

const Feed = () => {
    const darkmode = useSelector((state: RootState) => state.theme.isDark);
    const { data: rooms, isLoading, error } = useRoomsForHomePage();
    const navigate = useNavigate();
    const { roomId: currentRoomId } = useParams();
    const chatContainerRef = useRef<HTMLDivElement>(null);
    // Memoized room list to prevent unnecessary re-renders
    const roomList = useMemo(() => rooms || [], [rooms]);
    
    // Find the current room from the room list
    const currentRoom = useMemo(() => {
        if (!currentRoomId) return null;
        return roomList.find(room => room.room_id === currentRoomId) || null;
    }, [currentRoomId, roomList]);

    // Handle room click - navigate to /chat/:roomId
    const handleRoomClick = (roomId: string) => {
        navigate(`/chat/${roomId}`);
    };

    // Handle back to home
    const handleBackToHome = () => {
        navigate('/');
    };

    // Scroll to top when room changes (for mobile)
    useEffect(() => {
        if (chatContainerRef.current && window.innerWidth < 768) {
            chatContainerRef.current.scrollTop = 0;
        }
    }, [currentRoomId]);

    // Loading state
    if (isLoading) {
        return <LoadingRooms />;
    }
    
    // Error state
    if (error) {
        return <LoadingRoomError />;
    }
    
    // Empty state
    if (roomList.length === 0) {
        return <EmptyRoomsList />;
    }

    return (
        <div className={`${darkmode ? 'bg-dark text-light' : 'bg-light text-dark'} min-w-screen min-h-screen relative flex`}>
            {/* Two Column Layout */}
            <div className="flex w-full">
                {/* Left Sidebar - Rooms List (visible on desktop, hidden on mobile when chat is open) */}
                <div className={`
                    ${currentRoomId 
                        ? 'hidden md:block md:w-80 lg:w-96' 
                        : 'block w-full md:w-80 lg:w-96'
                    }
                    border-r border-gray-200 dark:border-gray-800 h-screen overflow-y-auto relative
                `}>
                    {/* Sticky Header with solid background - no transparency */}
                    <div className={`
                        sticky top-0 z-10 p-4 border-b border-gray-200 dark:border-gray-800
                        ${darkmode ? 'bg-dark' : 'bg-light'}
                    `}>
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                            Chats
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                            {roomList.length} conversation{roomList.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                    
                    <div className="space-y-1 pb-20">
                        {roomList.map((room) => (
                            <ChatRoomItem 
                                key={room.room_id} 
                                room={room} 
                                isActive={currentRoomId === room.room_id}
                                darkmode={darkmode}
                                onClick={handleRoomClick}
                            />
                        ))}
                    </div>

                    {/* Profile Button - positioned at the bottom left with spacing */}
                    <div className="sticky bottom-3 left-[120px] ml-7 z-20 pb-2 bg-inherit">
                        <NavLink 
                            to="/profile" 
                            className="block"
                        >
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg transition-all duration-300 flex items-center justify-center cursor-pointer hover:scale-105">
                                <User className="w-5 h-5 text-white" />
                            </div>
                        </NavLink>
                    </div>
                </div>

                {/* Right Side - Chat Area (only visible when a room is selected) */}
                <div className={`
                    flex-1 h-screen
                    ${!currentRoomId ? 'hidden md:flex items-center justify-center' : 'flex'}
                `}>
                    {currentRoomId ? (
                        <ChatRoom 
                            room={currentRoom} 
                            darkmode={darkmode} 
                            onBack={handleBackToHome} 
                        />
                    ) : (
                        <div className="text-center max-w-md mx-auto px-4">
                            <div className="bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 rounded-full p-6 w-32 h-32 mx-auto mb-6 flex items-center justify-center">
                                <MessageCircle className="w-16 h-16 text-purple-500" />
                            </div>
                            <h2 className="text-2xl font-bold mb-2">Select a conversation</h2>
                            <p className="text-gray-600 dark:text-gray-400">
                                Choose a chat from the list to start messaging
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Mobile back button when chat is open */}
            {currentRoomId && (
                <button
                    onClick={handleBackToHome}
                    className="md:hidden fixed top-4 left-4 z-20 p-2 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-lg"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
            )}
        </div>
    );
};

export default Feed;