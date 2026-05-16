import { useState } from "react";
import { MemberQueryResponseDTO } from "../../../../../apis/chat/members/types";
import { UserView } from "../../../../../apis/chat/rooms/types";
import RegularMembersSection from "./member_actions/RegularMembersSection";
import { Toast } from "./member_actions/ConfirmationDialog";
import { 
    Users as UsersIcon, 
    Crown, 
    User, 
    MoreVertical,
    LogOut,
    Shield,
    Loader2,
    UserPlus,
    Search,
    CheckCircle,
    X
} from "lucide-react";
import { 
    useActiveRoomMembersQuery, 
    useMyMembershipQuery,
    usePromoteMember,
    useDemoteMember,
    useRemoveMember,
    useLeaveRoom,
    useCreateMember
} from "../../../../../apis/chat/members/hooks";
import { useUsersToAddInGroup } from "../../../../../apis/chat/rooms/hooks";

interface MembersSectionProps {
    roomId: string;
    darkmode: boolean;
}

const MembersSection = ({ roomId, darkmode }: MembersSectionProps) => {
    const [activeMenuMemberId, setActiveMenuMemberId] = useState<string | null>(null);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
    const [showAddMembers, setShowAddMembers] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
    const [selectedRole, setSelectedRole] = useState<"USER" | "ADMIN">("USER");
    
    const { 
        data: members, 
        isLoading: isLoadingMembers,
        refetch: refetchMembers,
    } = useActiveRoomMembersQuery(roomId);
    
    const { data: myMembership } = useMyMembershipQuery(roomId);
    const { data: availableUsers, isLoading: isLoadingUsers } = useUsersToAddInGroup(roomId, { limit: 100 });
    const promoteMutation = usePromoteMember();
    const demoteMutation = useDemoteMember();
    const removeMutation = useRemoveMember();
    const leaveMutation = useLeaveRoom();
    const createMember = useCreateMember();
    
    const isCurrentUserOwner = myMembership?.is_admin === true;
    const isCurrentUserAdmin = myMembership?.is_admin === true;
    const currentUserMemberId = myMembership?.member_id || '';
    
    const showToast = (message: string, type: 'success' | 'error' | 'info') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };
    
    const getMemberDisplayName = (member: MemberQueryResponseDTO) => {
        if (member.user.first_name && member.user.last_name) {
            return `${member.user.first_name} ${member.user.last_name}`.trim();
        }
        if (member.user.first_name) return member.user.first_name;
        return member.user.username;
    };
    
    const getUserDisplayName = (user: UserView) => {
        if (user.first_name && user.last_name) return `${user.first_name} ${user.last_name}`.trim();
        if (user.first_name) return user.first_name;
        return user.username;
    };
    
    const handlePromoteMember = async (memberId: string) => {
        const member = members?.find(m => m.member_id === memberId);
        const memberName = member ? getMemberDisplayName(member) : 'this member';
        
        showToast(`Promoting ${memberName}...`, 'info');
        promoteMutation.mutate(memberId, {
            onSuccess: () => {
                showToast(`${memberName} is now an admin`, 'success');
                setTimeout(() => refetchMembers(), 500);
                setActiveMenuMemberId(null);
            },
            onError: (error: any) => showToast(error?.message || 'Failed to promote member', 'error'),
        });
    };
    
    const handleDemoteMember = async (memberId: string) => {
        const member = members?.find(m => m.member_id === memberId);
        const memberName = member ? getMemberDisplayName(member) : 'this member';
        
        showToast(`Demoting ${memberName}...`, 'info');
        demoteMutation.mutate(memberId, {
            onSuccess: () => {
                showToast(`${memberName} is now a regular member`, 'success');
                setTimeout(() => refetchMembers(), 500);
                setActiveMenuMemberId(null);
            },
            onError: (error: any) => showToast(error?.message || 'Failed to demote member', 'error'),
        });
    };
    
    const handleRemoveMember = async (memberId: string, memberName: string) => {
        showToast(`Removing ${memberName}...`, 'info');
        removeMutation.mutate(memberId, {
            onSuccess: () => {
                showToast(`${memberName} has been removed`, 'success');
                setTimeout(() => refetchMembers(), 500);
                setActiveMenuMemberId(null);
            },
            onError: (error: any) => showToast(error?.message || 'Failed to remove member', 'error'),
        });
    };
    
    const handleLeaveRoom = async () => {
        showToast('Leaving group...', 'info');
        leaveMutation.mutate(currentUserMemberId, {
            onSuccess: () => {
                showToast('You have left the group', 'success');
                setTimeout(() => window.location.href = '/chat', 1500);
            },
            onError: (error: any) => showToast(error?.message || 'Failed to leave group', 'error'),
        });
    };
    
    const handleAddMembers = async () => {
        if (selectedUsers.size === 0) return;
        
        const promises = Array.from(selectedUsers).map(userId => 
            createMember.mutateAsync({ 
                roomId, 
                data: { user_id: userId, status: selectedRole } 
            })
        );
        
        try {
            await Promise.all(promises);
            showToast(`Added ${selectedUsers.size} member(s) successfully!`, 'success');
            refetchMembers();
            setSelectedUsers(new Set());
            setSearchTerm("");
            setShowAddMembers(false);
        } catch (error) {
            console.error("Failed to add members:", error);
            showToast('Failed to add members', 'error');
        }
    };
    
    const filteredUsers = availableUsers?.filter(user => 
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];
    
    const admins = members?.filter(m => m.is_admin) || [];
    const regularMembers = members?.filter(m => !m.is_admin) || [];
    
    // Show loading state for membership check
    if (!myMembership && !isLoadingMembers) {
        return (
            <div className={`pt-4 border-t ${darkmode ? 'border-black' : 'border-gray-200'}`}>
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
                    <span className={`ml-2 ${darkmode ? 'text-gray-400' : 'text-gray-500'}`}>Loading permissions...</span>
                </div>
            </div>
        );
    }
    
    return (
        <>
            <div className={`pt-4 border-t ${darkmode ? 'border-black' : 'border-gray-200'}`}>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <UsersIcon className="w-5 h-5 text-purple-500" />
                        <h3 className={`font-semibold ${darkmode ? 'text-white' : 'text-gray-900'}`}>
                            Members
                        </h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${darkmode ? 'bg-black text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                            {members?.length || 0}
                        </span>
                    </div>
                    
                    <div className="flex gap-2">
                        {/* Add Member Button */}
                        {(isCurrentUserAdmin || isCurrentUserOwner) && (
                            <button
                                onClick={() => setShowAddMembers(!showAddMembers)}
                                className={`
                                    flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all
                                    ${showAddMembers 
                                        ? 'bg-gray-600 text-white hover:bg-gray-700' 
                                        : 'bg-purple-600 text-white hover:bg-purple-700'
                                    }
                                    shadow-sm hover:shadow-md
                                `}
                            >
                                <UserPlus className="w-4 h-4" />
                                {showAddMembers ? 'Cancel' : 'Add Member'}
                            </button>
                        )}
                        
                        {/* Leave Room Button */}
                        {myMembership && !isCurrentUserAdmin && !isCurrentUserOwner && (
                            <button
                                onClick={handleLeaveRoom}
                                disabled={leaveMutation.isPending}
                                className={`
                                    flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all
                                    ${darkmode 
                                        ? 'bg-red-600/20 text-red-400 hover:bg-red-600/30 border border-red-800' 
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
                </div>

                {/* Add Members Inline Section */}
                {showAddMembers && (
                    <div className={`mb-4 p-4 rounded-lg ${darkmode ? 'bg-black/50 border border-gray-800' : 'bg-gray-50 border border-gray-200'}`}>
                        {/* Role Selection */}
                        <div className="mb-3">
                            <label className={`block text-xs font-medium mb-1 ${darkmode ? 'text-gray-300' : 'text-gray-700'}`}>
                                Assign Role
                            </label>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setSelectedRole("USER")}
                                    className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                                        selectedRole === "USER"
                                            ? 'bg-purple-600 text-white'
                                            : darkmode 
                                                ? 'bg-black text-gray-300 border border-gray-700 hover:bg-gray-900' 
                                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                                >
                                    Member
                                </button>
                                <button
                                    onClick={() => setSelectedRole("ADMIN")}
                                    className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                                        selectedRole === "ADMIN"
                                            ? 'bg-purple-600 text-white'
                                            : darkmode 
                                                ? 'bg-black text-gray-300 border border-gray-700 hover:bg-gray-900' 
                                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                                >
                                    Admin
                                </button>
                            </div>
                        </div>
                        
                        {/* Search */}
                        <div className="relative mb-3">
                            <Search className={`absolute left-2 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 ${darkmode ? 'text-gray-600' : 'text-gray-400'}`} />
                            <input
                                type="text"
                                placeholder="Search users to add..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className={`
                                    w-full pl-7 pr-2 py-1.5 text-sm rounded-md border transition-colors
                                    ${darkmode 
                                        ? 'bg-black border-gray-700 text-white focus:border-purple-500 placeholder-gray-600' 
                                        : 'bg-white border-gray-300 text-gray-900 focus:border-purple-500'
                                    }
                                    focus:outline-none focus:ring-2 focus:ring-purple-500/20
                                `}
                            />
                        </div>
                        
                        {/* Users List */}
                        <div className="max-h-[200px] overflow-y-auto mb-3 space-y-1">
                            {isLoadingUsers ? (
                                <div className="flex items-center justify-center py-4">
                                    <Loader2 className="w-5 h-5 animate-spin text-purple-500" />
                                </div>
                            ) : filteredUsers.length === 0 ? (
                                <div className="text-center py-4">
                                    <p className={`text-xs ${darkmode ? 'text-gray-500' : 'text-gray-500'}`}>
                                        No users available to add
                                    </p>
                                </div>
                            ) : (
                                filteredUsers.map((user) => (
                                    <button
                                        key={user.user_id}
                                        onClick={() => {
                                            const newSelected = new Set(selectedUsers);
                                            if (newSelected.has(user.user_id)) {
                                                newSelected.delete(user.user_id);
                                            } else {
                                                newSelected.add(user.user_id);
                                            }
                                            setSelectedUsers(newSelected);
                                        }}
                                        className={`
                                            w-full flex items-center gap-2 p-2 rounded-md transition-all text-left
                                            ${selectedUsers.has(user.user_id)
                                                ? darkmode 
                                                    ? 'bg-purple-600/20 border border-purple-600' 
                                                    : 'bg-purple-50 border border-purple-500'
                                                : darkmode 
                                                    ? 'hover:bg-gray-900' 
                                                    : 'hover:bg-gray-100'
                                            }
                                        `}
                                    >
                                        {/* Avatar */}
                                        {user.profile_picture ? (
                                            <img src={user.profile_picture} alt={user.username} className="w-7 h-7 rounded-full object-cover" />
                                        ) : (
                                            <div className={`w-7 h-7 rounded-full flex items-center justify-center bg-gradient-to-br from-purple-600 to-pink-600`}>
                                                <span className="text-white text-xs font-medium">
                                                    {getUserDisplayName(user).charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                        )}
                                        
                                        {/* User Info */}
                                        <div className="flex-1">
                                            <p className={`text-sm font-medium ${darkmode ? 'text-white' : 'text-gray-900'}`}>
                                                {getUserDisplayName(user)}
                                            </p>
                                            <p className={`text-xs ${darkmode ? 'text-gray-500' : 'text-gray-500'}`}>
                                                @{user.username}
                                            </p>
                                        </div>
                                        
                                        {/* Checkmark */}
                                        {selectedUsers.has(user.user_id) && (
                                            <CheckCircle className="w-4 h-4 text-purple-500" />
                                        )}
                                    </button>
                                ))
                            )}
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex gap-2">
                            <button
                                onClick={() => {
                                    setShowAddMembers(false);
                                    setSelectedUsers(new Set());
                                    setSearchTerm("");
                                }}
                                className={`flex-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${darkmode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddMembers}
                                disabled={selectedUsers.size === 0 || createMember.isPending}
                                className={`flex-1 px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                                    selectedUsers.size === 0 || createMember.isPending
                                        ? 'bg-gray-700 cursor-not-allowed text-gray-400'
                                        : 'bg-purple-600 hover:bg-purple-700 text-white'
                                }`}
                            >
                                {createMember.isPending ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <UserPlus className="w-4 h-4" />
                                )}
                                Add {selectedUsers.size > 0 && `(${selectedUsers.size})`}
                            </button>
                        </div>
                    </div>
                )}

                {isLoadingMembers ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
                    </div>
                ) : (
                    <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar">
                        {/* Admins Section */}
                        {admins.length > 0 && (
                            <div>
                                <h4 className={`text-xs font-semibold mb-2 uppercase tracking-wider flex items-center gap-2 ${darkmode ? 'text-gray-500' : 'text-gray-500'}`}>
                                    <Shield className="w-3 h-3" />
                                    Administrators ({admins.length})
                                </h4>
                                <div className="space-y-2">
                                    {admins.map((member) => (
                                        <div key={member.member_id} className={`relative flex items-center gap-3 p-2 rounded-lg ${darkmode ? 'hover:bg-gray-900' : 'hover:bg-gray-50'} transition-colors group`}>
                                            <div className="relative">
                                                {member.user.profile_picture ? (
                                                    <img src={member.user.profile_picture} alt={getMemberDisplayName(member)} className="w-10 h-10 rounded-full object-cover" />
                                                ) : (
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-purple-600 to-pink-600`}>
                                                        <span className="text-white text-sm font-medium">{getMemberDisplayName(member).charAt(0).toUpperCase()}</span>
                                                    </div>
                                                )}
                                                <div className="absolute -bottom-1 -right-1">
                                                    <div className={`p-0.5 rounded-full ${darkmode ? 'bg-black' : 'bg-white'}`}>
                                                        {member.is_admin ? <Crown className="w-4 h-4 text-yellow-500" /> : <User className="w-4 h-4 text-gray-500" />}
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-1.5 flex-wrap">
                                                    <p className={`font-medium truncate ${darkmode ? 'text-white' : 'text-gray-900'}`}>{getMemberDisplayName(member)}</p>
                                                    {member.member_id === currentUserMemberId && <span className={`text-xs px-1.5 py-0.5 rounded ${darkmode ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-600'}`}>You</span>}
                                                </div>
                                                <p className={`text-xs ${darkmode ? 'text-gray-500' : 'text-gray-400'}`}>Admin</p>
                                            </div>
                                            
                                            {(isCurrentUserOwner || (isCurrentUserAdmin && member.member_id !== currentUserMemberId)) && (
                                                <div className="relative">
                                                    <button 
                                                        onClick={() => setActiveMenuMemberId(activeMenuMemberId === member.member_id ? null : member.member_id)} 
                                                        className={`p-1.5 rounded-lg transition-colors opacity-0 group-hover:opacity-100 ${darkmode ? 'hover:bg-gray-800' : 'hover:bg-gray-200'}`}
                                                    >
                                                        <MoreVertical className="w-4 h-4" />
                                                    </button>
                                                    {activeMenuMemberId === member.member_id && (
                                                        <div className={`absolute right-0 top-full mt-1 z-50 min-w-[160px] rounded-lg shadow-lg overflow-hidden animate-slide-in-right ${darkmode ? 'bg-black border border-gray-800' : 'bg-white border border-gray-200'}`}>
                                                            <button
                                                                onClick={() => {
                                                                    handleDemoteMember(member.member_id);
                                                                    setActiveMenuMemberId(null);
                                                                }}
                                                                className={`w-full px-4 py-2 text-sm text-left transition-colors flex items-center gap-2 ${darkmode ? 'hover:bg-gray-900 text-gray-200' : 'hover:bg-gray-50 text-gray-700'}`}
                                                            >
                                                                <Shield className="w-4 h-4" />
                                                                Demote to Member
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    handleRemoveMember(member.member_id, getMemberDisplayName(member));
                                                                    setActiveMenuMemberId(null);
                                                                }}
                                                                className={`w-full px-4 py-2 text-sm text-left transition-colors flex items-center gap-2 ${darkmode ? 'hover:bg-gray-900 text-red-400' : 'hover:bg-gray-50 text-red-600'}`}
                                                            >
                                                                <User className="w-4 h-4" />
                                                                Remove Member
                                                            </button>
                                                        </div>
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
                            <RegularMembersSection 
                                regularMembers={regularMembers}
                                darkmode={darkmode}
                                currentUserMemberId={currentUserMemberId}
                                isCurrentUserOwner={isCurrentUserOwner}
                                isCurrentUserAdmin={isCurrentUserAdmin}
                                activeMenuMemberId={activeMenuMemberId}
                                setActiveMenuMemberId={setActiveMenuMemberId}
                                getMemberDisplayName={getMemberDisplayName}
                                handlePromoteMember={handlePromoteMember}
                                handleDemoteMember={handleDemoteMember}
                                handleRemoveMember={handleRemoveMember}
                            />
                        )}
                        
                        {(!members || members.length === 0) && !isLoadingMembers && (
                            <div className="text-center py-8">
                                <UsersIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                <p className={`text-sm ${darkmode ? 'text-gray-500' : 'text-gray-500'}`}>No members found</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
            
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            
            <style>{`
                @keyframes slide-in-right {
                    from { opacity: 0; transform: translateX(100px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                .animate-slide-in-right { animation: slide-in-right 0.2s ease-out; }
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #374151; border-radius: 3px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #4B5563; }
                .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #1F2937; }
            `}</style>
        </>
    );
};

export default MembersSection;