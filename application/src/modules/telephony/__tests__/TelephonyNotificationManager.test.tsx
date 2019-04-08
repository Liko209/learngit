/*
 * @Author: Alessia Li (alessia.li@ringcentral.com)
 * @Date: 2019-04-02 15:41:55
 * Copyright © RingCentral. All rights reserved.
 */

import { TelephonyNotificationManager } from '../TelephonyNotificationManager';
import * as i18nT from '@/utils/i18nT';

describe('TelephonyNotificationManager', () => {
  let n: TelephonyNotificationManager;
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(i18nT, 'default').mockImplementation(async i => i);
    n = new TelephonyNotificationManager();
  });
  it('When dispatch action is INCOMING, show function should be called', async () => {
    jest.spyOn(n, 'show').mockImplementation();
    const noop = () => {};
    await n.dispatch({
      type: 'INCOMING',
      options: {
        id: 1,
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
    expect(n.show).toHaveBeenCalledWith(title, {
      actions: [answerAction],
      tag: '1',
      data: {
        id: 1,
        scope: 'telephony',
      },
      body: 'alex 123',
      icon: 'incoming-call.png',
    });
  });

  it('When dispatch action is HANGUP, close function should be called', async () => {
    jest.spyOn(n, 'close').mockImplementation();
    await n.dispatch({
      type: 'HANGUP',
      options: {
        id: 1,
      },
    });
    expect(n.close).toHaveBeenCalledWith(1);
  });

  it('When dispatch action is DESTROY, clear function should be called', () => {
    jest.spyOn(n, 'clear').mockImplementation();
    n.dispatch({
      type: 'DESTROY',
    });
    expect(n.clear).toHaveBeenCalled();
  });
});
