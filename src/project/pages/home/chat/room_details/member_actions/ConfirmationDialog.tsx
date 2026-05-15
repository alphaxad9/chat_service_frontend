import { useEffect } from "react";
import { CheckCircle, Loader2, XCircle } from "lucide-react";
interface ConfirmationDialogProps {
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    darkmode: boolean;
}

export const ConfirmationDialog = ({ title, message, onConfirm, onCancel, darkmode }: ConfirmationDialogProps) => {
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
                            Confirm
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};
interface ToastProps {
    message: string;
    type: 'success' | 'error' | 'info';
    onClose: () => void;
}

export const Toast = ({ message, type, onClose }: ToastProps) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

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