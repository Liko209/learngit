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
    beforeEach(() => {
      jest.clearAllMocks();
      jest.spyOn(i18nT, 'default').mockImplementation(async i => i);
      telephonyNotificationManager = new TelephonyNotificationManager();
    });

    it('should call show() when dispatch action is INCOMING', async () => {
      jest.spyOn(telephonyNotificationManager, 'show').mockImplementation();
      const noop = () => {};
      await telephonyNotificationManager.dispatch({
        type: 'INCOMING',
        options: {
          id: '1',
          callNumber: '123',
          callerName: 'alex',
          answerHandler: noop,
        },
      });

      const title = await i18nT.default('telephony.notification.incomingCall');
      const answerAction = {
        title: await i18nT.default('telephony.notification.answer'),
        icon: '',
        action: 'answer',
        handler: noop,
      };
      expect(telephonyNotificationManager.show).toHaveBeenCalledWith(title, {
        actions: [answerAction],
        tag: '1',
        data: {
          id: '1',
          scope: 'telephony',
        },
        body: 'alex 123',
        icon: 'incoming-call.png',
      });
    });

    it('should call close() when dispatch action is HANGUP', () => {
      jest.spyOn(telephonyNotificationManager, 'close').mockImplementation();
      telephonyNotificationManager.dispatch({
        type: 'HANGUP',
        options: {
          id: '1',
        },
      });
      expect(telephonyNotificationManager.close).toHaveBeenCalledWith('1');
    });

    it('should call clear() when dispatch action is DESTROY', () => {
      jest.spyOn(telephonyNotificationManager, 'clear').mockImplementation();
      telephonyNotificationManager.dispatch({
        type: 'DESTROY',
      });
      expect(telephonyNotificationManager.clear).toHaveBeenCalled();
    });
  });
});
