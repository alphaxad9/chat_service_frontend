import { useState, useRef, useEffect } from "react";
import { MyRoomsHomePageListDto } from "../../../../apis/chat/rooms/types";
import { format } from 'date-fns';
import { ArrowLeft, Users, User } from "lucide-react";
const ChatRoom = ({ 
    room, 
    darkmode, 
    onBack 
}: { 
    room: MyRoomsHomePageListDto | null; 
    darkmode: boolean; 
    onBack: () => void;
}) => {
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async () => {
        if (!newMessage.trim()) return;
        
        // Add optimistic message
        const optimisticMessage = {
            id: Date.now().toString(),
            content: newMessage,
            is_mine: true,
            created_at: new Date().toISOString(),
        };
        
        setMessages(prev => [...prev, optimisticMessage]);
        setNewMessage('');
        
        try {
            // Send message to your API
            // await sendMessage(room?.room_id, newMessage);
        } catch (error) {
            console.error('Failed to send message:', error);
            // Remove optimistic message on error
            setMessages(prev => prev.filter(m => m.id !== optimisticMessage.id));
        }
    };

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
        <div className="flex flex-col h-full w-full">
            {/* Chat Header */}
            <div className={`
                sticky top-0 z-10 p-4 border-b border-gray-200 dark:border-gray-800
                bg-inherit backdrop-blur-sm bg-opacity-80
            `}>
                <div className="flex items-center gap-3">
                    {/* Back button for mobile */}
                    <button
                        onClick={onBack}
                        className="md:hidden p-2 -ml-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
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
                    <div>
                        <h2 className="font-semibold text-lg">{room.name}</h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            {room.is_group ? 'Group conversation' : 'Online'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 && (
                    <div className="text-center text-gray-500 dark:text-gray-400 mt-8">
                        No messages yet. Start the conversation!
                    </div>
                )}
                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={`flex ${message.is_mine ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                                message.is_mine
                                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                                    : darkmode
                                    ? 'bg-gray-800 text-gray-100'
                                    : 'bg-gray-100 text-gray-900'
                            }`}
                        >
                            <p className="break-words">{message.content}</p>
                            <span className="text-xs opacity-70 mt-1 block">
                                {format(new Date(message.created_at), 'HH:mm')}
                            </span>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-inherit">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Type a message..."
                        className={`
                            flex-1 px-4 py-2 rounded-full border focus:outline-none focus:ring-2 focus:ring-purple-500
                            ${darkmode 
                                ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400' 
                                : 'bg-gray-100 border-gray-300 text-gray-900 placeholder-gray-500'
                            }
                        `}
                    />
                    <button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim()}
                        className={`
                            px-6 py-2 rounded-full font-semibold transition-all duration-300
                            ${newMessage.trim()
                                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg'
                                : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                            }
                        `}
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatRoom;