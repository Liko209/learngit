/*
 * @Author: Hankin Lin (hankin.lin@ringcentral.com)
 * @Date: 2018-12-28 15:52:43
 * Copyright © RingCentral. All rights reserved.
 */

import {
  rtcNetworkNotificationCenter,
  RTCNetworkEVENT,
} from '../RTCNetworkNotificationCenter';

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
  describe('onOnline()', () => {
    it('should network evevt emit online when listen online JPT-540', () => {
      const nnc = rtcNetworkNotificationCenter;
      const testListener = new TestListener();
      jest.spyOn(testListener, 'onOnline');
      nnc._onOnline();
      expect(nnc.isOnline()).toBe(true);
      expect(testListener.onOnline).toHaveBeenCalled();
    });

    it('should network evevt emit online twice when listen online twice JPT-542', () => {
      const nnc = rtcNetworkNotificationCenter;
      const testListener = new TestListener();
      jest.spyOn(testListener, 'onOnline');
      nnc._onOnline();
      nnc._onOnline();
      expect(nnc.isOnline()).toBe(true);
      expect(testListener.onOnline).toHaveBeenCalledTimes(2);
    });
  });

  describe('onOffline()', () => {
    it('should network evevt emit offline when listen offline JPT-541', async () => {
      const nnc = rtcNetworkNotificationCenter;
      const testListener = new TestListener();
      jest.spyOn(testListener, 'onOffline');
      nnc._onOffline();
      expect(nnc.isOnline()).toBe(false);
      expect(testListener.onOffline).toHaveBeenCalled();
    });

    it('should network evevt emit offline twice when listen offline twice JPT-543', async () => {
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
