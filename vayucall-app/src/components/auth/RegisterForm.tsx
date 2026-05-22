import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { isValidEmail, isValidPassword } from '../../utils/validation';

interface RegisterFormProps {
  onSwitchToLogin: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSwitchToLogin }) => {
  const { register } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isValidEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!isValidPassword(password)) {
      setError('Password must be between 6 and 128 characters.');
      return;
    }

    setLoading(true);
    try {
      await register(email, password);
    } catch (err: any) {
      console.error('Registration error:', err);
      switch (err.code) {
        case 'auth/email-already-in-use':
          setError('This email is already registered.');
          break;
        case 'auth/invalid-email':
          setError('Please enter a valid email address.');
          break;
        case 'auth/weak-password':
          setError('Password must be at least 6 characters.');
          break;
        case 'auth/network-request-failed':
          setError('Network error. Please check your connection.');
          break;
        default:
          setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-black text-white">Join Vayucall</h2>
        <p className="text-gray-500 text-sm">Create an account to start calling</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-field"
            placeholder="name@example.com"
            maxLength={254}
            disabled={loading}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-field"
            placeholder="••••••••"
            maxLength={128}
            disabled={loading}
          />
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs py-3 px-4 rounded-xl flex items-center space-x-2 animate-fade-in">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full mt-2"
        >
          {loading ? (
            <div className="w-6 h-6 border-3 border-deepBlue border-t-transparent rounded-full animate-spin"></div>
          ) : (
            'Create Account'
          )}
        </button>
      </form>

      <div className="pt-4 text-center">
        <button
          onClick={onSwitchToLogin}
          className="text-gray-500 hover:text-white text-sm transition-colors"
          disabled={loading}
        >
          Already have an account? <span className="text-cyan font-bold">Sign In</span>
        </button>
      </div>
    </div>
  );
};

export default RegisterForm;
