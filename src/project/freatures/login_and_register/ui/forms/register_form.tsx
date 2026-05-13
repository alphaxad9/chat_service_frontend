import React, { useState } from 'react';
import { User, Mail, Eye, EyeOff } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom'; // ✅ for navigation
import { setLoginView } from '../../state/authUiSlice';
import { RegisterFormData } from '../../../../../modules/user/authentication/types/auth';
import { useAuth } from '../../../../../apis/user/authentication/AuthContext';
import { LoadingOverlay } from '../../../../../modules/user/authentication/components/ui/LoadingOverlay';

interface Errors {
  username?: string;
  email?: string;
  password?: string;
  password2?: string;
  submit?: string;
}

const Register: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate(); // ✅
  const { register, isRegistering } = useAuth();

  const [registerFormData, setRegisterFormData] = useState<RegisterFormData>({
    username: '',
    email: '',
    password: '',
    password2: '',
  });

  const [errors, setErrors] = useState<Errors>({});
  const [message, setMessage] = useState<string>('');
  const [showPasswords, setShowPasswords] = useState<boolean>(false);
  const [showConfirmField, setShowConfirmField] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRegisterFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === 'password' && value.trim() !== '') {
      setShowConfirmField(true);
    }

    if (errors[name as keyof Errors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const validate = (): Errors => {
    const newErrors: Errors = {};

    if (!registerFormData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (registerFormData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (!registerFormData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(registerFormData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!registerFormData.password) {
      newErrors.password = 'Password is required';
    } else if (registerFormData.password.length < 8) {
      // ✅ Match your RegisterForm: min 8 chars
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (!registerFormData.password2) {
      newErrors.password2 = 'Please confirm your password';
    } else if (registerFormData.password !== registerFormData.password2) {
      newErrors.password2 = 'Passwords do not match';
    }

    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setMessage('');
    setErrors({});

    try {
      await register(registerFormData); // ✅ Handled by AuthContext
      navigate('/complete_profile', { replace: true }); // ✅ Redirect on success
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Registration failed. Email or username may already be in use.';
      setMessage(errorMessage);
      setErrors({ submit: errorMessage });
    }
  };

  const handleAuthState = () => {
    dispatch(setLoginView());
  };

  return (
    <>
      {/* ✅ Top loading bar during registration */}
      <LoadingOverlay show={isRegistering} />

      <div className="p-5">
        {message && (
          <div
            className={`p-4 mb-6 text-sm rounded-lg border ${
              errors.submit
                ? 'bg-red-50 border-red-200 text-red-700'
                : 'bg-green-50 border-green-200 text-green-700'
            }`}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Username Field */}
          <div className="mb-6">
            <label htmlFor="username" className="block text-sm font-semibold text-light mb-2">
              Username
            </label>
            <div className="relative">
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                value={registerFormData.username}
                onChange={handleChange}
                placeholder="username"
                className={`text-light bg-dark w-full px-4 py-2 pr-12 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200
                  ${
                    errors.username
                      ? 'border-red-300 focus:ring-red-200 bg-red-50 text-red-900 placeholder-red-300'
                      : 'border-slate-300 focus:ring-blue-200 focus:border-blue-500 hover:border-slate-400'
                  }`}
                aria-invalid={!!errors.username}
                aria-describedby={errors.username ? 'username-error' : undefined}
              />
              <User
                className={`absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${
                  errors.username ? 'text-red-600' : 'text-light'
                }`}
              />
            </div>
            {errors.username && (
              <p id="username-error" className="mt-2 text-sm text-red-600">
                {errors.username}
              </p>
            )}
          </div>

          {/* Email Field */}
          <div className="mb-6">
            <label htmlFor="email" className="block text-sm font-semibold text-light mb-2">
              Email Address
            </label>
            <div className="relative">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={registerFormData.email}
                onChange={handleChange}
                placeholder="you@gmail.com"
                className={`text-light bg-dark w-full px-4 py-2 pr-12 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200
                  ${
                    errors.email
                      ? 'border-red-300 focus:ring-red-200 bg-red-50 text-red-900 placeholder-red-300'
                      : 'border-slate-300 focus:ring-blue-200 focus:border-blue-500 hover:border-slate-400'
                  }`}
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? 'email-error' : undefined}
              />
              <Mail
                className={`absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${
                  errors.email ? 'text-red-600' : 'text-light'
                }`}
              />
            </div>
            {errors.email && (
              <p id="email-error" className="mt-2 text-sm text-red-600">
                {errors.email}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-semibold text-light mb-2">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPasswords ? 'text' : 'password'}
                autoComplete="new-password"
                value={registerFormData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className={`text-light bg-dark w-full px-4 py-2 pr-12 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200
                  ${
                    errors.password
                      ? 'border-red-300 focus:ring-red-200 bg-red-50 text-red-900 placeholder-red-300'
                      : 'border-slate-300 focus:ring-blue-200 focus:border-blue-500 hover:border-slate-400'
                  }`}
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? 'password-error' : undefined}
              />
              <button
                type="button"
                onClick={() => setShowPasswords(!showPasswords)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-light hover:text-blue-300 focus:outline-none"
                aria-label={showPasswords ? 'Hide password' : 'Show password'}
              >
                {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <p id="password-error" className="mt-2 text-sm text-red-600">
                {errors.password}
              </p>
            )}
          </div>

          {/* Confirm Password Field — Always shown after typing starts */}
          {(showConfirmField || registerFormData.password2) && (
            <div className="mb-6">
              <label
                htmlFor="password2"
                className="block text-sm font-semibold text-light mb-2"
              >
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="password2"
                  name="password2"
                  type={showPasswords ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={registerFormData.password2}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={`text-light bg-dark w-full px-4 py-2 pr-12 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200
                    ${
                      errors.password2
                        ? 'border-red-300 focus:ring-red-200 bg-red-50 text-red-900 placeholder-red-300'
                        : 'border-slate-300 focus:ring-blue-200 focus:border-blue-500 hover:border-slate-400'
                    }`}
                  aria-invalid={!!errors.password2}
                  aria-describedby={errors.password2 ? 'confirm-error' : undefined}
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(!showPasswords)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-light hover:text-blue-300 focus:outline-none"
                  aria-label={showPasswords ? 'Hide password' : 'Show password'}
                >
                  {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password2 && (
                <p id="confirm-error" className="mt-2 text-sm text-red-600">
                  {errors.password2}
                </p>
              )}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isRegistering}
            className="w-full py-3 px-3 bg-light text-dark font-semibold rounded-xl shadow-md transition-all duration-300
              focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:cursor-not-allowed
              disabled:bg-slate-400 hover:bg-light/90 transform hover:scale-[1.01] disabled:scale-100"
          >
            {isRegistering ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-dark"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Creating account...
              </span>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-slate-400">
            Already have an account?{' '}
            <span
              onClick={handleAuthState}
              className="font-medium text-light hover:text-blue-500 underline transition-colors cursor-pointer"
            >
              Sign in
            </span>
          </p>
        </div>
      </div>
    </>
  );
};

export default Register;