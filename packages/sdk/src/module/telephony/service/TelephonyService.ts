/*
 * @Author: kasni.huang (kasni.huang@ringcentral.com)
 * @Date: 2018-12-20 10:49:42
 * Copyright © RingCentral. All rights reserved.
 */
import { EntityBaseService } from '../../../framework/service/EntityBaseService';
import { TelephonyEngineController } from '../controller';
import { ITelephonyCallDelegate } from './ITelephonyCallDelegate';
import { ITelephonyAccountDelegate } from './ITelephonyAccountDelegate';
import { MakeCallController } from '../controller/MakeCallController';
import { MAKE_CALL_ERROR_CODE } from '../types';
import { RTC_STATUS_CODE } from 'voip';
import { SubscribeController } from '../../base/controller/SubscribeController';
import { SERVICE } from '../../../service/eventKey';

class TelephonyService extends EntityBaseService {
  private _telephonyEngineController: TelephonyEngineController;
  private _makeCallController: MakeCallController;

  constructor() {
    super(false);
    this.setSubscriptionController(
      SubscribeController.buildSubscriptionController({
        [SERVICE.LOGOUT]: this.handleLogOut,
      }),
    );
    this._init();
  }

  handleLogOut = async () => {
    this.telephonyController.logout();
  }

  protected get telephonyController() {
    if (!this._telephonyEngineController) {
      this._telephonyEngineController = new TelephonyEngineController();
    }
    return this._telephonyEngineController;
  }

  private _init() {
    this.telephonyController.initEngine();
    this._makeCallController = new MakeCallController();
  }

  createAccount = (
    accountDelegate: ITelephonyAccountDelegate,
    callDelegate: ITelephonyCallDelegate,
  ) => {
    this.telephonyController.createAccount(accountDelegate, callDelegate);
  }

  getAllCallCount = () => {
    return this.telephonyController.getAccountController().getCallCount();
  }

  makeCall = async (toNumber: string) => {
    const e164ToNumber = this._makeCallController.getE164PhoneNumber(toNumber);
    let result = await this._makeCallController.tryMakeCall(e164ToNumber);
    if (result !== MAKE_CALL_ERROR_CODE.NO_ERROR) {
      return result;
    }
    const makeCallResult = this.telephonyController
      .getAccountController()
      .makeCall(toNumber);
    switch (makeCallResult) {
      case RTC_STATUS_CODE.NUMBER_INVALID: {
        result = MAKE_CALL_ERROR_CODE.INVALID_PHONE_NUMBER;
        break;
      }
      case RTC_STATUS_CODE.MAX_CALLS_REACHED: {
        result = MAKE_CALL_ERROR_CODE.MAX_CALLS_REACHED;
        break;
      }
      case RTC_STATUS_CODE.INVALID_STATE: {
        result = MAKE_CALL_ERROR_CODE.INVALID_STATE;
        break;
      }
    }
    return result;
  }

  hangUp = (callId: string) => {
    this.telephonyController.getAccountController().hangUp(callId);
  }

  mute = (callId: string) => {
    this.telephonyController.getAccountController().mute(callId);
  }

  unmute = (callId: string) => {
    this.telephonyController.getAccountController().unmute(callId);
  }

  hold = (callId: string) => {
    this.telephonyController.getAccountController().hold(callId);
  }

  unhold = (callId: string) => {
    this.telephonyController.getAccountController().unhold(callId);
  }

  startRecord = (callId: string) => {
    this.telephonyController.getAccountController().startRecord(callId);
  }

  stopRecord = (callId: string) => {
    this.telephonyController.getAccountController().stopRecord(callId);
  }

  dtmf = (callId: string, digits: string) => {
    this.telephonyController.getAccountController().dtmf(callId, digits);
  }
}

export { TelephonyService };
