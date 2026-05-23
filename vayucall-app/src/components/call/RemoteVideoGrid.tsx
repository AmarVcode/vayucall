import RemoteVideoTile from './RemoteVideoTile';
import { IRemoteVideoTrack, IRemoteAudioTrack, UID } from 'agora-rtc-sdk-ng';

interface RemoteUser {
  uid: UID;
  videoTrack: IRemoteVideoTrack | null;
  audioTrack: IRemoteAudioTrack | null;
}

interface RemoteVideoGridProps {
  remoteUsers: RemoteUser[];
}

const RemoteVideoGrid = ({ remoteUsers }: RemoteVideoGridProps) => {
  if (remoteUsers.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-gray-500 space-y-4">
        <div className="w-20 h-20 border-4 border-gray-700 border-t-cyan rounded-full animate-spin"></div>
        <p className="text-xl animate-pulse">Waiting for others to join...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 relative w-full h-full overflow-hidden bg-black">
      {remoteUsers.map((user, index) => (
        <div 
          key={user.uid} 
          className={`absolute inset-0 transition-opacity duration-500 ${
            index === remoteUsers.length - 1 ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          <RemoteVideoTile user={user} isFullScreen={true} />
        </div>
      ))}
    </div>
  );
};

export default RemoteVideoGrid;
