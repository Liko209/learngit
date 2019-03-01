/*
 * @Author: Lewi Li (lewi.li@ringcentral.com)
 * @Date: 2019-02-28 22:29:08
 * Copyright © RingCentral. All rights reserved.
 */
import { TelephonyCallController } from '../TelephonyCallController';
import { ITelephonyCallDelegate } from '../../service/ITelephonyCallDelegate';
import { TELEPHONY_CALL_STATE } from '../../types';
import { RTC_CALL_STATE } from 'voip';

describe('TelephonyCallController', () => {
  class MockCall {
    getCallInfo() {
      return { uuid: 123 };
    }
  }

  class MockDelegate implements ITelephonyCallDelegate {
    onCallStateChange(callId: string, state: TELEPHONY_CALL_STATE) {}
  }

  const mockDelegate = new MockDelegate();
  const callController = new TelephonyCallController(mockDelegate);
  const rtcCall = new MockCall();
  beforeAll(() => {
    Object.assign(callController, {
      _rtcCall: rtcCall,
    });
    jest.spyOn(mockDelegate, 'onCallStateChange');
  });
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('should pass the idle state to call controller', () => {
    callController.onCallStateChange(RTC_CALL_STATE.IDLE);
    expect(mockDelegate.onCallStateChange).toBeCalledWith(
      123,
      TELEPHONY_CALL_STATE.IDLE,
    );
  });

  it('should pass the idle state to call controller', () => {});
  it('should pass the connected state to call controller', () => {
    callController.onCallStateChange(RTC_CALL_STATE.CONNECTED);
    expect(mockDelegate.onCallStateChange).toBeCalledWith(
      123,
      TELEPHONY_CALL_STATE.CONNECTED,
    );
  });

  it('should pass the connecting state to call controller', () => {
    callController.onCallStateChange(RTC_CALL_STATE.CONNECTING);
    expect(mockDelegate.onCallStateChange).toBeCalledWith(
      123,
      TELEPHONY_CALL_STATE.CONNECTING,
    );
  });

  it('should pass the disconnected state to call controller', () => {
    callController.onCallStateChange(RTC_CALL_STATE.DISCONNECTED);
    expect(mockDelegate.onCallStateChange).toBeCalledWith(
      123,
      TELEPHONY_CALL_STATE.DISCONNECTED,
    );
  });
});
