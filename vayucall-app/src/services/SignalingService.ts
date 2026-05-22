import { ref, set, onValue, push, remove, update } from 'firebase/database';
import { database } from '../lib/firebase';

export interface CallRequest {
  id: string;
  callerUid: string;
  callerEmail: string;
  receiverUid: string;
  channelName: string;
  status: 'pending' | 'accepted' | 'rejected' | 'ended';
  timestamp: number;
}

export const SignalingService = {
  // Send a call request to another user
  async makeCall(callerUid: string, callerEmail: string, receiverUid: string): Promise<string> {
    const channelName = `p2p_${[callerUid, receiverUid].sort().join('_')}`;
    const newCallId = push(ref(database, `calls/${receiverUid}`)).key!;
    
    const callData: CallRequest = {
      id: newCallId,
      callerUid,
      callerEmail,
      receiverUid,
      channelName,
      status: 'pending',
      timestamp: Date.now(),
    };

    await set(ref(database, `calls/${receiverUid}/${newCallId}`), callData);
    
    // Also store in caller's path so they can monitor status
    await set(ref(database, `calls/${callerUid}/${newCallId}`), callData);

    return newCallId;
  },

  // Update call status (accept/reject/end)
  async updateCallStatus(uid: string, otherUid: string, callId: string, status: CallRequest['status']) {
    const updates: any = {};
    updates[`calls/${uid}/${callId}/status`] = status;
    updates[`calls/${otherUid}/${callId}/status`] = status;
    return update(ref(database), updates);
  },

  // Listen for incoming calls
  subscribeToCalls(uid: string, callback: (calls: CallRequest[]) => void) {
    const callsRef = ref(database, `calls/${uid}`);
    return onValue(callsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const calls = Object.values(data) as CallRequest[];
        callback(calls);
      } else {
        callback([]);
      }
    });
  },

  // Listen for a specific call status change
  subscribeToCallStatus(uid: string, callId: string, callback: (status: CallRequest['status']) => void) {
    const statusRef = ref(database, `calls/${uid}/${callId}/status`);
    return onValue(statusRef, (snapshot) => {
      const status = snapshot.val();
      if (status) {
        callback(status);
      }
    });
  },

  // Clean up calls
  async removeCall(uid: string, otherUid: string, callId: string) {
    await remove(ref(database, `calls/${uid}/${callId}`));
    await remove(ref(database, `calls/${otherUid}/${callId}`));
  }
};

export default SignalingService;
