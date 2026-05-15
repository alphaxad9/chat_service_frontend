import { MessageCircle, Plus, X, Search } from "lucide-react";
import { RootState } from "../../../entities/store";
import { useSelector } from "react-redux";
import { useState } from "react";
import ListUsersForNewChat from "./ListUsersForNewChat";
import { useUsersForNewConversation } from "../../../../apis/chat/rooms/hooks";

const EmptyRoomsList = () => {
    const darkmode = useSelector((state: RootState) => state.theme.isDark);
    const [showNewChat, setShowNewChat] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    
    const { data: availableUsers, isLoading: isLoadingUsers } = useUsersForNewConversation({ limit: 50 });
    
    const filteredUsers = availableUsers?.filter(user => {
        if (!searchQuery.trim()) return true;
        const query = searchQuery.toLowerCase();
        return user.username.toLowerCase().includes(query) ||
            (user.first_name && user.first_name.toLowerCase().includes(query)) ||
            (user.last_name && user.last_name.toLowerCase().includes(query)) ||
            `${user.first_name} ${user.last_name}`.toLowerCase().includes(query);
    }) || [];

    if (!showNewChat) {
        return (
            <div className={`${darkmode ? 'bg-dark text-light' : 'bg-light text-dark'} min-w-screen min-h-screen flex items-center justify-center relative`}>
                <div className="text-center max-w-md mx-auto px-4">
                    <div className="bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 rounded-full p-6 w-32 h-32 mx-auto mb-6 flex items-center justify-center">
                        <MessageCircle className="w-16 h-16 text-purple-500" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">No conversations yet</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Start a new conversation by finding friends or creating a group chat
                    </p>
                    <button
                        onClick={() => setShowNewChat(!showNewChat)}
                        className={`
                            px-6 py-3 rounded-lg font-semibold transition-all duration-300 shadow-lg
                            bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600
                            text-white
                        `}
                    >
                        Find Friends
                    </button>
                </div>
            </div>
        );
    }

    // Show new chat interface
    return (
        <div className={`${darkmode ? 'bg-dark text-light' : 'bg-light text-dark'} h-screen flex flex-col`}>
            {/* Sticky Header */}
            <div className={`
                sticky top-0 z-10 p-4 border-b border-gray-200 dark:border-gray-800
                ${darkmode ? 'bg-dark' : 'bg-light'}
            `}>
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowNewChat(false)}
                            className={`
                                p-2 rounded-full transition-all duration-300
                                bg-red-500 hover:bg-red-600
                                text-white shadow-lg hover:scale-105
                            `}
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <span className={`
                            text-lg font-semibold tracking-tight
                            ${darkmode ? 'text-white' : 'text-gray-800'}
                        `}>
                            New Conversation
                        </span>
                    </div>
                </div>
                
                {/* Search Input for New Chat */}
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
            </div>
            
            {/* Users List */}
            <div className="flex-1 overflow-y-auto pb-20">
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
        </div>
    );
}

export default EmptyRoomsList;