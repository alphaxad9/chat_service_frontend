import { useState } from "react";
import { UserView } from "../../../../../../apis/chat/rooms/types";
import { useCreateMember } from "../../../../../../apis/chat/members/hooks";
import { Search, X, Plus, UserPlus, Loader2, UsersIcon, CheckCircle } from "lucide-react";
import { useUsersToAddInGroup } from "../../../../../../apis/chat/rooms/hooks";
const AddMemberModal = ({ 
    isOpen, 
    onClose, 
    roomId, 
    darkmode,
    onMemberAdded 
}: { 
    isOpen: boolean; 
    onClose: () => void; 
    roomId: string; 
    darkmode: boolean;
    onMemberAdded: () => void;
}) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
    const [selectedRole, setSelectedRole] = useState<"USER" | "ADMIN">("USER");
    
    const { data: availableUsers, isLoading, refetch } = useUsersToAddInGroup(roomId, { limit: 100 });
    const createMember = useCreateMember();
    
    const filteredUsers = availableUsers?.filter(user => 
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];
    
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
            onMemberAdded();
            onClose();
            setSelectedUsers(new Set());
            setSearchTerm("");
        } catch (error) {
            console.error("Failed to add members:", error);
        }
    };
    
    const getUserDisplayName = (user: UserView) => {
        if (user.first_name && user.last_name) return `${user.first_name} ${user.last_name}`.trim();
        if (user.first_name) return user.first_name;
        return user.username;
    };
    
    if (!isOpen) return null;
    
    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={onClose} />
            <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-[500px] max-h-[80vh] overflow-hidden">
                <div className={`rounded-xl shadow-2xl overflow-hidden flex flex-col ${darkmode ? 'bg-gray-800' : 'bg-white'}`}>
                    {/* Header */}
                    <div className={`p-4 border-b flex items-center justify-between ${darkmode ? 'border-gray-700' : 'border-gray-200'}`}>
                        <div className="flex items-center gap-2">
                            <UserPlus className="w-5 h-5 text-purple-500" />
                            <h3 className={`font-semibold ${darkmode ? 'text-white' : 'text-gray-900'}`}>
                                Add Members
                            </h3>
                        </div>
                        <button onClick={onClose} className={`p-1 rounded-lg transition-colors ${darkmode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    
                    {/* Role Selection */}
                    <div className={`p-4 border-b ${darkmode ? 'border-gray-700' : 'border-gray-200'}`}>
                        <label className={`block text-sm font-medium mb-2 ${darkmode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Assign Role
                        </label>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setSelectedRole("USER")}
                                className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                    selectedRole === "USER"
                                        ? 'bg-purple-500 text-white'
                                        : darkmode 
                                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                Member
                            </button>
                            <button
                                onClick={() => setSelectedRole("ADMIN")}
                                className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                    selectedRole === "ADMIN"
                                        ? 'bg-purple-500 text-white'
                                        : darkmode 
                                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                Admin
                            </button>
                        </div>
                    </div>
                    
                    {/* Search */}
                    <div className={`p-4 border-b ${darkmode ? 'border-gray-700' : 'border-gray-200'}`}>
                        <div className="relative">
                            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${darkmode ? 'text-gray-500' : 'text-gray-400'}`} />
                            <input
                                type="text"
                                placeholder="Search users..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className={`
                                    w-full pl-10 pr-4 py-2 rounded-lg border transition-colors
                                    ${darkmode 
                                        ? 'bg-gray-700 border-gray-600 text-white focus:border-purple-500' 
                                        : 'bg-white border-gray-300 text-gray-900 focus:border-purple-500'
                                    }
                                    focus:outline-none focus:ring-2 focus:ring-purple-500/20
                                `}
                            />
                        </div>
                    </div>
                    
                    {/* Users List */}
                    <div className="flex-1 overflow-y-auto max-h-[400px] p-2">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
                            </div>
                        ) : filteredUsers.length === 0 ? (
                            <div className="text-center py-8">
                                <UsersIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                <p className={`text-sm ${darkmode ? 'text-gray-400' : 'text-gray-500'}`}>
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
                                        w-full flex items-center gap-3 p-3 rounded-lg transition-all mb-1
                                        ${selectedUsers.has(user.user_id)
                                            ? darkmode 
                                                ? 'bg-purple-500/20 border border-purple-500' 
                                                : 'bg-purple-50 border border-purple-500'
                                            : darkmode 
                                                ? 'hover:bg-gray-700' 
                                                : 'hover:bg-gray-50'
                                        }
                                    `}
                                >
                                    {/* Avatar */}
                                    {user.profile_picture ? (
                                        <img src={user.profile_picture} alt={user.username} className="w-10 h-10 rounded-full object-cover" />
                                    ) : (
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-cyan-500`}>
                                            <span className="text-white text-sm font-medium">
                                                {getUserDisplayName(user).charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                    )}
                                    
                                    {/* User Info */}
                                    <div className="flex-1 text-left">
                                        <p className={`font-medium ${darkmode ? 'text-white' : 'text-gray-900'}`}>
                                            {getUserDisplayName(user)}
                                        </p>
                                        <p className={`text-xs ${darkmode ? 'text-gray-400' : 'text-gray-500'}`}>
                                            @{user.username}
                                        </p>
                                    </div>
                                    
                                    {/* Checkmark */}
                                    {selectedUsers.has(user.user_id) && (
                                        <CheckCircle className="w-5 h-5 text-purple-500" />
                                    )}
                                </button>
                            ))
                        )}
                    </div>
                    
                    {/* Footer */}
                    <div className={`p-4 border-t flex gap-2 ${darkmode ? 'border-gray-700' : 'border-gray-200'}`}>
                        <button
                            onClick={onClose}
                            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${darkmode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleAddMembers}
                            disabled={selectedUsers.size === 0 || createMember.isPending}
                            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                                selectedUsers.size === 0 || createMember.isPending
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-purple-500 hover:bg-purple-600 text-white'
                            }`}
                        >
                            {createMember.isPending ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Plus className="w-4 h-4" />
                            )}
                            Add {selectedUsers.size > 0 && `(${selectedUsers.size})`}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};
export default AddMemberModal;