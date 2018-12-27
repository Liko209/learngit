enum RTCCALL_STATE_IN_OBSERVER {
  IDLE = 'Idle',
  CONNECTING = 'Connecting',
  CONNECTED = 'Connected',
  DISCONNECTED = 'Disconnected',
}

interface IRTCCallObserver {
  onCallStateChange(state: RTCCALL_STATE_IN_OBSERVER): void;
}

export { IRTCCallObserver, RTCCALL_STATE_IN_OBSERVER };
