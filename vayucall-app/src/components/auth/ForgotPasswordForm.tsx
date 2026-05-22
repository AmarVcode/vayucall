import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { isValidEmail } from '../../utils/validation';

interface ForgotPasswordFormProps {
  onSwitchToLogin: () => void;
}

const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ onSwitchToLogin }) => {
  const { sendPasswordReset } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!isValidEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      await sendPasswordReset(email);
      setSuccess(true);
    } catch (err: any) {
      console.error('Password reset error:', err);
      switch (err.code) {
        case 'auth/user-not-found':
          setError('No account found for this email.');
          break;
        case 'auth/invalid-email':
          setError('Please enter a valid email address.');
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
        <h2 className="text-2xl font-black text-white">Reset Password</h2>
        <p className="text-gray-500 text-sm">We'll send you a recovery link</p>
      </div>

      {success ? (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-green-500/10 border border-green-500/20 text-green-500 text-xs py-4 px-4 rounded-xl text-center">
            Check your inbox for instructions to reset your password.
          </div>
          <button
            onClick={onSwitchToLogin}
            className="btn-primary w-full"
          >
            Back to Sign In
          </button>
        </div>
      ) : (
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
              'Send Recovery Link'
            )}
          </button>

          <div className="pt-4 text-center">
            <button
              onClick={onSwitchToLogin}
              className="text-gray-500 hover:text-white text-sm transition-colors"
              disabled={loading}
            >
              Remembered your password? <span className="text-cyan font-bold">Sign In</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ForgotPasswordForm;
