/*
 * @Author: Jayson zhang  (jayson.zhang@ringcentral.com)
 * @Date: 2018-12-25 09:10:00
 * Copyright © RingCentral. All rights reserved.
 */
import { EventEmitter2 } from 'eventemitter2';
import { RTCSipUserAgent, EVENT_TAG } from '../RTCSipUserAgent';

describe('RTCSipUserAgent', async () => {
  describe('register', () => {
    it('Should emit registered event when register success [JPT-599]', () => {
      const eventEmitter = new EventEmitter2();
      jest.spyOn(eventEmitter, 'emit');
      const userAgent = new RTCSipUserAgent(
        'provisionData',
        'options',
        eventEmitter,
      );
      userAgent.register('1');
      expect(eventEmitter.emit).toHaveBeenCalledWith(EVENT_TAG.REG_SUCCESS);
    });

    it('Should emit registrationFailed event with cause and response when register failed [JPT-600]', async () => {
      const eventEmitter = new EventEmitter2();
      jest.spyOn(eventEmitter, 'emit');
      const userAgent = new RTCSipUserAgent(
        'provisionData',
        'options',
        eventEmitter,
      );
      userAgent.register();
      expect(eventEmitter.emit).toBeCalledWith(
        EVENT_TAG.REG_FAILED,
        'response',
        500,
      );
    });
  });

  describe('makeCall', () => {
    it('Should return session when success', async () => {
      const eventEmitter = new EventEmitter2();
      const userAgent = new RTCSipUserAgent(
        'provisionData',
        'options',
        eventEmitter,
      );
      const session = userAgent.makeCall('phoneNumber', 'options');
      expect(session).toEqual('session');
    });
  });
});
