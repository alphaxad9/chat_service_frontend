import { MessageCircle } from "lucide-react";
import { useCreateDirectRoom } from "../../../../apis/chat/rooms/hooks";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

interface ListUsersForNewChatProps {
    filteredUsers: Array<{
        user_id: string;
        username: string;
        email: string;
        first_name: string;
        last_name: string;
        profile_picture: string | null;
    }>;
    darkmode: boolean;
    onClose: () => void;
}

const ListUsersForNewChat = ({ filteredUsers, darkmode, onClose }: ListUsersForNewChatProps) => {
    const createDirectRoom = useCreateDirectRoom();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    
    // Handle creating a new direct chat with optimistic update
    const handleCreateDirectChat = async (friendId: string) => {
        try {
            const result = await createDirectRoom.mutateAsync({ friend_id: friendId });
            
            if (result.room_id) {
                // Get existing rooms from cache
                const existingRooms = queryClient.getQueryData(['rooms', 'home']) as any[] || [];
                
                // Find the selected user
                const selectedUser = filteredUsers.find(user => user.user_id === friendId);
                
                if (selectedUser) {
                    // Create optimistic room object
                    const optimisticRoom = {
                        room_id: result.room_id,
                        name: selectedUser.first_name 
                            ? `${selectedUser.first_name} ${selectedUser.last_name}`.trim()
                            : selectedUser.username,
                        is_group: false,
                        has_profile_image: !!selectedUser.profile_picture,
                        profile_image_url: selectedUser.profile_picture,
                        my_unread_messages_in_room: 0,
                        last_activity_at: new Date().toISOString(),
                        last_message: null,
                        type: "DIRECT",
                        is_admin: true,
                        is_owner: true,
                        created_at: new Date().toISOString(),
                    };
                    
                    // Optimistically add to cache
                    queryClient.setQueryData(
                        ['rooms', 'home'],
                        [optimisticRoom, ...existingRooms]
                    );
                }
                
                // Close panel and navigate
                onClose();
                navigate(`/chat/${result.room_id}`);
                
                // Background sync with server
                await queryClient.invalidateQueries({ queryKey: ['rooms', 'home'] });
            }
        } catch (error) {
            console.error("Failed to create direct chat:", error);
        }
    };
    
    // Get user display name
    const getUserDisplayName = (user: any) => {
        if (user.first_name && user.last_name) {
            return `${user.first_name} ${user.last_name}`;
        }
        if (user.first_name) {
            return user.first_name;
        }
        return user.username;
    };

    return (
        <>
            <div className={`px-4 py-2 text-xs font-semibold ${darkmode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>
                Available Users ({filteredUsers.length})
            </div>
            {filteredUsers.map((user) => (
                <button
                    key={user.user_id}
                    onClick={() => handleCreateDirectChat(user.user_id)}
                    disabled={createDirectRoom.isPending}
                    className={`
                        w-full flex items-center gap-3 p-3 transition-all duration-200
                        ${darkmode 
                            ? 'hover:bg-gray-800/50 active:bg-gray-800' 
                            : 'hover:bg-gray-50 active:bg-gray-100'
                        }
                        border-b border-gray-100 dark:border-gray-800
                    `}
                >
                    {/* User Avatar */}
                    <div className="relative">
                        {user.profile_picture ? (
                            <img
                                src={user.profile_picture}
                                alt={getUserDisplayName(user)}
                                className="w-12 h-12 rounded-full object-cover"
                            />
                        ) : (
                            <div className={`
                                w-12 h-12 rounded-full flex items-center justify-center
                                bg-gradient-to-br from-blue-500 to-cyan-500
                            `}>
                                <span className="text-white text-lg font-medium">
                                    {getUserDisplayName(user).charAt(0).toUpperCase()}
                                </span>
                            </div>
                        )}
                        
                        {/* Online indicator */}
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></div>
                    </div>
                    
                    {/* User Info */}
                    <div className="flex-1 text-left">
                        <p className={`font-semibold ${darkmode ? 'text-white' : 'text-gray-900'}`}>
                            {getUserDisplayName(user)}
                        </p>
                        <p className={`text-xs ${darkmode ? 'text-gray-400' : 'text-gray-500'}`}>
                            @{user.username}
                        </p>
                    </div>
                    
                    {/* Start Chat Button */}
                    <div className={`
                        p-2 rounded-full
                        ${darkmode ? 'bg-gray-800' : 'bg-gray-100'}
                    `}>
                        {createDirectRoom.isPending ? (
                            <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <MessageCircle className="w-5 h-5 text-purple-500" />
                        )}
                    </div>
                </button>
            ))}
        </>
    );
};

export default ListUsersForNewChat;