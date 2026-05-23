import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { IAgoraRTCClient, ILocalTrack, IRemoteVideoTrack, IRemoteAudioTrack, UID, IMicrophoneAudioTrack, ICameraVideoTrack } from 'agora-rtc-sdk-ng';
import AgoraService from '../services/AgoraService';
import SignalingService from '../services/SignalingService';
import { useAuth } from '../contexts/AuthContext';
import CallControls from '../components/call/CallControls';
import RemoteVideoGrid from '../components/call/RemoteVideoGrid';
import LocalVideoOverlay from '../components/call/LocalVideoOverlay';

interface RemoteUser {
  uid: UID;
  videoTrack: IRemoteVideoTrack | null;
  audioTrack: IRemoteAudioTrack | null;
}

const CallRoom: React.FC = () => {
  const { channelName } = useParams<{ channelName: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const appId = import.meta.env.VITE_AGORA_APP_ID;

  const [localTracks, setLocalTracks] = useState<[IMicrophoneAudioTrack, ICameraVideoTrack] | null>(null);
  const [remoteUsers, setRemoteUsers] = useState<RemoteUser[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(true);
  const callIdRef = useRef<string | null>(null);
  const otherUidRef = useRef<string | null>(null);

  const tracksRef = useRef<ILocalTrack[]>([]);

  useEffect(() => {
    let agoraClient: IAgoraRTCClient;

    const initCall = async () => {
      if (!appId || appId === 'your_agora_app_id_here') {
        setError('Agora App ID is not configured.');
        setIsJoining(false);
        return;
      }

      try {
        agoraClient = AgoraService.init();

        agoraClient.on('user-published', async (user: any, mediaType: 'video' | 'audio') => {
          await agoraClient.subscribe(user, mediaType);
          
          setRemoteUsers((prev: RemoteUser[]) => {
            const existingUser = prev.find((u: RemoteUser) => u.uid === user.uid);
            if (existingUser) {
              return prev.map((u: RemoteUser) => 
                u.uid === user.uid 
                  ? { ...u, videoTrack: mediaType === 'video' ? user.videoTrack || null : u.videoTrack, audioTrack: mediaType === 'audio' ? user.audioTrack || null : u.audioTrack }
                  : u
              );
            }
            return [...prev, { 
              uid: user.uid, 
              videoTrack: mediaType === 'video' ? user.videoTrack || null : null, 
              audioTrack: mediaType === 'audio' ? user.audioTrack || null : null 
            }];
          });
        });

        agoraClient.on('user-unpublished', (user: any, mediaType: 'video' | 'audio') => {
          setRemoteUsers((prev: RemoteUser[]) => 
            prev.map((u: RemoteUser) => 
              u.uid === user.uid 
                ? { ...u, videoTrack: mediaType === 'video' ? null : u.videoTrack, audioTrack: mediaType === 'audio' ? null : u.audioTrack }
                : u
            ).filter((u: RemoteUser) => u.videoTrack || u.audioTrack)
          );
        });

        agoraClient.on('user-left', (user: any) => {
          setRemoteUsers((prev: RemoteUser[]) => prev.filter((u: RemoteUser) => u.uid !== user.uid));
        });

        const tracks = await AgoraService.createLocalTracks();
        setLocalTracks(tracks);
        tracksRef.current = tracks;

        await AgoraService.joinChannel(agoraClient, appId, channelName!, null);
        await AgoraService.publishTracks(agoraClient, tracks);

        setIsJoining(false);
      } catch (err: any) {
        console.error('Failed to join call:', err);
        setError(err.message?.includes('Permission denied') 
          ? 'Camera/Mic access denied.' 
          : 'Failed to connect to video service.');
        setIsJoining(false);
      }
    };

    initCall();

    const unsubscribeStatus = SignalingService.subscribeToCalls(currentUser!.uid, (calls) => {
      const currentCall = calls.find(c => c.channelName === channelName);
      if (currentCall) {
        callIdRef.current = currentCall.id;
        otherUidRef.current = currentCall.callerUid === currentUser!.uid ? currentCall.receiverUid : currentCall.callerUid;
        
        if (currentCall.status === 'ended' || currentCall.status === 'rejected') {
          navigate('/dashboard');
        }
      }
    });

    return () => {
      const leave = async () => {
        if (agoraClient) {
          await AgoraService.leaveChannel(agoraClient, tracksRef.current);
          if (callIdRef.current && otherUidRef.current) {
            await SignalingService.updateCallStatus(currentUser!.uid, otherUidRef.current, callIdRef.current, 'ended');
          }
        }
      };
      leave();
      unsubscribeStatus();
    };
  }, [appId, channelName, currentUser, navigate]);

  const handleToggleMute = async () => {
    if (localTracks) {
      try {
        await localTracks[0].setEnabled(isMuted);
        setIsMuted(!isMuted);
      } catch (err) {
        console.error('Toggle mute error:', err);
      }
    }
  };

  const handleToggleCamera = async () => {
    if (localTracks) {
      try {
        await localTracks[1].setEnabled(isCameraOff);
        setIsCameraOff(!isCameraOff);
      } catch (err) {
        console.error('Toggle camera error:', err);
      }
    }
  };

  const handleLeave = async () => {
    if (callIdRef.current && otherUidRef.current) {
      try {
        await SignalingService.updateCallStatus(currentUser!.uid, otherUidRef.current, callIdRef.current, 'ended');
      } catch (err) {
        console.error('Failed to end call:', err);
      }
    }
    navigate('/dashboard');
  };

  if (error) {
    return (
      <div className="min-h-screen mesh-bg flex flex-col items-center justify-center p-6 text-center">
        <div className="glass-card max-w-sm w-full space-y-6">
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto text-red-500">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-white">Call Failed</h2>
            <p className="text-gray-400 text-sm">{error}</p>
          </div>
          <button
            onClick={handleLeave}
            className="btn-primary w-full"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-[#020611] flex flex-col relative overflow-hidden select-none touch-none">
      <div className="absolute top-0 left-0 right-0 p-6 pt-12 bg-gradient-to-b from-black/80 via-black/40 to-transparent z-30 flex items-center justify-between pointer-events-none">
        <div className="flex items-center space-x-3 pointer-events-auto">
          <div className="w-10 h-10 bg-gradient-to-br from-cyan to-neonBlue rounded-2xl flex items-center justify-center shadow-lg border border-white/10">
            <img src="/logo.png" alt="Vayucall" className="w-8 h-8 rounded-full" />
          </div>
          <div>
            <h1 className="text-lg font-black text-white leading-none tracking-tight">Vayucall</h1>
            <p className="text-[9px] text-cyan uppercase tracking-[0.2em] font-black mt-1">P2P Secure</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3 pointer-events-auto bg-black/40 backdrop-blur-xl px-4 py-2 rounded-2xl border border-white/10">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.8)]"></div>
          <span className="text-[10px] text-white font-black uppercase tracking-widest">Live</span>
        </div>
      </div>

      <RemoteVideoGrid remoteUsers={remoteUsers} />

      <LocalVideoOverlay 
        videoTrack={localTracks ? localTracks[1] : null} 
        isCameraOff={isCameraOff} 
      />

      {!isJoining && (
        <CallControls
          isMuted={isMuted}
          isCameraOff={isCameraOff}
          onToggleMute={handleToggleMute}
          onToggleCamera={handleToggleCamera}
          onLeave={handleLeave}
        />
      )}

      {isJoining && (
        <div className="absolute inset-0 bg-[#020611] z-50 flex flex-col items-center justify-center space-y-6">
          <div className="relative">
            <div className="w-24 h-24 border-4 border-white/5 rounded-full"></div>
            <div className="absolute inset-0 w-24 h-24 border-4 border-cyan border-t-transparent rounded-full animate-spin"></div>
          </div>
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-black text-white">Establishing P2P</h2>
            <p className="text-gray-500 text-sm font-medium animate-pulse">Syncing with Agora SD-RTN...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CallRoom;
