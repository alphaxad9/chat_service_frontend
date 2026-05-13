import "react-phone-number-input/style.css";
import PhoneInput from "react-phone-number-input";

interface FormProps {
  phone: string | undefined;
  username: string | undefined;
  setPhone: (value: string | undefined) => void;
}


const PersonalInfo: React.FC<FormProps> = ({phone, setPhone, username}) => {

 

  return (
    <div className="p-6 border-b border-gray-700">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium">Personal Info</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <p className="text-sm text-gray-400">Username</p>
          <p className="font-medium">{username}</p>
        </div>


        <div>
          <p className="text-sm text-gray-400 mb-1">Phone</p>
          <div className="phone-input-dark">
            <PhoneInput
              international
              defaultCountry="US"
              value={phone}
              onChange={setPhone}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalInfo;
