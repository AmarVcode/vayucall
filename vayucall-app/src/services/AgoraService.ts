import AgoraRTC, {
  IAgoraRTCClient,
  IMicrophoneAudioTrack,
  ICameraVideoTrack,
  ILocalTrack,
  UID,
} from 'agora-rtc-sdk-ng';

export const AgoraService = {
  init(): IAgoraRTCClient {
    return AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
  },

  async joinChannel(
    client: IAgoraRTCClient,
    appId: string,
    channelName: string,
    token: string | null,
    uid: string | number | null = null
  ): Promise<UID> {
    return await client.join(appId, channelName, token, uid);
  },

  async createLocalTracks(): Promise<[IMicrophoneAudioTrack, ICameraVideoTrack]> {
    return await AgoraRTC.createMicrophoneAndCameraTracks();
  },

  async publishTracks(
    client: IAgoraRTCClient,
    tracks: ILocalTrack[]
  ): Promise<void> {
    await client.publish(tracks);
  },

  async leaveChannel(
    client: IAgoraRTCClient,
    tracks: ILocalTrack[]
  ): Promise<void> {
    tracks.forEach((track) => {
      track.stop();
      track.close();
    });
    await client.leave();
  },
};

export default AgoraService;
