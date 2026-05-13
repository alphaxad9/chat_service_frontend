import { useState } from "react";
import { Pencil } from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "../../../../../../../entities/store";



export const DeleteAccountSection: React.FC<{
  onConfirmDelete: (password: string) => void;
}> = ({ onConfirmDelete }) => {
  const darkmode = useSelector((state: RootState) => state.theme.isDark);
  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmationText, setConfirmationText] = useState('');
  const [password, setPassword] = useState('');

  const handleDelete = () => {
    if (confirmationText.trim() === 'DELETE MY ACCOUNT' && password.trim() !== '') {
      onConfirmDelete(password.trim());
      setIsConfirming(false);
      setConfirmationText('');
      setPassword('');
    }
  };

  const isConfirmValid = confirmationText.trim() === 'DELETE MY ACCOUNT';
  const isDeleteEnabled = isConfirmValid && password.trim() !== '';

  return (
    <div className="mt-3">
      {isConfirming ? (
        <div className="space-y-3">
          <p className="text-sm ">
            Type <span className="font-mono text-red-400">DELETE MY ACCOUNT</span> to confirm:
          </p>
          <input
            type="text"
            value={confirmationText}
            onChange={(e) => setConfirmationText(e.target.value)}
            className={`w-full px-3 py-1.5 ${
          darkmode ? 'bg-dark' : 'bg-light'
        } border border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
            placeholder="DELETE MY ACCOUNT"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className={`w-full px-3 py-1.5 ${
          darkmode ? 'bg-dark' : 'bg-light'
        } border border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
          <div className="flex gap-2">
            <button
              onClick={handleDelete}
              disabled={!isDeleteEnabled}
              className={`text-xs px-2 py-1 rounded ${
                isDeleteEnabled
                  ? 'bg-red-600 hover:bg-red-500'
                  : `${
          darkmode ? 'bg-light text-dark' : 'bg-dark text-light'
        } cursor-not-allowed`
              }`}
            >
              Confirm Delete
            </button>
            <button
              onClick={() => {
                setIsConfirming(false);
                setConfirmationText('');
                setPassword('');
              }}
              className="text-xs px-2 py-1 bg-gray-700  rounded hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsConfirming(true)}
          className="mt-2 text-sm text-red-400 hover:text-red-300 font-medium"
        >
          Delete Account
        </button>
      )}
    </div>
  );
};
export const PasswordEditableField: React.FC<{
  onSave: (currentPassword: string, newPassword: string) => void;
}> = ({ onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPassword2, setNewPassword2] = useState('');
  const darkmode = useSelector((state: RootState) => state.theme.isDark);

  const passwordsMatch = newPassword === newPassword2;
  const isPasswordValid = newPassword.length >= 8;
  const canSave = currentPassword.trim() !== '' && isPasswordValid && passwordsMatch;

  const handleSave = () => {
    if (canSave) {
      onSave(currentPassword.trim(), newPassword.trim());
      // Reset fields
      setCurrentPassword('');
      setNewPassword('');
      setNewPassword2('');
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setCurrentPassword('');
    setNewPassword('');
    setNewPassword2('');
    setIsEditing(false);
  };

  return (
    <div className="flex items-start gap-3 py-3">
      <div className="flex-1">
        {isEditing ? (
          <div className="space-y-2">
            <input
              type="password"
              placeholder="Current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className={`w-full px-3 py-1.5 ${
                darkmode ? 'bg-dark' : 'bg-light'
              } border border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            <input
              type="password"
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={`w-full px-3 py-1.5 ${
                darkmode ? 'bg-dark' : 'bg-light'
              } border border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            <input
              type="password"
              placeholder="Confirm new password"
              value={newPassword2}
              onChange={(e) => setNewPassword2(e.target.value)}
              className={`w-full px-3 py-1.5 ${
                darkmode ? 'bg-dark' : 'bg-light'
              } border border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />

            {/* Validation Feedback */}
            {newPassword && newPassword.length < 8 && (
              <p className="text-xs text-red-400">Password must be at least 8 characters</p>
            )}
            {newPassword2 && !passwordsMatch && (
              <p className="text-xs text-red-400">Passwords do not match</p>
            )}

            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={!canSave}
                className={`text-xs px-2 py-1 rounded ${
                  canSave
                    ? 'bg-blue-600 hover:bg-blue-500'
                    : `${
                        darkmode ? 'bg-gray-700 text-gray-400' : 'bg-gray-300 text-gray-500'
                      } cursor-not-allowed`
                }`}
              >
                Update Password
              </button>
              <button
                onClick={handleCancel}
                className="text-xs px-2 py-1 bg-gray-700 text-white rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="text-sm font-medium">Password</div>
            <div className="text-sm">••••••••</div>
          </div>
        )}
      </div>
      <div className="mt-1 flex-shrink-0">
        <Pencil
          size={16}
          className="hover:cursor-pointer"
          onClick={() => setIsEditing(true)}
        />
      </div>
    </div>
  );
};





export const EditableField: React.FC<{
  label: string;
  value: string;
  type: string;
  onSave: (newValue: string, password?: string) => void;
  requiresPassword?: boolean; // ← NEW
}> = ({ label, value, type, onSave, requiresPassword = false }) => {
  const darkmode = useSelector((state: RootState) => state.theme.isDark);
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const [password, setPassword] = useState('');

  const handleSave = () => {
    const trimmedValue = inputValue.trim();
    if (!trimmedValue) return;
  
    if (requiresPassword) {
      const trimmedPassword = password.trim();
      if (!trimmedPassword) return;
      onSave(trimmedValue, trimmedPassword);
    } else {
      onSave(trimmedValue);
    }

    setIsEditing(false);
    setPassword('');
  };

  const handleCancel = () => {
    setInputValue(value);
    setPassword('');
    setIsEditing(false);
  };

  return (
    <div className="flex items-start gap-3 py-3">
      
      <div className="flex-1">
        {isEditing ? (
          <div className="space-y-2">
            <input
              type={type}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
             className={`w-full px-3 py-1.5 ${
          darkmode ? 'bg-dark' : 'bg-light'
        } border border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
              autoFocus
              placeholder={label}
            />
            {requiresPassword && (
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Current password"
                className={`w-full px-3 py-1.5 ${
          darkmode ? 'bg-dark' : 'bg-light'
        } border border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            )}
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={
                  !inputValue.trim() || (requiresPassword && !password.trim())
                }
                className={`text-xs px-2 py-1 rounded ${
                  inputValue.trim() && (!requiresPassword || password.trim())
                    ? 'bg-blue-600 hover:bg-blue-500'
                    : `${
          darkmode ? 'bg-light text-dark' : 'bg-dark text-light'
        }  cursor-not-allowed`
                }`}
              >
                Save
              </button>
              <button
                onClick={handleCancel}
                className="text-xs px-2 py-1 bg-gray-700  rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="text-sm font-medium ">{label}</div>
            <div className="text-sm ">{value}</div>
          </div>
        )}
      </div>
      <div className="mt-1 flex-shrink-0">
        <Pencil
          size={16}
          className="hover:cursor-pointer"
          onClick={() => setIsEditing(true)}
        />
      </div>
    </div>
  );
};