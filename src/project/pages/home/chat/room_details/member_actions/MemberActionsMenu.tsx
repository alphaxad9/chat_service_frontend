import { MemberQueryResponseDTO } from "../../../../../../apis/chat/members/types";
import { ArrowUpCircle, ArrowDownCircle, UserMinus } from "lucide-react";
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
    const isSelf = member.member_id === currentUserMemberId;
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
                        onClick={() => { onPromote(member.member_id); onClose(); }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${darkmode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-50 text-gray-700'}`}
                    >
                        <ArrowUpCircle className="w-4 h-4 text-green-500" />
                        <span>Promote to Admin</span>
                    </button>
                )}
                
                {canDemote && (
                    <button
                        onClick={() => { onDemote(member.member_id); onClose(); }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${darkmode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-50 text-gray-700'}`}
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
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${darkmode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-50 text-gray-700'} border-t ${darkmode ? 'border-gray-700' : 'border-gray-100'}`}
                    >
                        <UserMinus className="w-4 h-4 text-red-500" />
                        <span>Remove from Group</span>
                    </button>
                )}
            </div>
        </>
    );
};
export default MemberActionsMenu;