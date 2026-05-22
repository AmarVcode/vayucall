import React, { useState } from 'react';
import LoginForm from '../components/auth/LoginForm';
import RegisterForm from '../components/auth/RegisterForm';
import ForgotPasswordForm from '../components/auth/ForgotPasswordForm';

type AuthView = 'login' | 'register' | 'forgotPassword';

const AuthScreen: React.FC = () => {
  const [view, setView] = useState<AuthView>('login');

  const renderForm = () => {
    switch (view) {
      case 'login':
        return (
          <LoginForm
            key="login"
            onSwitchToRegister={() => setView('register')}
            onSwitchToForgotPassword={() => setView('forgotPassword')}
          />
        );
      case 'register':
        return (
          <RegisterForm
            key="register"
            onSwitchToLogin={() => setView('login')}
          />
        );
      case 'forgotPassword':
        return (
          <ForgotPasswordForm
            key="forgotPassword"
            onSwitchToLogin={() => setView('login')}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen mesh-bg flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-[440px] space-y-12 animate-fade-in">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="relative group">
            <div className="absolute inset-0 bg-cyan/20 rounded-[32px] blur-2xl group-hover:bg-cyan/30 transition-all duration-500"></div>
            <div className="relative w-24 h-24 bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-[32px] flex items-center justify-center shadow-2xl overflow-hidden">
              <img src="/logo.png" alt="Vayucall Logo" className="w-20 h-20 rounded-2xl transform group-hover:scale-110 transition-transform duration-500" />
            </div>
          </div>
          <div className="space-y-1">
            <h1 className="text-5xl font-black text-white tracking-tighter">
              Vayu<span className="text-cyan">call</span>
            </h1>
            <p className="text-gray-500 font-medium uppercase tracking-[0.2em] text-[10px]">
              Next-Gen P2P Video Communication
            </p>
          </div>
        </div>
        
        <div className="glass-card !p-8 border-white/10 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan via-neonBlue to-cyan bg-[length:200%_auto] animate-[gradient_3s_linear_infinite]"></div>
          {renderForm()}
        </div>

        <p className="text-center text-gray-600 text-xs font-medium">
          Secure • Encrypted • Peer-to-Peer
        </p>
      </div>
    </div>
  );
};

export default AuthScreen;
