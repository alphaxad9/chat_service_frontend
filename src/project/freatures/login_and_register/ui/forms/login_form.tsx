import React, { useState } from 'react';
import { User, Eye, EyeOff } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom'; // ✅ for navigation
import { setRegisterView } from '../../state/authUiSlice';
import { LoginFormData } from '../../../../../modules/user/authentication/types/auth';
import { useAuth } from '../../../../../apis/user/authentication/AuthContext';
import { LoadingOverlay } from '../../../../../modules/user/authentication/components/ui/LoadingOverlay';

interface Errors {
  identifier?: string;
  password?: string;
  submit?: string;
}

const Login: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate(); // ✅
  const { login, isLoggingIn } = useAuth();

  const [formData, setFormData] = useState<LoginFormData>({
    identifier: '',
    password: '',
  });

  const [errors, setErrors] = useState<Errors>({});
  const [message, setMessage] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name as keyof Errors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const validate = (): Errors => {
    const newErrors: Errors = {};

    if (!formData.identifier.trim()) {
      newErrors.identifier = 'Username or email is required';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
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
      await login(formData); // Authenticates and likely sets user in context
      navigate('/', { replace: true }); // ✅ Redirect to root on success
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Invalid email/username or password.';
      setMessage(errorMessage);
      setErrors({ submit: errorMessage });
    }
  };

  const handleAuthState = () => {
    dispatch(setRegisterView());
  };

  return (
    <>
      {/* ✅ Show top loading bar during login */}
      <LoadingOverlay show={isLoggingIn} />

      <div className="p-8">
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
          {/* Identifier Field */}
          <div className="mb-6">
            <label htmlFor="identifier" className="block text-sm font-semibold text-light mb-2">
              Username or Email
            </label>
            <div className="relative">
              <input
                id="identifier"
                name="identifier"
                type="text"
                autoComplete="username"
                value={formData.identifier}
                onChange={handleChange}
                placeholder="Username or email"
                className={`text-light bg-dark w-full px-4 py-2 pr-12 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200
                  ${
                    errors.identifier
                      ? 'border-red-300 focus:ring-red-200 bg-red-50 text-red-900 placeholder-red-300'
                      : 'border-slate-300 focus:ring-blue-200 focus:border-blue-500 hover:border-slate-400'
                  }`}
                aria-invalid={!!errors.identifier}
                aria-describedby={errors.identifier ? 'identifier-error' : undefined}
              />
              <User
                className={`absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${
                  errors.identifier ? 'text-red-600' : 'text-light'
                }`}
              />
            </div>
            {errors.identifier && (
              <p id="identifier-error" className="mt-2 text-sm text-red-600">
                {errors.identifier}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div className="mb-6">
            <label htmlFor="password" className="block text-light text-sm font-semibold mb-2">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={formData.password}
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
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-light hover:text-blue-300 focus:outline-none"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <p id="password-error" className="mt-2 text-sm text-red-600">
                {errors.password}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoggingIn}
            className="w-full py-3 px-3 bg-light from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 disabled:from-slate-400 disabled:to-slate-500
              text-dark font-semibold rounded-xl shadow-md transition-all duration-300
              focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:cursor-not-allowed transform hover:scale-[1.01] disabled:scale-100"
          >
            {isLoggingIn ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                Signing in...
              </span>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-slate-600">
            Don't have an account?{' '}
            <span
              onClick={handleAuthState}
              className="font-medium text-light cursor-pointer hover:text-blue-500 underline transition-colors"
            >
              Register here
            </span>
          </p>
        </div>
      </div>
    </>
  );
};

export default Login;