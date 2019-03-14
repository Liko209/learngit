/*
 * @Author: Hankin Lin (hankin.lin@ringcentral.com)
 * @Date: 2018-12-28 15:52:43
 * Copyright © RingCentral. All rights reserved.
 */

import { RTCNetworkNotificationCenter } from '../RTCNetworkNotificationCenter';

import { RTC_NETWORK_EVENT, RTC_NETWORK_STATE } from '../types';

describe('Network Notification Center', () => {
  class TestListener {
    constructor() {
      this.listenEvevt();
    }
    listenEvevt() {
      RTCNetworkNotificationCenter.instance().on(
        RTC_NETWORK_EVENT.NETWORK_CHANGE,
        ({ state }: any) => {
          switch (state) {
            case RTC_NETWORK_STATE.OFFLINE:
              this.onOffline();
              break;
            case RTC_NETWORK_STATE.ONLINE:
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
      const nnc = RTCNetworkNotificationCenter.instance();
      const testListener = new TestListener();
      jest.spyOn(testListener, 'onOnline');
      nnc._onOnline();
      expect(nnc.isOnline()).toBe(true);
      expect(testListener.onOnline).toHaveBeenCalled();
    });

    it('should network evevt emit online twice when listen online twice JPT-542', () => {
      const nnc = RTCNetworkNotificationCenter.instance();
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
      const nnc = RTCNetworkNotificationCenter.instance();
      const testListener = new TestListener();
      jest.spyOn(testListener, 'onOffline');
      nnc._onOffline();
      expect(nnc.isOnline()).toBe(false);
      expect(testListener.onOffline).toHaveBeenCalled();
    });

    it('should network evevt emit offline twice when listen offline twice JPT-543', async () => {
      const nnc = RTCNetworkNotificationCenter.instance();
      const testListener = new TestListener();
      jest.spyOn(testListener, 'onOffline');
      nnc._onOffline();
      nnc._onOffline();
      expect(nnc.isOnline()).toBe(false);
      expect(testListener.onOffline).toHaveBeenCalledTimes(2);
    });
  });
});
