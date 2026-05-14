import { NavLink, useNavigate, useParams } from "react-router-dom";
import { useEffect, useRef, useMemo, useState } from 'react';
import ListUsersForNewChat from "./components/ListUsersForNewChat";
import { User, MessageCircle, ArrowLeft, Plus, Search, X } from "lucide-react";
import { useSelector } from 'react-redux';
import { RootState } from '../../entities/store';
import { useRoomsForHomePage } from "../../../apis/chat/rooms/hooks";
import { useUsersForNewConversation } from "../../../apis/chat/rooms/hooks";
import LoadingRooms from "./components/loading_rooms";
import EmptyRoomsList from "./components/empty_room_list";
import LoadingRoomError from "./components/loading_rooms_error";
import ChatRoomItem from "./chat/ChatRoomItem";
import ChatRoom from "./chat/ChatRoom";
import './feed.css'; 

ChatRoomItem.displayName = 'ChatRoomItem';

const Feed = () => {
    const darkmode = useSelector((state: RootState) => state.theme.isDark);
    const { data: rooms, isLoading, error, refetch: refetchRooms } = useRoomsForHomePage();
    const navigate = useNavigate();
    const { roomId: currentRoomId } = useParams();
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const [showNewChat, setShowNewChat] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    // Memoized room list to prevent unnecessary re-renders
    const roomList = useMemo(() => rooms || [], [rooms]);
    const { data: availableUsers, isLoading: isLoadingUsers, refetch: refetchUsers } = useUsersForNewConversation({ limit: 50 });

    // Refetch data on every mount
    useEffect(() => {
        refetchRooms();
        refetchUsers();
    }, [refetchRooms, refetchUsers]);
    
    // Find the current room from the room list
    const currentRoom = useMemo(() => {
        if (!currentRoomId) return null;
        return roomList.find(room => room.room_id === currentRoomId) || null;
    }, [currentRoomId, roomList]);

    // Handle room click - navigate to /chat/:roomId
    const handleRoomClick = (roomId: string) => {
        navigate(`/chat/${roomId}`);
        setShowNewChat(false);
    };

    // Handle back to home
    const handleBackToHome = () => {
        navigate('/');
        setShowNewChat(false);
    };
    
    const filteredUsers = useMemo(() => {
        if (!availableUsers) return [];
        if (!searchQuery.trim()) return availableUsers;
        
        const query = searchQuery.toLowerCase();
        return availableUsers.filter(user => 
            user.username.toLowerCase().includes(query) ||
            (user.first_name && user.first_name.toLowerCase().includes(query)) ||
            (user.last_name && user.last_name.toLowerCase().includes(query)) ||
            `${user.first_name} ${user.last_name}`.toLowerCase().includes(query)
        );
    }, [availableUsers, searchQuery]);

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

    return (
        <div className={`${darkmode ? 'bg-dark text-light' : 'bg-light text-dark'} min-w-screen min-h-screen relative flex`}>
            <div className="flex w-full">
                {/* Left Sidebar - Rooms List */}
                <div className={`
                    ${currentRoomId 
                        ? 'hidden md:block md:w-80 lg:w-96' 
                        : 'block w-full md:w-80 lg:w-96'
                    }
                    border-r border-gray-200 dark:border-gray-800 h-screen overflow-y-auto relative
                    custom-scrollbar
                `}>
                    {/* Sticky Header */}
                    <div className={`
                        sticky top-0 z-10 p-4 border-b border-gray-200 dark:border-gray-800
                        ${darkmode ? 'bg-dark' : 'bg-light'}
                    `}>
                        <div className="flex items-center justify-between mb-2">
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                Chats
                            </h1>
                            
                            {/* New Chat Button */}
                            <button
                                onClick={() => setShowNewChat(!showNewChat)}
                                className={`
                                    p-2 rounded-full transition-all duration-300
                                    ${showNewChat 
                                        ? 'bg-red-500 hover:bg-red-600 rotate-90' 
                                        : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
                                    }
                                    text-white shadow-lg hover:scale-105
                                `}
                            >
                                {showNewChat ? (
                                    <X className="w-5 h-5" />
                                ) : (
                                    <Plus className="w-5 h-5" />
                                )}
                            </button>
                        </div>
                        
                        {!showNewChat ? (
                            <p className="text-gray-500 dark:text-gray-400 text-sm">
                                {roomList.length} conversation{roomList.length !== 1 ? 's' : ''}
                            </p>
                        ) : (
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search users..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className={`
                                        w-full pl-9 pr-4 py-2 rounded-lg text-sm
                                        ${darkmode 
                                            ? 'bg-gray-800 text-white placeholder-gray-500 border-gray-700' 
                                            : 'bg-gray-100 text-gray-900 placeholder-gray-400 border-gray-200'
                                        }
                                        border focus:outline-none focus:ring-2 focus:ring-purple-500
                                        transition-all duration-200
                                    `}
                                    autoFocus
                                />
                            </div>
                        )}
                    </div>
                    
                    {/* Content Area */}
                    <div className="pb-20">
                        {!showNewChat ? (
                            /* Rooms List */
                            <div className="space-y-1">
                                {roomList.length === 0 ? (
                                    <EmptyRoomsList />
                                ) : (
                                    roomList.map((room) => (
                                        <ChatRoomItem 
                                            key={room.room_id} 
                                            room={room} 
                                            isActive={currentRoomId === room.room_id}
                                            darkmode={darkmode}
                                            onClick={handleRoomClick}
                                        />
                                    ))
                                )}
                            </div>
                        ) : (
                            /* Users List for New Chat */
                            <div className="space-y-1">
                                {isLoadingUsers ? (
                                    <div className="flex items-center justify-center py-12">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                                    </div>
                                ) : filteredUsers.length === 0 ? (
                                    <div className="text-center py-12">
                                        <div className={`
                                            w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4
                                            ${darkmode ? 'bg-gray-800' : 'bg-gray-100'}
                                        `}>
                                            <Search className="w-8 h-8 text-gray-400" />
                                        </div>
                                        <p className={`text-sm ${darkmode ? 'text-gray-400' : 'text-gray-500'}`}>
                                            {searchQuery ? 'No users found' : 'No users available'}
                                        </p>
                                    </div>
                                ) : (
                                    <ListUsersForNewChat 
                                        filteredUsers={filteredUsers}
                                        darkmode={darkmode}
                                        onClose={() => setShowNewChat(false)}
                                    />
                                )}
                            </div>
                        )}
                    </div>

                    {/* Profile Button */}
                    <div className="sticky bottom-3 left-[120px] ml-7 z-20 pb-2">
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

                {/* Right Side - Chat Area */}
                <div className={`
                    flex-1 h-screen
                    ${!currentRoomId ? 'hidden md:flex items-center justify-center' : 'flex'}
                `}>
                    {currentRoomId ? (
                        currentRoom ? (
                            <ChatRoom 
                                room={currentRoom} 
                                darkmode={darkmode} 
                                onBack={handleBackToHome} 
                            />
                        ) : (
                            <div className="flex items-center justify-center h-full w-full">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
                                <p className="text-gray-500 dark:text-gray-400">
                                    Loading conversation...
                                </p>
                            </div>
                        )
                    ) : (
                        <div className="text-center max-w-md mx-auto px-4">
                            <div className="bg-gradient-to-br from-purple-100 to-pink-100 dark:bg-purple-900/20 dark:bg-pink-900/20 rounded-full p-6 w-32 h-32 mx-auto mb-6 flex items-center justify-center">
                                <MessageCircle className="w-16 h-16 text-purple-500" />
                            </div>
                            <h2 className="text-2xl font-bold mb-2">Select a conversation</h2>
                            <p className="text-gray-600 dark:text-gray-400">
                                Choose a chat from the list or start a new conversation
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Mobile back button */}
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