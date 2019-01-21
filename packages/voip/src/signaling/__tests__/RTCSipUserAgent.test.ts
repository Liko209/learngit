/*
 * @Author: Jayson zhang  (jayson.zhang@ringcentral.com)
 * @Date: 2018-12-25 09:10:00
 * Copyright © RingCentral. All rights reserved.
 */
import { RTCSipUserAgent } from '../RTCSipUserAgent';
import { ProvisionDataOptions } from '../../signaling/types';

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
const options: ProvisionDataOptions = {};
const phoneNumber = 'phoneNumber';

describe('RTCSipUserAgent', async () => {
  describe('create', () => {
    it('Should emit registered event when create webPhone and register success', () => {
      const userAgent = new RTCSipUserAgent(provisionData, options);
      expect(mockOn.mock.calls[0][0]).toEqual('registered');
      expect(mockOn.mock.calls[1][0]).toEqual('registrationFailed');
      expect(WebPhone).toHaveBeenCalledTimes(1);
    });
  });

  describe('register', () => {
    it('Should register function have been called [JPT-599]', () => {
      const userAgent = new RTCSipUserAgent(provisionData, options);
      expect(mockRegister).not.toHaveBeenCalled();
      userAgent.register();
      expect(mockRegister).toHaveBeenCalled();
    });
  });

  describe('reRegister()', () => {
    it('Should reRegister has been called', () => {
      const userAgent = new RTCSipUserAgent(provisionData, options);
      jest.spyOn(userAgent, 'reRegister').mockImplementation(() => {});
      userAgent.reRegister();
      expect(userAgent.reRegister).toHaveBeenCalled();
    });
  });

  describe('makeCall', () => {
    it('Should call the invite function of WebPhone when UserAgent makeCall', async () => {
      const userAgent = new RTCSipUserAgent(provisionData, options);
      jest.spyOn(userAgent, 'makeCall');
      userAgent.makeCall(phoneNumber, {});
      expect(userAgent.makeCall).toHaveBeenCalledWith(phoneNumber, options);
      expect(mockInvite.mock.calls[0][0]).toEqual(phoneNumber);
      expect(mockInvite.mock.calls[0][1]).toEqual(options);
    });
  });
});
