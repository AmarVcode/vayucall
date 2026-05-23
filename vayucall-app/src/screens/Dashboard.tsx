import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ref, onValue } from 'firebase/database';
import { database } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import SignalingService, { CallRequest } from '../services/SignalingService';

interface UserStatus {
  uid: string;
  email: string;
  status: 'online' | 'offline';
  lastSeen: number;
}

const Dashboard: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserStatus[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [incomingCall, setIncomingCall] = useState<CallRequest | null>(null);
  const [outgoingCall, setOutgoingCall] = useState<CallRequest | null>(null);
  
  const ringtoneRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    ringtoneRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/1359/1359-preview.mp3');
    ringtoneRef.current.loop = true;

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    const usersRef = ref(database, 'users');
    const unsubscribeUsers = onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const userList = Object.entries(data).map(([uid, val]: [string, any]) => ({
          uid,
          ...val,
        })).filter(user => user.uid !== currentUser?.uid);
        setUsers(userList);
      }
    });

    const unsubscribeCalls = SignalingService.subscribeToCalls(currentUser!.uid, (calls) => {
      const now = Date.now();
      const STALE_CALL_THRESHOLD = 60000; // 1 minute

      const activeIncoming = calls.find(c => 
        c.receiverUid === currentUser!.uid && 
        c.status === 'pending' && 
        (now - c.timestamp) < STALE_CALL_THRESHOLD
      );
      
      const activeOutgoing = calls.find(c => 
        c.callerUid === currentUser!.uid && 
        c.status === 'pending' && 
        (now - c.timestamp) < STALE_CALL_THRESHOLD
      );
      
      if (activeIncoming) {
        if (!incomingCall || incomingCall.id !== activeIncoming.id) {
          setIncomingCall(activeIncoming);
          
          // Ringing and Vibration
          ringtoneRef.current?.play().catch(() => console.log('Audio play blocked'));
          if ('vibrate' in navigator) {
            navigator.vibrate([500, 200, 500, 200, 500]);
          }

          // Show local notification if app is in background/not focused
          if (document.hidden && 'Notification' in window && Notification.permission === 'granted') {
            new Notification('Incoming Vayucall', {
              body: `Incoming call from ${activeIncoming.callerEmail}`,
              icon: '/logo.png',
              tag: 'incoming-call',
              requireInteraction: true
            });
          }
        }
      } else {
        setIncomingCall(null);
        ringtoneRef.current?.pause();
        if (ringtoneRef.current) ringtoneRef.current.currentTime = 0;
        if ('vibrate' in navigator) {
          navigator.vibrate(0); // Stop vibration
        }
      }

      if (activeOutgoing) {
        setOutgoingCall(activeOutgoing);
      } else {
        const acceptedCall = calls.find(c => 
          c.callerUid === currentUser!.uid && 
          c.status === 'accepted' &&
          (now - c.timestamp) < STALE_CALL_THRESHOLD
        );
        if (acceptedCall) {
          navigate(`/call/${acceptedCall.channelName}`);
        }
        setOutgoingCall(null);
      }
    });

    return () => {
      unsubscribeUsers();
      unsubscribeCalls();
      ringtoneRef.current?.pause();
      if ('vibrate' in navigator) {
        navigator.vibrate(0);
      }
    };
  }, [currentUser, navigate, incomingCall]);

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCallUser = async (receiverUid: string) => {
    try {
      await SignalingService.makeCall(currentUser!.uid, currentUser!.email!, receiverUid);
    } catch (err) {
      console.error('Failed to make call:', err);
    }
  };

  const handleAcceptCall = async () => {
    if (incomingCall) {
      await SignalingService.updateCallStatus(currentUser!.uid, incomingCall.callerUid, incomingCall.id, 'accepted');
      navigate(`/call/${incomingCall.channelName}`);
    }
  };

  const handleRejectCall = async () => {
    if (incomingCall) {
      await SignalingService.updateCallStatus(currentUser!.uid, incomingCall.callerUid, incomingCall.id, 'rejected');
      setIncomingCall(null);
    }
  };

  const handleCancelCall = async () => {
    if (outgoingCall) {
      await SignalingService.updateCallStatus(currentUser!.uid, outgoingCall.receiverUid, outgoingCall.id, 'ended');
      setOutgoingCall(null);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/auth');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const formatDisplayName = (email: string) => {
    const name = email.split('@')[0];
    if (name.length > 12) {
      return name.substring(0, 10) + '...';
    }
    return name;
  };

  return (
    <div className="min-h-screen mesh-bg flex flex-col">
      <header className="glass border-b border-white/10 p-4 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan to-neonBlue rounded-2xl flex items-center justify-center shadow-lg shadow-cyan/20">
              <img src="/logo.png" alt="Vayucall" className="w-8 h-8 rounded-full" />
            </div>
            <span className="text-2xl font-black text-white tracking-tighter">
              Vayu<span className="text-cyan">call</span>
            </span>
          </div>
          <div className="flex items-center space-x-6">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-white font-medium text-sm">{currentUser?.email}</span>
              <span className="text-cyan text-[10px] uppercase tracking-widest font-bold">Authenticated</span>
            </div>
            <button
              onClick={handleLogout}
              className="btn-secondary !py-2 !px-4 text-sm"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 p-6 max-w-6xl mx-auto w-full space-y-8 animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-3xl font-black text-white">Contacts</h2>
            <p className="text-gray-400 text-sm mt-1">Connect with anyone instantly</p>
          </div>
          
          <div className="relative group w-full md:w-80">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-gray-500 group-focus-within:text-cyan transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search by email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field !pl-12 !py-3 w-full"
            />
          </div>
        </div>
        
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {filteredUsers.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-20 glass-card">
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-4">
                <svg className="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <p className="text-gray-500 font-medium">
                {searchQuery ? `No users matching "${searchQuery}"` : "No other users online right now"}
              </p>
            </div>
          ) : (
            filteredUsers.map((user) => (
              <div key={user.uid} className="glass-card group flex items-center justify-between hover:bg-white/[0.08] !p-4">
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="relative flex-shrink-0">
                    <div className="w-11 h-11 bg-gradient-to-br from-white/10 to-white/5 rounded-2xl flex items-center justify-center text-white font-black text-base border border-white/10 group-hover:border-cyan/50 transition-colors">
                      {user.email[0].toUpperCase()}
                    </div>
                    <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-[3px] border-[#050b18] ${user.status === 'online' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-gray-600'}`}></div>
                  </div>
                  <div className="min-w-0">
                    <p className="text-white font-bold text-sm truncate group-hover:text-cyan transition-colors" title={user.email}>
                      {formatDisplayName(user.email)}
                    </p>
                    <p className="text-[9px] text-gray-500 uppercase tracking-widest font-black">
                      {user.status === 'online' ? 'Available' : 'Away'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleCallUser(user.uid)}
                  disabled={user.status !== 'online' || !!outgoingCall || !!incomingCall}
                  className={`w-11 h-11 flex-shrink-0 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                    user.status === 'online' 
                      ? 'bg-cyan/10 text-cyan hover:bg-cyan hover:text-deepBlue shadow-lg shadow-cyan/5' 
                      : 'bg-white/5 text-gray-700 cursor-not-allowed'
                  }`}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 2V3z" />
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Incoming Call Modal */}
      {incomingCall && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xl z-[100] flex items-center justify-center p-4">
          <div className="glass rounded-[40px] max-w-sm w-full p-10 text-center space-y-8 animate-fade-in border-white/20 shadow-2xl">
            <div className="relative mx-auto w-32 h-32">
              <div className="absolute inset-0 bg-cyan/30 rounded-full animate-ping"></div>
              <div className="relative w-32 h-32 bg-gradient-to-br from-cyan to-neonBlue rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(0,212,255,0.3)]">
                <svg className="w-16 h-16 text-deepBlue" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 2V3z" />
                </svg>
              </div>
            </div>
            <div>
              <p className="text-cyan text-xs uppercase tracking-[0.3em] font-black mb-2">Incoming Call</p>
              <h3 className="text-2xl font-black text-white truncate">{incomingCall.callerEmail}</h3>
            </div>
            <div className="flex gap-4">
              <button
                onClick={handleRejectCall}
                className="btn-danger flex-1 !rounded-2xl"
              >
                Decline
              </button>
              <button
                onClick={handleAcceptCall}
                className="btn-primary flex-1 !rounded-2xl !bg-gradient-to-r !from-green-500 !to-emerald-600"
              >
                Accept
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Outgoing Call Modal */}
      {outgoingCall && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xl z-[100] flex items-center justify-center p-4">
          <div className="glass rounded-[40px] max-w-sm w-full p-10 text-center space-y-8 animate-fade-in border-white/20 shadow-2xl">
            <div className="relative mx-auto w-32 h-32">
              <div className="absolute inset-0 bg-white/10 rounded-full animate-pulse-soft"></div>
              <div className="relative w-32 h-32 bg-white/5 rounded-full flex items-center justify-center border border-white/20">
                <svg className="w-16 h-16 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 2V3z" />
                </svg>
              </div>
            </div>
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-[0.3em] font-black mb-2">Calling</p>
              <h3 className="text-2xl font-black text-white">Connecting...</h3>
              <p className="text-gray-500 text-sm mt-2">Waiting for answer</p>
            </div>
            <button
              onClick={handleCancelCall}
              className="btn-secondary w-full !rounded-2xl"
            >
              End Request
            </button>
          </div>
        </div>
      )}

      <footer className="p-8 text-center border-t border-white/5">
        <p className="text-gray-600 text-[10px] uppercase tracking-widest font-black">
          &copy; {new Date().getFullYear()} Vayucall System • P2P Encrypted
        </p>
      </footer>
    </div>
  );
};

export default Dashboard;
