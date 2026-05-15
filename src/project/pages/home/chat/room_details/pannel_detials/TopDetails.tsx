// src/project/pages/chat/room_details/pannel_detials/TopDetails.tsx

import { Users, User, Edit2 } from "lucide-react";

interface TopDetailsProps {
    roomDetails: {
        has_cover_image: boolean;
        cover_image_url: string | null;
        has_profile_image: boolean;
        profile_image_url: string | null;
        name: string;
        is_group: boolean;
        type: string;
        description: string | null;
    };
    darkmode: boolean;
}

const TopDetails = ({ roomDetails, darkmode }: TopDetailsProps) => {
    return (
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
        </>
    );
};

export default TopDetails;