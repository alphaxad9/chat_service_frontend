import { MessageCircle, Users, X, Check } from "lucide-react";
import { useCreateDirectRoom, useCreateGroupRoomWithFormData } from "../../../../apis/chat/rooms/hooks";
import { CreateGroupRoomFormData } from "../../../../apis/chat/rooms/types";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { MyRoomsHomePageListDto } from "../../../../apis/chat/rooms/types";
import { useState } from "react";

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
    const createGroupRoom = useCreateGroupRoomWithFormData();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    
    // State for group chat creation
    const [isCreatingGroup, setIsCreatingGroup] = useState(false);
    const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
    const [groupName, setGroupName] = useState("");
    const [groupDescription, setGroupDescription] = useState("");
    const [groupProfileImage, setGroupProfileImage] = useState<File | null>(null);
    const [groupCoverImage, setGroupCoverImage] = useState<File | null>(null);
    
    // Handle creating a new direct chat with optimistic update
    const handleCreateDirectChat = async (friendId: string) => {
        try {
            const result = await createDirectRoom.mutateAsync({ friend_id: friendId });

            if (result.room_id) {
                const selectedUser = filteredUsers.find(user => user.user_id === friendId);
                if (!selectedUser) return;

                const optimisticRoom: MyRoomsHomePageListDto = {
                    room_id: result.room_id,
                    name: selectedUser.first_name 
                        ? `${selectedUser.first_name} ${selectedUser.last_name}`.trim()
                        : selectedUser.username,
                    is_group: false,
                    has_profile_image: !!selectedUser.profile_picture,
                    profile_image_url: selectedUser.profile_picture || null,
                    my_unread_messages_in_room: 0,
                    last_activity_at: new Date().toISOString(),
                    last_message: null,
                    is_deleted: false,
                };

                // Optimistic update - add to the top of the list
                queryClient.setQueryData(['rooms', 'home'], (old: any[] = []) => [
                    optimisticRoom,
                    ...old,
                ]);

                // Close panel + navigate immediately
                onClose();
                navigate(`/chat/${result.room_id}`);
            }
        } catch (error) {
            console.error("Failed to create direct chat:", error);
        }
    };
    
    // Handle creating a new group chat
    const handleCreateGroupChat = async () => {
        if (selectedUsers.size === 0) {
            alert("Please select at least one user to create a group chat");
            return;
        }
        
        if (!groupName.trim()) {
            alert("Please enter a group name");
            return;
        }
        
        try {
            const participantIds = Array.from(selectedUsers);
            
            const formData: CreateGroupRoomFormData = {
                group_name: groupName.trim(),
                description: groupDescription.trim() || undefined,
                participant_ids: participantIds,
                profile_image: groupProfileImage || undefined,
                cover_image: groupCoverImage || undefined,
            };
            
            const result = await createGroupRoom.mutateAsync(formData);
            
            if (result.room_id) {
             
                
                const optimisticRoom: MyRoomsHomePageListDto = {
                    room_id: result.room_id,
                    name: groupName.trim(),
                    is_group: true,
                    has_profile_image: !!groupProfileImage,
                    profile_image_url: groupProfileImage ? URL.createObjectURL(groupProfileImage) : null,
                    my_unread_messages_in_room: 0,
                    last_activity_at: new Date().toISOString(),
                    last_message: null,
                    is_deleted: false,
                };
                
                // Optimistic update - add to the top of the list
                queryClient.setQueryData(['rooms', 'home'], (old: any[] = []) => [
                    optimisticRoom,
                    ...old,
                ]);
                
                // Reset states and close panel
                resetGroupCreation();
                onClose();
                navigate(`/chat/${result.room_id}`);
            }
        } catch (error) {
            console.error("Failed to create group chat:", error);
            alert("Failed to create group chat. Please try again.");
        }
    };
    
    // Toggle user selection for group chat
    const toggleUserSelection = (userId: string) => {
        const newSelection = new Set(selectedUsers);
        if (newSelection.has(userId)) {
            newSelection.delete(userId);
        } else {
            newSelection.add(userId);
        }
        setSelectedUsers(newSelection);
    };
    
    // Reset group creation state
    const resetGroupCreation = () => {
        setIsCreatingGroup(false);
        setSelectedUsers(new Set());
        setGroupName("");
        setGroupDescription("");
        setGroupProfileImage(null);
        setGroupCoverImage(null);
    };
    
    // Cancel group creation
    const cancelGroupCreation = () => {
        resetGroupCreation();
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
    
    // Handle image file selection
    const handleImageSelect = (type: 'profile' | 'cover', file: File | null) => {
        if (type === 'profile') {
            setGroupProfileImage(file);
        } else {
            setGroupCoverImage(file);
        }
    };
    
    // Render group creation form
    if (isCreatingGroup) {
        return (
            <div className="flex flex-col h-full">
                {/* Header */}
                <div className={`flex items-center justify-between p-4 border-b ${darkmode ? 'border-gray-800' : 'border-gray-200'}`}>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={cancelGroupCreation}
                            className={`p-1 rounded-lg transition-colors ${darkmode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
                        >
                            <X className={`w-5 h-5 ${darkmode ? 'text-gray-400' : 'text-gray-600'}`} />
                        </button>
                        <h3 className={`font-semibold ${darkmode ? 'text-white' : 'text-gray-900'}`}>
                            Create Group Chat
                        </h3>
                    </div>
                    <button
                        onClick={handleCreateGroupChat}
                        disabled={createGroupRoom.isPending || selectedUsers.size === 0 || !groupName.trim()}
                        className={`
                            px-4 py-2 rounded-lg font-medium transition-all
                            ${(createGroupRoom.isPending || selectedUsers.size === 0 || !groupName.trim())
                                ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed opacity-50'
                                : 'bg-purple-500 hover:bg-purple-600 text-white'
                            }
                        `}
                    >
                        {createGroupRoom.isPending ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            'Create'
                        )}
                    </button>
                </div>
                
                {/* Group Info Form */}
                <div className={`p-4 border-b ${darkmode ? 'border-gray-800' : 'border-gray-200'}`}>
                    {/* Group Name */}
                    <div className="mb-4">
                        <label className={`block text-sm font-medium mb-2 ${darkmode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Group Name *
                        </label>
                        <input
                            type="text"
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                            placeholder="Enter group name"
                            className={`
                                w-full px-3 py-2 rounded-lg border transition-colors
                                ${darkmode 
                                    ? 'bg-gray-800 border-gray-700 text-white focus:border-purple-500' 
                                    : 'bg-white border-gray-300 text-gray-900 focus:border-purple-500'
                                }
                                focus:outline-none focus:ring-2 focus:ring-purple-500/20
                            `}
                        />
                    </div>
                    
                    {/* Group Description */}
                    <div className="mb-4">
                        <label className={`block text-sm font-medium mb-2 ${darkmode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Description (Optional)
                        </label>
                        <textarea
                            value={groupDescription}
                            onChange={(e) => setGroupDescription(e.target.value)}
                            placeholder="What's this group about?"
                            rows={2}
                            className={`
                                w-full px-3 py-2 rounded-lg border transition-colors resize-none
                                ${darkmode 
                                    ? 'bg-gray-800 border-gray-700 text-white focus:border-purple-500' 
                                    : 'bg-white border-gray-300 text-gray-900 focus:border-purple-500'
                                }
                                focus:outline-none focus:ring-2 focus:ring-purple-500/20
                            `}
                        />
                    </div>
                    
                    {/* Group Images */}
                    <div className="grid grid-cols-2 gap-3">
                        {/* Profile Image */}
                        <div>
                            <label className={`block text-sm font-medium mb-2 ${darkmode ? 'text-gray-300' : 'text-gray-700'}`}>
                                Group Icon
                            </label>
                            <div className="relative">
                                {groupProfileImage ? (
                                    <div className="relative">
                                        <img
                                            src={URL.createObjectURL(groupProfileImage)}
                                            alt="Group profile"
                                            className="w-20 h-20 rounded-full object-cover"
                                        />
                                        <button
                                            onClick={() => handleImageSelect('profile', null)}
                                            className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                ) : (
                                    <label className={`
                                        w-20 h-20 rounded-full flex flex-col items-center justify-center cursor-pointer
                                        border-2 border-dashed transition-colors
                                        ${darkmode 
                                            ? 'border-gray-700 hover:border-purple-500 bg-gray-800' 
                                            : 'border-gray-300 hover:border-purple-500 bg-gray-50'
                                        }
                                    `}>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleImageSelect('profile', e.target.files?.[0] || null)}
                                            className="hidden"
                                        />
                                        <span className="text-2xl">📷</span>
                                        <span className={`text-xs mt-1 ${darkmode ? 'text-gray-400' : 'text-gray-500'}`}>
                                            Upload
                                        </span>
                                    </label>
                                )}
                            </div>
                        </div>
                        
                        {/* Cover Image */}
                        <div>
                            <label className={`block text-sm font-medium mb-2 ${darkmode ? 'text-gray-300' : 'text-gray-700'}`}>
                                Cover Photo
                            </label>
                            <div className="relative">
                                {groupCoverImage ? (
                                    <div className="relative">
                                        <img
                                            src={URL.createObjectURL(groupCoverImage)}
                                            alt="Group cover"
                                            className="w-32 h-20 rounded-lg object-cover"
                                        />
                                        <button
                                            onClick={() => handleImageSelect('cover', null)}
                                            className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                ) : (
                                    <label className={`
                                        w-32 h-20 rounded-lg flex flex-col items-center justify-center cursor-pointer
                                        border-2 border-dashed transition-colors
                                        ${darkmode 
                                            ? 'border-gray-700 hover:border-purple-500 bg-gray-800' 
                                            : 'border-gray-300 hover:border-purple-500 bg-gray-50'
                                        }
                                    `}>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleImageSelect('cover', e.target.files?.[0] || null)}
                                            className="hidden"
                                        />
                                        <span className="text-2xl">🖼️</span>
                                        <span className={`text-xs mt-1 ${darkmode ? 'text-gray-400' : 'text-gray-500'}`}>
                                            Upload
                                        </span>
                                    </label>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Selected Users Counter */}
                <div className={`px-4 py-2 text-xs font-semibold ${darkmode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider flex items-center justify-between border-b ${darkmode ? 'border-gray-800' : 'border-gray-200'}`}>
                    <span>Selected Users ({selectedUsers.size})</span>
                    {selectedUsers.size > 0 && (
                        <button
                            onClick={() => setSelectedUsers(new Set())}
                            className="text-red-500 hover:text-red-600 text-xs"
                        >
                            Clear All
                        </button>
                    )}
                </div>
                
                {/* Users List for Selection */}
                <div className="flex-1 overflow-y-auto">
                    {filteredUsers.map((user) => (
                        <button
                            key={user.user_id}
                            onClick={() => toggleUserSelection(user.user_id)}
                            className={`
                                w-full flex items-center gap-3 p-3 transition-all duration-200
                                ${darkmode 
                                    ? 'hover:bg-gray-800/50 active:bg-gray-800' 
                                    : 'hover:bg-gray-50 active:bg-gray-100'
                                }
                                border-b border-gray-100 dark:border-gray-800
                            `}
                        >
                            {/* Checkbox */}
                            <div className={`
                                w-5 h-5 rounded border-2 flex items-center justify-center transition-all
                                ${selectedUsers.has(user.user_id)
                                    ? 'bg-purple-500 border-purple-500'
                                    : darkmode
                                        ? 'border-gray-600 bg-gray-800'
                                        : 'border-gray-300 bg-white'
                                }
                            `}>
                                {selectedUsers.has(user.user_id) && (
                                    <Check className="w-3 h-3 text-white" />
                                )}
                            </div>
                            
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
                        </button>
                    ))}
                </div>
            </div>
        );
    }
    
    // Render user list (Direct Chat mode)
    return (
        <>
            {/* Header with Group Chat Option */}
            <div className={`px-4 py-2 flex items-center justify-between border-b ${darkmode ? 'border-gray-800' : 'border-gray-200'}`}>
                <div className={`text-xs font-semibold ${darkmode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>
                    Available Users ({filteredUsers.length})
                </div>
                <button
                    onClick={() => setIsCreatingGroup(true)}
                    className={`
                        flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all
                        ${darkmode 
                            ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' 
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                        }
                    `}
                >
                    <Users className="w-4 h-4" />
                    New Group
                </button>
            </div>
            
            {/* Users List */}
            <div className="flex-1 overflow-y-auto">
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
            </div>
        </>
    );
};

export default ListUsersForNewChat;