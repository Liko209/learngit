/*
 * @Author: Lewi Li (lewi.li@ringcentral.com)
 * @Date: 2019-03-01 09:16:12
 * Copyright © RingCentral. All rights reserved.
 */
import { TelephonyAccountController } from '../TelephonyAccountController';
import { ITelephonyAccountDelegate } from '../../service/ITelephonyAccountDelegate';
import { TELEPHONY_ACCOUNT_STATE } from '../../types';
import RTCEngine, { RTC_ACCOUNT_STATE } from 'voip/src';

describe('TelephonyAccountController', () => {
  const rtcEngine = new RTCEngine();

  class MockAccount implements ITelephonyAccountDelegate {
    onAccountStateChanged(state: TELEPHONY_ACCOUNT_STATE) {}
  }
  const mockAcc = new MockAccount();
  const accountController = new TelephonyAccountController(rtcEngine, mockAcc);

  it('should pass idle state to controller', () => {
    spyOn(mockAcc, 'onAccountStateChanged');
    accountController.onAccountStateChanged(RTC_ACCOUNT_STATE.IDLE);
    expect(mockAcc.onAccountStateChanged).toBeCalledWith(
      TELEPHONY_ACCOUNT_STATE.IDLE,
    );
  });

  it('should pass failed state to controller', () => {
    spyOn(mockAcc, 'onAccountStateChanged');
    accountController.onAccountStateChanged(RTC_ACCOUNT_STATE.FAILED);
    expect(mockAcc.onAccountStateChanged).toBeCalledWith(
      TELEPHONY_ACCOUNT_STATE.FAILED,
    );
  });

  it('should pass inProgress state to controller', () => {
    spyOn(mockAcc, 'onAccountStateChanged');
    accountController.onAccountStateChanged(RTC_ACCOUNT_STATE.IN_PROGRESS);
    expect(mockAcc.onAccountStateChanged).toBeCalledWith(
      TELEPHONY_ACCOUNT_STATE.IN_PROGRESS,
    );
  });

  it('should pass registered state to controller', () => {
    spyOn(mockAcc, 'onAccountStateChanged');
    accountController.onAccountStateChanged(RTC_ACCOUNT_STATE.REGISTERED);
    expect(mockAcc.onAccountStateChanged).toBeCalledWith(
      TELEPHONY_ACCOUNT_STATE.REGISTERED,
    );
  });

  it('should pass unregistered state to controller', () => {
    spyOn(mockAcc, 'onAccountStateChanged');
    accountController.onAccountStateChanged(RTC_ACCOUNT_STATE.UNREGISTERED);
    expect(mockAcc.onAccountStateChanged).toBeCalledWith(
      TELEPHONY_ACCOUNT_STATE.UNREGISTERED,
    );
  });
});
