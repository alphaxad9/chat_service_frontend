import { Phone } from 'lucide-react';
import PhoneInput from "react-phone-number-input";

interface PhoneFormProps {
  phone: string | undefined;
  setPhone: (value: string | undefined) => void;
}

const PhoneForm: React.FC<PhoneFormProps> = ({ phone, setPhone }) => {
  return (
    <div className="mb-6">
      <label className="block text-sm font-semibold mb-2 text-center">Phone Number</label>
      <div className="relative phone-input-dark">
        <PhoneInput
              international
              defaultCountry="US"
              value={phone}
              onChange={setPhone}
            />
        <Phone className="absolute right-3 top-1/2 transform -translate-y-1/2 text-light" size={16} />
      </div>
    </div>
  );
};

export default PhoneForm;