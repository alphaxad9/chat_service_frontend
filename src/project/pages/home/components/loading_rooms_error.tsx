import { MessageCircle} from "lucide-react";
import { RootState } from "../../../entities/store";
import { useSelector } from "react-redux";

const LoadingRoomError = () => {
    const darkmode = useSelector((state: RootState) => state.theme.isDark);
    return (
            <div className={`${darkmode ? 'bg-dark text-light' : 'bg-light text-dark'} min-w-screen min-h-screen flex items-center justify-center relative`}>
             
                <div className="text-center">
                    <div className="text-red-500 mb-4">
                        <MessageCircle className="w-16 h-16 mx-auto" />
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">Failed to load conversations</p>
                    <button 
                        onClick={() => window.location.reload()} 
                        className="mt-4 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
}

export default LoadingRoomError;