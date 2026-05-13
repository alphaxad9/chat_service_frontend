import { useDispatch } from 'react-redux';
import { setSection } from '../../../lib/state/completeProfileSlice';
import { triggerAuthLoading } from '../../../../../freatures/login_and_register/state/authUiSlice';
import {User} from 'lucide-react';

const AskUser = () => {
    const dispatch = useDispatch();
    const handleToggle = (section: 'section1' | 'section2' | 'section3') => {
    dispatch(triggerAuthLoading())
    dispatch(setSection(section));
  };
    const handleSkip = () => {
      dispatch(triggerAuthLoading())
    }
  return (
    <div className="bg-dark text-light h-full min-h-screen w-screen flex items-center flex-col justify-center">
      {/* Simulated wallet graphic with added gap */}
    
        <div className="w-48 mb-[150px] h-48 rounded-lg flex items-center justify-center text-xl font-bold">
         <User size={100} />
        </div>
      

      <div
        className="max-w-md w-full auth-container rounded-t-3xl overflow-hidden p-8 text-center"
        style={{ position: 'absolute', bottom: 0, left: 0, right: 0, minHeight: '50vh' }} // Increased height
      >
        <h1 className="text-2xl font-extrabold text-white mb-4">ZedVyde</h1>
        <p className="mb-6 text-blue-200 text-sm">
          Complete your profile to discover the best for you!
        </p>

        {/* Buttons styled like Login component */}
        <button
          type="button"
          onClick={() => handleToggle('section1')}
          className="w-full py-2 px-4 bg-light from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-dark font-semibold rounded-xl shadow-md transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-300 hover:scale-[1.01] mb-4"
        >
          Get Started
        </button>
        <button
          
          type="button"
          onClick={handleSkip}
          className="w-full py-2 px-4 bg-transparent border border-slate-300 text-light font-semibold rounded-xl hover:bg-slate-700 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-200 hover:scale-[1.01]"
        >
          Skip
        </button>
      </div>
    </div>
  );
};

export default AskUser;