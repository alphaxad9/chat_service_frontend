
interface professionProps {
  first_name: string;
  setFirstName: (value: string) => void;
  last_name: string;
  setLastName: (value: string) => void;
}

// Get flag emoji from country ISO code


const FullNames:React.FC<professionProps> = ({first_name, setFirstName, last_name, setLastName}) => {


  
  return (
    <div className='px-6 w-full flex flex-col lg_profile_complete:flex-row items-center justify-around'>

        <div className="px-3 mb-6 w-full max-w-xs">
          <label className="block text-sm font-semibold mb-2">First Name</label>
          <input
            type="text"
            value={first_name}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Enter your first name"
            className="bg-dark text-light w-full px-4 py-2 border border-slate-300 rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>

        {/* Last name */}
        <div className="px-3 mb-6 w-full max-w-xs">
          <label className="block text-sm font-semibold mb-2">Last Name</label>
          <input
            type="text"
            value={last_name}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Enter your last name"
            className="bg-dark text-light w-full px-4 py-2 border border-slate-300 rounded-[4px] focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>
      </div>
  );
};

export default FullNames;
