/// <reference path="../../__tests__/types.d.ts" />
import {
  rtcNetworkNotificationCenter,
  RTCNetworkEVENT,
} from '../rtcNetworkNotificationCenter';

describe('Network Notification Center', async () => {
  class TestListener {
    constructor() {
      this.listenEvevt();
    }
    listenEvevt() {
      rtcNetworkNotificationCenter.on(
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
  describe('should _isOnline chang to true when listen message', () => {
    it('network evevt emit online JPT-540', () => {
      const nnc = rtcNetworkNotificationCenter;
      const testListener = new TestListener();
      jest.spyOn(testListener, 'onOnline');
      nnc._onOnline();
      expect(nnc.isOnline()).toBe(true);
      expect(testListener.onOnline).toHaveBeenCalled();
    });

    it('network evevt emit online twice JPT-542', () => {
      const nnc = rtcNetworkNotificationCenter;
      const testListener = new TestListener();
      jest.spyOn(testListener, 'onOnline');
      nnc._onOnline();
      nnc._onOnline();
      expect(nnc.isOnline()).toBe(true);
      expect(testListener.onOnline).toHaveBeenCalledTimes(2);
    });
  });

  describe('should _isOnline chang to false when listen message', () => {
    it('network event emit offline JPT-541', async () => {
      const nnc = rtcNetworkNotificationCenter;
      const testListener = new TestListener();
      jest.spyOn(testListener, 'onOffline');
      nnc._onOffline();
      expect(nnc.isOnline()).toBe(false);
      expect(testListener.onOffline).toHaveBeenCalled();
    });

    it('network event emit offline twice JPT-543', async () => {
      const nnc = rtcNetworkNotificationCenter;
      const testListener = new TestListener();
      jest.spyOn(testListener, 'onOffline');
      nnc._onOffline();
      nnc._onOffline();
      expect(nnc.isOnline()).toBe(false);
      expect(testListener.onOffline).toHaveBeenCalledTimes(2);
    });
  });
});
