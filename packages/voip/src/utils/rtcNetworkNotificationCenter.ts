import notificationCenter, {
  NotificationCenter,
} from '../../../sdk/src/service/notificationCenter';
import { SOCKET } from '../../../sdk/src/service/eventKey';

enum RTCNetworkEVENT {
  NETWORK_CHANGE = 'RTCNetworkEVENT.NETWORK_CHANGE',
}

class RTCNetworkNotificationCenter extends NotificationCenter {
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
    notificationCenter.on(SOCKET.NETWORK_CHANGE, ({ state }: any) => {
      switch (state) {
        case 'offline':
          this._onOffline();
          break;
        case 'online':
          this._onOnline();
          break;
        default:
          break;
      }
    });
  }

  public isOnline() {
    return this._isOnline;
  }
}

const rtcNetworkNotificationCenter: RTCNetworkNotificationCenter = new RTCNetworkNotificationCenter();

export { RTCNetworkNotificationCenter, RTCNetworkEVENT };
export default rtcNetworkNotificationCenter;
