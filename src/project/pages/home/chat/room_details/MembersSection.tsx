// src/project/pages/chat/room_details/MembersSection.tsx

import { useState, useEffect } from "react";
import { MemberQueryResponseDTO } from "../../../../../apis/chat/members/types";
import { 
    Users as UsersIcon, 
    Crown, 
    User, 
    MoreVertical,
    ArrowUpCircle,
    ArrowDownCircle,
    LogOut,
    Shield,
    UserMinus,
    CheckCircle,
    XCircle,
    Loader2
} from "lucide-react";
import { 
    useActiveRoomMembersQuery, 
    useMyMembershipQuery,
    usePromoteMember,
    useDemoteMember,
    useRemoveMember,
    useLeaveRoom
} from "../../../../../apis/chat/members/hooks";
import { useQueryClient } from "@tanstack/react-query";

interface MembersSectionProps {
    roomId: string;
    darkmode: boolean;
}

interface ToastProps {
    message: string;
    type: 'success' | 'error' | 'info';
    onClose: () => void;
}

const Toast = ({ message, type, onClose }: ToastProps) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 animate-slide-up">
            <div className={`
                flex items-center gap-2 px-4 py-2.5 rounded-lg shadow-lg
                ${type === 'success' ? 'bg-green-500 text-white' : ''}
                ${type === 'error' ? 'bg-red-500 text-white' : ''}
                ${type === 'info' ? 'bg-blue-500 text-white' : ''}
            `}>
                {type === 'success' && <CheckCircle className="w-4 h-4" />}
                {type === 'error' && <XCircle className="w-4 h-4" />}
                {type === 'info' && <Loader2 className="w-4 h-4 animate-spin" />}
                <span className="text-sm font-medium">{message}</span>
            </div>
        </div>
    );
};

interface ConfirmationDialogProps {
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    darkmode: boolean;
}

const ConfirmationDialog = ({ title, message, onConfirm, onCancel, darkmode }: ConfirmationDialogProps) => {
    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={onCancel} />
            <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-80">
                <div className={`
                    rounded-xl shadow-2xl overflow-hidden
                    ${darkmode ? 'bg-gray-800' : 'bg-white'}
                `}>
                    <div className={`p-4 ${darkmode ? 'border-b border-gray-700' : 'border-b border-gray-200'}`}>
                        <h3 className={`font-semibold ${darkmode ? 'text-white' : 'text-gray-900'}`}>
                            {title}
                        </h3>
                    </div>
                    <div className="p-4">
                        <p className={`text-sm ${darkmode ? 'text-gray-300' : 'text-gray-600'}`}>
                            {message}
                        </p>
                    </div>
                    <div className={`flex gap-2 p-4 pt-0`}>
                        <button
                            onClick={onCancel}
                            className={`
                                flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors
                                ${darkmode 
                                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }
                            `}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onConfirm}
                            className="flex-1 px-4 py-2 rounded-lg text-sm font-medium bg-red-500 text-white hover:bg-red-600 transition-colors"
                        >
                            Confirm
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

interface MemberActionsMenuProps {
    member: MemberQueryResponseDTO;
    currentUserMemberId: string;
    isCurrentUserOwner: boolean;
    isCurrentUserAdmin: boolean;
    darkmode: boolean;
    onClose: () => void;
    onPromote: (memberId: string) => void;
    onDemote: (memberId: string) => void;
    onRemove: (memberId: string, memberName: string) => void;
}

