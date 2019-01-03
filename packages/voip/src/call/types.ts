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

enum RTCCALL_ACTION {
  FLIP_SUCCESS = 'flipSuccess',
  FLIP_FAILED = 'flipFailed',
  START_RECORD_SUCCESS = 'startRecordSuccess',
  START_RECORD_FAILED = 'startRecordFailed',
  STOP_RECORD_SUCCESS = 'stopRecordSuccess',
  STOP_RECORD_FAILED = 'stopRecordFailed',
}
export { RTCCallInfo, RTCCALL_STATE, RTCCALL_ACTION };
