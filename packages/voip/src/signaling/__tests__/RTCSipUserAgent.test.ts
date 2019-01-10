/*
 * @Author: Jayson zhang  (jayson.zhang@ringcentral.com)
 * @Date: 2018-12-25 09:10:00
 * Copyright © RingCentral. All rights reserved.
 */
import { EventEmitter2 } from 'eventemitter2';
import { RTCSipUserAgent } from '../RTCSipUserAgent';
const WebPhone = require('ringcentral-web-phone');

const mockInvite = jest.fn();
const mockRegister = jest.fn();
const mockOn = jest.fn();

jest.mock('ringcentral-web-phone', () => {
  return jest.fn().mockImplementation(() => {
    return {
      userAgent: {
        register: mockRegister,
        invite: mockInvite,
        on: mockOn,
      },
    };
  });
});

const provisionData = 'provisionData';
const options = 'options';
const phoneNumber = 'phoneNumber';

describe('RTCSipUserAgent', async () => {
  describe('create', () => {
    it('Should emit registered event when create webPhone and register success', () => {
      const eventEmitter = new EventEmitter2();
      const userAgent = new RTCSipUserAgent(
        provisionData,
        options,
        eventEmitter,
      );
      expect(mockOn.mock.calls[0][0]).toEqual('registered');
      expect(mockOn.mock.calls[1][0]).toEqual('registrationFailed');
      expect(WebPhone).toHaveBeenCalledTimes(1);
    });
  });

  describe('register', () => {
    it('Should emit registered event when register success [JPT-599]', () => {
      const eventEmitter = new EventEmitter2();
      const userAgent = new RTCSipUserAgent(
        provisionData,
        options,
        eventEmitter,
      );
      expect(mockRegister).not.toHaveBeenCalled();
      userAgent.register();
      expect(mockRegister).toHaveBeenCalled();
    });
  });

  describe('makeCall', () => {
    it('Should call the invite function of WebPhone when UserAgent makeCall', async () => {
      const eventEmitter = new EventEmitter2();
      const userAgent = new RTCSipUserAgent(
        provisionData,
        options,
        eventEmitter,
      );
      jest.spyOn(userAgent, 'makeCall');
      userAgent.makeCall(phoneNumber, options);
      expect(userAgent.makeCall).toHaveBeenCalledWith(phoneNumber, options);
      expect(mockInvite.mock.calls[0][0]).toEqual(phoneNumber);
      expect(mockInvite.mock.calls[0][1]).toEqual(options);
    });
  });
});
