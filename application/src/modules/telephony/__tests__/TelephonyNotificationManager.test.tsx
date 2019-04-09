/*
 * @Author: Alessia Li (alessia.li@ringcentral.com)
 * @Date: 2019-04-02 15:41:55
 * Copyright © RingCentral. All rights reserved.
 */

import { TelephonyNotificationManager } from '../TelephonyNotificationManager';
import * as i18nT from '@/utils/i18nT';

describe('TelephonyNotificationManager', () => {
  describe('dispatch()', () => {
    let telephonyNotificationManager: TelephonyNotificationManager;
    const title = 'Incoming Call';
    const noop = () => {};
    const answerAction = {
      title: 'Answer',
      icon: '',
      action: 'answer',
      handler: noop,
    };
    beforeEach(() => {
      jest.clearAllMocks();
      jest.spyOn(i18nT, 'default').mockImplementation(async i => {
        const translation = {
          'telephony.notification.incomingCall': 'Incoming Call',
          'telephony.notification.answer': 'Answer',
          'telephony.notification.unknownCaller': 'Unknown Caller',
        };
        return translation[i] || i;
      });
      telephonyNotificationManager = new TelephonyNotificationManager();
    });

    it('should call show() when dispatch action is SHOW', async () => {
      jest.spyOn(telephonyNotificationManager, 'show').mockImplementation();
      await telephonyNotificationManager.dispatch({
        type: 'SHOW',
        options: {
          id: '1',
          callNumber: '123',
          callerName: 'alex',
          answerHandler: noop,
        },
      });

      expect(telephonyNotificationManager.show).toHaveBeenCalledWith(title, {
        actions: [answerAction],
        tag: '1',
        data: {
          id: '1',
          scope: 'telephony',
        },
        body: 'alex 123',
        icon: '/icon/incomingCall.png',
      });
    });

    it('should call show() with body contains "Unknown Caller" when the call is from an unrecognized caller [JPT-1489]', async () => {
      jest.spyOn(telephonyNotificationManager, 'show').mockImplementation();
      await telephonyNotificationManager.dispatch({
        type: 'SHOW',
        options: {
          id: '1',
          callNumber: '123',
          callerName: '',
          answerHandler: noop,
        },
      });

      expect(telephonyNotificationManager.show).toHaveBeenCalledWith(title, {
        actions: [answerAction],
        tag: '1',
        data: {
          id: '1',
          scope: 'telephony',
        },
        body: 'Unknown Caller 123',
        icon: '/icon/incomingCall.png',
      });
    });

    it('should call show() with body contains "Unknown Caller" when the caller is anonymous [JPT-1489]', async () => {
      jest.spyOn(telephonyNotificationManager, 'show').mockImplementation();
      await telephonyNotificationManager.dispatch({
        type: 'SHOW',
        options: {
          id: '1',
          callNumber: 'anonymous',
          callerName: 'abc',
          answerHandler: noop,
        },
      });

      expect(telephonyNotificationManager.show).toHaveBeenCalledWith(title, {
        actions: [answerAction],
        tag: '1',
        data: {
          id: '1',
          scope: 'telephony',
        },
        body: 'Unknown Caller ',
        icon: '/icon/incomingCall.png',
      });
    });
    it('should call close() when dispatch action is CLOSE', () => {
      jest.spyOn(telephonyNotificationManager, 'close').mockImplementation();
      telephonyNotificationManager.dispatch({
        type: 'CLOSE',
        options: {
          id: '1',
        },
      });
      expect(telephonyNotificationManager.close).toHaveBeenCalledWith('1');
    });

    it('should call clear() when dispatch action is DISPOSE', () => {
      jest.spyOn(telephonyNotificationManager, 'clear').mockImplementation();
      telephonyNotificationManager.dispatch({
        type: 'DISPOSE',
      });
      expect(telephonyNotificationManager.clear).toHaveBeenCalled();
    });
  });
});
