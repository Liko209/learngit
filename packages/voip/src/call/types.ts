type RTCCallInfo = {
  fromName: string;
  fromNum: string;
  toName: string;
  toNum: string;
  uuid: string;
};

enum RTCCALL_STATE {
  IDLE = 'Idle',
  CONNECTING = 'Connecting',
  CONNECTED = 'Connected',
  DISCONNECTED = 'Disconnected',
}

export { RTCCallInfo, RTCCALL_STATE };
