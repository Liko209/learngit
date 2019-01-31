/*
 * @Author: Jayson zhang  (jayson.zhang@ringcentral.com)
 * @Date: 2018-12-25 09:10:00
 * Copyright © RingCentral. All rights reserved.
 */
import { RTCSipUserAgent } from '../RTCSipUserAgent';
import { ProvisionDataOptions } from '../../signaling/types';
import { RTCCallOptions } from '../../api/types';
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
  beforeEach(() => {
    mockInvite.mockClear();
    mockRegister.mockClear();
    mockOn.mockClear();
  });

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
    let userAgent = null;
    function setupMakeCall() {
      userAgent = new RTCSipUserAgent(provisionData, {});
      jest.spyOn(userAgent, 'makeCall');
    }

    it('Should call the invite function of WebPhone with default homeCountryId when UserAgent makeCall [JPT-973] [JPT-975]', async () => {
      setupMakeCall();
      const options: RTCCallOptions = {};
      userAgent.makeCall(phoneNumber, options);
      expect(userAgent.makeCall).toHaveBeenCalledWith(phoneNumber, {
        homeCountryId: '1',
      });
      expect(mockInvite.mock.calls[0][0]).toEqual(phoneNumber);
      expect(mockInvite.mock.calls[0][1]).toEqual({ homeCountryId: '1' });
    });

    it('Should call the invite function of WebPhone with homeCountryId param when UserAgent makeCall [JPT-972]', async () => {
      setupMakeCall();
      const options: RTCCallOptions = { homeCountryId: '100' };
      userAgent.makeCall(phoneNumber, options);
      expect(userAgent.makeCall).toHaveBeenCalledWith(phoneNumber, {
        homeCountryId: '100',
      });
      expect(mockInvite.mock.calls[0][0]).toEqual(phoneNumber);
      expect(mockInvite.mock.calls[0][1]).toEqual(options);
    });

    it('Should call the invite function of WebPhone with homeCountryId param when UserAgent makeCall [JPT-974]', async () => {
      setupMakeCall();
      const options: RTCCallOptions = { fromNumber: '100' };
      userAgent.makeCall(phoneNumber, options);
      expect(userAgent.makeCall).toHaveBeenCalledWith(phoneNumber, {
        fromNumber: '100',
        homeCountryId: '1',
      });
      expect(mockInvite.mock.calls[0][0]).toEqual(phoneNumber);
      expect(mockInvite.mock.calls[0][1]).toEqual({
        fromNumber: '100',
        homeCountryId: '1',
      });
    });
  });
});
