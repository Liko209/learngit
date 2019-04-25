/*
 * @Author: kasni.huang (kasni.huang@ringcentral.com)
 * @Date: 2018-12-20 10:49:42
 * Copyright © RingCentral. All rights reserved.
 */
import { EntityBaseService } from '../../../framework/service/EntityBaseService';
import { TelephonyEngineController } from '../controller';
import { ITelephonyCallDelegate } from './ITelephonyCallDelegate';
import { ITelephonyAccountDelegate } from './ITelephonyAccountDelegate';
import { SubscribeController } from '../../base/controller/SubscribeController';
import { SERVICE } from '../../../service/eventKey';
import { MAKE_CALL_ERROR_CODE } from '../types';

class TelephonyService extends EntityBaseService {
  private _telephonyEngineController: TelephonyEngineController;

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
  }

  createAccount = (
    accountDelegate: ITelephonyAccountDelegate,
    callDelegate: ITelephonyCallDelegate,
  ) => {
    this.telephonyController.createAccount(accountDelegate, callDelegate);
  }

  getAllCallCount = () => {
    const accountController = this.telephonyController.getAccountController();
    return accountController ? accountController.getCallCount() : 0;
  }

  makeCall = async (toNumber: string) => {
    const accountController = this.telephonyController.getAccountController();
    if (accountController) {
      return this.telephonyController.getAccountController().makeCall(toNumber);
    }
    return MAKE_CALL_ERROR_CODE.INVALID_STATE;
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

  answer = (callId: string) => {
    this.telephonyController.getAccountController().answer(callId);
  }

  sendToVoiceMail = (callId: string) => {
    this.telephonyController.getAccountController().sendToVoiceMail(callId);
  }

  ignore = (callId: string) => {
    this.telephonyController.getAccountController().ignore(callId);
  }
}

export { TelephonyService };
