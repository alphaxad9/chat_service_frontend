import { Mail, Apple } from 'lucide-react';


const OtherParties = () => {
    const handleGoogleLogin = () => {
    window.location.href = '/api/auth/google'; 
  };

  const handleAppleLogin = () => {
    window.location.href = '/api/auth/apple'; 
  };
    return(
         <div className="px-6 pb-4">
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-gradient-to-br from-black to-gray-900 text-slate-400">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Google */}
              <button
              disabled
                type="button"
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-slate-500 rounded-xl shadow-sm bg-black hover:bg-slate-800 text-sm font-medium text-white transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <Mail className="h-5 w-5 text-white" aria-hidden="true" />
                <span>Gmail</span>
              </button>

              {/* Apple */}
              <button
              disabled
                type="button"
                onClick={handleAppleLogin}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-slate-500 rounded-xl shadow-sm bg-black hover:bg-slate-800 text-sm font-medium text-white transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <Apple className="h-5 w-5" aria-hidden="true" />
                <span>Apple</span>
              </button>
            </div>
          </div>
       
    )
}

export default OtherParties;