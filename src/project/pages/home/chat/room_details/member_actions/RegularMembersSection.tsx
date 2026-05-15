// src/project/pages/chat/room_details/member_actions/RegularMembersSection.tsx

import { MemberQueryResponseDTO } from "../../../../../../apis/chat/members/types";
import { MoreVertical } from "lucide-react";
import MemberActionsMenu from "./MemberActionsMenu";
interface RegularMembersSectionProps {
    regularMembers: MemberQueryResponseDTO[];
    darkmode: boolean;
    currentUserMemberId: string;
    isCurrentUserOwner: boolean;
    isCurrentUserAdmin: boolean;
    activeMenuMemberId: string | null;
    setActiveMenuMemberId: (id: string | null) => void;
    getMemberDisplayName: (member: MemberQueryResponseDTO) => string;
    handlePromoteMember: (memberId: string) => void;
    handleDemoteMember: (memberId: string) => void;
    handleRemoveMember: (memberId: string, memberName: string) => void;
}

const RegularMembersSection = ({
    regularMembers,
    darkmode,
    currentUserMemberId,
    isCurrentUserOwner,
    isCurrentUserAdmin,
    activeMenuMemberId,
    setActiveMenuMemberId,
    getMemberDisplayName,
    handlePromoteMember,
    handleDemoteMember,
    handleRemoveMember
}: RegularMembersSectionProps) => {
    return (
        <div>
            <h4 className={`text-xs font-semibold mb-2 uppercase tracking-wider ${darkmode ? 'text-gray-400' : 'text-gray-500'}`}>
                Members ({regularMembers.length})
            </h4>
            <div className="space-y-2">
                {regularMembers.map((member) => (
                    <div key={member.member_id} className={`relative flex items-center gap-3 p-2 rounded-lg ${darkmode ? 'hover:bg-gray-800/50' : 'hover:bg-gray-50'} transition-colors group`}>
                        <div>
                            {member.user.profile_picture ? (
                                <img src={member.user.profile_picture} alt={getMemberDisplayName(member)} className="w-10 h-10 rounded-full object-cover" />
                            ) : (
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-cyan-500`}>
                                    <span className="text-white text-sm font-medium">{getMemberDisplayName(member).charAt(0).toUpperCase()}</span>
                                </div>
                            )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                                <p className={`font-medium truncate ${darkmode ? 'text-white' : 'text-gray-900'}`}>{getMemberDisplayName(member)}</p>
                                {member.member_id === currentUserMemberId && <span className={`text-xs px-1.5 py-0.5 rounded ${darkmode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>You</span>}
                            </div>
                            <p className={`text-xs ${darkmode ? 'text-gray-500' : 'text-gray-400'}`}>Member</p>
                        </div>
                        
                        {(isCurrentUserOwner || (isCurrentUserAdmin && member.member_id !== currentUserMemberId)) && (
                            <div className="relative">
                                <button 
                                    onClick={() => setActiveMenuMemberId(activeMenuMemberId === member.member_id ? null : member.member_id)} 
                                    className={`p-1.5 rounded-lg transition-colors opacity-0 group-hover:opacity-100 ${darkmode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
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
    );
};

export default RegularMembersSection;