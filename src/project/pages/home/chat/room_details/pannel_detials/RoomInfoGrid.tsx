// src/project/pages/chat/room_details/pannel_detials/RoomInfoGrid.tsx

import { 
    Calendar, 
    Clock, 
    Shield, 
    UserCheck,
} from "lucide-react";

interface RoomInfoGridProps {
    roomDetails: {
        created_at: string | null;
        last_activity_at: string | null;
        is_admin: boolean;
        is_group: boolean;
        is_owner: boolean;
    };
    darkmode: boolean;
}

const RoomInfoGrid = ({ roomDetails, darkmode }: RoomInfoGridProps) => {
    return (
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
    );
};

export default RoomInfoGrid;