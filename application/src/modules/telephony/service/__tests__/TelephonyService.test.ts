/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2019-04-08 18:26:31
 * Copyright © RingCentral. All rights reserved.
 */

import { Jupiter, container } from 'framework';
import { TelephonyService } from '../TelephonyService';
import { ServiceLoader } from 'sdk/module/serviceLoader';
import * as telephony from '@/modules/telephony/module.config';
import * as notification from '@/modules/notification/module.config';

const jupiter = container.get(Jupiter);
jupiter.registerModule(telephony.config);
jupiter.registerModule(notification.config);

const mockServerTelephonyService = {
  answer: jest.fn(),
  sendToVoiceMail: jest.fn(),
  ignore: jest.fn(),
  hangUp: jest.fn(),
  getAllCallCount: jest.fn(),
  mute: jest.fn(),
  unmute: jest.fn(),
};

ServiceLoader.getInstance = jest
  .fn()
  .mockReturnValue(mockServerTelephonyService);

let telephonyService: TelephonyService;

beforeAll(() => {
  telephonyService = jupiter.get<TelephonyService>(TelephonyService);
  jest.resetAllMocks();
});

describe('TelephonyService', () => {
  it('should call answer', () => {
    const callId = 'id_0';
    telephonyService.answer();
    expect(mockServerTelephonyService.answer).not.toBeCalled();
    telephonyService._callId = callId;
    telephonyService.answer();
    expect(mockServerTelephonyService.answer).toBeCalledWith(callId);
    telephonyService._callId = undefined;
  });

  it('should call ignore', () => {
    const callId = 'id_1';
    telephonyService.ignore();
    expect(mockServerTelephonyService.ignore).not.toBeCalled();
    telephonyService._callId = callId;
    telephonyService.ignore();
    expect(mockServerTelephonyService.ignore).toBeCalledWith(callId);
    telephonyService._callId = undefined;
  });

  it('should call sendToVoiceMail', () => {
    const callId = 'id_2';
    telephonyService.sendToVoiceMail();
    expect(mockServerTelephonyService.sendToVoiceMail).not.toBeCalled();
    telephonyService._callId = callId;
    telephonyService.sendToVoiceMail();
    expect(mockServerTelephonyService.sendToVoiceMail).toBeCalledWith(callId);
    telephonyService._callId = undefined;
  });

  it('should call hangUp', () => {
    const callId = 'id_3';
    telephonyService.hangUp();
    expect(mockServerTelephonyService.hangUp).not.toBeCalled();
    telephonyService._callId = callId;
    telephonyService.hangUp();
    expect(mockServerTelephonyService.hangUp).toBeCalledWith(callId);
    telephonyService._callId = undefined;
  });

  it('should call directCall', () => {
    const toNumber = '000';
    telephonyService.makeCall = jest.fn();
    mockServerTelephonyService.getAllCallCount.mockReturnValue(1);
    telephonyService.directCall(toNumber);
    expect(telephonyService.makeCall).not.toBeCalled();
    mockServerTelephonyService.getAllCallCount.mockReturnValue(0);
    telephonyService.directCall(toNumber);
    expect(telephonyService.makeCall).toBeCalledWith(toNumber);
  });

  it('should call muteOrUnmute', () => {
    const callId = 'id_4';
    telephonyService.muteOrUnmute(false);
    expect(mockServerTelephonyService.mute).not.toBeCalled();
    expect(mockServerTelephonyService.unmute).not.toBeCalled();
    telephonyService._callId = callId;
    telephonyService.muteOrUnmute(false);
    expect(mockServerTelephonyService.mute).not.toBeCalled();
    expect(mockServerTelephonyService.unmute).toBeCalled();
    jest.resetAllMocks();
    telephonyService.muteOrUnmute(true);
    expect(mockServerTelephonyService.mute).toBeCalled();
    expect(mockServerTelephonyService.unmute).not.toBeCalled();
    telephonyService._callId = undefined;
  });
});
