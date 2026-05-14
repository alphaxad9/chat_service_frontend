// src/project/pages/chat/room_details/RoomDetailsPannel.tsx
import { useRoomById, useDeleteGroupRoom } from "../../../../../apis/chat/rooms/hooks";
import { useActiveRoomMembersQuery } from "../../../../../apis/chat/members/hooks";
import { MemberQueryResponseDTO } from "../../../../../apis/chat/members/types";
import "../../feed.css"
import { 
    Calendar, 
    Clock, 
    Trash2, 
    Edit2, 
    Shield, 
    UserCheck,
    X,
    Users as UsersIcon,
    Crown,
    Star,
    MoreVertical
} from "lucide-react";
import { Users, User } from "lucide-react";
import { MyRoomsHomePageListDto } from "../../../../../apis/chat/rooms/types";
import { RefObject, useState } from "react";

interface RoomDetailsPanelProps {
    room: MyRoomsHomePageListDto;
    darkmode: boolean;
    onClose: () => void;
    panelRef: RefObject<HTMLDivElement | null>;
}

export default function RoomDetailsPannel({ room, darkmode, onClose, panelRef }: RoomDetailsPanelProps) {
    const [showMemberMenu, setShowMemberMenu] = useState<string | null>(null);
    
    // Fetch detailed room information
    const { data: roomDetails, isLoading: isLoadingDetails } = useRoomById(
        room?.room_id || null
    );
    
    // Fetch all members in the room
    const { 
        data: members, 
        isLoading: isLoadingMembers 
    } = useActiveRoomMembersQuery(room?.room_id || null);
    
    // Delete room mutation
    const { mutate: deleteRoom, isPending: isDeleting } = useDeleteGroupRoom();

    // Handle delete room
    const handleDeleteRoom = () => {
        if (!room) return;
        
        const confirmDelete = window.confirm(
            `Are you sure you want to delete "${room.name}"? This action cannot be undone.`
        );
        
        if (confirmDelete && roomDetails) {
            deleteRoom(roomDetails.room_id);
            onClose();
        }
    };

    // Helper to get display name from member
    const getMemberDisplayName = (member: MemberQueryResponseDTO) => {
        if (member.user.first_name && member.user.last_name) {
            return `${member.user.first_name} ${member.user.last_name}`;
        }
        if (member.user.first_name) {
            return member.user.first_name;
        }
        return member.user.username;
    };

    // Helper to get member role icon
    const getMemberRoleIcon = (member: MemberQueryResponseDTO) => {
        if (member.is_admin) {
            return <Crown className="w-4 h-4 text-yellow-500" />;
        }
        return <User className="w-4 h-4 text-gray-400" />;
    };

    // Helper to get member role text
    const getMemberRoleText = (member: MemberQueryResponseDTO) => {
        if (member.is_admin) {
            return "Admin";
        }
        return "Member";
    };

    // Group members by role
    const admins = members?.filter(m => m.is_admin) || [];
    const regularMembers = members?.filter(m => !m.is_admin) || [];

    return (
        <>
            {/* Backdrop */}
            <div 
                className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity" 
                onClick={onClose}
            />
            
            {/* Side Panel */}
            <div
                ref={panelRef}
                className={`
                    fixed right-0 top-0 h-full w-full sm:w-96 
                    ${darkmode ? 'bg-dark' : 'bg-white'} 
                    shadow-2xl z-50 transform transition-transform duration-300 ease-in-out
                    overflow-y-auto border-l ${darkmode ? 'border-gray-800' : 'border-gray-200'}
                    custom-scrollbar
                `}
            >
                {/* Panel Header */}
                <div className={`
                    sticky top-0 z-10 p-4 border-b ${darkmode ? 'border-gray-800 bg-dark' : 'border-gray-200 bg-white'}
                    flex items-center justify-between
                `}>
                    <h2 className={`text-xl font-bold ${darkmode ? 'text-white' : 'text-gray-900'}`}>
                        Room Details
                    </h2>
                    <button
                        onClick={onClose}
                        className={`
                            p-2 rounded-lg transition-colors
                            ${darkmode 
                                ? 'hover:bg-gray-800 text-gray-400' 
                                : 'hover:bg-gray-100 text-gray-600'
                            }
                        `}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
                
                {/* Panel Content */}
                <div className="p-6 space-y-6">
                    {isLoadingDetails ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                        </div>
                    ) : roomDetails ? (
                        <>
                            {/* Room Profile Image with Cover Image Background */}
                            <div className="flex justify-center relative w-40 h-40 mx-auto">
                                {/* Cover Image as Background - Larger and behind */}
                                {roomDetails.has_cover_image && roomDetails.cover_image_url && (
                                    <img 
                                        src={roomDetails.cover_image_url} 
                                        alt="Cover background"
                                        className="absolute inset-0 w-full h-full rounded-full object-cover opacity-40"
                                    />
                                )}
                                
                                {/* Profile Image (on top) */}
                                <div className="relative z-10">
                                    {roomDetails.has_profile_image && roomDetails.profile_image_url ? (
                                        <img 
                                            src={roomDetails.profile_image_url} 
                                            alt={roomDetails.name}
                                            className="w-32 h-32 rounded-full object-cover border-4 border-purple-500"
                                        />
                                    ) : (
                                        <div className={`
                                            w-32 h-32 rounded-full flex items-center justify-center border-4 border-purple-500
                                            ${roomDetails.is_group 
                                                ? 'bg-gradient-to-br from-purple-500 to-pink-500' 
                                                : 'bg-gradient-to-br from-blue-500 to-cyan-500'
                                            }
                                        `}>
                                            {roomDetails.is_group ? (
                                                <Users className="w-16 h-16 text-white" />
                                            ) : (
                                                <User className="w-16 h-16 text-white" />
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            {/* Room Name */}
                            <div className="text-center">
                                <h3 className={`text-2xl font-bold mb-1 ${darkmode ? 'text-white' : 'text-gray-900'}`}>
                                    {roomDetails.name}
                                </h3>
                                <span className={`
                                    inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
                                    ${roomDetails.is_group 
                                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' 
                                        : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                                    }
                                `}>
                                    {roomDetails.type}
                                </span>
                            </div>
                            
                            {/* Room Description */}
                            {roomDetails.description && (
                                <div className={`p-4 rounded-lg ${darkmode ? 'bg-dark' : 'bg-gray-50'}`}>
                                    <h4 className={`text-sm font-semibold mb-2 flex items-center gap-2 ${darkmode ? 'text-gray-200' : 'text-gray-700'}`}>
                                        <Edit2 className="w-4 h-4" />
                                        Description
                                    </h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {roomDetails.description}
                                    </p>
                                </div>
                            )}
                            
                            {/* Room Info Grid */}
                            <div className="space-y-3">
                                {/* Created At */}
                                <div className={`flex items-center gap-3 p-3 rounded-lg ${darkmode ? 'bg-dark' : 'bg-gray-50'}`}>
                                    <Calendar className="w-5 h-5 text-gray-500" />
                                    <div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Created</p>
                                        <p className={`text-sm font-medium ${darkmode ? 'text-gray-200' : 'text-gray-700'}`}>
                                            {roomDetails.created_at 
                                                ? new Date(roomDetails.created_at).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })
                                                : 'N/A'
                                            }
                                        </p>
                                    </div>
                                </div>
                                
                                {/* Last Activity */}
                                <div className={`flex items-center gap-3 p-3 rounded-lg ${darkmode ? 'bg-dark' : 'bg-gray-50'}`}>
                                    <Clock className="w-5 h-5 text-gray-500" />
                                    <div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Last Activity</p>
                                        <p className={`text-sm font-medium ${darkmode ? 'text-gray-200' : 'text-gray-700'}`}>
                                            {roomDetails.last_activity_at 
                                                ? new Date(roomDetails.last_activity_at).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })
                                                : 'N/A'
                                            }
                                        </p>
                                    </div>
                                </div>
                                
                                {/* Admin Status */}
                                {roomDetails.is_admin && (
                                    <div className={`flex items-center gap-3 p-3 rounded-lg ${darkmode ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
                                        <Shield className="w-5 h-5 text-purple-500" />
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Your Role</p>
                                            <p className="text-sm font-medium text-purple-600 dark:text-purple-400">
                                                Administrator
                                            </p>
                                        </div>
                                    </div>
                                )}
                                
                                {/* Owner Status - Only for GROUP rooms */}
                                {roomDetails.is_group && roomDetails.is_owner && (
                                    <div className={`flex items-center gap-3 p-3 rounded-lg ${darkmode ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
                                        <UserCheck className="w-5 h-5 text-green-500" />
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Ownership</p>
                                            <p className="text-sm font-medium text-green-600 dark:text-green-400">
                                                Room Owner
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Members Section - Only show for group rooms */}
                            {roomDetails.is_group && (
                                <div className={`pt-4 border-t ${darkmode ? 'border-gray-800' : 'border-gray-200'}`}>
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            <UsersIcon className="w-5 h-5 text-purple-500" />
                                            <h3 className={`font-semibold ${darkmode ? 'text-white' : 'text-gray-900'}`}>
                                                Members
                                            </h3>
                                            <span className={`
                                                text-xs px-2 py-0.5 rounded-full
                                                ${darkmode ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-600'}
                                            `}>
                                                {members?.length || 0}
                                            </span>
                                        </div>
                                    </div>

                                    {isLoadingMembers ? (
                                        <div className="flex items-center justify-center py-8">
                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500"></div>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {/* Admins Section */}
                                            {admins.length > 0 && (
                                                <div>
                                                    <h4 className={`
                                                        text-xs font-semibold mb-2 uppercase tracking-wider
                                                        ${darkmode ? 'text-gray-400' : 'text-gray-500'}
                                                    `}>
                                                        Administrators ({admins.length})
                                                    </h4>
                                                    <div className="space-y-2">
                                                        {admins.map((member) => (
                                                            <div
                                                                key={member.member_id}
                                                                className={`
                                                                    flex items-center gap-3 p-2 rounded-lg
                                                                    ${darkmode ? 'hover:bg-gray-800/50' : 'hover:bg-gray-50'}
                                                                    transition-colors
                                                                `}
                                                            >
                                                                {/* Avatar */}
                                                                <div className="relative">
                                                                    {member.user.profile_picture ? (
                                                                        <img
                                                                            src={member.user.profile_picture}
                                                                            alt={getMemberDisplayName(member)}
                                                                            className="w-10 h-10 rounded-full object-cover"
                                                                        />
                                                                    ) : (
                                                                        <div className={`
                                                                            w-10 h-10 rounded-full flex items-center justify-center
                                                                            bg-gradient-to-br from-purple-500 to-pink-500
                                                                        `}>
                                                                            <span className="text-white text-sm font-medium">
                                                                                {getMemberDisplayName(member).charAt(0).toUpperCase()}
                                                                            </span>
                                                                        </div>
                                                                    )}
                                                                    
                                                                    {/* Role Badge */}
                                                                    <div className="absolute -bottom-1 -right-1">
                                                                        <div className={`
                                                                            p-0.5 rounded-full
                                                                            ${darkmode ? 'bg-dark' : 'bg-white'}
                                                                        `}>
                                                                            {getMemberRoleIcon(member)}
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* Member Info */}
                                                                <div className="flex-1 min-w-0">
                                                                    <p className={`font-medium truncate ${darkmode ? 'text-white' : 'text-gray-900'}`}>
                                                                        {getMemberDisplayName(member)}
                                                                        {member.user.username && getMemberDisplayName(member) !== member.user.username && (
                                                                            <span className={`text-xs ml-1 ${darkmode ? 'text-gray-500' : 'text-gray-400'}`}>
                                                                                (@{member.user.username})
                                                                            </span>
                                                                        )}
                                                                    </p>
                                                                    <p className={`text-xs ${darkmode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                                        {getMemberRoleText(member)}
                                                                    </p>
                                                                </div>

                                                                {/* Joined Date */}
                                                                <div className="text-right">
                                                                    <p className={`text-xs ${darkmode ? 'text-gray-500' : 'text-gray-400'}`}>
                                                                        Joined
                                                                    </p>
                                                                    <p className={`text-xs ${darkmode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                                        {member.joined_at 
                                                                            ? new Date(member.joined_at).toLocaleDateString()
                                                                            : 'N/A'
                                                                        }
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Regular Members Section */}
                                            {regularMembers.length > 0 && (
                                                <div>
                                                    <h4 className={`
                                                        text-xs font-semibold mb-2 uppercase tracking-wider
                                                        ${darkmode ? 'text-gray-400' : 'text-gray-500'}
                                                    `}>
                                                        Members ({regularMembers.length})
                                                    </h4>
                                                    <div className="space-y-2">
                                                        {regularMembers.map((member) => (
                                                            <div
                                                                key={member.member_id}
                                                                className={`
                                                                    flex items-center gap-3 p-2 rounded-lg
                                                                    ${darkmode ? 'hover:bg-gray-800/50' : 'hover:bg-gray-50'}
                                                                    transition-colors
                                                                `}
                                                            >
                                                                {/* Avatar */}
                                                                <div className="relative">
                                                                    {member.user.profile_picture ? (
                                                                        <img
                                                                            src={member.user.profile_picture}
                                                                            alt={getMemberDisplayName(member)}
                                                                            className="w-10 h-10 rounded-full object-cover"
                                                                        />
                                                                    ) : (
                                                                        <div className={`
                                                                            w-10 h-10 rounded-full flex items-center justify-center
                                                                            bg-gradient-to-br from-blue-500 to-cyan-500
                                                                        `}>
                                                                            <span className="text-white text-sm font-medium">
                                                                                {getMemberDisplayName(member).charAt(0).toUpperCase()}
                                                                            </span>
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                {/* Member Info */}
                                                                <div className="flex-1 min-w-0">
                                                                    <p className={`font-medium truncate ${darkmode ? 'text-white' : 'text-gray-900'}`}>
                                                                        {getMemberDisplayName(member)}
                                                                        {member.user.username && getMemberDisplayName(member) !== member.user.username && (
                                                                            <span className={`text-xs ml-1 ${darkmode ? 'text-gray-500' : 'text-gray-400'}`}>
                                                                                (@{member.user.username})
                                                                            </span>
                                                                        )}
                                                                    </p>
                                                                    <p className={`text-xs ${darkmode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                                        Member
                                                                    </p>
                                                                </div>

                                                                {/* Joined Date */}
                                                                <div className="text-right">
                                                                    <p className={`text-xs ${darkmode ? 'text-gray-500' : 'text-gray-400'}`}>
                                                                        Joined
                                                                    </p>
                                                                    <p className={`text-xs ${darkmode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                                        {member.joined_at 
                                                                            ? new Date(member.joined_at).toLocaleDateString()
                                                                            : 'N/A'
                                                                        }
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Empty State */}
                                            {(!members || members.length === 0) && !isLoadingMembers && (
                                                <div className="text-center py-8">
                                                    <UsersIcon className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                                                    <p className={`text-sm ${darkmode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                        No members found
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                            
                            {/* Delete Room - Only for GROUP rooms and only if owner */}
                            {roomDetails.is_group && roomDetails.is_owner && (
                                <div className={`pt-4 border-t ${darkmode ? 'border-gray-800' : 'border-gray-200'}`}>
                                    <button
                                        onClick={handleDeleteRoom}
                                        disabled={isDeleting}
                                        className={`
                                            w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg
                                            font-medium transition-all duration-300
                                            ${isDeleting
                                                ? 'bg-gray-400 cursor-not-allowed'
                                                : 'bg-red-500 hover:bg-red-600 text-white hover:shadow-lg'
                                            }
                                        `}
                                    >
                                        <Trash2 className="w-5 h-5" />
                                        {isDeleting ? 'Deleting...' : 'Delete Room'}
                                    </button>
                                    <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-2">
                                        This action cannot be undone
                                    </p>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                            Failed to load room details
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}