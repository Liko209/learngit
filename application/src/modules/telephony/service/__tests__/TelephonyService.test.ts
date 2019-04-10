/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2019-04-08 18:26:31
 * Copyright © RingCentral. All rights reserved.
 */

import { container, decorate, injectable } from 'framework';
import { TelephonyStore } from '../../store';
import { TelephonyService } from '../TelephonyService';
import { ServiceLoader } from 'sdk/module/serviceLoader';

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

decorate(injectable(), TelephonyStore);
decorate(injectable(), TelephonyService);

container.bind(TelephonyService).to(TelephonyService);
container.bind(TelephonyStore).to(TelephonyStore);

let telephonyService: TelephonyService;

beforeAll(() => {
  telephonyService = container.get<TelephonyService>(TelephonyService);
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
