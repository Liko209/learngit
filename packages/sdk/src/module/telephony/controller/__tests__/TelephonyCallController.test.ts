/*
 * @Author: Lewi Li (lewi.li@ringcentral.com)
 * @Date: 2019-02-28 22:29:08
 * Copyright © RingCentral. All rights reserved.
 */
import { TelephonyCallController } from '../TelephonyCallController';
import { ITelephonyCallDelegate } from '../../service/ITelephonyCallDelegate';
import { RTC_CALL_STATE } from 'voip';

describe('TelephonyCallController', () => {
  class MockDelegate implements ITelephonyCallDelegate {
    onCallStateChange(callId: string, state: RTC_CALL_STATE) {}
  }

  function clearMocks() {
    jest.clearAllMocks();
    jest.resetModules();
    jest.restoreAllMocks();
  }

  let mockDelegate;
  let callController;
  let rtcCall;

  function setup() {
    mockDelegate = new MockDelegate();
    callController = new TelephonyCallController(mockDelegate);
    rtcCall = {
      getCallInfo: jest.fn().mockReturnValue({ uuid: 123 }),
      hangup: jest.fn(),
    };
    Object.assign(callController, {
      _rtcCall: rtcCall,
    });
    jest.spyOn(mockDelegate, 'onCallStateChange');
  }

  beforeAll(() => {
    clearMocks();
    setup();
  });

  describe('hangUp', () => {
    it('should call rtc hangup when controller hangup is called', () => {
      jest.spyOn(rtcCall, 'hangup');
      callController.hangUp();
      expect(rtcCall.hangup).toBeCalled();
    });
  });

  describe('onCallStateChange', () => {
    it('should pass the idle state to call controller', () => {
      callController.onCallStateChange(RTC_CALL_STATE.IDLE);
      expect(mockDelegate.onCallStateChange).toBeCalledWith(
        123,
        RTC_CALL_STATE.IDLE,
      );
    });

    it('should pass the connected state to call controller', () => {
      callController.onCallStateChange(RTC_CALL_STATE.CONNECTED);
      expect(mockDelegate.onCallStateChange).toBeCalledWith(
        123,
        RTC_CALL_STATE.CONNECTED,
      );
    });

    it('should pass the connecting state to call controller', () => {
      callController.onCallStateChange(RTC_CALL_STATE.CONNECTING);
      expect(mockDelegate.onCallStateChange).toBeCalledWith(
        123,
        RTC_CALL_STATE.CONNECTING,
      );
    });

    it('should pass the disconnected state to call controller', () => {
      callController.onCallStateChange(RTC_CALL_STATE.DISCONNECTED);
      expect(mockDelegate.onCallStateChange).toBeCalledWith(
        123,
        RTC_CALL_STATE.DISCONNECTED,
      );
    });
  });
});
