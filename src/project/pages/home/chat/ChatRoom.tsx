// src/project/pages/chat/ChatRoom.tsx
import { useState, useRef, useEffect } from "react";
import { MyRoomsHomePageListDto } from "../../../../apis/chat/rooms/types";
import { ArrowLeft, Users, User, X} from "lucide-react";
import MessageArea from "./messages/MessageArea";
import RoomDetailsPannel from "./room_details/RoomDetailsPannel";

interface ChatRoomProps { 
    room: MyRoomsHomePageListDto | null; 
    darkmode: boolean; 
    onBack: () => void;
}

const ChatRoom = ({ room, darkmode, onBack }: ChatRoomProps) => {
    const [showDetailsPanel, setShowDetailsPanel] = useState(false);
    const panelRef = useRef<HTMLDivElement>(null);
    
    // Close panel when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
                setShowDetailsPanel(false);
            }
        };
        
        if (showDetailsPanel) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [showDetailsPanel]);
    
    // Prevent body scroll when panel is open
    useEffect(() => {
        if (showDetailsPanel) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [showDetailsPanel]);
    
    if (!room) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
                    <p className="text-gray-500 dark:text-gray-400">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full w-full relative">
            {/* Chat Header */}
            <div className={`
                sticky top-0 z-10 p-4 border-b border-gray-200 dark:border-gray-800
                backdrop-blur-sm bg-opacity-80
                ${darkmode ? 'bg-dark' : 'bg-white'}
            `}>
                <div className="flex items-center gap-3">
                    {/* Back button for mobile */}
                    <button
                        onClick={onBack}
                        className={`
                            md:hidden p-2 -ml-2 rounded-lg transition-colors
                            ${darkmode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}
                        `}
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    
                    <div className="relative">
                        {room.has_profile_image && room.profile_image_url ? (
                            <img 
                                src={room.profile_image_url} 
                                alt={room.name}
                                className="w-10 h-10 rounded-full object-cover"
                            />
                        ) : (
                            <div className={`
                                w-10 h-10 rounded-full flex items-center justify-center
                                ${room.is_group 
                                    ? 'bg-gradient-to-br from-purple-500 to-pink-500' 
                                    : 'bg-gradient-to-br from-blue-500 to-cyan-500'
                                }
                            `}>
                                {room.is_group ? (
                                    <Users className="w-5 h-5 text-white" />
                                ) : (
                                    <User className="w-5 h-5 text-white" />
                                )}
                            </div>
                        )}
                    </div>
                    
                    {/* Clickable room name to open details panel */}
                    <div 
                        onClick={() => setShowDetailsPanel(true)}
                        className="flex-1 cursor-pointer hover:opacity-80 transition-opacity"
                    >
                        <h2 className={`font-semibold text-lg ${darkmode ? 'text-white' : 'text-gray-900'}`}>
                            {room.name}
                        </h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            {room.is_group ? 'Group conversation' : 'Online'}
                        </p>
                    </div>
                </div>
            </div>
            
            {/* Message Area */}
            <MessageArea darkmode={darkmode} roomId={room.room_id} />
            
            {/* Room Details Side Panel - Pass required props */}
            {showDetailsPanel && (
                <RoomDetailsPannel 
                    room={room}
                    darkmode={darkmode}
                    onClose={() => setShowDetailsPanel(false)}
                    panelRef={panelRef}
                />
            )}
        </div>
    );
};

export default ChatRoom;