/// <reference path="../../__tests__/types.d.ts" />
import {
  RTCNetworkNotificationCenter,
  RTCNetworkEVENT,
} from '../rtcNetworkNotificationCenter';

import notificationCenter from '../../../../sdk/src/service/notificationCenter';
import { SOCKET } from '../../../../sdk/src/service/eventKey';

describe('Network Notification Center', async () => {
  class TestListener {
    constructor() {
      this.listenEvevt();
    }
    listenEvevt() {
      RTCNetworkNotificationCenter.getInstance().on(
        RTCNetworkEVENT.NETWORK_CHANGE,
        ({ state }: any) => {
          switch (state) {
            case 'offline':
              this.onOffline();
              break;
            case 'online':
              this.onOnline();
              break;
            default:
              break;
          }
        },
      );
    }

    onOnline() {}

    onOffline() {}
  }

  it('network evevt emit online', () => {
    const nnc = RTCNetworkNotificationCenter.getInstance();
    const testListener = new TestListener();
    jest.spyOn(testListener, 'onOnline');
    jest.spyOn(nnc, '_onOnline');
    notificationCenter.emit(SOCKET.NETWORK_CHANGE, { state: 'online' });
    expect(nnc._onOnline).toHaveBeenCalled();
    expect(nnc.isOnline() === true);
    expect(testListener.onOnline).toHaveBeenCalled();
  });

  it('network evevt emit online twice', () => {
    const nnc = RTCNetworkNotificationCenter.getInstance();
    const testListener = new TestListener();
    jest.spyOn(testListener, 'onOnline');
    jest.spyOn(nnc, '_onOnline');
    notificationCenter.emit(SOCKET.NETWORK_CHANGE, { state: 'online' });
    notificationCenter.emit(SOCKET.NETWORK_CHANGE, { state: 'online' });
    expect(nnc._onOnline).toHaveBeenCalledTimes(3);
    expect(nnc.isOnline() === true);
    expect(testListener.onOnline).toHaveBeenCalledTimes(2);
  });

  it('network event emit offline', async () => {
    const nnc = RTCNetworkNotificationCenter.getInstance();
    const testListener = new TestListener();
    jest.spyOn(testListener, 'onOffline');
    jest.spyOn(nnc, '_onOffline');
    notificationCenter.emit(SOCKET.NETWORK_CHANGE, { state: 'offline' });
    expect(nnc._onOffline).toHaveBeenCalled();
    expect(nnc.isOnline() === false);
    expect(testListener.onOffline).toHaveBeenCalled();
  });

  it('network event emit offline twice', async () => {
    const nnc = RTCNetworkNotificationCenter.getInstance();
    const testListener = new TestListener();
    jest.spyOn(testListener, 'onOffline');
    jest.spyOn(nnc, '_onOffline');
    notificationCenter.emit(SOCKET.NETWORK_CHANGE, { state: 'offline' });
    notificationCenter.emit(SOCKET.NETWORK_CHANGE, { state: 'offline' });
    expect(nnc._onOffline).toHaveBeenCalledTimes(3);
    expect(nnc.isOnline() === false);
    expect(testListener.onOffline).toHaveBeenCalledTimes(2);
  });
});
