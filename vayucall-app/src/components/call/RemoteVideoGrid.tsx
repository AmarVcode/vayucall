import React from 'react';
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

const RemoteVideoGrid: React.FC<RemoteVideoGridProps> = ({ remoteUsers }) => {
  if (remoteUsers.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-gray-500 space-y-4">
        <div className="w-20 h-20 border-4 border-gray-700 border-t-cyan rounded-full animate-spin"></div>
        <p className="text-xl animate-pulse">Waiting for others to join...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 auto-rows-min overflow-y-auto">
      {remoteUsers.map((user) => (
        <RemoteVideoTile key={user.uid} user={user} />
      ))}
    </div>
  );
};

export default RemoteVideoGrid;
