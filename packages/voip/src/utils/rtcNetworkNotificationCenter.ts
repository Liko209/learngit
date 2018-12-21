import { EventEmitter2 } from 'eventemitter2';

enum RTCNetworkEVENT {
  NETWORK_CHANGE = 'RTCNetworkEVENT.NETWORK_CHANGE',
}

class RTCNetworkNotificationCenter extends EventEmitter2 {
  private _isOnline: boolean = true;

  constructor() {
    super();
    this._listenEvevt();
  }

  private _onOnline() {
    this._isOnline = true;
    this.emit(RTCNetworkEVENT.NETWORK_CHANGE, { state: 'online' });
  }

  private _onOffline() {
    this._isOnline = false;
    this.emit(RTCNetworkEVENT.NETWORK_CHANGE, { state: 'offline' });
  }

  private _listenEvevt() {
    window.addEventListener('online', () => {
      this._onOnline();
    });

    window.addEventListener('offline', () => {
      this._onOffline();
    });
  }

  public isOnline() {
    return this._isOnline;
  }
}

const rtcNetworkNotificationCenter: RTCNetworkNotificationCenter = new RTCNetworkNotificationCenter();

export { rtcNetworkNotificationCenter, RTCNetworkEVENT };