const MemberActionsMenu = ({ 
    member, 
    currentUserMemberId,
    isCurrentUserOwner,
    isCurrentUserAdmin,
    darkmode, 
    onClose,
    onPromote,
    onDemote,
    onRemove
}: MemberActionsMenuProps) => {
    // Can't perform actions on yourself
    const isSelf = member.member_id === currentUserMemberId;
    
    // Determine what actions to show
    const canPromote = isCurrentUserOwner && !member.is_admin && !isSelf;
    const canDemote = (isCurrentUserOwner || isCurrentUserAdmin) && member.is_admin && !isSelf;
    const canRemove = (isCurrentUserOwner || isCurrentUserAdmin) && !isSelf;
    
    return (
        <>
            <div className="fixed inset-0 z-40" onClick={onClose} />
            <div className={`
                absolute right-0 mt-2 w-56 rounded-lg shadow-lg z-50
                ${darkmode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}
                overflow-hidden
            `}>
                {canPromote && (
                    <button
                        onClick={() => {
                            onPromote(member.member_id);
                            onClose();
                        }}
                        className={`
                            w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors
                            ${darkmode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-50 text-gray-700'}
                        `}
                    >
                        <ArrowUpCircle className="w-4 h-4 text-green-500" />
                        <span>Promote to Admin</span>
                    </button>
                )}
                
                {canDemote && (
                    <button
                        onClick={() => {
                            onDemote(member.member_id);
                            onClose();
                        }}
                        className={`
                            w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors
                            ${darkmode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-50 text-gray-700'}
                        `}
                    >
                        <ArrowDownCircle className="w-4 h-4 text-orange-500" />
                        <span>Demote to Member</span>
                    </button>
                )}
                
                {canRemove && (
                    <button
                        onClick={() => {
                            const memberName = member.user.first_name 
                                ? `${member.user.first_name} ${member.user.last_name || ''}`.trim()
                                : member.user.username;
                            onRemove(member.member_id, memberName);
                            onClose();
                        }}
                        className={`
                            w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors
                            ${darkmode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-50 text-gray-700'}
                            border-t ${darkmode ? 'border-gray-700' : 'border-gray-100'}
                        `}
                    >
                        <UserMinus className="w-4 h-4 text-red-500" />
                        <span>Remove from Group</span>
                    </button>
                )}
            </div>
        </>
    );
};

