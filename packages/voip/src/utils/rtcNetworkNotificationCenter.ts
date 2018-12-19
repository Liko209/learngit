import notificationCenter, {
  NotificationCenter,
} from '../../../sdk/src/service/notificationCenter';
import { SOCKET } from '../../../sdk/src/service/eventKey';

export enum RTCNetworkEVENT {
  NETWORK_CHANGE = 'RTCNetworkEVENT.NETWORK_CHANGE',
}

export class RTCNetworkNotificationCenter extends NotificationCenter {
  private _isOnline: boolean = true;
  private static instance: RTCNetworkNotificationCenter;

  private constructor() {
    super();
    this._listenEvevt();
  }

  public static getInstance() {
    if (!RTCNetworkNotificationCenter.instance) {
      RTCNetworkNotificationCenter.instance = new RTCNetworkNotificationCenter();
    }

    return RTCNetworkNotificationCenter.instance;
  }

  private _onOnline() {
    this._isOnline = true;
    this.emit(RTCNetworkEVENT.NETWORK_CHANGE, { state: 'online' });
    console.log('RTCNetworkNotificationCenter: network change to online');
  }

  private _onOffline() {
    this._isOnline = false;
    this.emit(RTCNetworkEVENT.NETWORK_CHANGE, { state: 'offline' });
    console.log('RTCNetworkNotificationCenter: network change to offline');
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
