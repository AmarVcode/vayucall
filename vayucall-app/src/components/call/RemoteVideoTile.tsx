import { useEffect, useRef } from 'react';
import { IRemoteVideoTrack, IRemoteAudioTrack, UID } from 'agora-rtc-sdk-ng';

interface RemoteUser {
  uid: UID;
  videoTrack: IRemoteVideoTrack | null;
  audioTrack: IRemoteAudioTrack | null;
}

interface RemoteVideoTileProps {
  user: RemoteUser;
  isFullScreen?: boolean;
}

const RemoteVideoTile = ({ user, isFullScreen }: RemoteVideoTileProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user.videoTrack && containerRef.current) {
      user.videoTrack.play(containerRef.current);
    }
    return () => {
      user.videoTrack?.stop();
    };
  }, [user.videoTrack]);

  useEffect(() => {
    if (user.audioTrack) {
      user.audioTrack.play();
    }
    return () => {
      user.audioTrack?.stop();
    };
  }, [user.audioTrack]);

  return (
    <div className={`relative w-full h-full bg-gray-900 ${isFullScreen ? '' : 'aspect-video rounded-xl overflow-hidden border border-gray-700'}`}>
      <div ref={containerRef} className="w-full h-full [&>video]:object-cover" />
      {!user.videoTrack && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900">
          <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mb-4 border-2 border-white/5">
            <svg className="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Video Paused</p>
        </div>
      )}
      <div className="absolute bottom-32 left-6 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-xl text-xs text-white font-black border border-white/10 flex items-center space-x-2">
        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
        <span>User {user.uid}</span>
      </div>
    </div>
  );
};

export default RemoteVideoTile;
