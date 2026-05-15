// src/project/pages/chat/room_details/RoomDetailsPannel.tsx
import { useState } from "react";
import { useRoomById, useDeleteGroupRoom } from "../../../../../apis/chat/rooms/hooks";
import "../../feed.css"
import { 
    Calendar, 
    Clock, 
    Trash2, 
    Edit2, 
    Shield, 
    UserCheck,
    X,
    CheckCircle,
    XCircle,
    Loader2
} from "lucide-react";
import { Users, User } from "lucide-react";
import { MyRoomsHomePageListDto } from "../../../../../apis/chat/rooms/types";
import { RefObject } from "react";
import MembersSection from "./MembersSection";

interface RoomDetailsPanelProps {
    room: MyRoomsHomePageListDto;
    darkmode: boolean;
    onClose: () => void;
    panelRef: RefObject<HTMLDivElement | null>;
}

interface ToastProps {
    message: string;
    type: 'success' | 'error' | 'info';
    onClose: () => void;
}

const Toast = ({ message, type, onClose }: ToastProps) => {
    setTimeout(() => {
        onClose();
    }, 3000);

    return (
        <div className="fixed top-20 right-4 z-50 animate-slide-in-right">
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
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default function RoomDetailsPannel({ room, darkmode, onClose, panelRef }: RoomDetailsPanelProps) {
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
    const [confirmation, setConfirmation] = useState<{
        title: string;
        message: string;
        onConfirm: () => void;
    } | null>(null);
    
    // Fetch detailed room information
    const { data: roomDetails, isLoading: isLoadingDetails } = useRoomById(
        room?.room_id || null
    );

    // Delete room mutation
    const { mutate: deleteRoom, isPending: isDeleting } = useDeleteGroupRoom();

    // Show toast notification
    const showToast = (message: string, type: 'success' | 'error' | 'info') => {
        setToast({ message, type });
    };

    // Handle delete room
    const handleDeleteRoom = () => {
        if (!room || !roomDetails) return;
        
        setConfirmation({
            title: 'Delete Room',
            message: `Are you sure you want to delete "${room.name}"? This action cannot be undone.`,
            onConfirm: () => {
                setConfirmation(null);
                showToast('Deleting room...', 'info');
                
                deleteRoom(roomDetails.room_id, {
                    onSuccess: () => {
                        showToast('Room deleted successfully', 'success');
                        setTimeout(() => {
                            onClose();
                            window.location.href = '/chat';
                        }, 1000);
                    },
                    onError: (error: any) => {
                        showToast(error?.message || 'Failed to delete room', 'error');
                    }
                });
            }
        });
    };

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
                                        src={roomDetails.cover_image_url || undefined} 
                                        alt="Cover background"
                                        className="absolute inset-0 w-full h-full rounded-full object-cover opacity-40"
                                    />
                                )}
                                
                                {/* Profile Image (on top) */}
                                <div className="relative z-10">
                                    {roomDetails.has_profile_image && roomDetails.profile_image_url ? (
                                        <img 
                                            src={roomDetails.profile_image_url || undefined} 
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
                                <MembersSection 
                                    roomId={roomDetails.room_id}
                                    darkmode={darkmode}
                                />
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