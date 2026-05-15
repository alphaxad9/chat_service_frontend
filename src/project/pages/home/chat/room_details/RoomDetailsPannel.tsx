// src/project/pages/chat/room_details/RoomDetailsPannel.tsx
import { useState } from "react";
import { useRoomById, useDeleteGroupRoom } from "../../../../../apis/chat/rooms/hooks";
import TopDetails from "./pannel_detials/TopDetails";
import RoomInfoGrid from "./pannel_detials/RoomInfoGrid";
import "../../feed.css"
import { 
    Trash2, 
    X,
} from "lucide-react";

import { MyRoomsHomePageListDto } from "../../../../../apis/chat/rooms/types";
import { RefObject } from "react";
import MembersSection from "./MembersSection";
import { ConfirmationDialog, Toast } from "./pannel_detials/PannelDetails";

interface RoomDetailsPanelProps {
    room: MyRoomsHomePageListDto;
    darkmode: boolean;
    onClose: () => void;
    panelRef: RefObject<HTMLDivElement | null>;
}

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
                            <TopDetails 
                                roomDetails={roomDetails}
                                darkmode={darkmode}
                            />
                            
                            {/* Room Info Grid */}
                            <RoomInfoGrid 
                                roomDetails={roomDetails}
                                darkmode={darkmode}
                            />
                            
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