const MembersSection = ({ roomId, darkmode }: MembersSectionProps) => {
    const queryClient = useQueryClient();
    const [activeMenuMemberId, setActiveMenuMemberId] = useState<string | null>(null);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
    const [confirmation, setConfirmation] = useState<{
        title: string;
        message: string;
        onConfirm: () => void;
    } | null>(null);
    
    // Fetch all members in the room
    const { 
        data: members, 
        isLoading: isLoadingMembers,
        refetch: refetchMembers,
        error: membersError
    } = useActiveRoomMembersQuery(roomId);
    
    // Get current user's membership to determine permissions
    const { data: myMembership, error: myMembershipError } = useMyMembershipQuery(roomId);
    
    // Mutations
    const promoteMutation = usePromoteMember();
    const demoteMutation = useDemoteMember();
    const removeMutation = useRemoveMember();
    const leaveMutation = useLeaveRoom();
    
    // Check if current user is owner
    const isCurrentUserOwner = myMembership?.is_admin === true;
    const isCurrentUserAdmin = myMembership?.is_admin === true;
    const currentUserMemberId = myMembership?.member_id || '';
    
    // Helper to get member role icon
    const getMemberRoleIcon = (member: MemberQueryResponseDTO) => {
        if (member.is_admin) {
            return <Crown className="w-4 h-4 text-yellow-500" />;
        }
        return <User className="w-4 h-4 text-gray-400" />;
    };
    
    // Helper to get display name from member
    const getMemberDisplayName = (member: MemberQueryResponseDTO) => {
        if (member.user.first_name && member.user.last_name) {
            return `${member.user.first_name} ${member.user.last_name}`.trim();
        }
        if (member.user.first_name) {
            return member.user.first_name;
        }
        return member.user.username;
    };

    // Helper to get member role text
    const getMemberRoleText = (member: MemberQueryResponseDTO) => {
        if (member.is_admin) {
            return "Admin";
        }
        return "Member";
    };
    
    // Show toast notification
    const showToast = (message: string, type: 'success' | 'error' | 'info') => {
        setToast({ message, type });
    };
    
    // Handle promote member
    const handlePromoteMember = async (memberId: string) => {
        const member = members?.find(m => m.member_id === memberId);
        const memberName = member ? getMemberDisplayName(member) : 'this member';
        
        setConfirmation({
            title: 'Promote to Admin',
            message: `Are you sure you want to promote ${memberName} to admin?`,
            onConfirm: () => {
                setConfirmation(null);
                showToast(`Promoting ${memberName}...`, 'info');
                
                promoteMutation.mutate(memberId, {
                    onSuccess: (response) => {
                        console.log('Promote success:', response);
                        showToast(`${memberName} is now an admin`, 'success');
                        setTimeout(() => {
                            refetchMembers();
                        }, 500);
                        setActiveMenuMemberId(null);
                    },
                    onError: (error: any) => {
                        console.error('Promote error:', error);
                        showToast(error?.message || 'Failed to promote member', 'error');
                    }
                });
            }
        });
    };
    
    // Handle demote member
    const handleDemoteMember = async (memberId: string) => {
        const member = members?.find(m => m.member_id === memberId);
        const memberName = member ? getMemberDisplayName(member) : 'this member';
        
        setConfirmation({
            title: 'Demote to Member',
            message: `Are you sure you want to demote ${memberName} to regular member?`,
            onConfirm: () => {
                setConfirmation(null);
                showToast(`Demoting ${memberName}...`, 'info');
                
                demoteMutation.mutate(memberId, {
                    onSuccess: (response) => {
                        console.log('Demote success:', response);
                        showToast(`${memberName} is now a regular member`, 'success');
                        setTimeout(() => {
                            refetchMembers();
                        }, 500);
                        setActiveMenuMemberId(null);
                    },
                    onError: (error: any) => {
                        console.error('Demote error:', error);
                        showToast(error?.message || 'Failed to demote member', 'error');
                    }
                });
            }
        });
    };
    
    // Handle remove member
    const handleRemoveMember = async (memberId: string, memberName: string) => {
        setConfirmation({
            title: 'Remove Member',
            message: `Are you sure you want to remove ${memberName} from this group?`,
            onConfirm: () => {
                setConfirmation(null);
                showToast(`Removing ${memberName}...`, 'info');
                
                removeMutation.mutate(memberId, {
                    onSuccess: (response) => {
                        console.log('Remove success:', response);
                        showToast(`${memberName} has been removed from the group`, 'success');
                        setTimeout(() => {
                            refetchMembers();
                        }, 500);
                        setActiveMenuMemberId(null);
                    },
                    onError: (error: any) => {
                        console.error('Remove error:', error);
                        showToast(error?.message || 'Failed to remove member', 'error');
                    }
                });
            }
        });
    };
    
    // Handle leave room
    const handleLeaveRoom = async () => {
        if (!currentUserMemberId) {
            showToast('Unable to leave: Member ID not found', 'error');
            return;
        }
        
        setConfirmation({
            title: 'Leave Group',
            message: 'Are you sure you want to leave this group? You can rejoin if invited again.',
            onConfirm: () => {
                setConfirmation(null);
                showToast('Leaving group...', 'info');
                
                leaveMutation.mutate(currentUserMemberId, {
                    onSuccess: (response) => {
                        console.log('Leave success:', response);
                        showToast('You have left the group', 'success');
                        setTimeout(() => {
                            window.location.href = '/chat';
                        }, 1500);
                    },
                    onError: (error: any) => {
                        console.error('Leave error:', error);
                        showToast(error?.message || 'Failed to leave group', 'error');
                    }
                });
            }
        });
    };
    
    // Debug logging
    useEffect(() => {
        console.log('MembersSection mounted with roomId:', roomId);
        console.log('Members data:', members);
        console.log('My membership:', myMembership);
        if (membersError) console.error('Members fetch error:', membersError);
        if (myMembershipError) console.error('My membership error:', myMembershipError);
    }, [roomId, members, myMembership, membersError, myMembershipError]);
    
    const admins = members?.filter(m => m.is_admin) || [];
    const regularMembers = members?.filter(m => !m.is_admin) || [];
    const isLoading = isLoadingMembers || promoteMutation.isPending || demoteMutation.isPending || removeMutation.isPending || leaveMutation.isPending;
    
    return (
        <>
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
                    
                    {/* Leave Room Button for non-admin/non-owner users */}
                    {myMembership && !isCurrentUserAdmin && !isCurrentUserOwner && (
                        <button
                            onClick={handleLeaveRoom}
                            disabled={leaveMutation.isPending}
                            className={`
                                flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all
                                ${darkmode 
                                    ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' 
                                    : 'bg-red-50 text-red-600 hover:bg-red-100'
                                }
                                ${leaveMutation.isPending ? 'opacity-50 cursor-not-allowed' : ''}
                            `}
                        >
                            <LogOut className="w-4 h-4" />
                            {leaveMutation.isPending ? 'Leaving...' : 'Leave Group'}
                        </button>
                    )}
                </div>

                {isLoadingMembers ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500"></div>
                    </div>
                ) : (
                    <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar">
                        {/* Admins Section */}
                        {admins.length > 0 && (
                            <div>
                                <h4 className={`
                                    text-xs font-semibold mb-2 uppercase tracking-wider flex items-center gap-2
                                    ${darkmode ? 'text-gray-400' : 'text-gray-500'}
                                `}>
                                    <Shield className="w-3 h-3" />
                                    Administrators ({admins.length})
                                </h4>
                                <div className="space-y-2">
                                    {admins.map((member) => (
                                        <div
                                            key={member.member_id}
                                            className={`
                                                relative flex items-center gap-3 p-2 rounded-lg
                                                ${darkmode ? 'hover:bg-gray-800/50' : 'hover:bg-gray-50'}
                                                transition-colors group
                                            `}
                                        >
                                            {/* Avatar */}
                                            <div className="relative">
                                                {member.user.profile_picture ? (
                                                    <img
                                                        src={member.user.profile_picture}
                                                        alt={getMemberDisplayName(member)}
                                                        className="w-10 h-10 rounded-full object-cover"
                                                        onError={(e) => {
                                                            (e.target as HTMLImageElement).style.display = 'none';
                                                        }}
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
                                                        ${darkmode ? 'bg-gray-900' : 'bg-white'}
                                                    `}>
                                                        {getMemberRoleIcon(member)}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Member Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-1.5 flex-wrap">
                                                    <p className={`font-medium truncate ${darkmode ? 'text-white' : 'text-gray-900'}`}>
                                                        {getMemberDisplayName(member)}
                                                    </p>
                                                    {member.member_id === currentUserMemberId && (
                                                        <span className={`
                                                            text-xs px-1.5 py-0.5 rounded
                                                            ${darkmode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}
                                                        `}>
                                                            You
                                                        </span>
                                                    )}
                                                </div>
                                                {member.user.username && getMemberDisplayName(member) !== member.user.username && (
                                                    <p className={`text-xs ${darkmode ? 'text-gray-500' : 'text-gray-400'}`}>
                                                        @{member.user.username}
                                                    </p>
                                                )}
                                                <p className={`text-xs mt-0.5 ${darkmode ? 'text-gray-500' : 'text-gray-400'}`}>
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
                                            
                                            {/* Actions Menu Button - Only for users with permissions */}
                                            {(isCurrentUserOwner || (isCurrentUserAdmin && member.member_id !== currentUserMemberId)) && (
                                                <div className="relative">
                                                    <button
                                                        onClick={() => setActiveMenuMemberId(
                                                            activeMenuMemberId === member.member_id ? null : member.member_id
                                                        )}
                                                        className={`
                                                            p-1.5 rounded-lg transition-colors opacity-0 group-hover:opacity-100
                                                            ${darkmode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}
                                                        `}
                                                    >
                                                        <MoreVertical className="w-4 h-4" />
                                                    </button>
                                                    
                                                    {activeMenuMemberId === member.member_id && (
                                                        <MemberActionsMenu
                                                            member={member}
                                                            currentUserMemberId={currentUserMemberId}
                                                            isCurrentUserOwner={isCurrentUserOwner}
                                                            isCurrentUserAdmin={isCurrentUserAdmin}
                                                            darkmode={darkmode}
                                                            onClose={() => setActiveMenuMemberId(null)}
                                                            onPromote={handlePromoteMember}
                                                            onDemote={handleDemoteMember}
                                                            onRemove={handleRemoveMember}
                                                        />
                                                    )}
                                                </div>
                                            )}
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
                                                relative flex items-center gap-3 p-2 rounded-lg
                                                ${darkmode ? 'hover:bg-gray-800/50' : 'hover:bg-gray-50'}
                                                transition-colors group
                                            `}
                                        >
                                            {/* Avatar */}
                                            <div className="relative">
                                                {member.user.profile_picture ? (
                                                    <img
                                                        src={member.user.profile_picture}
                                                        alt={getMemberDisplayName(member)}
                                                        className="w-10 h-10 rounded-full object-cover"
                                                        onError={(e) => {
                                                            (e.target as HTMLImageElement).style.display = 'none';
                                                        }}
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
                                                <div className="flex items-center gap-1.5 flex-wrap">
                                                    <p className={`font-medium truncate ${darkmode ? 'text-white' : 'text-gray-900'}`}>
                                                        {getMemberDisplayName(member)}
                                                    </p>
                                                    {member.member_id === currentUserMemberId && (
                                                        <span className={`
                                                            text-xs px-1.5 py-0.5 rounded
                                                            ${darkmode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}
                                                        `}>
                                                            You
                                                        </span>
                                                    )}
                                                </div>
                                                {member.user.username && getMemberDisplayName(member) !== member.user.username && (
                                                    <p className={`text-xs ${darkmode ? 'text-gray-500' : 'text-gray-400'}`}>
                                                        @{member.user.username}
                                                    </p>
                                                )}
                                                <p className={`text-xs mt-0.5 ${darkmode ? 'text-gray-500' : 'text-gray-400'}`}>
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
                                            
                                            {/* Actions Menu Button - Only for users with permissions */}
                                            {(isCurrentUserOwner || (isCurrentUserAdmin && member.member_id !== currentUserMemberId)) && (
                                                <div className="relative">
                                                    <button
                                                        onClick={() => setActiveMenuMemberId(
                                                            activeMenuMemberId === member.member_id ? null : member.member_id
                                                        )}
                                                        className={`
                                                            p-1.5 rounded-lg transition-colors opacity-0 group-hover:opacity-100
                                                            ${darkmode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}
                                                        `}
                                                    >
                                                        <MoreVertical className="w-4 h-4" />
                                                    </button>
                                                    
                                                    {activeMenuMemberId === member.member_id && (
                                                        <MemberActionsMenu
                                                            member={member}
                                                            currentUserMemberId={currentUserMemberId}
                                                            isCurrentUserOwner={isCurrentUserOwner}
                                                            isCurrentUserAdmin={isCurrentUserAdmin}
                                                            darkmode={darkmode}
                                                            onClose={() => setActiveMenuMemberId(null)}
                                                            onPromote={handlePromoteMember}
                                                            onDemote={handleDemoteMember}
                                                            onRemove={handleRemoveMember}
                                                        />
                                                    )}
                                                </div>
                                            )}
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
            
            {/* Toast Notifications */}
            {toast && (
                <Toast 
                    message={toast.message} 
                    type={toast.type} 
                    onClose={() => setToast(null)} 
                />
            )}
            
            {/* Confirmation Dialog */}
            {confirmation && (
                <ConfirmationDialog
                    title={confirmation.title}
                    message={confirmation.message}
                    onConfirm={confirmation.onConfirm}
                    onCancel={() => setConfirmation(null)}
                    darkmode={darkmode}
                />
            )}
            
            <style>{`
                @keyframes slide-up {
                    from {
                        opacity: 0;
                        transform: translateX(-50%) translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(-50%) translateY(0);
                    }
                }
                
                .animate-slide-up {
                    animation: slide-up 0.3s ease-out;
                }
                    @keyframes slide-in-right {
    from {
        opacity: 0;
        transform: translateX(100px);
    }
    to {
        opacity: 1;
        transform: translateX(0);
    }
}

.animate-slide-in-right {
    animation: slide-in-right 0.3s ease-out;
}
            `}</style>
        </>
    );
}

export default MembersSection;